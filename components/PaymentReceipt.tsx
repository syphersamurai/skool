'use client';

import { useState, useRef } from 'react';
import { formatCurrency } from '@/lib/paystack';

interface PaymentReceiptProps {
  payment: {
    id: string;
    feeId: string;
    studentId: string;
    studentName: string;
    amount: number;
    paymentMethod: string;
    paymentDate: string | Date;
    transactionId?: string;
    discountApplied?: boolean;
    discountAmount?: number;
    createdAt: any;
  };
  fee?: {
    feeType: string;
    class: string;
    term: string;
    academicYear: string;
    amount: number;
    amountPaid: number;
    balance: number;
  };
  school?: {
    name: string;
    address: string;
    logo?: string;
    phone?: string;
    email?: string;
  };
}

export default function PaymentReceipt({ payment, fee, school }: PaymentReceiptProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = () => {
    setIsPrinting(true);
    
    // Use window.print() to print the receipt
    const printContent = receiptRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;
    
    if (printContent) {
      document.body.innerHTML = `
        <html>
          <head>
            <title>Payment Receipt</title>
            <style>
              body { font-family: Arial, sans-serif; }
              .receipt { max-width: 800px; margin: 0 auto; padding: 20px; }
              .receipt-header { text-align: center; margin-bottom: 20px; }
              .receipt-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
              .receipt-subtitle { font-size: 16px; color: #666; }
              .receipt-info { margin-bottom: 20px; }
              .receipt-info-row { display: flex; margin-bottom: 5px; }
              .receipt-info-label { font-weight: bold; width: 150px; }
              .receipt-info-value { flex: 1; }
              .receipt-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              .receipt-table th, .receipt-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .receipt-table th { background-color: #f2f2f2; }
              .receipt-footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
            </style>
          </head>
          <body>
            <div class="receipt">${printContent}</div>
          </body>
        </html>
      `;
      
      window.print();
      document.body.innerHTML = originalContent;
      setIsPrinting(false);
    }
  };
  
  // Format date for display
  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format time for display
  const formatTime = (date: Date | string) => {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toLocaleTimeString('en-NG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-6" ref={receiptRef}>
        {/* Receipt Header */}
        <div className="text-center mb-6">
          {school?.logo && (
            <img 
              src={school.logo} 
              alt={`${school.name} Logo`} 
              className="h-16 mx-auto mb-2" 
            />
          )}
          <h2 className="text-2xl font-bold">{school?.name || 'School Management System'}</h2>
          <p className="text-gray-600">{school?.address || ''}</p>
          {school?.phone && <p className="text-gray-600">Tel: {school.phone}</p>}
          {school?.email && <p className="text-gray-600">Email: {school.email}</p>}
          <div className="mt-4 border-t border-b border-gray-200 py-2">
            <h3 className="text-xl font-semibold">PAYMENT RECEIPT</h3>
            <p className="text-gray-500">Receipt No: {payment.id.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>
        
        {/* Student & Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-500 mb-2">STUDENT INFORMATION</h4>
            <p className="font-medium">{payment.studentName}</p>
            <p className="text-gray-600">ID: {payment.studentId}</p>
            {fee && <p className="text-gray-600">Class: {fee.class}</p>}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-500 mb-2">PAYMENT INFORMATION</h4>
            <p className="text-gray-600">Date: {formatDate(payment.paymentDate)}</p>
            <p className="text-gray-600">Time: {formatTime(payment.paymentDate)}</p>
            <p className="text-gray-600">Method: {payment.paymentMethod}</p>
            {payment.transactionId && (
              <p className="text-gray-600">Transaction ID: {payment.transactionId}</p>
            )}
          </div>
        </div>
        
        {/* Fee Details */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">FEE DETAILS</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Description</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border-b">
                    {fee ? `${fee.feeType} - ${fee.term}, ${fee.academicYear}` : 'Fee Payment'}
                  </td>
                  <td className="px-4 py-2 text-right border-b">
                    {formatCurrency((payment.amount + (payment.discountAmount || 0)) * 100, 'NGN')}
                  </td>
                </tr>
                {payment.discountApplied && payment.discountAmount && payment.discountAmount > 0 && (
                  <tr className="text-green-600">
                    <td className="px-4 py-2 border-b">Discount Applied</td>
                    <td className="px-4 py-2 text-right border-b">-{formatCurrency(payment.discountAmount * 100, 'NGN')}</td>
                  </tr>
                )}
                <tr className="font-bold">
                  <td className="px-4 py-2">Total Paid</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(payment.amount * 100, 'NGN')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Balance Information */}
        {fee && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Previous Balance:</p>
                <p className="text-sm font-medium">Amount Paid:</p>
                <p className="text-sm font-medium">Current Balance:</p>
              </div>
              <div className="text-right">
                <p className="text-sm">{formatCurrency((fee.amountPaid - payment.amount + fee.balance) * 100, 'NGN')}</p>
                <p className="text-sm">{formatCurrency(payment.amount * 100, 'NGN')}</p>
                <p className="text-sm font-bold">{formatCurrency(fee.balance * 100, 'NGN')}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Thank you for your payment!</p>
          <p className="mt-2">This is a computer-generated receipt and does not require a signature.</p>
        </div>
      </div>
      
      {/* Print Button */}
      <div className="p-4 bg-gray-50 border-t flex justify-end">
        <button
          onClick={handlePrint}
          disabled={isPrinting}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
        >
          {isPrinting ? 'Printing...' : 'Print Receipt'}
        </button>
      </div>
    </div>
  );
}