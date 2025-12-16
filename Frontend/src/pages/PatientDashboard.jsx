import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyAppointments } from '../services/api';

const PatientDashboard = () => {
    const { user } = useAuth();
    const [nextAppointment, setNextAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalVisits: 0,
        upcoming: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getMyAppointments();
                const allAppointments = res.data || [];

                // Filter for future appointments only
                const now = new Date();
                const future = allAppointments.filter(appt =>
                    new Date(appt.appointmentDate) >= now && appt.status !== 'Cancelled'
                );

                // Sort by closest date
                future.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

                setNextAppointment(future.length > 0 ? future[0] : null);
                setStats({
                    totalVisits: allAppointments.length,
                    upcoming: future.length
                });

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- Styles ---
    const dashboardContainer = {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
    };

    const headerStyle = {
        marginBottom: '10px'
    };

    const welcomeTitle = {
        fontSize: '1.8rem',
        color: '#2c3e50',
        marginBottom: '5px'
    };

    const subTitle = {
        color: '#7f8c8d',
        fontSize: '1rem'
    };

    // Grid for Stats Cards (Responsive)
    const statsGrid = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
    };

    const cardStyle = {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid #eee',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
    };

    const statNumber = {
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#3498db',
        margin: '10px 0'
    };

    const statLabel = {
        color: '#636e72',
        fontSize: '0.9rem',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    };

    // Split View for Main Content
    const contentSection = {
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap' // Allows wrapping on mobile
    };

    const mainCard = {
        ...cardStyle,
        flex: '2 1 400px', // Takes up more space, min width 400px
        minHeight: '200px'
    };

    const sideCard = {
        ...cardStyle,
        flex: '1 1 250px', // Takes up less space
    };

    const sectionTitle = {
        fontSize: '1.2rem',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '16px',
        borderBottom: '2px solid #f1f2f6',
        paddingBottom: '10px'
    };

    const actionButtonStyle = {
        display: 'block',
        width: '100%',
        padding: '12px',
        margin: '8px 0',
        backgroundColor: '#e8f4fc',
        color: '#3498db',
        textAlign: 'center',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: '600',
        transition: 'background-color 0.2s',
    };

    const dateBox = {
        backgroundColor: '#3498db',
        color: 'white',
        padding: '10px',
        borderRadius: '8px',
        textAlign: 'center',
        width: '60px',
        marginRight: '15px'
    };

    return (
        <div style={dashboardContainer}>
            {/* 1. Header Section */}
            <div style={headerStyle}>
                <h1 style={welcomeTitle}>Hello, {user?.name} 👋</h1>
                <p style={subTitle}>Here is your health overview for today.</p>
            </div>

            {/* 2. Key Metrics Grid */}
            <div style={statsGrid}>
                <div style={cardStyle}>
                    <span style={statLabel}>Upcoming Appointments</span>
                    <span style={statNumber}>{stats.upcoming}</span>
                </div>
                <div style={cardStyle}>
                    <span style={statLabel}>Total Visits</span>
                    <span style={statNumber}>{stats.totalVisits}</span>
                </div>
                <div style={cardStyle}>
                    <span style={statLabel}>Medical Profile</span>
                    <div style={{ marginTop: '10px', color: '#27ae60', fontWeight: '500' }}>
                        Active
                    </div>
                </div>
            </div>

            {/* 3. Main Content Area */}
            <div style={contentSection}>
                {/* Next Appointment Card */}
                <div style={mainCard}>
                    <h3 style={sectionTitle}>Next Appointment</h3>

                    {loading ? (
                        <p>Loading schedule...</p>
                    ) : nextAppointment ? (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={dateBox}>
                                <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                                    {new Date(nextAppointment.appointmentDate).toLocaleDateString('en-US', { month: 'short' })}
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                    {new Date(nextAppointment.appointmentDate).getDate()}
                                </div>
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 4px 0', color: '#2c3e50' }}>
                                    Dr. {nextAppointment.doctorId?.name || 'Unknown Doctor'}
                                </h4>
                                <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>
                                    {nextAppointment.timeSlot} • {nextAppointment.type} Consultation
                                </p>
                                {nextAppointment.videoLink && (
                                    <a href={nextAppointment.videoLink} target="_blank" rel="noreferrer" style={{ ...actionButtonStyle, display: 'inline-block', width: 'auto', marginTop: '10px', fontSize: '0.8rem', padding: '6px 12px' }}>
                                        Join Video Call
                                    </a>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#95a5a6', padding: '20px' }}>
                            <p>No upcoming appointments scheduled.</p>
                            <Link to="/patient/find-doctors" style={{ ...actionButtonStyle, backgroundColor: '#3498db', color: 'white', display: 'inline-block', width: 'auto', padding: '10px 20px' }}>
                                Book Now
                            </Link>
                        </div>
                    )}
                </div>

                {/* Quick Actions Card */}
                <div style={sideCard}>
                    <h3 style={sectionTitle}>Quick Actions</h3>
                    <Link to="/patient/find-doctors" style={actionButtonStyle}>
                        🔍 Find a Doctor
                    </Link>
                    <Link to="/patient/appointments" style={actionButtonStyle}>
                        📅 View Calendar
                    </Link>
                    <Link to="/patient/profile" style={actionButtonStyle}>
                        👤 Update Medical Info
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;