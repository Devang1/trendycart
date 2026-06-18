import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters")
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const productSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(20),
  categoryIds: z.array(z.string().min(1)).min(1),
  brand: z.string().min(2),
  price: z.coerce.number().positive(),
  discountPrice: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().nonnegative(),
  images: z.array(z.string().url()).min(1)
});

export const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(8),
  line1: z.string().min(4),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(4),
  country: z.string().default("India")
});

export const checkoutSchema = z.object({
  addressId: z.string().optional(),
  shippingAddress: addressSchema,
  paymentMethod: z.enum(["RAZORPAY", "COD"])
});

export const reviewSchema = z.object({
  productId: z.string(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional()
});
