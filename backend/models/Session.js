const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  day: { type: String, required: true },
  meal: [{ type: String, required: true }],
  type: { type: String, enum: ['lunch', 'dinner'], required: true },
  initialWeight: { type: Number, required: true },
  wasteWeight: { type: Number, default: 0 },
  numberOfStudentsRegistered: { type: Number, default: 0 },
  numberOfStudentsCheckedIn: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
