// This script can be used to seed test payment records in Firestore
// Run with: node scripts/seed-payments.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample payment data
const samplePayments = [
  {
    feeId: 'fee123', // Replace with actual fee ID
    studentId: 'student456', // Replace with actual student ID
    studentName: 'John Doe',
    amount: 25000, // ₦25,000
    paymentMethod: 'Paystack',
    paymentDate: new Date(),
    transactionId: 'PSK_' + Math.random().toString(36).substring(2, 15),
    discountApplied: true,
    discountAmount: 5000, // ₦5,000 discount
    status: 'completed',
    createdAt: serverTimestamp()
  },
  {
    feeId: 'fee124', // Replace with actual fee ID
    studentId: 'student789', // Replace with actual student ID
    studentName: 'Jane Smith',
    amount: 15000, // ₦15,000
    paymentMethod: 'Bank Transfer',
    paymentDate: new Date(Date.now() - 86400000), // Yesterday
    transactionId: 'BNK_' + Math.random().toString(36).substring(2, 15),
    discountApplied: false,
    status: 'completed',
    createdAt: serverTimestamp()
  },
  {
    feeId: 'fee125', // Replace with actual fee ID
    studentId: 'student101', // Replace with actual student ID
    studentName: 'Michael Johnson',
    amount: 30000, // ₦30,000
    paymentMethod: 'Cash',
    paymentDate: new Date(Date.now() - 172800000), // 2 days ago
    status: 'completed',
    createdAt: serverTimestamp()
  },
  {
    feeId: 'fee126', // Replace with actual fee ID
    studentId: 'student202', // Replace with actual student ID
    studentName: 'Sarah Williams',
    amount: 20000, // ₦20,000
    paymentMethod: 'Paystack',
    paymentDate: new Date(Date.now() - 259200000), // 3 days ago
    transactionId: 'PSK_' + Math.random().toString(36).substring(2, 15),
    status: 'pending',
    createdAt: serverTimestamp()
  },
  {
    feeId: 'fee127', // Replace with actual fee ID
    studentId: 'student303', // Replace with actual student ID
    studentName: 'David Brown',
    amount: 18000, // ₦18,000
    paymentMethod: 'Cheque',
    paymentDate: new Date(Date.now() - 345600000), // 4 days ago
    transactionId: 'CHQ_' + Math.random().toString(36).substring(2, 15),
    status: 'failed',
    createdAt: serverTimestamp()
  }
];

// Function to seed payments
async function seedPayments() {
  try {
    console.log('Seeding payments...');
    
    for (const payment of samplePayments) {
      const docRef = await addDoc(collection(db, 'payments'), payment);
      console.log(`Payment added with ID: ${docRef.id}`);
    }
    
    console.log('Payments seeded successfully!');
  } catch (error) {
    console.error('Error seeding payments:', error);
  }
}

// Run the seed function
seedPayments();