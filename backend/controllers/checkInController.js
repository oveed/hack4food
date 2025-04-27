const CheckIn = require('../models/Checkin');
const Session = require('../models/Session');
const Student = require('../models/Student');

// Create a new check-in
exports.createCheckIn = async (req, res) => {
    try {
        const { sessionId, studentId, percentage = 0 } = req.body;

        // Validate the input
        if (!sessionId || !studentId || typeof percentage !== 'number') {
            return res.status(400).json({ message: 'sessionId, studentId, and percentage are required' });
        }

        // Validate session existence
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Find or create a new CheckIn document for the session
        let checkIn = await CheckIn.findOne({ session: sessionId });

        if (!checkIn) {
            checkIn = new CheckIn({ session: sessionId, students: [] });
        }

        // Check if the student already exists in the session
        const studentExists = checkIn.students.some(s => s.student.toString() === studentId);

        if (!studentExists) {
            // If the student doesn't exist, add them with the percentage
            checkIn.students.push({ student: studentId, percentage });
        } else {
            // If the student already exists, update the percentage
            checkIn.students = checkIn.students.map(s => {
                if (s.student.toString() === studentId) {
                    return { ...s.toObject(), percentage };
                }
                return s;
            });
        }

        // Save the updated CheckIn document
        await checkIn.save();

        // Update the number of students checked in
        session.numberOfStudentsCheckedIn = checkIn.students.length;
        await session.save();

        // Now find the student and decrement their solde
        const student = await Student.findById(studentId);
        if (student) {
            student.solde = (student.solde || 0) - 1;
            if (student.solde < 0) student.solde = 0; // Optional: prevent solde going negative
            await student.save();
        }

        res.status(201).json(checkIn);
    } catch (err) {
        console.error('Error creating/updating check-in:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateStudentPercentageInCheckIn = async (req, res) => {
    try {
        const { sessionId, studentId, percentage } = req.body;

        // Validate the input
        if (!sessionId || !studentId || typeof percentage !== 'number') {
            return res.status(400).json({ message: 'sessionId, studentId, and percentage are required' });
        }

        // Find the CheckIn document for the session
        let checkIn = await CheckIn.findOne({ session: sessionId });

        if (!checkIn) {
          checkIn = new CheckIn({ session: sessionId, students: [] });
        }
        
        // Check if the student already exists in the session
        const studentIndex = checkIn.students.findIndex(s => s.student.toString() === studentId);
        
        if (studentIndex === -1) {
          checkIn.students.push({ student: studentId, percentage });
        } else {
          checkIn.students[studentIndex].percentage = percentage;
        }
        
        // Save the updated CheckIn document
        await checkIn.save();

        res.status(200).json(checkIn);
    } catch (err) {
        console.error('Error updating student percentage:', err);
        res.status(500).json({ error: err.message });
    }
};




// Add a student to an existing check-in
exports.addStudentToCheckIn = async (req, res) => {
    try {
        const { checkInId, studentId } = req.body;

        const checkIn = await CheckIn.findById(checkInId);
        if (!checkIn) {
            return res.status(404).json({ message: 'Check-In not found' });
        }

        if (!checkIn.students.includes(studentId)) {
            checkIn.students.push(studentId);
            await checkIn.save();

            const session = await Session.findById(checkIn.session);
            session.numberOfStudentsCheckedIn += 1;
            await session.save();
        }

        res.json(checkIn);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Remove a student from a check-in
exports.removeStudentFromCheckIn = async (req, res) => {
    try {
        const { checkInId, studentId } = req.body;

        const checkIn = await CheckIn.findById(checkInId);
        if (!checkIn) {
            return res.status(404).json({ message: 'Check-In not found' });
        }

        if (checkIn.students.includes(studentId)) {
            checkIn.students = checkIn.students.filter(id => id.toString() !== studentId);
            await checkIn.save();

            const session = await Session.findById(checkIn.session);
            session.numberOfStudentsCheckedIn -= 1;
            await session.save();
        }

        res.json(checkIn);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a check-in by ID (populate session and students)
exports.getCheckIn = async (req, res) => {
    try {
        const { checkInId } = req.params;

        const checkIn = await CheckIn.findById(checkInId)
            .populate('session')
            .populate('students');

        if (!checkIn) {
            return res.status(404).json({ message: 'Check-In not found' });
        }

        res.json(checkIn);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all check-ins
exports.getAllCheckIns = async (req, res) => {
    try {
        const checkIns = await CheckIn.find()
            .populate('session')
            .populate('students');

        res.json(checkIns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a check-in
exports.deleteCheckIn = async (req, res) => {
    try {
        const { checkInId } = req.params;

        const checkIn = await CheckIn.findByIdAndDelete(checkInId);

        if (!checkIn) {
            return res.status(404).json({ message: 'Check-In not found' });
        }

        const session = await Session.findById(checkIn.session);
        if (session) {
            session.numberOfStudentsCheckedIn -= checkIn.students.length;
            if (session.numberOfStudentsCheckedIn < 0) session.numberOfStudentsCheckedIn = 0;
            await session.save();
        }

        res.json({ message: 'Check-In deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
