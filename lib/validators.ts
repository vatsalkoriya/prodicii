import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const storeCreateSchema = z.object({
  name: z.string().min(2).max(60),
  subdomain: z
    .string()
    .min(2)
    .max(32)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).optional(),
  upiId: z.string().optional(),
});

export const storeUpdateSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  upiId: z.string().optional(),
  customDomain: z.string().optional(),
  theme: z.enum(['theme-one', 'theme-two']).optional(),
  homepageSections: z.record(z.any()).optional(),
  description: z.string().max(500).optional(),
  logo: z.string().url().optional(),
  bannerImage: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  returnPolicy: z.string().max(2000).optional(),
  socialLinks: z
    .object({
      instagram: z.string().url().optional(),
      facebook: z.string().url().optional(),
      twitter: z.string().url().optional(),
    })
    .optional(),
});

export const productSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  price: z.number().nonnegative(),
  upiId: z.string().optional(),
  costPrice: z.number().nonnegative().optional(),
  description: z.string().max(5000).optional(),
  image: z.string().optional(),
  inventory: z.number().int().nonnegative().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sku: z.string().optional(),
  attachments: z
    .array(
      z.object({
        name: z.string().min(1).max(255),
        url: z.string().url(),
        mimeType: z.string().optional(),
        size: z.number().int().nonnegative().max(5 * 1024 * 1024).optional(),
      })
    )
    .optional(),
  externalLinks: z
    .array(
      z.object({
        label: z.string().min(1).max(120),
        url: z.string().url(),
      })
    )
    .optional(),
  isFeatured: z.boolean().optional(),
  storeId: z.string().min(1),
});

export const orderCreateSchema = z.object({
  storeId: z.string().min(1),
  products: z.array(
    z.object({ productId: z.string(), qty: z.number().int().min(1) })
  ),
  customer: z
    .object({
      name: z.string().min(1),
      email: z.string().email().optional(),
      phone: z.string().optional(),
    })
    .optional(),
  shippingAddress: z
    .object({
      line1: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
    })
    .optional(),
});

export const paymentSubmitSchema = z.object({
  orderId: z.string().min(1),
  utr: z
    .string()
    .min(12)
    .max(22)
    .regex(/^[A-Z0-9]+$/i, 'Invalid UTR format'),
  screenshotUrl: z.string().url().optional(),
});
