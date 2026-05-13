import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus =
  | 'pending_payment'
  | 'payment_submitted'
  | 'payment_verified'
  | 'payment_rejected';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  qty: number;
  price: number;
  name: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  storeId: mongoose.Types.ObjectId;
  products: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  utr?: string;
  screenshotUrl?: string;
  customer?: mongoose.Types.ObjectId;
  customerSnapshot?: { name?: string; email?: string; phone?: string };
  shippingAddress?: {
    line1?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  paymentVerifiedAt?: Date;
  paymentVerifiedBy?: mongoose.Types.ObjectId;
  ipAddress?: string;
  notes?: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, unique: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    products: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        qty: Number,
        price: Number,
        name: String,
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending_payment', 'payment_submitted', 'payment_verified', 'payment_rejected'],
      default: 'pending_payment',
    },
    utr: { type: String, default: null },
    screenshotUrl: { type: String, default: null },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', default: null },
    customerSnapshot: {
      name: String,
      email: String,
      phone: String,
    },
    shippingAddress: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
    },
    paymentVerifiedAt: { type: Date, default: null },
    paymentVerifiedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    ipAddress: { type: String, default: null },
    notes: { type: String, default: null },
  },
  { timestamps: true }
);

// Auto-generate order number before save
OrderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Prevent duplicate UTR submissions within the same store
OrderSchema.index({ utr: 1, storeId: 1 }, { sparse: true });

export default (mongoose.models.Order as mongoose.Model<IOrder>) ||
  mongoose.model<IOrder>('Order', OrderSchema);
