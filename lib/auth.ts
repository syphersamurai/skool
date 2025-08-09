import { createContext, useContext, useEffect, useState } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { app, db } from './firebase';

// User roles
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  SCHOOL_ADMIN = 'school_admin',
  TEACHER = 'teacher',
  PARENT = 'parent',
  STUDENT = 'student',
}

// Extended user type with role
export interface UserData {
  uid: string;
  email: string | null;
  name: string | null;
  role: UserRole;
  schoolId?: string;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  // Function to fetch user data from Firestore
  const fetchUserData = async (firebaseUser: FirebaseUser) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<UserData, 'uid'>;
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          ...userData
        } as UserData;
      } else {
        // If no user document exists, create a basic user object
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          role: UserRole.PARENT, // Default role
        } as UserData;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Note: Additional user data is stored in the registration page
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}