import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyAppointments, getDoctorProfileMe, getDoctorAnalytics } from '../services/api';
import { 
  FiClock, FiAlertTriangle, FiCheckCircle, FiPlay, FiGrid, 
  FiPieChart, FiAward, FiStar, FiInfo, FiXCircle, FiVideo, 
  FiMapPin
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PatientSnapshotDrawer from '../components/PatientSnapshotDrawer';
import ConsultationModal from '../components/ConsultationModal';

// --- DEMO DATA CONSTANTS ---
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

    const loadDemoData = () => {
        if (isDemoMode) {
            fetchDashboardData();
            return;
        }

        const confirmLoad = window.confirm("Load sample data? This will display temporary demo data.");
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

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning ☀️';
        if (hour < 18) return 'Good Afternoon 🌤️';
        return 'Good Evening 🌙';
    };

    // --- Analytics UI Components ---
    const AnalyticsPanel = () => {
        if (!analyticsData) return null;

        const total = analyticsData.totalAppointments || 1; 
        const completedPct = Math.round((analyticsData.breakdown.completed / total) * 100);
        const scheduledPct = Math.round((analyticsData.breakdown.scheduled / total) * 100);
        const cancelledPct = Math.round((analyticsData.breakdown.cancelled / total) * 100);

        return (
            <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
                <div className="analytics-metrics-grid" style={{ marginBottom: '20px' }}>
                    {[
                        { val: analyticsData.totalPatients, label: 'Total Patient Base', sub: 'Distinct Individuals Treated', color: '#3b82f6' },
                        { val: analyticsData.totalAppointments, label: 'Total Consultations', sub: 'All Completed Appointments', color: '#10b981' },
                        { val: `${analyticsData.visitTypes.online} / ${analyticsData.visitTypes.offline}`, label: 'Consultation Mode', sub: 'Virtual / In-Clinic Split', color: '#f59e0b' },
                        { val: '98%', label: 'Patient Satisfaction', sub: 'Based on Post-Visit Surveys', color: '#8b5cf6' }
                    ].map((item, idx) => (
                        <div key={idx} className="card-shadow" style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', textAlign: 'center', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: 10, right: 10, color: '#94a3b8', cursor: 'pointer' }}><FiInfo size={12} /></div>
                            <h3 style={{ fontSize: '2rem', fontWeight: '700', color: item.color, margin: '0 0 2px 0', lineHeight: 1 }}>{item.val}</h3>
                            <p style={{ color: '#1e293b', fontWeight: '600', fontSize: '0.9rem', margin: '0 0 2px 0' }}>{item.label}</p>
                            <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0 }}>{item.sub}</p>
                        </div>
                    ))}
                </div>

                <div className="analytics-charts-grid">
                    <div className="card-shadow" style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', height: '320px' }}>
                        <h3 style={{ margin: '0 0 16px 0', color: '#334155', fontWeight: '600', fontSize: '1rem' }}>Patient Volume (Last 7 Days)</h3>
                        <ResponsiveContainer width="100%" height="88%">
                            <BarChart data={analyticsData.weeklyTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                                <Bar dataKey="visits" fill="#6366f1" radius={[4,4,0,0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="card-shadow" style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', height: '320px', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ margin: '0 0 16px 0', color: '#334155', fontWeight: '600', fontSize: '1rem' }}>Appointment Status</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'center' }}>
                            {[
                                { label: 'Completed', pct: completedPct, val: analyticsData.breakdown.completed, icon: <FiCheckCircle size={16} />, bg: '#dcfce7', color: '#16a34a' },
                                { label: 'Scheduled', pct: scheduledPct, val: analyticsData.breakdown.scheduled, icon: <FiClock size={16} />, bg: '#dbeafe', color: '#2563eb' },
                                { label: 'Cancelled', pct: cancelledPct, val: analyticsData.breakdown.cancelled, icon: <FiXCircle size={16} />, bg: '#fee2e2', color: '#dc2626' }
                            ].map((stat, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: idx !== 2 ? '12px' : 0, borderBottom: idx !== 2 ? '1px solid #f1f5f9' : 'none' }}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {stat.icon}
                                        </div>
                                        <div>
                                            <p style={{ margin: '0 0 2px 0', fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>{stat.label}</p>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{stat.pct}% of total</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', alignSelf: 'center' }}>
                                        <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>{stat.val}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // --- Styles & Constants ---
    const headerButtonStyle = (isActive) => ({
        padding: '6px 12px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '600',
        backgroundColor: isActive ? 'white' : 'transparent',
        color: isActive ? (viewMode === 'overview' ? '#3b82f6' : '#8b5cf6') : '#64748b',
        boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap'
    });

    return (
        <div className="main-container">
            {/* Header Section */}
            <div className="header-container" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ marginBottom: '10px', width: '100%' }}>
                    {/* Greeting Row */}
                    <h1 className="greeting-text" style={{ fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0' }}>
                        {getGreeting()} <span style={{fontWeight: '800'}}>Dr. {user?.name || 'Admin'}</span>
                    </h1>
                    
                    {/* Appointments Count */}
                    <p style={{ color: '#64748b', margin: '0 0 8px 0', fontSize: '0.9rem' }}>You have <strong>{todayAppointments.length}</strong> appointments today.</p>
                    
                    {/* Badge Row */}
                    <div className="badge-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '4px' }}>
                        {/* Demo Badge */}
                        {isDemoMode && (
                            <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', border: '1px solid #fcd34d', display: 'inline-flex', alignItems: 'center' }}>
                                DEMO MODE
                            </span>
                        )}

                        {/* Analytics Badges */}
                        {analyticsData && analyticsData.totalPatients > 5 && (
                             <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '20px', backgroundColor: '#fff7ed', color: '#ea580c', fontSize: '0.7rem', fontWeight: '700' }}>
                                <FiAward size={12} /> Practice Builder
                            </div>
                        )}
                         {analyticsData && analyticsData.totalAppointments > 20 && (
                             <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '20px', backgroundColor: '#f3e8ff', color: '#7e22ce', fontSize: '0.7rem', fontWeight: '700' }}>
                                <FiStar size={12} /> Top Doc
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Top Right Actions */}
                <div className="header-actions">
                    {/* View Switcher */}
                    <div className="view-switcher" style={{ display: 'flex', backgroundColor: '#e2e8f0', padding: '4px', borderRadius: '8px' }}>
                        <button onClick={() => setViewMode('overview')} className="switcher-btn" style={headerButtonStyle(viewMode === 'overview')}>
                            <FiGrid size={14} /> Overview
                        </button>
                        <button onClick={() => setViewMode('analytics')} className="switcher-btn" style={headerButtonStyle(viewMode === 'analytics')}>
                            <FiPieChart size={14} /> Analytics
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            {viewMode === 'overview' ? (
                <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
                    {/* Priority Cards Row */}
                    <div className="priority-grid" style={{ marginBottom: '20px' }}>
                        
                        {/* Urgent Card */}
                        <div className="card-shadow" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: '700', color: '#B91C1C', fontSize: '0.8rem', letterSpacing: '0.5px' }}>URGENT ATTENTION</span>
                                <FiAlertTriangle color="#EF4444" size={18} />
                            </div>
                            <h3 style={{ fontSize: '2.2rem', fontWeight: '700', margin: '0 0 4px 0', color: '#7F1D1D', lineHeight: 1 }}>{priorityStats.highRisk}</h3>
                            <p style={{ fontSize: '0.8rem', color: '#991B1B', margin: 0, fontWeight: '500' }}>Patients tagged with critical health alerts</p>
                        </div>

                        {/* Up Next Card */}
                        <div className="card-shadow" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: '700', color: '#B45309', fontSize: '0.8rem', letterSpacing: '0.5px' }}>UP NEXT</span>
                                <FiClock color="#F59E0B" size={18} />
                            </div>
                            <h3 style={{ fontSize: '2.2rem', fontWeight: '700', margin: '0 0 4px 0', color: '#78350F', lineHeight: 1 }}>{priorityStats.pending}</h3>
                            <p style={{ fontSize: '0.8rem', color: '#92400E', margin: 0, fontWeight: '500' }}>Scheduled appointments awaiting start</p>
                        </div>

                        {/* Standard Care Card */}
                        <div className="card-shadow" style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: '700', color: '#047857', fontSize: '0.8rem', letterSpacing: '0.5px' }}>STANDARD CARE</span>
                                <FiCheckCircle color="#10B981" size={18} />
                            </div>
                            <h3 style={{ fontSize: '2.2rem', fontWeight: '700', margin: '0 0 4px 0', color: '#064E3B', lineHeight: 1 }}>{priorityStats.routine}</h3>
                            <p style={{ fontSize: '0.8rem', color: '#065F46', margin: 0, fontWeight: '500' }}>Regular follow-ups and general visits</p>
                        </div>
                    </div>

                    {/* Schedule Table */}
                    <div className="card-shadow" style={{ backgroundColor: 'white', borderRadius: '12px', padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', fontWeight: '700' }}>Today's Schedule</h3>
                        </div>
                        {todayAppointments.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                <p style={{fontSize: '1rem'}}>No real appointments scheduled today.</p>
                                <button onClick={loadDemoData} style={{ marginTop: '8px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}>
                                    Load Demo Data
                                </button>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
                                    <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                        <tr>
                                            {['Time', 'Patient Name', 'Mode', 'Action'].map(head => (
                                                <th key={head} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748B', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>{head}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {todayAppointments.map((appt) => (
                                            <tr key={appt._id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }}>
                                                <td style={{ padding: '12px 16px', fontWeight: '500', color: '#334155', fontSize: '0.85rem' }}>{appt.timeSlot}</td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                                        <span 
                                                            onClick={() => handlePatientClick(appt.patientId?._id)}
                                                            style={{ fontWeight: '600', color: '#2563EB', cursor: 'pointer', fontSize: '0.9rem' }}
                                                        >
                                                            {appt.patientId?.name}
                                                        </span>
                                                        {appt.riskTag === 'High Risk' && (
                                                            <span style={{ marginLeft: '10px', fontSize: '0.65rem', fontWeight: '700', background: '#FEE2E2', color: '#B91C1C', padding: '2px 6px', borderRadius: '4px', border: '1px solid #FECACA' }}>
                                                                HIGH RISK
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    {appt.type === 'Online' ? (
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#4F46E5', background: '#E0E7FF', padding: '4px 10px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: '500' }}>
                                                            <FiVideo size={12} /> Video Call
                                                        </span>
                                                    ) : (
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', background: '#D1FAE5', padding: '4px 10px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: '500' }}>
                                                            <FiMapPin size={12} /> In-Clinic
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    {appt.status !== 'Completed' ? (
                                                        <button 
                                                            onClick={() => startConsultation(appt)} 
                                                            style={{ 
                                                                padding: '6px 16px', 
                                                                background: '#2563EB', 
                                                                color: 'white', 
                                                                border: 'none', 
                                                                borderRadius: '6px', 
                                                                cursor: 'pointer', 
                                                                display: 'flex', 
                                                                alignItems: 'center', 
                                                                gap: '6px', 
                                                                fontWeight: '600',
                                                                fontSize: '0.85rem',
                                                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                                            }}
                                                        >
                                                            <FiPlay size={14} /> Start
                                                        </button>
                                                    ) : (
                                                        <span style={{ color: '#16A34A', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                                            <FiCheckCircle size={14} /> Completed
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <AnalyticsPanel />
            )}

            <PatientSnapshotDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} patientId={selectedPatientId} />
            <ConsultationModal appointment={consultationAppt} onClose={() => setConsultationAppt(null)} onSuccess={fetchDashboardData} />
            
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                
                .main-container {
                    padding: 16px 24px;
                    background-color: #F3F4F6;
                    font-family: 'Inter', sans-serif;
                    min-height: 100vh;
                    width: 100%;
                    box-sizing: border-box;
                }

                .card-shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

                .priority-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
                .analytics-metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
                .analytics-charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
                
                /* FIXED: Removed nowrap and added wrapping logic */
                .greeting-text { 
                    font-size: 1.5rem; 
                    white-space: normal;
                    word-break: break-word;
                    line-height: 1.3;
                }

                .badge-row::-webkit-scrollbar { display: none; }
                .badge-row { -ms-overflow-style: none; scrollbar-width: none; }

                @media (max-width: 1024px) {
                    .analytics-metrics-grid { grid-template-columns: repeat(2, 1fr); }
                    .priority-grid { grid-template-columns: repeat(3, 1fr); }
                }

                @media (max-width: 768px) {
                    .main-container { 
                        padding: 16px 12px; 
                    }

                    .header-container { flex-direction: column; }
                    .header-container > div { width: 100%; justify-content: space-between; }
 
                    /* FIXED: Adjusted font size for mobile */
                    .greeting-text { 
                        font-size: 1.25rem; 
                    }

                    .header-actions { width: 100%; margin-top: 16px; }
                    .view-switcher { width: 100%; display: flex; }
                    .switcher-btn { flex: 1; justify-content: center; }

                    .priority-grid { grid-template-columns: 1fr; }
                    .analytics-metrics-grid { grid-template-columns: 1fr; }
                    .analytics-charts-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default DoctorDashboard;