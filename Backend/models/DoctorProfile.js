const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    specialization: {
        type: String,
        required: [true, 'Please add a specialization'],
        trim: true
    },
    experience: {
        type: Number,
        required: [true, 'Please add years of experience'],
        default: 0
    },
    qualifications: {
        type: [String], 
        required: [true, 'Please add qualifications']
    },

    languages: {
        type: [String],
        default: ['English']
    },
    awards: {
        type: [String],
        default: []
    },
    socialLinks: {
        website: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        twitter: { type: String, default: '' }
    },

    fees: {
        type: Number,
        required: [true, 'Please add consultation fee'],
        default: 0
    },
    clinicAddress: {
        type: String,
        required: [true, 'Please add clinic address']
    },
    about: {
        type: String,
        default: ""
    },
    verificationDocument: {
        type: String, 
        default: ""
    },
    
    availableSlots: [{
        day: {
            type: String, 
            required: true
        },
        startTime: {
            type: String, 
            required: true
        },
        endTime: {
            type: String, 
            required: true
        }
    }],
    isApproved: {
        type: Boolean,
        default: false 
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.DoctorProfile || mongoose.model('DoctorProfile', doctorProfileSchema);