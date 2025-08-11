import { z } from 'zod';

export const inventoryItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  quantity: z.number().min(0, 'Quantity must be non-negative').max(999999, 'Quantity too large'),
  price: z.number().min(0, 'Price must be non-negative').max(999999, 'Price too large'),
  category: z.string().min(1, 'Category is required').max(50, 'Category must be less than 50 characters'),
  vendor: z.string().max(100, 'Vendor must be less than 100 characters').optional(),
  sku: z.string().min(1, 'SKU is required').max(50, 'SKU must be less than 50 characters'),
  barcode: z.string().max(50, 'Barcode must be less than 50 characters').optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  low_stock_threshold: z.number().min(0, 'Threshold must be non-negative').max(999999, 'Threshold too large')
});

export const businessLocationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  is_default: z.boolean().optional()
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters')
});

export const authSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  businessName: z.string().min(1, 'Business name is required').max(100, 'Business name must be less than 100 characters').optional()
});

// Sanitization functions
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const sanitizeNumber = (input: number): number => {
  return Math.max(0, Math.min(999999, input));
};