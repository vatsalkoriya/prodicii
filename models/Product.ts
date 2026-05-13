import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  price: number;
  upiId?: string;
  costPrice?: number;
  image?: string;
  images?: string[];
  inventory: number;
  description?: string;
  category?: string;
  tags?: string[];
  sku?: string;
  attachments?: Array<{
    name: string;
    url: string;
    mimeType?: string;
    size?: number;
  }>;
  externalLinks?: Array<{
    label: string;
    url: string;
  }>;
  isActive: boolean;
  isFeatured: boolean;
  storeId: mongoose.Types.ObjectId;
  seo?: { metaTitle?: string; metaDescription?: string };
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    price: { type: Number, required: true },
    upiId: { type: String, default: null },
    costPrice: { type: Number, default: null },
    image: { type: String, default: null },
    images: [{ type: String }],
    inventory: { type: Number, default: 0 },
    description: { type: String, default: '' },
    category: { type: String, default: null },
    tags: [{ type: String }],
    sku: { type: String, default: null },
    attachments: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        mimeType: { type: String, default: null },
        size: { type: Number, default: null },
      },
    ],
    externalLinks: [
      {
        label: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    seo: {
      metaTitle: String,
      metaDescription: String,
    },
  },
  { timestamps: true }
);

// Compound unique index: slug must be unique per store
ProductSchema.index({ slug: 1, storeId: 1 }, { unique: true });

export default (mongoose.models.Product as mongoose.Model<IProduct>) ||
  mongoose.model<IProduct>('Product', ProductSchema);
