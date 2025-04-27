const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  phone: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Offer', OfferSchema);
