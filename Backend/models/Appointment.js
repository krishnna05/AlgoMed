const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    appointmentDate: {
        type: Date,
        required: [true, 'Please select a date']
    },
    timeSlot: {
        type: String,
        required: [true, 'Please select a time slot']
    },
    status: {
        type: String,
        enum: ['Scheduled', 'In-Progress', 'Completed', 'Cancelled', 'No-show'],
        default: 'Scheduled'
    },
    type: {
        type: String,
        enum: ['Online', 'Offline'],
        default: 'Online'
    },
    reason: {
        type: String,
        required: true
    },
    // --- Clinical Data ---
    doctorNotes: { type: String, default: "" },
    diagnosis: { type: String, default: "" },
    prescription: { type: String, default: "" },

    outcome: { 
        type: String, 
        enum: ['Improved', 'Stable', 'Worsening', 'Referral', 'Pending'],
        default: 'Pending'
    },

    vitals: {
        bp: { type: String, default: "" },
        temp: { type: String, default: "" },
        weight: { type: String, default: "" },
        pulse: { type: String, default: "" }
    },
    
    videoLink: { type: String, default: "" },
    medicalRecordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalRecord' 
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);