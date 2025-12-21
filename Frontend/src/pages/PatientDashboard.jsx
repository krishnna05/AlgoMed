import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyAppointments, getPatientProfile } from '../services/api';
import { 
  FiClock, FiCalendar, FiActivity, FiMapPin, FiVideo, 
  FiArrowRight, FiSun, FiTrendingUp, FiTarget, FiDatabase, FiZap 
} from 'react-icons/fi';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// --- HEALTH TIPS DATABASE ---
const HEALTH_TIPS = [
    "Hydration is key! Aim for 8 glasses of water today to maintain energy.",
    "A 30-minute brisk walk can boost your mood and cardiovascular health.",
    "Reduce screen time 1 hour before bed for significantly better sleep quality.",
    "Don't skip breakfast—it jumpstarts your metabolism for the day!",
    "Stretch every hour if you have a desk job to prevent back strain."
];

// --- DEMO DATA ---
const DEMO_DATA = {
    nextAppointment: {
        appointmentDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        doctorId: { name: "Anjali Gupta" },
        reason: "Routine Cardiac Checkup",
        type: "Online",
        videoLink: "https://meet.google.com/demo-link"
    },
    stats: { total: 12, completed: 10, online: 8 },
    chartData: [
        { name: 'Jan', visits: 1 }, { name: 'Feb', visits: 3 },
        { name: 'Mar', visits: 2 }, { name: 'Apr', visits: 4 },
        { name: 'May', visits: 1 }, { name: 'Jun', visits: 3 }
    ],
    healthScore: 85,
    profile: {
        bloodGroup: 'O+',
        height: '175',
        weight: '70'
    }
};

const PatientDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isDemoMode, setIsDemoMode] = useState(false);

    // Data States
    const [nextAppointment, setNextAppointment] = useState(null);
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ total: 0, completed: 0, online: 0 });
    const [chartData, setChartData] = useState([]);
    const [tip, setTip] = useState("");

    useEffect(() => {
        setTip(HEALTH_TIPS[Math.floor(Math.random() * HEALTH_TIPS.length)]);
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Appointments
            const apptRes = await getMyAppointments();
            const allAppts = apptRes.data || [];
            
            const now = new Date();
            const future = allAppts.filter(a => new Date(a.appointmentDate) >= now && a.status !== 'Cancelled');
            future.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
            setNextAppointment(future[0] || null);

            setStats({
                total: allAppts.length,
                completed: allAppts.filter(a => a.status === 'Completed').length,
                online: allAppts.filter(a => a.type === 'Online').length
            });

            // Chart Data
            const monthMap = {};
            allAppts.forEach(appt => {
                const month = new Date(appt.appointmentDate).toLocaleString('default', { month: 'short' });
                monthMap[month] = (monthMap[month] || 0) + 1;
            });
            const chartDataArray = Object.keys(monthMap).map(key => ({ name: key, visits: monthMap[key] }));
            setChartData(chartDataArray.length ? chartDataArray : []);

            // 2. Fetch Profile
            const profRes = await getPatientProfile();
            setProfile(profRes.data || {});

            setIsDemoMode(false);

        } catch (error) {
            console.error("Dashboard Load Error", error);
        } finally {
            setLoading(false);
        }
    };

    // --- DEMO LOADER ---
    const toggleDemoData = () => {
        if (isDemoMode) {
            fetchDashboardData(); // Reset to real data
        } else {
            setLoading(true);
            setTimeout(() => {
                setNextAppointment(DEMO_DATA.nextAppointment);
                setStats(DEMO_DATA.stats);
                setChartData(DEMO_DATA.chartData);
                setProfile(DEMO_DATA.profile);
                setIsDemoMode(true);
                setLoading(false);
            }, 600);
        }
    };

    // --- Calculated Health Score ---
    const healthScore = useMemo(() => {
        if (isDemoMode) return DEMO_DATA.healthScore;

        if (!profile) return 50; 
        let score = 50;
        if (profile.bloodGroup) score += 10;
        if (profile.height && profile.weight) {
             const h = profile.height / 100;
             const bmi = profile.weight / (h * h);
             if (bmi > 18.5 && bmi < 25) score += 20; 
             else score += 10; 
        }
        if (profile.lifestyle?.smoking === 'No') score += 10;
        if (profile.lifestyle?.activityLevel === 'Active') score += 10;
        return Math.min(score, 100);
    }, [profile, isDemoMode]);

    // --- Formatter ---
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return {
            day: d.getDate(),
            month: d.toLocaleString('default', { month: 'short' }),
            time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            weekday: d.toLocaleString('default', { weekday: 'long' })
        };
    };

    const nextDate = nextAppointment ? formatDate(nextAppointment.appointmentDate) : null;

    // --- Styles ---
    const styles = {
        container: { maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' },
        
        // Header
        header: { 
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', 
            marginBottom: '30px', flexWrap: 'wrap', gap: '20px' 
        },
        greetingGroup: { flex: 1 },
        greeting: { fontSize: '2rem', fontWeight: '800', color: '#1e293b', margin: 0 },
        dateBadge: { 
            display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '8px', 
            color: '#64748b', backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem' 
        },

        tipCard: {
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
            padding: '16px 20px', borderRadius: '16px',
            border: '1px solid #22c55e', // Green border
            boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)', // Glowing green shadow
            maxWidth: '450px',
            display: 'flex', gap: '15px', alignItems: 'flex-start',
            transition: 'transform 0.2s ease',
            cursor: 'default'
        },
        tipIconBox: {
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            minWidth: '40px', height: '40px', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', boxShadow: '0 4px 10px rgba(22, 163, 74, 0.3)'
        },
        tipContent: { flex: 1 },
        tipTitle: { fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#15803d', marginBottom: '4px', letterSpacing: '0.5px' },
        tipText: { fontSize: '0.9rem', color: '#334155', lineHeight: '1.4', fontStyle: 'italic' },
        
        // Grid
        mainGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px', alignItems: 'start' },
        
        card: { 
            backgroundColor: 'white', borderRadius: '16px', padding: '24px', 
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0',
            position: 'relative', overflow: 'hidden'
        },
        
        emptyStateCard: {
            background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)', 
            color: 'white',
            minHeight: '220px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            textAlign: 'center',
            position: 'relative', overflow: 'hidden',
            border: 'none',
            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)' // Blue Glow
        },
        
        // Hero Card (Active Appointment)
        heroCard: {
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            minHeight: '220px'
        },
        
        // Demo Button
        demoBtn: {
            padding: '8px 16px', borderRadius: '8px', border: '1px solid #6366f1',
            backgroundColor: isDemoMode ? '#e0e7ff' : 'white', color: '#6366f1',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600',
            display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
            height: 'fit-content'
        },

        // Health Score
        scoreContainer: { position: 'relative', width: '120px', height: '120px', margin: '0 auto' },
        
        // Action Button
        actionBtn: {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px', backgroundColor: 'white', border: '1px solid #e2e8f0',
            borderRadius: '12px', color: '#334155', fontWeight: '600',
            textDecoration: 'none', transition: 'all 0.2s', marginBottom: '12px'
        }
    };

    if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading Dashboard...</div>;

    return (
        <div style={styles.container}>
            
            {/* --- 1. HEADER & TIPS --- */}
            <div style={styles.header}>
                <div style={styles.greetingGroup}>
                    <h1 style={styles.greeting}>Hello, {user?.name.split(' ')[0]} 👋</h1>
                    <div style={styles.dateBadge}>
                        <FiSun color="#f59e0b" />
                        <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>

                {/* Demo Toggle */}
                <button onClick={toggleDemoData} style={styles.demoBtn}>
                    <FiDatabase /> {isDemoMode ? 'Exit Demo' : 'Load Demo Data'}
                </button>

                {/* UPDATED: Glowing Health Tip */}
                <div style={styles.tipCard} className="hover-lift">
                    <div style={styles.tipIconBox}><FiZap size={20} /></div>
                    <div style={styles.tipContent}>
                        <div style={styles.tipTitle}>Daily Insight</div>
                        <div style={styles.tipText}>"{tip}"</div>
                    </div>
                </div>
            </div>

            <div style={styles.mainGrid} className="responsive-grid">
                
                {/* --- 2. LEFT COLUMN --- */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    
                    {/* A. Next Appointment Card */}
                    {nextAppointment ? (
                        <div style={{ ...styles.card, ...styles.heroCard }}>
                            {/* Decorative Background Circles */}
                            <div style={{ position: 'absolute', top: -20, right: -20, width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                            
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                                        UPCOMING
                                    </span>
                                    {nextAppointment.type === 'Online' ? <FiVideo size={24} /> : <FiMapPin size={24} />}
                                </div>
                                <div style={{ marginTop: '20px' }}>
                                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, lineHeight: 1 }}>
                                        {nextDate.time}
                                    </h2>
                                    <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>
                                        {nextDate.weekday}, {nextDate.day} {nextDate.month}
                                    </div>
                                    <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                                        Dr. {nextAppointment.doctorId?.name} • {nextAppointment.reason}
                                    </div>
                                </div>
                            </div>
                            
                            {nextAppointment.videoLink && (
                                <a href={nextAppointment.videoLink} target="_blank" rel="noreferrer" 
                                   style={{ 
                                       marginTop: '20px', backgroundColor: 'white', color: '#2563eb', 
                                       textAlign: 'center', padding: '12px', borderRadius: '8px', 
                                       fontWeight: '700', textDecoration: 'none', position: 'relative', zIndex: 2 
                                   }}>
                                   Join Video Consultation
                                </a>
                            )}
                        </div>
                    ) : (

                        <div style={{ ...styles.card, ...styles.emptyStateCard }}>
                            {/* Abstract Shapes */}
                            <div style={{ position: 'absolute', top: -40, left: -40, width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                            <div style={{ position: 'absolute', bottom: -30, right: -20, width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                            <div style={{ position: 'absolute', top: '20%', right: '10%', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
                            
                            <FiCalendar size={48} style={{ opacity: 0.9, marginBottom: '15px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>No Upcoming Appointments</h3>
                            <p style={{ opacity: 0.9, marginTop: '8px', maxWidth: '300px', fontSize: '0.95rem' }}>
                                You are all caught up! Feel free to book a consultation if you need assistance.
                            </p>
                            <Link to="/patient/find-doctors" style={{ marginTop: '20px', backgroundColor: 'white', color: '#0ea5e9', padding: '12px 28px', borderRadius: '30px', fontWeight: '700', fontSize: '0.9rem', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', transition: 'transform 0.2s' }}>
                                Book New Visit
                            </Link>
                        </div>
                    )}

                    {/* B. Activity Chart */}
                    <div style={styles.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Wellness Journey</h3>
                            <FiTrendingUp color="#3b82f6" />
                        </div>
                        <div style={{ height: '250px', width: '100%' }}>
                            {chartData.length > 0 ? (
                                <ResponsiveContainer>
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Area type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                    <FiActivity size={32} style={{ opacity: 0.3, marginBottom: '10px' }}/>
                                    <span style={{ fontStyle: 'italic' }}>No activity data yet.</span>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* --- 3. RIGHT COLUMN --- */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    
                    {/* A. Health Score Widget */}
                    <div style={{ ...styles.card, textAlign: 'center' }}>
                         <h3 style={{ margin: '0 0 20px 0', fontSize: '1rem', color: '#64748b' }}>Overall Health Score</h3>
                         
                         <div style={styles.scoreContainer}>
                             <svg width="120" height="120" viewBox="0 0 120 120">
                                 <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                                 <circle 
                                    cx="60" cy="60" r="50" fill="none" stroke={healthScore > 75 ? "#10b981" : "#f59e0b"} strokeWidth="10"
                                    strokeDasharray="314" strokeDashoffset={314 - (314 * healthScore) / 100}
                                    strokeLinecap="round" transform="rotate(-90 60 60)"
                                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                                 />
                             </svg>
                             <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                 <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b' }}>{healthScore}</span>
                             </div>
                         </div>
                         
                         <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '10px' }}>
                             {healthScore > 75 ? "Excellent! Keep it up." : "Complete your profile to improve."}
                         </p>

                         {/* Mini Vitals */}
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                             <div>
                                 <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Blood</div>
                                 <div style={{ fontWeight: '700', color: '#ef4444' }}>{profile?.bloodGroup || '--'}</div>
                             </div>
                             <div>
                                 <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Height</div>
                                 <div style={{ fontWeight: '700', color: '#1e293b' }}>{profile?.height || '--'}</div>
                             </div>
                             <div>
                                 <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Weight</div>
                                 <div style={{ fontWeight: '700', color: '#1e293b' }}>{profile?.weight || '--'}</div>
                             </div>
                         </div>
                    </div>

                    {/* B. Stats Summary */}
                    <div style={styles.card}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#1e293b' }}>Your Activity</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                            <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#334155' }}>{stats.total}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Visits</div>
                            </div>
                            <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>{stats.completed}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Done</div>
                            </div>
                             <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>{stats.online}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Online</div>
                            </div>
                        </div>
                    </div>

                    {/* C. Quick Actions */}
                    <div>
                        <h3 style={{ fontSize: '1rem', color: '#64748b', marginBottom: '15px' }}>Quick Actions</h3>
                        
                        <Link to="/patient/find-doctors" style={styles.actionBtn} className="action-hover">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '8px', color: '#3b82f6' }}><FiMapPin /></div>
                                Find a Specialist
                            </span>
                            <FiArrowRight color="#cbd5e1" />
                        </Link>

                        <Link to="/patient/profile" style={styles.actionBtn} className="action-hover">
                             <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: '#fff7ed', padding: '8px', borderRadius: '8px', color: '#f97316' }}><FiActivity /></div>
                                Update Vitals
                            </span>
                            <FiArrowRight color="#cbd5e1" />
                        </Link>
                    </div>

                </div>
            </div>

            <style>{`
                .action-hover:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-color: #cbd5e1; }
                .hover-lift:hover { transform: translateY(-3px); }
                @media (max-width: 900px) {
                    .responsive-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default PatientDashboard;