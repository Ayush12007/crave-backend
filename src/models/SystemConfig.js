import mongoose from 'mongoose';

const SystemConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g., 'global_commission'
  value: { type: mongoose.Schema.Types.Mixed, required: true }, // e.g., 10 (percent)
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('SystemConfig', SystemConfigSchema);