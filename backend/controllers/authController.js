const User = require('../models/User');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const Business = require('../models/Business');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ firstName, lastName, email, password: hashedPassword, role });

        // Create the corresponding profile based on role
        switch (role) {
            case 'student':
                const { university, year, solde = 0 } = req.body;
                await Student.create({
                    user: user._id,  
                    email: email,
                    university: university,
                    year: year,
                    sessionCount: 0,
                    solde: solde,
                });
                break;
            case 'admin':
                await Admin.create({
                    user: user._id,
                });
                break;
            case 'business':
                await Business.create({
                    user: user._id,
                    companyName: req.body.companyName,
                    phone: req.body.phone,
                    address: req.body.address
                });
                break;
            default:
                return res.status(400).json({ message: 'Invalid role provided' });
        }



        const token = generateToken(user);

        res.status(201).json({ token, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password first
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user);

        let responseUser = user.toObject();  

        // Depending on role, find profile
        if (user.role === 'student') {
            const profile = await Student.findOne({ user: user._id });
            if (!profile) {
                return res.status(400).json({ message: 'Student profile not found' });
            }
            responseUser.profile = profile.toObject(); // add profile inside
        } 
        else if (user.role === 'business') {
            const profile = await Business.findOne({ user: user._id });
            if (!profile) {
                return res.status(400).json({ message: 'Business profile not found' });
            }
            responseUser.profile = profile.toObject();
        } 
        else if (user.role === 'admin') {
            // Do nothing, just return the user
        } 
        else {
            return res.status(400).json({ message: 'Invalid user role' });
        }

        // Remove password before sending user data (important security step)
        delete responseUser.password;

        res.json({ token, user: responseUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


