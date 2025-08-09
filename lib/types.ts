// Common types used throughout the application

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  class: string;
  admissionNumber: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  address: string;
  medicalInfo?: string;
  emergencyContact: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'graduated' | 'transferred';
  profileImage?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  address: string;
  qualification: string;
  experience: number;
  subjects: string[];
  classes: string[];
  employeeId: string;
  hireDate: string;
  salary: number;
  status: 'active' | 'inactive' | 'terminated';
  profileImage?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Class {
  id: string;
  name: string;
  level: 'Basic 1' | 'Basic 2' | 'Basic 3' | 'Basic 4' | 'Basic 5' | 'Basic 6';
  section?: string;
  capacity: number;
  currentEnrollment: number;
  classTeacherId: string;
  classTeacherName: string;
  subjects: string[];
  academicYear: string;
  status: 'active' | 'inactive';
  createdAt: any;
  updatedAt: any;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  classes: string[];
  teacherId?: string;
  teacherName?: string;
  isCore: boolean;
  status: 'active' | 'inactive';
  createdAt: any;
  updatedAt: any;
}

export interface Result {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  term: '1st Term' | '2nd Term' | '3rd Term';
  academicYear: string;
  subjects: {
    [subjectName: string]: {
      firstTest: number;
      secondTest: number;
      exam: number;
      total: number;
      grade: string;
      position?: number;
    };
  };
  totalScore: number;
  averageScore: number;
  position: number;
  totalStudents: number;
  remarks?: string;
  teacherComment?: string;
  principalComment?: string;
  status: 'draft' | 'published' | 'approved';
  createdAt: any;
  updatedAt: any;
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  timeIn?: string;
  timeOut?: string;
  remarks?: string;
  recordedBy: string;
  createdAt: any;
  updatedAt: any;
}

export interface Fee {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  feeType: string;
  amount: number;
  amountPaid: number;
  balance: number;
  dueDate: string;
  status: 'paid' | 'partial' | 'unpaid' | 'overdue';
  term: '1st Term' | '2nd Term' | '3rd Term';
  academicYear: string;
  description?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Payment {
  id: string;
  feeId: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'paystack';
  paymentDate: any;
  transactionId?: string;
  discountApplied?: boolean;
  discountAmount?: number;
  status: 'completed' | 'pending' | 'failed';
  metadata?: any;
  createdAt: any;
  updatedAt: any;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free';
  discountValue: number;
  maxUses: number;
  usedCount: number;
  expiryDate: string;
  isActive: boolean;
  applicableClasses?: string[];
  applicableFeeTypes?: string[];
  createdAt: any;
  updatedAt: any;
}

export interface FeeStructure {
  id: string;
  class: string;
  academicYear: string;
  term: '1st Term' | '2nd Term' | '3rd Term';
  fees: {
    [feeType: string]: number;
  };
  totalAmount: number;
  dueDate: string;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

// Nigerian Primary School Subjects
export const NIGERIAN_PRIMARY_SUBJECTS = [
  'English Language',
  'Mathematics',
  'Basic Science and Technology',
  'Social Studies',
  'Nigerian Language (Hausa)',
  'Nigerian Language (Igbo)',
  'Nigerian Language (Yoruba)',
  'Creative and Cultural Arts',
  'Physical and Health Education',
  'Civic Education',
  'Computer Studies',
  'Agricultural Science',
  'Home Economics',
  'French Language',
  'Arabic Studies',
  'Christian Religious Studies',
  'Islamic Religious Studies'
];

// Nigerian Primary School Classes
export const NIGERIAN_PRIMARY_CLASSES = [
  'Basic 1',
  'Basic 2',
  'Basic 3',
  'Basic 4',
  'Basic 5',
  'Basic 6'
];

// Academic Terms
export const ACADEMIC_TERMS = [
  '1st Term',
  '2nd Term',
  '3rd Term'
];

// Fee Types
export const FEE_TYPES = [
  'Tuition Fee',
  'Development Fee',
  'Sports Fee',
  'Library Fee',
  'Laboratory Fee',
  'Examination Fee',
  'Computer Fee',
  'Transport Fee',
  'Feeding Fee',
  'Uniform Fee',
  'Books Fee',
  'Medical Fee',
  'Registration Fee',
  'Graduation Fee'
];

// Grading System
export const GRADING_SYSTEM = {
  'A': { min: 80, max: 100, description: 'Excellent' },
  'B': { min: 70, max: 79, description: 'Very Good' },
  'C': { min: 60, max: 69, description: 'Good' },
  'D': { min: 50, max: 59, description: 'Fair' },
  'E': { min: 40, max: 49, description: 'Pass' },
  'F': { min: 0, max: 39, description: 'Fail' }
};