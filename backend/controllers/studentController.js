const Student = require('../models/Student');
const Booking = require('../models/Booking');
const Session = require('../models/Session');

// Create a new student
exports.createStudent = async (req, res) => {
    try {
        const { user, university, year } = req.body;

        const student = await Student.create({
            user,
            university,
            year,
        });

        res.status(201).json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        // Fetch all students and populate the 'user' field from the User collection
        const students = await Student.find().populate('user');

        if (!students || students.length === 0) {
            return res.status(404).json({ message: 'No students found' });
        }

        // Combine the Student and User data
        const combinedStudents = students.map(student => {
            // Check if the user is populated correctly
            if (!student.user) {
                console.error('User data not populated correctly for student', student._id);
            }

            const user = student.user || {}; // If user is not populated, it will fallback to an empty object.

            return {
                studentId: student._id,               // Student's ID
                userId: user._id,                     // User's ID
                firstName: user.firstName,            // User's first name
                lastName: user.lastName,              // User's last name
                email: user.email,                    // User's email
                role: user.role,                      // User's role (student/admin/business)
                school: student.school,               // Student's school
                year: student.year,                  
                university: student.university,      
                solde: student.solde,                 // Student's balance or solde
                sessionCount: student.sessionCount    // Student's session count
            };
        });

        // Return the combined student data
        res.json(combinedStudents);
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).json({ error: err.message });
    }
};

// Get a single student by ID
exports.getStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findById(studentId).populate('user');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Increment solde for multiple students
exports.incrementSolde = async (req, res) => {
    try {
        const { studentIds } = req.body;

        if (!Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ message: 'Please provide an array of student IDs' });
        }

        // Find all students by their IDs
        const students = await Student.find({ '_id': { $in: studentIds } });
        
        if (!students || students.length === 0) {
            return res.status(404).json({ message: 'No students found with the provided IDs' });
        }

        // Increment solde for each student
        students.forEach(student => {
            student.solde += 5;
            student.save();
        });

        res.json({ message: 'Solde incremented by 5 for all specified students', students });
    } catch (err) {
        console.error('Error incrementing solde for students:', err);
        res.status(500).json({ error: err.message });
    }
};


// Update a student
exports.updateStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const updates = req.body;

        const student = await Student.findByIdAndUpdate(studentId, updates, { new: true });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findByIdAndDelete(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Book a session (create a booking)
exports.bookSession = async (req, res) => {
    try {
        const { studentId, sessionId } = req.body;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const booking = await Booking.create({
            session: sessionId,
            students: [studentId]
        });

        res.status(201).json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Student check-in (increment session count)
exports.checkIn = async (req, res) => {
    try {
        const { studentId } = req.body;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        student.sessionCount += 1;
        await student.save();

        res.json({ message: 'Check-in successful', student });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
