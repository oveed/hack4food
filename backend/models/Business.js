const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Business', businessSchema);
