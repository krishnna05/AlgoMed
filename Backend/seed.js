require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const PatientProfile = require('./models/PatientProfile');
const DoctorProfile = require('./models/DoctorProfile');
const Appointment = require('./models/Appointment');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');
    } catch (err) {
        console.error('DB Connection Failed:', err.message);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await PatientProfile.deleteMany({});
    await DoctorProfile.deleteMany({});
    await Appointment.deleteMany({});

    // --- 1. Create Doctor ---
    console.log('👨‍⚕️ Creating Doctor...');
    const doctorSalt = await bcrypt.genSalt(10);
    const doctorHash = await bcrypt.hash('password123', doctorSalt);

    const doctor = await User.create({
        name: "Admin",
        email: "doctor@algomed.com",
        password: doctorHash,
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
        consultationFees: 50
    });

    // --- 2. Create Patients ---
    console.log('😷 Creating Patients...');
    const patientSalt = await bcrypt.genSalt(10);
    const patientHash = await bcrypt.hash('password123', patientSalt);

    // Patient A: High Risk (Diabetes) + History
    const patientA = await User.create({ name: "Akshay Khanna", email: "akshay@test.com", password: patientHash, role: "patient", gender: "Male", phone: "9876543210" });

    // Patient B: High Risk (Severe Peanut Allergy)
    const patientB = await User.create({ name: "Vani Kapoor", email: "vani@test.com", password: patientHash, role: "patient", gender: "Female", phone: "9876543211" });

    // Patient C: Routine
    const patientC = await User.create({ name: "Sara Chauhan", email: "sara@test.com", password: patientHash, role: "patient", gender: "Male", phone: "9876543212" });

    // --- 3. Create Patient Profiles (Clinical Intelligence) ---
    console.log('📋 Creating Medical Profiles...');

    // Akshay's Profile (High Risk Condition)
    await PatientProfile.create({
        userId: patientA._id,
        dateOfBirth: new Date("1980-01-01"),
        bloodGroup: "O+",
        height: 175,
        weight: 85,
        medicalHistory: [{ condition: "Diabetes Type 2", diagnosisDate: new Date("2020-01-01"), status: "Active" }],
        allergies: [],
        currentMedications: [{ name: "Metformin", dosage: "500mg", frequency: "Twice daily" }]
    });

    // Vani's Profile (Severe Allergy)
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

    // Sara's Profile (Healthy)
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

    // --- 4. Create Appointments ---
    console.log('📅 Creating Appointments...');

    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today); lastWeek.setDate(lastWeek.getDate() - 7);
    const twoWeeksAgo = new Date(today); twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const lastMonth = new Date(today); lastMonth.setDate(lastMonth.getDate() - 30);

    const appointments = [
        // --- HISTORY FOR ANALYTICS & GRAPHS (Akshay) ---
        {
            patientId: patientA._id, doctorId: doctor._id,
            appointmentDate: lastMonth, timeSlot: "10:00 AM", status: "Completed", type: "Online",
            reason: "Regular Checkup", outcome: "Stable",
            doctorNotes: "Patient monitoring sugar levels.",
            vitals: { bp: "130/85", weight: "88", pulse: "78", temp: "98.6" }
        },
        {
            patientId: patientA._id, doctorId: doctor._id,
            appointmentDate: twoWeeksAgo, timeSlot: "10:00 AM", status: "Completed", type: "Offline",
            reason: "Sugar fluctuations", outcome: "Worsening",
            doctorNotes: "Advised diet changes.",
            vitals: { bp: "135/90", weight: "87", pulse: "82", temp: "98.4" }
        },
        {
            patientId: patientA._id, doctorId: doctor._id,
            appointmentDate: lastWeek, timeSlot: "10:00 AM", status: "Completed", type: "Online",
            reason: "Follow up", outcome: "Improved",
            doctorNotes: "Levels looking better.",
            vitals: { bp: "125/82", weight: "86", pulse: "76", temp: "98.5" }
        },

        // --- TODAY'S SCHEDULE (Doctor Dashboard) ---
        // 1. High Risk (Akshay - Diabetes)
        {
            patientId: patientA._id, doctorId: doctor._id,
            appointmentDate: today, timeSlot: "09:00 AM", status: "Scheduled", type: "Online",
            reason: "Monthly Review",
        },
        // 2. High Risk (Vani - Allergy)
        {
            patientId: patientB._id, doctorId: doctor._id,
            appointmentDate: today, timeSlot: "10:00 AM", status: "Scheduled", type: "Offline",
            reason: "Skin rash consultation",
        },
        // 3. Routine (Sara - Pending)
        {
            patientId: patientC._id, doctorId: doctor._id,
            appointmentDate: today, timeSlot: "11:00 AM", status: "Scheduled", type: "Online",
            reason: "General fatigue",
        },
        // 4. Completed Today (To show 'Done' status)
        {
            patientId: patientC._id, doctorId: doctor._id,
            appointmentDate: today, timeSlot: "08:30 AM", status: "Completed", type: "Online",
            reason: "Prescription Renewal", outcome: "Stable",
            doctorNotes: "Renewed multivitamin.",
            vitals: { bp: "118/75", weight: "75", pulse: "70", temp: "98.2" }
        }
    ];

    await Appointment.insertMany(appointments);

    console.log('✅ Seeding Complete! Demo data is ready.');
    console.log('👉 Login as Doctor: doctor@algomed.com / password123');
    process.exit();
};

seedData();