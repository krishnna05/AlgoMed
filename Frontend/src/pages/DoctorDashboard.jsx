import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyAppointments, getDoctorProfileMe, getDoctorAnalytics } from '../services/api';
import { FiUsers, FiCalendar, FiClock, FiActivity, FiMoreHorizontal, FiAlertTriangle, FiCheckCircle, FiPlay, FiFileText, FiPieChart, FiGrid, FiAward, FiStar } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PatientSnapshotDrawer from '../components/PatientSnapshotDrawer';
import ConsultationModal from '../components/ConsultationModal';

const DoctorDashboard = () => {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'analytics'
    
    // Data State
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [priorityStats, setPriorityStats] = useState({ highRisk: 0, pending: 0, routine: 0 });
    const [analyticsData, setAnalyticsData] = useState(null);
    const [profileComplete, setProfileComplete] = useState(true);
    const [loading, setLoading] = useState(true);

    // Modals
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [consultationAppt, setConsultationAppt] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const profileRes = await getDoctorProfileMe();
            if (!profileRes.data) setProfileComplete(false);

            // Fetch Appointments
            const apptRes = await getMyAppointments();
            const allAppts = apptRes.data || [];
            
            // Filter Today
            const today = new Date().toDateString();
            const todaysList = allAppts.filter(appt =>
                new Date(appt.appointmentDate).toDateString() === today &&
                appt.status !== 'Cancelled'
            );
            todaysList.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
            setTodayAppointments(todaysList);

            // Priority Logic
            setPriorityStats({
                highRisk: todaysList.filter(a => a.riskTag === 'High Risk').length,
                pending: todaysList.filter(a => a.status === 'Scheduled').length,
                routine: todaysList.filter(a => a.riskTag !== 'High Risk').length
            });

            // Fetch Analytics (Pre-load)
            const analyticsRes = await getDoctorAnalytics();
            setAnalyticsData(analyticsRes.data);

        } catch (error) {
            console.error("Error loading dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePatientClick = (patientId) => {
        setSelectedPatientId(patientId);
        setIsDrawerOpen(true);
    };

    const startConsultation = (appt) => {
        setConsultationAppt(appt);
    };

    // --- Helper for Greeting ---
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning ☀️';
        if (hour < 18) return 'Good Afternoon 🌤️';
        return 'Good Evening 🌙';
    };

    // --- Badge Logic ---
    const getBadges = () => {
        const badges = [];
        if (!analyticsData) return badges;
        if (analyticsData.totalPatients > 5) badges.push({ icon: <FiAward />, text: "Practice Builder", color: "#f59e0b" });
        if (analyticsData.totalAppointments > 20) badges.push({ icon: <FiStar />, text: "Top Doc", color: "#8b5cf6" });
        return badges;
    };

    // --- Analytics UI Components ---
    const AnalyticsPanel = () => {
        if (!analyticsData) return <div>Loading Stats...</div>;

        const pieData = [
            { name: 'Completed', value: analyticsData.breakdown.completed },
            { name: 'Scheduled', value: analyticsData.breakdown.scheduled },
            { name: 'Cancelled', value: analyticsData.breakdown.cancelled },
        ];
        const COLORS = ['#10b981', '#3b82f6', '#ef4444'];

        return (
            <div style={{ animation: 'fadeIn 0.5s' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '2.5rem', color: '#3b82f6', margin: 0 }}>{analyticsData.totalPatients}</h3>
                        <p style={{ color: '#64748b' }}>Unique Patients</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '2.5rem', color: '#10b981', margin: 0 }}>{analyticsData.totalAppointments}</h3>
                        <p style={{ color: '#64748b' }}>Total Visits</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '2.5rem', color: '#f59e0b', margin: 0 }}>
                            {analyticsData.visitTypes.online} <span style={{fontSize: '1rem', color:'#ccc'}}>/</span> {analyticsData.visitTypes.offline}
                        </h3>
                        <p style={{ color: '#64748b' }}>Online / Offline</p>
                    </div>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '2.5rem', color: '#8b5cf6', margin: 0 }}>98%</h3>
                        <p style={{ color: '#64748b' }}>Satisfaction</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    <div className="card" style={{ height: '400px' }}>
                        <h3 style={{ marginBottom: '20px', color: '#334155' }}>Patient Volume (Last 7 Days)</h3>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={analyticsData.weeklyTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="visits" fill="#6366f1" radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="card" style={{ height: '400px' }}>
                        <h3 style={{ marginBottom: '20px', color: '#334155' }}>Appointment Status</h3>
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ textAlign: 'center', marginTop: '-20px', fontSize: '0.9rem', color: '#64748b' }}>
                            <span style={{color: '#10b981'}}>● Done</span> &nbsp; 
                            <span style={{color: '#3b82f6'}}>● Pending</span> &nbsp;
                            <span style={{color: '#ef4444'}}>● Cancelled</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // --- Main Render ---
    return (
        <div style={{ paddingBottom: '40px' }}>
            {/* Header with Greeting & Gamification */}
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                        {getGreeting()}, Dr. {user?.name}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <p style={{ color: '#64748b', margin: 0 }}>You have <strong>{todayAppointments.length}</strong> appointments today.</p>
                        
                        {/* Badges */}
                        {getBadges().map((badge, i) => (
                            <div key={i} style={{ 
                                display: 'flex', alignItems: 'center', gap: '5px', 
                                padding: '4px 10px', borderRadius: '20px', 
                                backgroundColor: badge.color + '20', color: badge.color, 
                                fontSize: '0.75rem', fontWeight: '700' 
                            }}>
                                {badge.icon} {badge.text}
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* View Switcher */}
                <div style={{ display: 'flex', backgroundColor: '#e2e8f0', padding: '4px', borderRadius: '8px' }}>
                    <button 
                        onClick={() => setViewMode('overview')}
                        style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', backgroundColor: viewMode === 'overview' ? 'white' : 'transparent', color: viewMode === 'overview' ? '#3b82f6' : '#64748b', boxShadow: viewMode === 'overview' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiGrid /> Overview
                    </button>
                    <button 
                        onClick={() => setViewMode('analytics')}
                        style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', backgroundColor: viewMode === 'analytics' ? 'white' : 'transparent', color: viewMode === 'analytics' ? '#8b5cf6' : '#64748b', boxShadow: viewMode === 'analytics' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiPieChart /> Analytics
                    </button>
                </div>
            </div>

            {viewMode === 'overview' ? (
                <>
                    {/* Priority Panel */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '5px solid #ef4444', backgroundColor: '#fef2f2' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: '600', color: '#64748b' }}>HIGH RISK</span><FiAlertTriangle color="#ef4444" size={20} /></div>
                            <h3 style={{ fontSize: '2rem', margin: 0 }}>{priorityStats.highRisk}</h3>
                        </div>
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '5px solid #f59e0b' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: '600', color: '#64748b' }}>PENDING</span><FiClock color="#f59e0b" size={20} /></div>
                            <h3 style={{ fontSize: '2rem', margin: 0 }}>{priorityStats.pending}</h3>
                        </div>
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '5px solid #10b981' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: '600', color: '#64748b' }}>ROUTINE</span><FiCheckCircle color="#10b981" size={20} /></div>
                            <h3 style={{ fontSize: '2rem', margin: 0 }}>{priorityStats.routine}</h3>
                        </div>
                    </div>

                    {/* Schedule Table */}
                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}><h3 style={{ margin: 0 }}>Today's Schedule</h3></div>
                        {todayAppointments.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No appointments today.</div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    {todayAppointments.map((appt) => (
                                        <tr key={appt._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '16px 24px' }}>{appt.timeSlot}</td>
                                            <td style={{ padding: '16px 24px', fontWeight: '600', color: '#2563eb', cursor: 'pointer' }} onClick={() => handlePatientClick(appt.patientId?._id)}>
                                                {appt.patientId?.name}
                                                {appt.riskTag === 'High Risk' && <span style={{ marginLeft: '10px', fontSize: '0.7rem', background: '#fee2e2', color: '#b91c1c', padding: '2px 6px', borderRadius: '4px' }}>HIGH RISK</span>}
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>{appt.type}</td>
                                            <td style={{ padding: '16px 24px' }}>
                                                {appt.status !== 'Completed' ? (
                                                    <button onClick={() => startConsultation(appt)} style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <FiPlay /> Start
                                                    </button>
                                                ) : <span style={{ color: 'green' }}>Completed</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            ) : (
                <AnalyticsPanel />
            )}

            <PatientSnapshotDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} patientId={selectedPatientId} />
            <ConsultationModal appointment={consultationAppt} onClose={() => setConsultationAppt(null)} onSuccess={fetchDashboardData} />
            
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default DoctorDashboard;