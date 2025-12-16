const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');
const Appointment = require('../models/Appointment'); // Import Appointment model

const getPatientProfile = async (req, res, next) => {
    try {
        // Find profile linked to the logged-in user
        const profile = await PatientProfile.findOne({ userId: req.user.id });

        if (!profile) {
            return res.status(200).json({
                success: true,
                data: null,
                message: "No profile found"
            });
        }

        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        next(error);
    }
};

const updatePatientProfile = async (req, res, next) => {
    try {
        const {
            dateOfBirth,
            bloodGroup,
            height,
            weight,
            medicalHistory,
            allergies,
            currentMedications,
            lifestyle,
            emergencyContact
        } = req.body;

        // Check if profile exists
        let profile = await PatientProfile.findOne({ userId: req.user.id });

        if (profile) {
            // Update existing profile
            profile.dateOfBirth = dateOfBirth || profile.dateOfBirth;
            profile.bloodGroup = bloodGroup || profile.bloodGroup;
            profile.height = height || profile.height;
            profile.weight = weight || profile.weight;
            profile.medicalHistory = medicalHistory || profile.medicalHistory;
            profile.allergies = allergies || profile.allergies;
            profile.currentMedications = currentMedications || profile.currentMedications;
            profile.lifestyle = lifestyle || profile.lifestyle;
            profile.emergencyContact = emergencyContact || profile.emergencyContact;

            const updatedProfile = await profile.save();
            return res.status(200).json({ success: true, data: updatedProfile });
        } else {
            // Create new profile
            profile = await PatientProfile.create({
                userId: req.user.id,
                dateOfBirth,
                bloodGroup,
                height,
                weight,
                medicalHistory,
                allergies,
                currentMedications,
                lifestyle,
                emergencyContact
            });

            return res.status(201).json({ success: true, data: profile });
        }
    } catch (error) {
        next(error);
    }
};

const getPatientSummary = async (req, res, next) => {
    try {
        const patientId = req.params.id;

        // 1. Fetch Basic User Info
        const user = await User.findById(patientId).select('name email phone gender createdAt');
        if (!user) {
            res.status(404);
            throw new Error('Patient user not found');
        }

        // 2. Fetch Medical Profile (History, Allergies, Vitals)
        const profile = await PatientProfile.findOne({ userId: patientId });

        // 3. Fetch Last Visit (Completed)
        const lastVisit = await Appointment.findOne({
            patientId: patientId,
            status: 'Completed'
        })
        .sort({ appointmentDate: -1 })
        .select('appointmentDate doctorNotes reason');

        // 4. Calculate Age (if DOB exists)
        let age = 'N/A';
        if (profile?.dateOfBirth) {
            const diff = Date.now() - new Date(profile.dateOfBirth).getTime();
            age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
        }

        // 5. Construct Summary Object
        const summary = {
            basic: {
                name: user.name,
                gender: user.gender || 'Not specified',
                age: age,
                phone: user.phone,
                memberSince: user.createdAt
            },
            medical: {
                bloodGroup: profile?.bloodGroup || 'N/A',
                height: profile?.height || '-',
                weight: profile?.weight || '-',
                activeConditions: profile?.medicalHistory?.filter(c => c.status === 'Active') || [],
                allergies: profile?.allergies || [],
                medications: profile?.currentMedications || []
            },
            lastVisit: lastVisit ? {
                date: lastVisit.appointmentDate,
                reason: lastVisit.reason,
                notes: lastVisit.doctorNotes
            } : null
        };

        res.status(200).json({ success: true, data: summary });

    } catch (error) {
        next(error);
    }
};

const getPatientVitalsHistory = async (req, res, next) => {
    try {
        const patientId = req.params.id;

        // Find all COMPLETED appointments for this patient, sorted by date
        const appointments = await Appointment.find({
            patientId: patientId,
            status: 'Completed'
        })
        .select('appointmentDate vitals')
        .sort({ appointmentDate: 1 });

        // Transform data for frontend graph
        const history = appointments
            .filter(app => app.vitals && (app.vitals.bp || app.vitals.weight)) // Only if data exists
            .map(app => ({
                date: app.appointmentDate,
                bp: app.vitals.bp, 
                weight: app.vitals.weight, 
                pulse: app.vitals.pulse
            }));

        res.status(200).json({ success: true, data: history });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPatientProfile,
    updatePatientProfile,
    getPatientSummary,
    getPatientVitalsHistory
};