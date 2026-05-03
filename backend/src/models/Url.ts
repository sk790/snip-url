import mongoose, { Document, Schema } from 'mongoose';

export interface IUrl extends Document {
  originalUrl: string;
  shortUrl: string;
  urlCode: string;
  createdAt: Date;
  startDate?: Date;
  expiresAt?: Date;
  password?: string;
  userId?: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const UrlSchema: Schema = new Schema({
  originalUrl: { type: String, required: true },
  shortUrl: { type: String, required: true },
  urlCode: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  startDate: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  password: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
});

export default mongoose.model<IUrl>('Url', UrlSchema);
