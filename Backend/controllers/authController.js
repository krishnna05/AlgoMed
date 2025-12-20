const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// --- REGISTER PATIENT ---
const registerPatient = async (req, res, next) => {
    try {
        const {
            name, email, password, gender, phone,
            dateOfBirth, bloodGroup, emergencyContactName, emergencyContactPhone
        } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name, email, password: hashedPassword, role: 'patient', gender, phone
        });

        await PatientProfile.create({
            userId: user._id,
            dateOfBirth,
            bloodGroup,
            emergencyContact: {
                name: emergencyContactName,
                phone: emergencyContactPhone
            }
        });

        const token = generateToken(user._id, user.role);
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            success: true,
            data: { _id: user._id, name: user.name, email: user.email, role: user.role, token }
        });

    } catch (error) {
        next(error);
    }
};

// --- REGISTER DOCTOR ---
const registerDoctor = async (req, res, next) => {
    try {
        const {
            name, email, password, gender, phone,
            specialization, experience, medicalRegNumber, clinicName, clinicAddress
        } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name, email, password: hashedPassword, role: 'doctor', gender, phone, isVerified: false
        });

        await DoctorProfile.create({
            userId: user._id,
            specialization: specialization || 'General',
            experience: experience || 0,
            clinicAddress: clinicAddress || 'Not Provided',
            about: `Practicing at ${clinicName}`,
            qualifications: [],
            isApproved: false
        });

        const token = generateToken(user._id, user.role);
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            success: true,
            data: { _id: user._id, name: user.name, email: user.email, role: user.role, token }
        });

    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user._id, user.role);
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            data: { _id: user._id, name: user.name, email: user.email, role: user.role, token }
        });

    } catch (error) {
        next(error);
    }
};

const logout = (req, res) => {
    res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

module.exports = { registerPatient, registerDoctor, login, logout };