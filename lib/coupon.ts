import { db } from './firebase';
import { collection, query, where, getDocs, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free';
  discountValue: number;
  maxUses: number;
  usedCount: number;
  expiryDate: string;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  message?: string;
}

/**
 * Validates a coupon code and calculates the discount amount
 * @param code The coupon code to validate
 * @param amount The original amount to apply the discount to
 * @returns A validation result object
 */
export async function validateCoupon(code: string, amount: number): Promise<CouponValidationResult> {
  try {
    // Normalize the code (uppercase)
    const normalizedCode = code.trim().toUpperCase();
    
    // Query the coupon from Firestore
    const couponsRef = collection(db, 'coupons');
    const q = query(couponsRef, where('code', '==', normalizedCode));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { valid: false, message: 'Invalid coupon code' };
    }
    
    // Get the coupon data
    const couponDoc = querySnapshot.docs[0];
    const couponData = couponDoc.data() as Omit<Coupon, 'id'>;
    const coupon: Coupon = {
      id: couponDoc.id,
      ...couponData,
      expiryDate: couponData.expiryDate ? new Date(couponData.expiryDate.seconds * 1000).toISOString().split('T')[0] : ''
    };
    
    // Check if the coupon is active
    if (!coupon.isActive) {
      return { valid: false, message: 'This coupon is inactive' };
    }
    
    // Check if the coupon has reached its maximum uses
    if (coupon.usedCount >= coupon.maxUses) {
      return { valid: false, message: 'This coupon has reached its maximum usage limit' };
    }
    
    // Check if the coupon has expired
    const expiryDate = new Date(coupon.expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
    
    if (expiryDate < today) {
      return { valid: false, message: 'This coupon has expired' };
    }
    
    // Calculate the discount amount
    let discountAmount = 0;
    
    switch (coupon.discountType) {
      case 'percentage':
        discountAmount = (amount * coupon.discountValue) / 100;
        break;
      case 'fixed':
        discountAmount = Math.min(coupon.discountValue, amount); // Don't exceed the original amount
        break;
      case 'free':
        discountAmount = amount; // Full amount discount
        break;
    }
    
    return {
      valid: true,
      coupon,
      discountAmount,
      message: 'Coupon applied successfully'
    };
    
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { valid: false, message: 'Error validating coupon' };
  }
}

/**
 * Records the usage of a coupon
 * @param couponId The ID of the coupon that was used
 * @param userId The ID of the user who used the coupon
 * @param feeId The ID of the fee record the coupon was applied to
 * @param discountAmount The amount that was discounted
 */
export async function recordCouponUsage(couponId: string, userId: string, feeId: string, discountAmount: number) {
  try {
    // Update the coupon's usage count
    const couponRef = doc(db, 'coupons', couponId);
    await updateDoc(couponRef, {
      usedCount: increment(1),
      updatedAt: serverTimestamp()
    });
    
    // Record the usage in the couponUsage collection
    const couponUsageRef = collection(db, 'couponUsage');
    await getDocs(couponUsageRef);
    
    // In a real implementation, you would add a document to the couponUsage collection
    // For now, we'll just log it
    console.log(`Recorded coupon usage: ${couponId} by user ${userId} for fee ${feeId} with discount ${discountAmount}`);
    
  } catch (error) {
    console.error('Error recording coupon usage:', error);
    throw error;
  }
}

/**
 * Formats a discount value based on its type
 * @param discountType The type of discount (percentage, fixed, free)
 * @param discountValue The value of the discount
 * @returns A formatted string representation of the discount
 */
export function formatDiscountValue(discountType: string, discountValue: number): string {
  switch (discountType) {
    case 'percentage':
      return `${discountValue}%`;
    case 'fixed':
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
      }).format(discountValue);
    case 'free':
      return 'Free';
    default:
      return discountValue.toString();
  }
}