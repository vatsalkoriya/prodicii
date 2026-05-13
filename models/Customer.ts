import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  storeId: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  totalSpent: number;
  orderCount: number;
  lastOrderAt?: Date;
  isBlocked: boolean;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    name: { type: String, required: true },
    email: { type: String, default: null },
    phone: { type: String, default: null },
    address: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
    },
    totalSpent: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 },
    lastOrderAt: { type: Date, default: null },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default (mongoose.models.Customer as mongoose.Model<ICustomer>) ||
  mongoose.model<ICustomer>('Customer', CustomerSchema);
