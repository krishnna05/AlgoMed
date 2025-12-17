const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const ChatLog = require('../models/ChatLog');

const resetDatabase = async (req, res, next) => {
    try {
        console.log('🔄 Demo Reset Triggered...');

        // 1. Clear all Data
        await User.deleteMany({});
        await PatientProfile.deleteMany({});
        await DoctorProfile.deleteMany({});
        await Appointment.deleteMany({});
        await ChatLog.deleteMany({});

        // 2. Re-Seed Users
        // Hash password (using fixed salt for speed/consistency in demo)
        const passwordHash = await bcrypt.hash('password123', 10);

        // --- Create Doctor ---
        const doctor = await User.create({
            name: "Admin",
            email: "doctor@algomed.com",
            password: passwordHash,
            role: "doctor",
            phone: "1234567890",
            gender: "Male"
        });

        await DoctorProfile.create({
            userId: doctor._id,
            specialization: "General Physician",
            experience: 10,
            qualifications: ["MBBS", "MD"],
            clinicAddress: "123 Health St, AlgoCity",
            fees: 50,
            availableSlots: [
                { day: 'Monday', startTime: '09:00', endTime: '17:00' },
                { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
                { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
                { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
                { day: 'Friday', startTime: '09:00', endTime: '17:00' }
            ]
        });

        // --- Create Patients ---
        const patientA = await User.create({ name: "Akshay Khanna", email: "akshay@test.com", password: passwordHash, role: "patient", gender: "Male", phone: "9876543210" });
        const patientB = await User.create({ name: "Vani Kapoor", email: "vani@test.com", password: passwordHash, role: "patient", gender: "Female", phone: "9876543211" });
        const patientC = await User.create({ name: "Sara Chauhan", email: "sara@test.com", password: passwordHash, role: "patient", gender: "Female", phone: "9876543212" });

        // --- Create Medical Profiles ---
        // Akshay (Diabetes)
        await PatientProfile.create({
            userId: patientA._id,
            dateOfBirth: new Date("1980-01-01"),
            bloodGroup: "O+",
            height: 175,
            weight: 85,
            medicalHistory: [{ condition: "Diabetes Type 2", diagnosedDate: new Date("2020-01-01"), status: "Active" }],
            allergies: [],
            currentMedications: [{ name: "Metformin", dosage: "500mg", frequency: "Twice daily" }]
        });

        // Vani (Allergy)
        await PatientProfile.create({
            userId: patientB._id,
            dateOfBirth: new Date("1995-05-15"),
            bloodGroup: "A-",
            height: 162,
            weight: 60,
            medicalHistory: [],
            allergies: [{ allergen: "Peanuts", severity: "Severe", reaction: "Anaphylaxis" }],
            currentMedications: []
        });

        // Sara (Healthy)
        await PatientProfile.create({
            userId: patientC._id,
            dateOfBirth: new Date("2000-10-10"),
            bloodGroup: "B+",
            height: 180,
            weight: 75,
            medicalHistory: [],
            allergies: [],
            currentMedications: []
        });

        // --- Create Appointments ---
        const today = new Date();
        const lastMonth = new Date(today); lastMonth.setDate(lastMonth.getDate() - 30);
        const twoWeeksAgo = new Date(today); twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const lastWeek = new Date(today); lastWeek.setDate(lastWeek.getDate() - 7);

        const appointments = [
            // Historical Data
            {
                patientId: patientA._id, doctorId: doctor._id, appointmentDate: lastMonth, timeSlot: "10:00 AM",
                status: "Completed", type: "Online", reason: "Regular Checkup", outcome: "Stable",
                doctorNotes: "Patient monitoring sugar levels.", vitals: { bp: "130/85", weight: "88", pulse: "78", temp: "98.6" }
            },
            {
                patientId: patientA._id, doctorId: doctor._id, appointmentDate: twoWeeksAgo, timeSlot: "10:00 AM",
                status: "Completed", type: "Offline", reason: "Sugar fluctuations", outcome: "Worsening",
                doctorNotes: "Advised diet changes.", vitals: { bp: "135/90", weight: "87", pulse: "82", temp: "98.4" }
            },
            {
                patientId: patientA._id, doctorId: doctor._id, appointmentDate: lastWeek, timeSlot: "10:00 AM",
                status: "Completed", type: "Online", reason: "Follow up", outcome: "Improved",
                doctorNotes: "Levels looking better.", vitals: { bp: "125/82", weight: "86", pulse: "76", temp: "98.5" }
            },
            // Today's Schedule
            {
                patientId: patientA._id, doctorId: doctor._id, appointmentDate: today, timeSlot: "09:00 AM",
                status: "Scheduled", type: "Online", reason: "Monthly Review",
            },
            {
                patientId: patientB._id, doctorId: doctor._id, appointmentDate: today, timeSlot: "10:00 AM",
                status: "Scheduled", type: "Offline", reason: "Skin rash consultation",
            },
            {
                patientId: patientC._id, doctorId: doctor._id, appointmentDate: today, timeSlot: "11:00 AM",
                status: "Scheduled", type: "Online", reason: "General fatigue",
            },
            {
                patientId: patientC._id, doctorId: doctor._id, appointmentDate: today, timeSlot: "08:30 AM",
                status: "Completed", type: "Online", reason: "Prescription Renewal", outcome: "Stable",
                doctorNotes: "Renewed multivitamin.", vitals: { bp: "118/75", weight: "75", pulse: "70", temp: "98.2" }
            }
        ];

        await Appointment.insertMany(appointments);

        res.status(200).json({ 
            success: true, 
            message: "System reset to demo state successfully" 
        });

    } catch (error) {
        console.error('Reset Failed:', error);
        next(error);
    }
};

module.exports = { resetDatabase };