import mongoose from 'mongoose';

const DailyCounterSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true
  },
  seq: {
    type: Number,
    default: 0
  }
});

export default mongoose.model('DailyCounter', DailyCounterSchema);