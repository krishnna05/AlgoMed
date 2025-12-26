import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyAppointments, getPatientProfile } from '../services/api';
import { 
  FiCalendar, FiActivity, FiMapPin, FiVideo, 
  FiArrowRight, FiSun, FiTrendingUp, FiZap 
} from 'react-icons/fi';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// --- HEALTH TIPS DATABASE ---
const HEALTH_TIPS = [
    "Hydration is key! Aim for 8 glasses of water today.",
    "A 30-minute brisk walk can boost your mood.",
    "Reduce screen time 1 hour before bed.",
    "Don't skip breakfast—it jumpstarts your metabolism!",
    "Stretch every hour to prevent back strain."
];

const PatientDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

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

            // 2. Prepare Chart Data
            const monthMap = {};
            allAppts.forEach(appt => {
                const month = new Date(appt.appointmentDate).toLocaleString('default', { month: 'short' });
                monthMap[month] = (monthMap[month] || 0) + 1;
            });
            const chartDataArray = Object.keys(monthMap).map(key => ({ name: key, visits: monthMap[key] }));
            setChartData(chartDataArray.length ? chartDataArray : []);

            // 3. Fetch Profile
            const profRes = await getPatientProfile();
            setProfile(profRes.data || {});

        } catch (error) {
            console.error("Dashboard Load Error", error);
        } finally {
            setLoading(false);
        }
    };

    const healthScore = useMemo(() => {
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
    }, [profile]);

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

    // --- BASE STYLES ---
    const styles = {
        dateBadge: { 
            display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '6px', 
            color: '#64748b', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem' 
        },
        tipCard: {
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
            padding: '12px 16px', borderRadius: '12px',
            border: '1px solid #22c55e', 
            boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)', 
            display: 'flex', gap: '12px', alignItems: 'flex-start',
            cursor: 'default'
        },
        tipIconBox: {
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            minWidth: '32px', height: '32px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', boxShadow: '0 4px 10px rgba(22, 163, 74, 0.3)'
        },
        card: { 
            backgroundColor: 'white', borderRadius: '12px', padding: '18px', 
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0',
            position: 'relative', overflow: 'hidden'
        },
        emptyStateCard: {
            background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)', 
            color: 'white',
            minHeight: '180px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            textAlign: 'center',
            position: 'relative', overflow: 'hidden',
            border: 'none',
            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)' 
        },
        heroCard: {
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            minHeight: '180px'
        },
        scoreContainer: { position: 'relative', width: '100px', height: '100px', margin: '0 auto' },
        actionBtn: {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px', backgroundColor: 'white', border: '1px solid #e2e8f0',
            borderRadius: '10px', color: '#334155', fontWeight: '600', fontSize: '0.85rem',
            textDecoration: 'none', transition: 'all 0.2s', marginBottom: '10px'
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>Loading Dashboard...</div>;

    const radius = 42;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="dashboard-container">
            
            {/* --- 1. HEADER & TIPS --- */}
            <div className="dashboard-header">
                <div style={{flex: 1, minWidth: '200px'}}>
                    <h1 className="greeting-text">Hello, {user?.name ? user.name.split(' ')[0] : 'Patient'} 👋</h1>
                    <div style={styles.dateBadge}>
                        <FiSun color="#f59e0b" size={14} />
                        <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>

                {/* Health Tip */}
                <div style={styles.tipCard} className="hover-lift tip-card-mobile">
                    <div style={styles.tipIconBox}><FiZap size={16} /></div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: '#15803d', marginBottom: '2px', letterSpacing: '0.5px' }}>Daily Insight</div>
                        <div style={{ fontSize: '0.8rem', color: '#334155', lineHeight: '1.3', fontStyle: 'italic' }}>"{tip}"</div>
                    </div>
                </div>
            </div>

            {/* --- MAIN LAYOUT GRID --- */}
            <div className="main-grid">
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {nextAppointment ? (
                        <div style={{ ...styles.card, ...styles.heroCard }}>
                            <div style={{ position: 'absolute', top: -15, right: -15, width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                            
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '15px', fontSize: '0.7rem', fontWeight: '600' }}>
                                        UPCOMING
                                    </span>
                                    {nextAppointment.type === 'Online' ? <FiVideo size={20} /> : <FiMapPin size={20} />}
                                </div>
                                <div style={{ marginTop: '15px' }}>
                                    <h2 className="hero-time">
                                        {nextDate.time}
                                    </h2>
                                    <div style={{ fontSize: '1rem', opacity: 0.9 }}>
                                        {nextDate.weekday}, {nextDate.day} {nextDate.month}
                                    </div>
                                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.2)', fontSize: '0.9rem' }}>
                                        Dr. {nextAppointment.doctorId?.name} • {nextAppointment.reason}
                                    </div>
                                </div>
                            </div>
                            
                            {nextAppointment.videoLink && (
                                <a href={nextAppointment.videoLink} target="_blank" rel="noreferrer" 
                                   style={{ 
                                       marginTop: '15px', backgroundColor: 'white', color: '#2563eb', 
                                       textAlign: 'center', padding: '12px', borderRadius: '6px', fontSize: '0.9rem',
                                       fontWeight: '700', textDecoration: 'none', position: 'relative', zIndex: 2, display: 'block' 
                                   }}>
                                   Join Video Consultation
                                </a>
                            )}
                        </div>
                    ) : (

                        <div style={{ ...styles.card, ...styles.emptyStateCard }}>
                            <FiCalendar size={36} style={{ opacity: 0.9, marginBottom: '12px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>No Upcoming Appointments</h3>
                            <p style={{ opacity: 0.9, marginTop: '6px', maxWidth: '280px', fontSize: '0.85rem' }}>
                                You are all caught up! Feel free to book a consultation.
                            </p>
                            <Link to="/patient/find-doctors" style={{ marginTop: '15px', backgroundColor: 'white', color: '#0ea5e9', padding: '10px 24px', borderRadius: '25px', fontWeight: '700', fontSize: '0.8rem', textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', transition: 'transform 0.2s' }}>
                                Book New Visit
                            </Link>
                        </div>
                    )}

                    {/* B. Activity Chart */}
                    <div style={styles.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Wellness Journey</h3>
                            <FiTrendingUp color="#3b82f6" size={18} />
                        </div>
                        <div style={{ height: '250px', width: '100%' }}>
                            {chartData.length > 0 ? (
                                <ResponsiveContainer>
                                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                                        <Area type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorVisits)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                    <FiActivity size={24} style={{ opacity: 0.3, marginBottom: '8px' }}/>
                                    <span style={{ fontStyle: 'italic', fontSize: '0.8rem' }}>No activity data yet.</span>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* --- 3. RIGHT COLUMN --- */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* A. Health Score Widget */}
                    <div style={{ ...styles.card, textAlign: 'center' }}>
                         <h3 style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#64748b' }}>Overall Health Score</h3>
                         
                         <div style={styles.scoreContainer}>
                             <svg width="100" height="100" viewBox="0 0 100 100">
                                 <circle cx="50" cy="50" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="8" />
                                 <circle 
                                    cx="50" cy="50" r={radius} fill="none" stroke={healthScore > 75 ? "#10b981" : "#f59e0b"} strokeWidth="8"
                                    strokeDasharray={circumference} 
                                    strokeDashoffset={circumference - (circumference * healthScore) / 100}
                                    strokeLinecap="round" transform="rotate(-90 50 50)"
                                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                                 />
                             </svg>
                             <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                 <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>{healthScore}</span>
                             </div>
                         </div>
                         
                         <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>
                             {healthScore > 75 ? "Excellent! Keep it up." : "Complete your profile to improve."}
                         </p>

                         {/* Mini Vitals */}
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                             <div>
                                 <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Blood</div>
                                 <div style={{ fontWeight: '700', color: '#ef4444', fontSize: '0.9rem' }}>{profile?.bloodGroup || '--'}</div>
                             </div>
                             <div>
                                 <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Height</div>
                                 <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>{profile?.height || '--'}</div>
                             </div>
                             <div>
                                 <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Weight</div>
                                 <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>{profile?.weight || '--'}</div>
                             </div>
                         </div>
                    </div>

                    {/* B. Stats Summary */}
                    <div style={styles.card}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#1e293b' }}>Your Activity</h3>
                        <div className="stats-grid">
                            <div className="stat-box">
                                <div className="stat-val" style={{ color: '#334155' }}>{stats.total}</div>
                                <div className="stat-label">Visits</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-val" style={{ color: '#10b981' }}>{stats.completed}</div>
                                <div className="stat-label">Done</div>
                            </div>
                             <div className="stat-box">
                                <div className="stat-val" style={{ color: '#3b82f6' }}>{stats.online}</div>
                                <div className="stat-label">Online</div>
                            </div>
                        </div>
                    </div>

                    {/* C. Quick Actions */}
                    <div>
                        <h3 style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '12px' }}>Quick Actions</h3>
                        
                        <Link to="/patient/find-doctors" style={styles.actionBtn} className="action-hover">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ background: '#eff6ff', padding: '6px', borderRadius: '6px', color: '#3b82f6' }}><FiMapPin size={14} /></div>
                                Find a Specialist
                            </span>
                            <FiArrowRight color="#cbd5e1" size={14} />
                        </Link>

                        <Link to="/patient/profile" style={styles.actionBtn} className="action-hover">
                             <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ background: '#fff7ed', padding: '6px', borderRadius: '6px', color: '#f97316' }}><FiActivity size={14} /></div>
                                Update Vitals
                            </span>
                            <FiArrowRight color="#cbd5e1" size={14} />
                        </Link>
                    </div>

                </div>
            </div>

            <style>{`
                .dashboard-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 0 20px 30px 20px;
                }
                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                    gap: 15px;
                }
                .greeting-text {
                    font-size: 1.6rem;
                    font-weight: 800;
                    color: #1e293b;
                    margin: 0;
                }
                .main-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 20px;
                    align-items: start;
                }
                .hero-time {
                    font-size: 2rem;
                    font-weight: 800;
                    margin: 0;
                    line-height: 1;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                }
                .stat-box {
                    background-color: #f8fafc;
                    padding: 12px;
                    border-radius: 10px;
                    text-align: center;
                }
                .stat-val {
                    font-size: 1.2rem;
                    font-weight: 700;
                }
                .stat-label {
                    font-size: 0.65rem;
                    color: #64748b;
                    text-transform: uppercase;
                }
                .tip-card-mobile {
                    max-width: 350px;
                }
                .action-hover:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-color: #cbd5e1; }
                .hover-lift:hover { transform: translateY(-3px); }

                /* --- MEDIA QUERIES --- */
                
                @media (max-width: 900px) {
                    .main-grid {
                        grid-template-columns: 1fr; /* Stack columns */
                    }
                    .dashboard-header {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .tip-card-mobile {
                        max-width: 100%; /* Full width tip on mobile */
                    }
                }

                @media (max-width: 480px) {
                    .dashboard-container {
                        padding: 10px; /* Reduced padding from 20px to 10px to fit screen better */
                        width: 100%;
                        overflow-x: hidden;
                    }
                    .greeting-text {
                        font-size: 1.4rem;
                    }
                    .hero-time {
                        font-size: 1.6rem;
                    }
                    .stat-val {
                        font-size: 1rem;
                    }
                    .action-hover {
                        padding: 15px; /* Larger touch target */
                    }
                }
            `}</style>
        </div>
    );
};

export default PatientDashboard;