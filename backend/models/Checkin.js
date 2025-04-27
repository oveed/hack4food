const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  students: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    percentage: { type: Number, default: 0 }
  }]
  }, { timestamps: true });

const CheckIn = mongoose.models.CheckIn || mongoose.model('CheckIn', checkInSchema);

module.exports = CheckIn;
