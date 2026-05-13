import mongoose, { Schema, Document } from 'mongoose';

export interface IStore extends Document {
  name: string;
  subdomain: string;
  customDomain?: string;
  upiId?: string;
  ownerId: mongoose.Types.ObjectId;
  theme?: string;
  homepageSections?: Record<string, any>;
  description?: string;
  logo?: string;
  bannerImage?: string;
  favicon?: string;
  socialLinks?: { instagram?: string; facebook?: string; twitter?: string };
  contactEmail?: string;
  returnPolicy?: string;
  isActive: boolean;
}

const StoreSchema = new Schema<IStore>(
  {
    name: { type: String, required: true },
    subdomain: { type: String, required: true, unique: true, lowercase: true, trim: true },
    customDomain: { type: String, default: null, sparse: true },
    upiId: { type: String, default: null },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    theme: { type: String, default: 'theme-one' },
    homepageSections: { type: Schema.Types.Mixed, default: {} },
    description: { type: String, default: '' },
    logo: { type: String, default: null },
    bannerImage: { type: String, default: null },
    favicon: { type: String, default: null },
    socialLinks: {
      instagram: String,
      facebook: String,
      twitter: String,
    },
    contactEmail: { type: String, default: null },
    returnPolicy: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default (mongoose.models.Store as mongoose.Model<IStore>) ||
  mongoose.model<IStore>('Store', StoreSchema);
