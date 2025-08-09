// Database utility functions for Firestore operations
import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  serverTimestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { Student, Teacher, Class, Subject, Result, Attendance, Fee, Payment, Coupon, FeeStructure } from './types';

// Generic CRUD operations
export class FirestoreService<T> {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  async getById(id: string): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  }

  async getAll(orderByField?: string, orderDirection: 'asc' | 'desc' = 'desc'): Promise<T[]> {
    let q = collection(db, this.collectionName);
    
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection)) as any;
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  }

  async getWhere(field: string, operator: any, value: any): Promise<T[]> {
    const q = query(collection(db, this.collectionName), where(field, operator, value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async getPaginated(
    pageSize: number = 10,
    lastDoc?: DocumentSnapshot,
    orderByField: string = 'createdAt',
    orderDirection: 'asc' | 'desc' = 'desc'
  ): Promise<{ data: T[]; lastDoc: DocumentSnapshot | null }> {
    let q = query(
      collection(db, this.collectionName),
      orderBy(orderByField, orderDirection),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    return { data, lastDoc: newLastDoc };
  }
}

// Service instances for each collection
export const studentsService = new FirestoreService<Student>('students');
export const teachersService = new FirestoreService<Teacher>('teachers');
export const classesService = new FirestoreService<Class>('classes');
export const subjectsService = new FirestoreService<Subject>('subjects');
export const resultsService = new FirestoreService<Result>('results');
export const attendanceService = new FirestoreService<Attendance>('attendance');
export const feesService = new FirestoreService<Fee>('fees');
export const paymentsService = new FirestoreService<Payment>('payments');
export const couponsService = new FirestoreService<Coupon>('coupons');
export const feeStructuresService = new FirestoreService<FeeStructure>('feeStructures');

// Specialized functions for complex operations

// Student operations
export async function getStudentsByClass(className: string): Promise<Student[]> {
  return studentsService.getWhere('class', '==', className);
}

export async function getActiveStudents(): Promise<Student[]> {
  return studentsService.getWhere('status', '==', 'active');
}

// Teacher operations
export async function getTeachersBySubject(subject: string): Promise<Teacher[]> {
  return teachersService.getWhere('subjects', 'array-contains', subject);
}

export async function getActiveTeachers(): Promise<Teacher[]> {
  return teachersService.getWhere('status', '==', 'active');
}

// Class operations
export async function getActiveClasses(): Promise<Class[]> {
  return classesService.getWhere('status', '==', 'active');
}

// Result operations
export async function getResultsByStudent(studentId: string): Promise<Result[]> {
  return resultsService.getWhere('studentId', '==', studentId);
}

export async function getResultsByClassAndTerm(className: string, term: string, academicYear: string): Promise<Result[]> {
  const q = query(
    collection(db, 'results'),
    where('class', '==', className),
    where('term', '==', term),
    where('academicYear', '==', academicYear)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Result));
}

// Attendance operations
export async function getAttendanceByDate(date: string): Promise<Attendance[]> {
  return attendanceService.getWhere('date', '==', date);
}

export async function getAttendanceByStudentAndDateRange(
  studentId: string,
  startDate: string,
  endDate: string
): Promise<Attendance[]> {
  const q = query(
    collection(db, 'attendance'),
    where('studentId', '==', studentId),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance));
}

// Fee operations
export async function getFeesByStudent(studentId: string): Promise<Fee[]> {
  return feesService.getWhere('studentId', '==', studentId);
}

export async function getUnpaidFees(): Promise<Fee[]> {
  const q = query(
    collection(db, 'fees'),
    where('status', 'in', ['unpaid', 'partial', 'overdue'])
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Fee));
}

// Payment operations
export async function getPaymentsByStudent(studentId: string): Promise<Payment[]> {
  return paymentsService.getWhere('studentId', '==', studentId);
}

export async function getPaymentsByDateRange(startDate: string, endDate: string): Promise<Payment[]> {
  const q = query(
    collection(db, 'payments'),
    where('paymentDate', '>=', new Date(startDate)),
    where('paymentDate', '<=', new Date(endDate)),
    orderBy('paymentDate', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
}

// Batch operations
export async function createBulkStudentFees(
  students: Student[],
  feeStructure: FeeStructure
): Promise<void> {
  const batch = writeBatch(db);
  
  students.forEach(student => {
    Object.entries(feeStructure.fees).forEach(([feeType, amount]) => {
      const feeRef = doc(collection(db, 'fees'));
      batch.set(feeRef, {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        class: student.class,
        feeType,
        amount,
        amountPaid: 0,
        balance: amount,
        dueDate: feeStructure.dueDate,
        status: 'unpaid',
        term: feeStructure.term,
        academicYear: feeStructure.academicYear,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
  });
  
  await batch.commit();
}

// Analytics functions
export async function getDashboardStats(): Promise<{
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  pendingFees: number;
  totalRevenue: number;
}> {
  try {
    const [students, teachers, classes, fees, payments] = await Promise.all([
      getActiveStudents(),
      getActiveTeachers(),
      getActiveClasses(),
      getUnpaidFees(),
      paymentsService.getAll()
    ]);

    const pendingFees = fees.reduce((sum, fee) => sum + fee.balance, 0);
    const totalRevenue = payments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);

    return {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalClasses: classes.length,
      pendingFees,
      totalRevenue,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalStudents: 0,
      totalTeachers: 0,
      totalClasses: 0,
      pendingFees: 0,
      totalRevenue: 0,
    };
  }
}