import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyAppointments, getDoctorProfileMe, getDoctorAnalytics } from '../services/api';
import { FiClock, FiAlertTriangle, FiCheckCircle, FiPlay, FiGrid, FiPieChart, FiAward, FiStar, FiInfo, FiXCircle, FiVideo, FiMapPin, FiDatabase } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PatientSnapshotDrawer from '../components/PatientSnapshotDrawer';
import ConsultationModal from '../components/ConsultationModal';

// --- DEMO DATA CONSTANTS (Client-Side Only) ---
const DEMO_APPOINTMENTS = [
  {
    _id: 'demo_1',
    timeSlot: '09:00 AM',
    patientId: { _id: 'p1', name: 'Rohit Sharma' },
    type: 'Online',
    status: 'Completed',
    riskTag: 'Routine',
    appointmentDate: new Date().toISOString()
  },
  {
    _id: 'demo_2',
    timeSlot: '10:00 AM',
    patientId: { _id: 'p2', name: 'Rahul Yadav' },
    type: 'Offline',
    status: 'Scheduled',
    riskTag: 'High Risk',   
    appointmentDate: new Date().toISOString()
  },
  {
    _id: 'demo_3',
    timeSlot: '11:30 AM',
    patientId: { _id: 'p3', name: 'Ravi Kumar' },
    type: 'Online',
    status: 'Scheduled',
    riskTag: 'Routine',
    appointmentDate: new Date().toISOString()
  },
  {
    _id: 'demo_4',
    timeSlot: '02:00 PM',
    patientId: { _id: 'p4', name: 'Ayush Sharma' },
    type: 'Offline',
    status: 'Scheduled',
    riskTag: 'Routine',
    appointmentDate: new Date().toISOString()
  }
];

const DEMO_ANALYTICS = {
  totalPatients: 142,
  totalAppointments: 385,
  visitTypes: { online: 210, offline: 175 },
  breakdown: { completed: 320, scheduled: 45, cancelled: 20 },
  weeklyTrend: [
    { name: 'Mon', visits: 12 },
    { name: 'Tue', visits: 19 },
    { name: 'Wed', visits: 15 },
    { name: 'Thu', visits: 22 },
    { name: 'Fri', visits: 18 },
    { name: 'Sat', visits: 8 },
    { name: 'Sun', visits: 4 }
  ]
};

const DoctorDashboard = () => {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState('overview'); 
    
    // Data State
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [priorityStats, setPriorityStats] = useState({ highRisk: 0, pending: 0, routine: 0 });
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDemoMode, setIsDemoMode] = useState(false);

    // Modals
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [consultationAppt, setConsultationAppt] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            await getDoctorProfileMe();

            const apptRes = await getMyAppointments();
            const allAppts = apptRes.data || [];
            
            const today = new Date().toDateString();
            
            let todaysList = allAppts.filter(appt =>
                new Date(appt.appointmentDate).toDateString() === today &&
                appt.status !== 'Cancelled'
            );

            const uniqueAppts = Array.from(new Map(todaysList.map(item => [item._id, item])).values());

            uniqueAppts.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
            
            updateDashboardState(uniqueAppts);

            const analyticsRes = await getDoctorAnalytics();
            setAnalyticsData(analyticsRes.data);
            
            setIsDemoMode(false);

        } catch (error) {
            console.error("Error loading dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateDashboardState = (appointments) => {
        setTodayAppointments(appointments);
        setPriorityStats({
            highRisk: appointments.filter(a => a.riskTag === 'High Risk').length,
            pending: appointments.filter(a => a.status === 'Scheduled').length,
            routine: appointments.filter(a => a.riskTag !== 'High Risk').length
        });
    };

    // --- CLIENT-SIDE DEMO LOADER ---
    const loadDemoData = () => {
        if (isDemoMode) {
            fetchDashboardData();
            return;
        }

        const confirmLoad = window.confirm("Load sample data? This will display temporary demo data without modifying your database.");
        if (confirmLoad) {
            setLoading(true);
            setTimeout(() => {
                updateDashboardState(DEMO_APPOINTMENTS);
                setAnalyticsData(DEMO_ANALYTICS);
                setIsDemoMode(true);
                setLoading(false);
            }, 500); 
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

    // --- Styles ---
    const demoBtn = {
        padding: '8px 16px',
        borderRadius: '8px',
        border: '1px solid #6366f1',
        backgroundColor: isDemoMode ? '#e0e7ff' : 'white',
        color: '#6366f1',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s'
    };

    // --- Analytics UI Components ---
    const AnalyticsPanel = () => {
        if (!analyticsData) return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                <p>No analytics data available yet.</p>
                <button 
                    onClick={loadDemoData}
                    style={demoBtn}>
                    <FiDatabase /> Load Demo Analytics
                </button>
            </div>
        );

        // Calculate Percentages
        const total = analyticsData.totalAppointments || 1; 
        const completedPct = Math.round((analyticsData.breakdown.completed / total) * 100);
        const scheduledPct = Math.round((analyticsData.breakdown.scheduled / total) * 100);
        const cancelledPct = Math.round((analyticsData.breakdown.cancelled / total) * 100);

        return (
            <div style={{ animation: 'fadeIn 0.5s' }}>
                {/* Metric Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                    
                    <div className="card" style={{ textAlign: 'center', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 10, right: 10, color: '#94a3b8' }} title="Number of distinct individuals you have treated"><FiInfo size={14} /></div>
                        <h3 style={{ fontSize: '2.5rem', color: '#3b82f6', margin: 0 }}>{analyticsData.totalPatients}</h3>
                        <p style={{ color: '#1e293b', fontWeight: '600', marginBottom: '4px' }}>Total Patient Base</p>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Distinct Individuals Treated</p>
                    </div>

                    <div className="card" style={{ textAlign: 'center', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 10, right: 10, color: '#94a3b8' }} title="Total number of appointments"><FiInfo size={14} /></div>
                        <h3 style={{ fontSize: '2.5rem', color: '#10b981', margin: 0 }}>{analyticsData.totalAppointments}</h3>
                        <p style={{ color: '#1e293b', fontWeight: '600', marginBottom: '4px' }}>Total Consultations</p>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>All Completed Appointments</p>
                    </div>

                    <div className="card" style={{ textAlign: 'center', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 10, right: 10, color: '#94a3b8' }} title="Online vs Offline"><FiInfo size={14} /></div>
                        <h3 style={{ fontSize: '2.5rem', color: '#f59e0b', margin: 0 }}>
                            {analyticsData.visitTypes.online} <span style={{fontSize: '1rem', color:'#ccc'}}>/</span> {analyticsData.visitTypes.offline}
                        </h3>
                        <p style={{ color: '#1e293b', fontWeight: '600', marginBottom: '4px' }}>Consultation Mode</p>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Virtual / In-Clinic Split</p>
                    </div>

                    <div className="card" style={{ textAlign: 'center', position: 'relative' }}>
                         <div style={{ position: 'absolute', top: 10, right: 10, color: '#94a3b8' }} title="Satisfaction"><FiInfo size={14} /></div>
                        <h3 style={{ fontSize: '2.5rem', color: '#8b5cf6', margin: 0 }}>98%</h3>
                        <p style={{ color: '#1e293b', fontWeight: '600', marginBottom: '4px' }}>Patient Satisfaction</p>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Based on Post-Visit Surveys</p>
                    </div>
                </div>

                {/* Charts Area */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    <div className="card" style={{ height: '400px' }}>
                        <h3 style={{ marginBottom: '20px', color: '#334155' }}>Patient Volume (Last 7 Days)</h3>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={analyticsData.weeklyTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip cursor={{fill: '#f1f5f9'}} />
                                <Bar dataKey="visits" fill="#6366f1" radius={[4,4,0,0]} name="Appointments" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ marginBottom: '20px', color: '#334155' }}>Appointment Status</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, justifyContent: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiCheckCircle size={20} /></div>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>Completed</p>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{completedPct}% of total</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}><span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>{analyticsData.breakdown.completed}</span></div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiClock size={20} /></div>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>Scheduled</p>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{scheduledPct}% of total</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}><span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>{analyticsData.breakdown.scheduled}</span></div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiXCircle size={20} /></div>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>Cancelled</p>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{cancelledPct}% of total</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}><span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>{analyticsData.breakdown.cancelled}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // --- Main Render ---
    return (
        <div style={{ paddingBottom: '40px' }}>
            {/* Header with Greeting & Buttons */}
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                        {getGreeting()} Dr. {user?.name}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <p style={{ color: '#64748b', margin: 0 }}>You have <strong>{todayAppointments.length}</strong> appointments today.</p>
                        
                        {/* Demo Mode Badge */}
                        {isDemoMode && (
                            <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid #fcd34d' }}>
                                DEMO MODE
                            </span>
                        )}

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
                
                {/* Actions: Demo & View Switcher */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* Load Demo Data Button */}
                    <button onClick={loadDemoData} style={demoBtn} title="Toggle Demo Data">
                        <FiDatabase /> {isDemoMode ? 'Demo Active' : 'Load Demo'}
                    </button>

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
            </div>

            {viewMode === 'overview' ? (
                <>
                    {/* Priority Panel */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                        
                        {/* Urgent Attention */}
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: '700', color: '#b91c1c' }}>URGENT ATTENTION</span><FiAlertTriangle color="#ef4444" size={24} /></div>
                            <h3 style={{ fontSize: '2.5rem', margin: '8px 0', color: '#7f1d1d' }}>{priorityStats.highRisk}</h3>
                            <p style={{ fontSize: '0.85rem', color: '#991b1b', margin: 0, fontWeight: '500' }}>Patients tagged with critical health alerts</p>
                        </div>

                        {/* Up Next */}
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: '700', color: '#b45309' }}>UP NEXT</span><FiClock color="#f59e0b" size={24} /></div>
                            <h3 style={{ fontSize: '2.5rem', margin: '8px 0', color: '#78350f' }}>{priorityStats.pending}</h3>
                            <p style={{ fontSize: '0.85rem', color: '#92400e', margin: 0, fontWeight: '500' }}>Scheduled appointments awaiting start</p>
                        </div>

                        {/* Standard Care */}
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: '700', color: '#047857' }}>STANDARD CARE</span><FiCheckCircle color="#10b981" size={24} /></div>
                            <h3 style={{ fontSize: '2.5rem', margin: '8px 0', color: '#064e3b' }}>{priorityStats.routine}</h3>
                            <p style={{ fontSize: '0.85rem', color: '#065f46', margin: 0, fontWeight: '500' }}>Regular follow-ups and general visits</p>
                        </div>
                    </div>

                    {/* Schedule Table */}
                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}><h3 style={{ margin: 0 }}>Today's Schedule</h3></div>
                        {todayAppointments.length === 0 ? (
                            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                                <p style={{fontSize: '1.1rem'}}>No real appointments scheduled today.</p>
                                <button onClick={loadDemoData} style={{ marginTop: '10px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}>
                                    Load Demo Data to Preview Dashboard
                                </button>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <tr>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>Time</th>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>Patient Name</th>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>Mode</th>
                                        <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {todayAppointments.map((appt) => (
                                        <tr key={appt._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '16px 24px', fontWeight: '500', color: '#334155' }}>{appt.timeSlot}</td>
                                            <td style={{ padding: '16px 24px', fontWeight: '600', color: '#2563eb', cursor: 'pointer' }} onClick={() => handlePatientClick(appt.patientId?._id)}>
                                                {appt.patientId?.name}
                                                {appt.riskTag === 'High Risk' && <span style={{ marginLeft: '10px', fontSize: '0.7rem', background: '#fee2e2', color: '#b91c1c', padding: '2px 6px', borderRadius: '4px' }}>HIGH RISK</span>}
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                {appt.type === 'Online' ? (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6366f1', background: '#e0e7ff', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', width: 'fit-content' }}>
                                                        <FiVideo /> Video Call
                                                    </span>
                                                ) : (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', background: '#d1fae5', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', width: 'fit-content' }}>
                                                        <FiMapPin /> In-Clinic
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                {appt.status !== 'Completed' ? (
                                                    <button onClick={() => startConsultation(appt)} style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <FiPlay /> Start
                                                    </button>
                                                ) : <span style={{ color: 'green', fontWeight: '600' }}>Completed</span>}
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