import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import crypto from 'crypto';

// Verify that the request is coming from Paystack
function verifyPaystackSignature(req: NextRequest, body: string): boolean {
  try {
    const signature = req.headers.get('x-paystack-signature');
    if (!signature) return false;
    
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY as string)
      .update(body)
      .digest('hex');
    
    return hash === signature;
  } catch (error) {
    console.error('Error verifying Paystack signature:', error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get the raw request body as text
    const body = await req.text();
    
    // Verify the request is from Paystack
    if (!verifyPaystackSignature(req, body)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // Parse the body
    const event = JSON.parse(body);
    
    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data);
        break;
      
      case 'transfer.success':
        // Handle successful transfers (e.g., refunds)
        await handleSuccessfulTransfer(event.data);
        break;
      
      // Add more event types as needed
      
      default:
        // Log unhandled event types for future reference
        console.log(`Unhandled Paystack event: ${event.event}`, event);
    }
    
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing Paystack webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleSuccessfulPayment(data: any) {
  try {
    // Extract metadata from the payment
    const { metadata, reference, amount, customer, paid_at } = data;
    
    if (!metadata || !metadata.fee_id) {
      console.error('Missing fee_id in payment metadata');
      return;
    }
    
    // Get the fee record
    const feeRef = doc(db, 'fees', metadata.fee_id);
    const feeSnap = await getDoc(feeRef);
    
    if (!feeSnap.exists()) {
      console.error(`Fee record with ID ${metadata.fee_id} not found`);
      return;
    }
    
    const feeData = feeSnap.data();
    const amountInNaira = amount / 100; // Convert from kobo to naira
    
    // Update the fee record
    const newAmountPaid = (feeData.amountPaid || 0) + amountInNaira;
    const newBalance = feeData.amount - newAmountPaid;
    const newStatus = newBalance <= 0 ? 'paid' : 'partial';
    
    await updateDoc(feeRef, {
      amountPaid: newAmountPaid,
      balance: newBalance,
      status: newStatus,
      lastUpdated: serverTimestamp()
    });
    
    // Record the payment in the payments collection
    await addDoc(collection(db, 'payments'), {
      feeId: metadata.fee_id,
      studentId: metadata.student_id,
      studentName: metadata.student_name,
      amount: amountInNaira,
      paymentMethod: 'paystack',
      paymentDate: new Date(paid_at),
      transactionId: reference,
      status: 'completed',
      metadata: {
        paystack_reference: reference,
        customer_email: customer.email,
        discount_applied: metadata.discount_applied,
        discount_amount: metadata.discount_amount
      },
      createdAt: serverTimestamp()
    });
    
    console.log(`Successfully processed payment for fee ${metadata.fee_id}`);
  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw error; // Re-throw to be caught by the main handler
  }
}

async function handleSuccessfulTransfer(data: any) {
  // Handle refunds or other transfers
  // This is a placeholder for future implementation
  console.log('Successful transfer:', data);
}