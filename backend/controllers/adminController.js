const Admin = require('../models/Admin');
const Offer = require('../models/Offer');

// Approve an offer
exports.approveOffer = async (req, res) => {
  try {
    const { offerId } = req.params;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending offers can be approved' });
    }

    offer.status = 'accepted';
    await offer.save();

    res.json({ message: 'Offer approved successfully', offer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reject an offer
exports.rejectOffer = async (req, res) => {
  try {
    const { offerId } = req.params;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending offers can be rejected' });
    }

    offer.status = 'rejected';
    await offer.save();

    res.json({ message: 'Offer rejected successfully', offer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find();
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

