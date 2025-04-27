const Session = require('../models/Session');

const Booking = require('../models/Booking');

exports.createSession = async (req, res) => {
    try {
        const session = await Session.create(req.body);

        if (!session) {
            return res.status(400).json({ error: 'Failed to create session' });
        }

        const booking = await Booking.create({
            session: session._id,
            students: [] 
        });

        if (!booking) {
            return res.status(400).json({ error: 'Failed to create booking' });
        }

        res.status(201).json({
            session,
            booking
        });
    } catch (err) {
        // Generic error handler
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Get a session by ID
exports.getSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        res.json(session);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all sessions
exports.getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.find();
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a session
exports.updateSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const updates = req.body;

        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        if (updates.date) session.date = updates.date;
        if (updates.day) session.day = updates.day;
        if (updates.type) session.type = updates.type;
        if (updates.initialWeight !== undefined) session.initialWeight = updates.initialWeight;
        if (updates.wasteWeight !== undefined) session.wasteWeight = updates.wasteWeight;
        if (updates.numberOfStudentsRegistered !== undefined) session.numberOfStudentsRegistered = session.numberOfStudentsRegistered + updates.numberOfStudentsRegistered;
        if (updates.numberOfStudentsCheckedIn !== undefined) session.numberOfStudentsCheckedIn = updates.numberOfStudentsCheckedIn;

        await session.save();

        res.json(session);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a session
exports.deleteSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await Session.findByIdAndDelete(sessionId);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        res.json({ message: 'Session deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
