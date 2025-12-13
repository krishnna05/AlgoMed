const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referencing User (who has role 'doctor')
        required: true
    },
    appointmentDate: {
        type: Date,
        required: [true, 'Please select a date']
    },

    // Storing time as a string for simplicity for example "10:30 AM"
    timeSlot: {
        type: String,
        required: [true, 'Please select a time slot']
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled', 'No-show'],
        default: 'Scheduled'
    },
    type: {
        type: String,
        enum: ['Online', 'Offline'],
        default: 'Online'
    },
    // For storing the reason for visit entered by patient
    reason: {
        type: String,
        required: [true, 'Please enter a reason for visit']
    },
    // Notes added by Doctor after/during visit
    doctorNotes: {
        type: String,
        default: ""
    },
    // Link for video call (generated later)
    videoLink: {
        type: String,
        default: ""
    },
    // Link to an actual prescription/medical record created after the visit
    medicalRecordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalRecord' 
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);