const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');

const getDoctorAnalytics = async (req, res, next) => {
    try {
        const doctorId = req.user._id; 

        // 1. Total Appointments & Status Breakdown
        const statusStats = await Appointment.aggregate([
            { $match: { doctorId: doctorId } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // 2. Online vs Offline Ratio (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const typeStats = await Appointment.aggregate([
            { 
                $match: { 
                    doctorId: doctorId,
                    appointmentDate: { $gte: thirtyDaysAgo }
                } 
            },
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);

        // 3. Unique Patients Count
        const uniquePatients = await Appointment.distinct('patientId', { doctorId: doctorId });

        // 4. Activity Volume (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const weeklyActivity = await Appointment.aggregate([
            {
                $match: {
                    doctorId: doctorId,
                    appointmentDate: { $gte: sevenDaysAgo }
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
            totalPatients: uniquePatients ? uniquePatients.length : 0,
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
                name: item._id ? new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' }) : 'N/A',
                visits: item.visits
            }))
        };

        res.status(200).json({
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        next(error);
    }
};

module.exports = { getDoctorAnalytics };