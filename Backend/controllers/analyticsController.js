const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');

const getDoctorAnalytics = async (req, res, next) => {
    try {
        const doctorId = new mongoose.Types.ObjectId(req.user.id);

        // 1. Total Appointments & Status Breakdown
        const statusStats = await Appointment.aggregate([
            { $match: { doctorId: doctorId } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // 2. Online vs Offline Ratio (Last 30 days)
        const typeStats = await Appointment.aggregate([
            { 
                $match: { 
                    doctorId: doctorId,
                    appointmentDate: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
                } 
            },
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);

        // 3. Unique Patients Count
        const uniquePatients = await Appointment.distinct('patientId', { doctorId: doctorId });

        // 4. Activity Volume (Last 7 Days)
        const weeklyActivity = await Appointment.aggregate([
            {
                $match: {
                    doctorId: doctorId,
                    appointmentDate: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } },
                    visits: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Format Data for Frontend
        const analytics = {
            totalPatients: uniquePatients.length,
            totalAppointments: statusStats.reduce((acc, curr) => acc + curr.count, 0),
            breakdown: {
                completed: statusStats.find(s => s._id === 'Completed')?.count || 0,
                cancelled: statusStats.find(s => s._id === 'Cancelled')?.count || 0,
                scheduled: statusStats.find(s => s._id === 'Scheduled')?.count || 0,
            },
            visitTypes: {
                online: typeStats.find(t => t._id === 'Online')?.count || 0,
                offline: typeStats.find(t => t._id === 'Offline')?.count || 0,
            },
            weeklyTrend: weeklyActivity.map(item => ({
                name: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' }),
                visits: item.visits
            }))
        };

        res.status(200).json({
            success: true,
            data: analytics
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { getDoctorAnalytics };