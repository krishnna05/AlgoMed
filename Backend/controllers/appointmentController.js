const Appointment = require('../models/Appointment');
const User = require('../models/User');

const bookAppointment = async (req, res, next) => {
    try {
        const { doctorId, appointmentDate, timeSlot, type, reason } = req.body;

        // 1. Check if doctor exists and is actually a doctor
        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== 'doctor') {
            res.status(404);
            throw new Error('Doctor not found');
        }

        // 2. Check for double booking (Same Doctor, Same Date, Same Slot)
        const existingAppointment = await Appointment.findOne({
            doctorId,
            appointmentDate,
            timeSlot,
            status: { $nin: ['Cancelled'] } // Ignore cancelled slots
        });

        if (existingAppointment) {
            res.status(400);
            throw new Error('This time slot is already booked. Please choose another.');
        }

        // 3. Create Appointment
        const appointment = await Appointment.create({
            patientId: req.user.id, // From authMiddleware
            doctorId,
            appointmentDate,
            timeSlot,
            type,
            reason
        });

        res.status(201).json({
            success: true,
            data: appointment,
            message: "Appointment booked successfully"
        });

    } catch (error) {
        next(error);
    }
};

const getMyAppointments = async (req, res, next) => {
    try {
        let query = {};

        // If Patient -> show their bookings with doctors
        if (req.user.role === 'patient') {
            query = { patientId: req.user.id };
        } 
        // If Doctor -> show bookings assigned to them
        else if (req.user.role === 'doctor') {
            query = { doctorId: req.user.id };
        } 
        // If Admin -> show all (optional feature)
        else if (req.user.role === 'admin') {
            query = {}; 
        }

        // Populate 'patientId' to get patient name, 'doctorId' to get doctor name
        const appointments = await Appointment.find(query)
            .populate('patientId', 'name email phone gender')
            .populate('doctorId', 'name email') 
            .sort({ appointmentDate: 1, timeSlot: 1 }); // Sort by date ascending

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });

    } catch (error) {
        next(error);
    }
};

const updateAppointmentStatus = async (req, res, next) => {
    try {
        const { status, doctorNotes, videoLink } = req.body;
        const appointmentId = req.params.id;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            res.status(404);
            throw new Error('Appointment not found');
        }

        // Security Check: Only the assigned doctor (or admin) can update
        if (req.user.role !== 'admin' && appointment.doctorId.toString() !== req.user.id) {
            res.status(403);
            throw new Error('Not authorized to update this appointment');
        }

        // Update fields if provided
        if (status) appointment.status = status;
        if (doctorNotes) appointment.doctorNotes = doctorNotes;
        if (videoLink) appointment.videoLink = videoLink;

        const updatedAppointment = await appointment.save();

        res.status(200).json({
            success: true,
            data: updatedAppointment,
            message: `Appointment updated to ${status || 'new status'}`
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    bookAppointment,
    getMyAppointments,
    updateAppointmentStatus
};