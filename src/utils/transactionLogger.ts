
import { supabase } from '@/integrations/supabase/client';
import { TransactionType } from '@/store/transactionStore';

export interface TransactionLogData {
  itemId: string;
  type: TransactionType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  unitPrice?: number;
  referenceNumber?: string;
  notes?: string;
}

export const logTransaction = async ({
  itemId,
  type,
  quantity,
  previousQuantity,
  newQuantity,
  unitPrice,
  referenceNumber,
  notes
}: TransactionLogData) => {
  try {
    const totalValue = unitPrice ? Math.abs(quantity) * unitPrice : null;

    const { error } = await supabase
      .from('transactions')
      .insert([{
        item_id: itemId,
        transaction_type: type,
        quantity: quantity,
        previous_quantity: previousQuantity,
        new_quantity: newQuantity,
        unit_price: unitPrice,
        total_value: totalValue,
        reference_number: referenceNumber,
        notes: notes,
        user_id: null // Will be set by auth if implemented
      }]);

    if (error) {
      console.error('Error logging transaction:', error);
      throw error;
    }

    console.log('Transaction logged successfully:', { itemId, type, quantity });
  } catch (error) {
    console.error('Failed to log transaction:', error);
    // Don't throw the error to prevent breaking the main operation
  }
};
