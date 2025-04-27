const Business = require('../models/Business');
const Offer = require('../models/Offer');
const Session = require('../models/Session');

// Create a new business
exports.createBusiness = async (req, res) => {
  try {
    const { user, companyName, phone, address } = req.body;

    const business = await Business.create({
      user,
      companyName,
      phone,
      address
    });

    res.status(201).json(business);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all businesses
exports.getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find().populate('user');
    res.json(businesses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single business by ID
exports.getBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId).populate('user');
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json(business);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a business
exports.updateBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const updates = req.body;

    const business = await Business.findByIdAndUpdate(businessId, updates, { new: true });
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json(business);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a business
exports.deleteBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findByIdAndDelete(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json({ message: 'Business deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Make an offer on a session
exports.makeOffer = async (req, res) => {
  try {
    const { businessId, sessionId, price } = req.body;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const offer = await Offer.create({
      session: sessionId,
      business: businessId,
      phone: business.phone,
      price,
      status: 'pending'
    });

    res.status(201).json(offer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all offers made by a business
exports.getBusinessOffers = async (req, res) => {
  try {
    const { businessId } = req.params;

    const offers = await Offer.find({ business: businessId })
      .populate('session')
      .populate('business');

    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
