import mongoose, { Document, Schema } from 'mongoose';

export interface IClick extends Document {
  urlId: mongoose.Types.ObjectId;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  browser: string;
  os: string;
  device: string;
}

const ClickSchema: Schema = new Schema({
  urlId: { type: Schema.Types.ObjectId, ref: 'Url', required: true },
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String, default: 'Unknown' },
  userAgent: { type: String, default: 'Unknown' },
  browser: { type: String, default: 'Unknown' },
  os: { type: String, default: 'Unknown' },
  device: { type: String, default: 'Desktop' }
});

export default mongoose.model<IClick>('Click', ClickSchema);
