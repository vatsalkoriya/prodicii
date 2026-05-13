import mongoose, { Schema, Document } from 'mongoose';

export type DomainStatus = 'pending' | 'verified' | 'failed';

export interface IDomain extends Document {
  storeId: mongoose.Types.ObjectId;
  domainName: string;
  verificationStatus: DomainStatus;
  verificationToken: string;
  isPrimary: boolean;
}

const DomainSchema = new Schema<IDomain>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    domainName: { type: String, required: true, unique: true, lowercase: true, trim: true },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      default: 'pending',
    },
    verificationToken: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default (mongoose.models.Domain as mongoose.Model<IDomain>) ||
  mongoose.model<IDomain>('Domain', DomainSchema);
