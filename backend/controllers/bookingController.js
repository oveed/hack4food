const Booking = require('../models/Booking');
const Session = require('../models/Session');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { sessionId, studentIds } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const booking = await Booking.create({
      session: sessionId,
      students: studentIds
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a student to an existing booking
exports.addStudentToBooking = async (req, res) => {
  try {
    const { sessionId, studentId } = req.body;

    const booking = await Booking.findOne({ session: sessionId });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found', sessionId });
    }

    if (!booking.students.includes(studentId)) {
      booking.students.push(studentId);
      await booking.save();
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove a student from a booking
exports.removeStudentFromBooking = async (req, res) => {
  try {
    const { bookingId, studentId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.students = booking.students.filter(id => id.toString() !== studentId);
    await booking.save();

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a booking by ID (with populated session and students)
exports.getBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate('session')
      .populate('students');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('students');

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a booking
exports.updateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { sessionId, studentIds } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (sessionId) {
      const session = await Session.findById(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      booking.session = sessionId;
    }

    if (studentIds) {
      booking.students = studentIds;
    }

    await booking.save();

    const updatedBooking = await Booking.findById(bookingId)
      .populate('session')
      .populate('students');

    res.json(updatedBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByIdAndDelete(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
