
/* AlgoMed2/Frontend/src/pages/MyAppointments.jsx */
import React, { useEffect, useState } from 'react';
import { getMyAppointments, updateAppointmentStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    FiClock, FiMapPin, FiVideo, FiCalendar,
    FiMessageSquare, FiCheckCircle, FiXCircle, FiSearch
} from 'react-icons/fi';

import VideoCallWidget from '../components/VideoCallWidgetComponent';

const DEMO_SCHEDULE_DATA = [
    {
        _id: 'demo_1',
        appointmentDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
        timeSlot: '10:00 AM',
        type: 'Online',
        status: 'Scheduled',
        reason: 'Follow-up for Hypertension',
        patientId: { _id: 'p1', name: 'Rohit Sharma', email: 'rohit@example.com' },
        doctorId: { _id: 'd1', name: 'Dr. A. Gupta', email: 'doctor@algomed.com' },
    },
    {
        _id: 'demo_2',
        appointmentDate: new Date().toISOString(),
        timeSlot: '02:30 PM',
        type: 'Offline',
        status: 'Scheduled',
        reason: 'General Checkup & Blood Test',
        patientId: { _id: 'p2', name: 'Sneha Patel', email: 'sneha@example.com' },
        doctorId: { _id: 'd1', name: 'Dr. A. Gupta', email: 'doctor@algomed.com' }
    },
    {
        _id: 'demo_3',
        appointmentDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        timeSlot: '11:00 AM',
        type: 'Online',
        status: 'Completed',
        reason: 'Skin Rash Consultation',
        patientId: { _id: 'p3', name: 'Vikram Singh', email: 'vikram@example.com' },
        doctorId: { _id: 'd1', name: 'Dr. A. Gupta', email: 'doctor@algomed.com' }
    },
    {
        _id: 'demo_4',
        appointmentDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        timeSlot: '04:00 PM',
        type: 'Offline',
        status: 'Cancelled',
        reason: 'High Fever',
        patientId: { _id: 'p4', name: 'Anjali Verma', email: 'anjali@example.com' },
        doctorId: { _id: 'd1', name: 'Dr. A. Gupta', email: 'doctor@algomed.com' }
    }
];

const MyAppointments = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [isDemoMode, setIsDemoMode] = useState(false);

    const [activeCallAppointment, setActiveCallAppointment] = useState(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await getMyAppointments();
            const sorted = (res.data || []).sort((a, b) => {
                return new Date(b.appointmentDate) - new Date(a.appointmentDate);
            });
            setAppointments(sorted);
            setIsDemoMode(false);
        } catch (error) {
            console.error("Error fetching appointments:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadDemoData = () => {
        if (window.confirm("Load sample schedule data? This is for demonstration only.")) {
            setLoading(true);
            setTimeout(() => {
                setAppointments(DEMO_SCHEDULE_DATA.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate)));
                setIsDemoMode(true);
                setLoading(false);
            }, 600);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        if (isDemoMode) {
            alert("Status updates are disabled in Demo Mode.");
            return;
        }
        if (!window.confirm(`Are you sure you want to mark this appointment as ${newStatus}?`)) return;

        try {
            await updateAppointmentStatus(id, { status: newStatus });
            fetchAppointments();
        } catch (error) {
            alert("Failed to update status");
            console.error(error);
        }
    };

    const handleStartChat = (otherParty) => {
        const route = user.role === 'doctor' ? '/doctor/messages' : '/patient/messages';
        navigate(route, { state: { selectedUser: otherParty } });
    };

    const handleJoinCall = (appointment) => {
        setActiveCallAppointment(appointment);
    };

    const filteredAppointments = appointments.filter(appt => {
        if (filter === 'All') return true;
        return appt.status === filter;
    });

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
    };

    return (
        <div className="app-container">
            {/* --- HEADER SECTION --- */}
            <div className="header-section">
                <div className="header-text">
                    <h1 className="page-title">Appointments</h1>
                    <p className="page-subtitle">Manage your visits and consultations</p>
                </div>

                <div className="filter-wrapper">
                    {['All', 'Scheduled', 'Completed', 'Cancelled'].map(f => (
                        <button
                            key={f}
                            className={`filter-tab ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- CONTENT SECTION --- */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Syncing schedule...</p>
                </div>
            ) : filteredAppointments.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon"><FiCalendar /></div>
                    <h3>No appointments found</h3>
                    <p>You don't have any {filter.toLowerCase()} appointments.</p>

                    {user.role === 'patient' ? (
                        <button
                            onClick={() => navigate('/find-doctors')}
                            className="action-btn video-btn"
                            style={{ marginTop: '12px', padding: '10px 20px', fontSize: '0.9rem' }}
                        >
                            <FiSearch className="btn-icon" />
                            <span>Book an appointment</span>
                        </button>
                    ) : (
                        !isDemoMode && (
                            <button onClick={loadDemoData} className="link-btn">Load Demo Data</button>
                        )
                    )}
                </div>
            ) : (
                <div className="cards-grid">
                    {filteredAppointments.map(appt => {
                        const dateObj = new Date(appt.appointmentDate);
                        const isDoctor = user.role === 'doctor';
                        const otherParty = isDoctor ? appt.patientId : appt.doctorId;
                        const otherName = otherParty?.name || 'Unknown User';
                        const statusClass = appt.status.toLowerCase();

                        return (
                            <div key={appt._id} className="appt-card">

                                {/* 1. LEFT: DATE STRIP */}
                                <div className="card-date-strip">
                                    <span className="date-month">{dateObj.toLocaleString('default', { month: 'short' })}</span>
                                    <span className="date-day">{dateObj.getDate()}</span>
                                    <span className="date-year">{dateObj.getFullYear()}</span>
                                </div>

                                {/* 2. RIGHT: MAIN CONTENT */}
                                <div className="card-content">

                                    {/* A. Top Row: User Info & Status */}
                                    <div className="content-header">
                                        <div className="user-profile">
                                            <div className="avatar-circle">
                                                {getInitials(otherName)}
                                            </div>
                                            <div className="user-text">
                                                <h4 className="user-name">{otherName}</h4>
                                                <span className="user-role">{isDoctor ? 'Patient' : 'Doctor'}</span>
                                            </div>
                                        </div>
                                        <span className={`status-badge ${statusClass}`}>{appt.status}</span>
                                    </div>

                                    {/* B. Middle Row: Details */}
                                    <div className="content-details">
                                        <div className="detail-item">
                                            <FiClock className="icon" />
                                            <span>{appt.timeSlot}</span>
                                        </div>
                                        <div className="detail-item">
                                            {appt.type === 'Online' ? <FiVideo className="icon" /> : <FiMapPin className="icon" />}
                                            <span>{appt.type} Consultation</span>
                                        </div>
                                        <div className="detail-reason">
                                            <span className="label">Reason:</span> {appt.reason}
                                        </div>
                                    </div>

                                    {/* C. Bottom Row: ACTIONS */}
                                    <div className="content-actions">
                                        {/* 1. Message Button */}
                                        {appt.status !== 'Cancelled' && (
                                            <button
                                                className="action-btn chat-btn"
                                                onClick={() => handleStartChat(otherParty)}
                                            >
                                                <FiMessageSquare className="btn-icon" />
                                                <span>Message</span>
                                            </button>
                                        )}

                                        {/* 2. Video Button (UPDATED) */}
                                        {appt.type === 'Online' && appt.status === 'Scheduled' && (
                                            <button
                                                onClick={() => handleJoinCall(appt)}
                                                className="action-btn video-btn"
                                            >
                                                <FiVideo className="btn-icon" />
                                                <span>Join Call</span>
                                            </button>
                                        )}

                                        {/* 3. Doctor Actions */}
                                        {isDoctor && appt.status === 'Scheduled' && (
                                            <>
                                                <button
                                                    className="action-btn complete-btn"
                                                    onClick={() => handleStatusUpdate(appt._id, 'Completed')}
                                                >
                                                    <FiCheckCircle className="btn-icon" />
                                                    <span>Complete</span>
                                                </button>
                                                <button
                                                    className="action-btn cancel-btn"
                                                    onClick={() => handleStatusUpdate(appt._id, 'Cancelled')}
                                                >
                                                    <FiXCircle className="btn-icon" />
                                                    <span>Cancel</span>
                                                </button>
                                            </>
                                        )}

                                        {/* 4. Patient Actions */}
                                        {!isDoctor && appt.status === 'Scheduled' && (
                                            <button
                                                className="action-btn cancel-btn"
                                                onClick={() => handleStatusUpdate(appt._id, 'Cancelled')}
                                            >
                                                <FiXCircle className="btn-icon" />
                                                <span>Cancel</span>
                                            </button>
                                        )}
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {activeCallAppointment && (
                <VideoCallWidget
                    appointment={activeCallAppointment}
                    onClose={() => setActiveCallAppointment(null)}
                />
            )}

            <style>{`
        .app-container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #334155;
            font-size: 14px;
        }

        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 24px;
            gap: 16px;
            flex-wrap: wrap;
        }
        .page-title {
            font-size: 1.6rem;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
            letter-spacing: -0.02em;
        }
        .page-subtitle {
            margin: 4px 0 0 0;
            color: #64748b;
            font-size: 0.85rem;
        }

        .filter-wrapper {
            display: flex;
            background: #f1f5f9;
            padding: 3px;
            border-radius: 8px;
            gap: 4px;
        }
        .filter-tab {
            padding: 6px 14px;
            border: none;
            background: transparent;
            color: #64748b;
            font-size: 0.8rem;
            font-weight: 500;
            cursor: pointer;
            border-radius: 6px;
            transition: all 0.2s;
        }
        .filter-tab:hover {
            color: #1e293b;
            background: rgba(255,255,255,0.6);
        }
        .filter-tab.active {
            background: #ffffff;
            color: #2563eb;
            font-weight: 600;
            box-shadow: 0 1px 2px rgba(0,0,0,0.06);
        }

        .cards-grid {
            display: flex;
            flex-direction: column;
            gap: 14px;
        }

        .appt-card {
            display: flex;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .appt-card:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.06);
            border-color: #cbd5e1;
        }

        .card-date-strip {
            width: 80px;
            background: #f8fafc;
            border-right: 1px solid #f1f5f9;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 12px;
            flex-shrink: 0;
            text-align: center;
        }
        .date-month {
            text-transform: uppercase;
            font-size: 0.7rem;
            font-weight: 700;
            color: #64748b;
            letter-spacing: 0.05em;
            line-height: 1;
        }
        .date-day {
            font-size: 1.6rem;
            font-weight: 700;
            color: #0f172a;
            line-height: 1.1;
            margin: 2px 0;
        }
        .date-year {
            font-size: 0.7rem;
            color: #94a3b8;
            line-height: 1;
        }

        .card-content {
            flex: 1;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .content-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .user-profile {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .avatar-circle {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 0.8rem;
            flex-shrink: 0;
        }
        .user-name {
            font-size: 0.95rem;
            font-weight: 600;
            color: #1e293b;
            margin: 0;
        }
        .user-role {
            font-size: 0.75rem;
            color: #64748b;
            display: block;
        }
        .status-badge {
            padding: 3px 10px;
            border-radius: 99px;
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.03em;
        }
        .status-badge.scheduled { background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; }
        .status-badge.completed { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }
        .status-badge.cancelled { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }

        .content-details {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid #f8fafc;
        }
        .detail-item {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #475569;
            font-size: 0.85rem;
        }
        .detail-item .icon {
            color: #94a3b8;
        }
        .detail-reason {
            background: #f1f5f9;
            padding: 4px 8px;
            border-radius: 4px;
            color: #475569;
            font-size: 0.8rem;
        }
        .detail-reason .label {
            font-weight: 600;
            color: #334155;
            margin-right: 4px;
        }

        .content-actions {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        }
        .action-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 14px;
            border-radius: 6px;
            border: 1px solid transparent;
            font-size: 0.8rem;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s;
            line-height: 1;
            white-space: nowrap;
        }
        .btn-icon {
            font-size: 1rem;
        }

        .chat-btn {
            background: #ffffff;
            color: #475569;
            border-color: #e2e8f0;
        }
        .chat-btn:hover {
            background: #f8fafc;
            color: #1e293b;
            border-color: #cbd5e1;
        }
        
        .video-btn {
            background: #dbeafe; 
            color: #1e40af;      
            border-color: #bfdbfe;
        }
        .video-btn:hover {
            background: #bfdbfe;
            color: #1e3a8a;
        }

        .complete-btn {
            background: #dcfce7;
            color: #166534;
            border-color: #bbf7d0;
        }
        .complete-btn:hover {
            background: #bbf7d0;
        }

        .cancel-btn {
            background: #fff1f2;
            color: #be123c;
            border-color: #fecdd3;
        }
        .cancel-btn:hover {
            background: #ffe4e6;
        }

        .empty-state {
            display: flex;            
            flex-direction: column;    
            align-items: center;      
            justify-content: center;   
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 12px;
            border: 1px dashed #cbd5e1;
            min-height: 300px;
        }
        .empty-icon { 
            font-size: 3rem;           
            color: #cbd5e1; 
            margin-bottom: 16px;       
        }
        .empty-state h3 {
            margin: 0 0 8px 0;
            color: #1e293b;
            font-size: 1.1rem;
            font-weight: 600;
        }
        .empty-state p {
            margin: 0 0 24px 0;
            color: #64748b;
            max-width: 320px;
            line-height: 1.5;
        }

        .loading-state { text-align: center; padding: 40px; color: #64748b; }
        .spinner {
            width: 24px; height: 24px; border: 2px solid #e2e8f0; 
            border-top-color: #2563eb; border-radius: 50%; 
            animation: spin 0.8s linear infinite; margin: 0 auto 10px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .link-btn {
            background: none; border: none; 
            color: #2563eb; font-weight: 600; cursor: pointer;
            padding: 0;
            font-size: 0.9rem;
        }
        .link-btn:hover { text-decoration: underline; }

        @media (max-width: 600px) {
            .app-container { padding: 12px; padding-bottom: 80px; }
            .header-section { flex-direction: column; align-items: flex-start; gap: 12px; }
            .filter-wrapper { width: 100%; overflow-x: auto; }
            
            .appt-card { flex-direction: column; }
            
            .card-date-strip {
                width: 100%;
                flex-direction: row; 
                align-items: baseline; 
                justify-content: flex-start;
                gap: 8px;
                padding: 10px 14px; 
                border-right: none;
                border-bottom: 1px solid #f1f5f9;
                background: #f8fafc;
                text-align: left;
            }
            .date-day { 
                font-size: 1.1rem; 
                line-height: 1; 
                margin: 0; 
            }
            .date-month { font-size: 0.75rem; }
            .date-year { font-size: 0.75rem; }

            .card-content { 
                padding: 14px; 
                gap: 12px; 
            }
            
            .content-details {
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
            }

            .content-actions {
                flex-direction: row; 
                flex-wrap: wrap;    
                width: 100%;
                gap: 8px;
            }
            
            .action-btn {
                flex: 1 1 45%; 
                justify-content: center;
                padding: 10px;
                min-width: 120px; 
            }
        }
      `}</style>
        </div>
    );
};

export default MyAppointments;