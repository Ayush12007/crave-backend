import DailyCounter from '../models/DailyCounter.js';

const getNextSequence = async () => {
  const today = new Date().toISOString().slice(0, 10);
  
  const counter = await DailyCounter.findOneAndUpdate(
    { date: today },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const sequenceStr = counter.seq.toString().padStart(3, '0');
  return `#${sequenceStr}`;
};

export default getNextSequence;