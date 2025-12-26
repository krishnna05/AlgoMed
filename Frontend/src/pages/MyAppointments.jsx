import React, { useEffect, useState } from 'react';
import { getMyAppointments, updateAppointmentStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiClock, FiMapPin, FiVideo, FiCalendar } from 'react-icons/fi';

// --- DEMO DATA CONSTANTS ---
const DEMO_SCHEDULE_DATA = [
  {
    _id: 'demo_1',
    appointmentDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    timeSlot: '10:00 AM',
    type: 'Online',
    status: 'Scheduled',
    reason: 'Follow-up for Hypertension',
    patientId: { name: 'Rohit Sharma', email: 'rohit@example.com' },
    doctorId: { name: 'Dr. A. Gupta', email: 'doctor@algomed.com' },
    videoLink: 'https://meet.google.com/abc-defg-hij'
  },
  {
    _id: 'demo_2',
    appointmentDate: new Date().toISOString(),
    timeSlot: '02:30 PM',
    type: 'Offline',
    status: 'Scheduled',
    reason: 'General Checkup & Blood Test',
    patientId: { name: 'Sneha Patel', email: 'sneha@example.com' },
    doctorId: { name: 'Dr. A. Gupta', email: 'doctor@algomed.com' }
  },
  {
    _id: 'demo_3',
    appointmentDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    timeSlot: '11:00 AM',
    type: 'Online',
    status: 'Completed',
    reason: 'Skin Rash Consultation',
    patientId: { name: 'Vikram Singh', email: 'vikram@example.com' },
    doctorId: { name: 'Dr. A. Gupta', email: 'doctor@algomed.com' }
  },
  {
    _id: 'demo_4',
    appointmentDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    timeSlot: '04:00 PM',
    type: 'Offline',
    status: 'Cancelled',
    reason: 'High Fever',
    patientId: { name: 'Anjali Verma', email: 'anjali@example.com' },
    doctorId: { name: 'Dr. A. Gupta', email: 'doctor@algomed.com' }
  },
  {
    _id: 'demo_5',
    appointmentDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    timeSlot: '09:00 AM',
    type: 'Online',
    status: 'Scheduled',
    reason: 'Diabetes Diet Consultation',
    patientId: { name: 'Rahul Roy', email: 'rahul@example.com' },
    doctorId: { name: 'Dr. A. Gupta', email: 'doctor@algomed.com' },
    videoLink: 'https://meet.google.com/xyz-uvw-pqr'
  }
];

const MyAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [isDemoMode, setIsDemoMode] = useState(false);

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
    if(isDemoMode) {
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

  const filteredAppointments = appointments.filter(appt => {
    if (filter === 'All') return true;
    return appt.status === filter;
  });

  return (
    <div className="app-container">
      <div className="header-section">
        <div className="page-header-content">
            <h1 className="page-title">Schedule</h1>
            <p className="page-subtitle">Manage your appointments and visits</p>
        </div>
        
        <div className="controls-container">
            <div className="filter-container">
            {['All', 'Scheduled', 'Completed', 'Cancelled'].map(f => (
                <button 
                    key={f} 
                    className={`filter-btn ${filter === f ? 'active' : ''}`}
                    onClick={() => setFilter(f)}>
                {f}
                </button>
            ))}
            </div>
        </div>
      </div>

      {loading ? (
        <div className="state-msg">
            <div>Loading schedule...</div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="empty-card">
          <FiCalendar size={32} color="#cbd5e1" style={{ marginBottom: '10px' }} />
          <h3 className="empty-title">No appointments found.</h3>
          <p className="empty-text">You don't have any appointments in this category.</p>
          {!isDemoMode && (
              <button onClick={loadDemoData} className="link-btn">
                  Load Demo Data
              </button>
          )}
        </div>
      ) : (
        <div className="list-container">
          {filteredAppointments.map(appt => {
            const dateObj = new Date(appt.appointmentDate);
            const otherPartyName = user.role === 'patient' ? appt.doctorId?.name : appt.patientId?.name;

            return (
              <div key={appt._id} className="appt-card">
                <div className="card-content">
                  {/* Left Section: Date & Info */}
                  <div className="top-section">
                    <div className="date-box">
                        <span className="date-month">{dateObj.toLocaleString('default', { month: 'short' })}</span>
                        <span className="date-day">{dateObj.getDate()}</span>
                    </div>

                    <div className="info-box">
                        <div className="person-name">{otherPartyName || 'Unknown User'}</div>
                        
                        <div className="meta-row">
                            <span className="meta-item"><FiClock /> {appt.timeSlot}</span>
                            <span className="divider">|</span>
                            {appt.type === 'Online' ? 
                                <span className="meta-item online"><FiVideo /> Online</span> : 
                                <span className="meta-item offline"><FiMapPin /> Clinic</span>
                            }
                        </div>
                        
                        <div className="reason-text">
                            <span className="reason-label">Reason:</span> {appt.reason}
                        </div>

                        {appt.videoLink && appt.status === 'Scheduled' && (
                        <a href={appt.videoLink} target="_blank" rel="noreferrer" className="video-link">
                            <FiVideo /> Join Video Call
                        </a>
                        )}
                    </div>
                  </div>

                  {/* Right/Bottom Section: Status & Actions */}
                  <div className="action-section">
                    <span className={`status-badge ${appt.status.toLowerCase()}`}>{appt.status}</span>

                    {appt.status === 'Scheduled' && (
                      <div className="btn-group">
                        {user.role === 'patient' && (
                          <button 
                            className="action-btn cancel"
                            onClick={() => handleStatusUpdate(appt._id, 'Cancelled')}
                          >
                            Cancel Visit
                          </button>
                        )}

                        {user.role === 'doctor' && (
                          <>
                            <button 
                              className="action-btn complete"
                              onClick={() => handleStatusUpdate(appt._id, 'Completed')}
                            >
                              Mark Done
                            </button>
                            <button 
                              className="action-btn cancel"
                              onClick={() => handleStatusUpdate(appt._id, 'Cancelled')}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- CSS --- */}
      <style>{`
        /* DESKTOP DEFAULTS */
        .app-container { max-width: 850px; margin: 0 auto; width: 100%; padding: 0 0 30px 0; font-family: 'Inter', sans-serif; }
        
        .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
        .page-header-content { flex: 1; }
        .page-title { font-size: 1.75rem; font-weight: 800; color: #1e293b; margin: 0; line-height: 1.2; }
        .page-subtitle { margin: 4px 0 0; color: #64748b; font-size: 0.85rem; }

        /* TOGGLE BAR */
        .controls-container { display: flex; align-items: center; }
        .filter-container { display: inline-flex; background-color: #f1f5f9; padding: 4px; border-radius: 10px; gap: 4px; border: 1px solid #e2e8f0; }
        .filter-btn { padding: 6px 14px; border-radius: 7px; border: none; background-color: transparent; color: #64748b; cursor: pointer; font-size: 0.85rem; font-weight: 500; white-space: nowrap; transition: all 0.2s ease-in-out; position: relative; }
        .filter-btn:hover:not(.active) { background-color: rgba(0,0,0,0.03); color: #475569; }
        .filter-btn.active { background-color: white; color: #2563eb; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06); }

        /* CARDS */
        .list-container { display: flex; flex-direction: column; gap: 12px; }
        .appt-card { background-color: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; transition: transform 0.2s; }
        .card-content { display: flex; justify-content: space-between; align-items: flex-start; gap: 15px; }
        
        .top-section { display: flex; gap: 15px; align-items: flex-start; flex: 1; min-width: 0; }
        
        .date-box { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 60px; height: 60px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; flex-shrink: 0; }
        .date-day { font-size: 1.3rem; font-weight: 700; color: #334155; line-height: 1; }
        .date-month { font-size: 0.7rem; color: #64748b; text-transform: uppercase; font-weight: 600; margin-top: 2px; }

        .info-box { flex: 1; min-width: 0; }
        .person-name { font-size: 1rem; font-weight: 600; color: #1e293b; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .meta-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; font-size: 0.8rem; color: #64748b; flex-wrap: wrap; }
        .meta-item { display: flex; align-items: center; gap: 4px; }
        .meta-item.online { color: #6366f1; background: #eff6ff; padding: 2px 6px; border-radius: 4px; font-weight: 500;}
        .meta-item.offline { color: #059669; background: #ecfdf5; padding: 2px 6px; border-radius: 4px; font-weight: 500;}
        .divider { color: #cbd5e1; font-size: 0.7rem; }
        
        .reason-text { font-size: 0.85rem; color: #475569; background: #f8fafc; padding: 6px; border-radius: 6px; display: inline-block; margin-top: 4px; max-width: 100%; word-wrap: break-word;}
        .reason-label { font-weight: 600; }
        .video-link { display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; color: #2563eb; font-size: 0.8rem; text-decoration: none; font-weight: 500; padding: 4px 8px; background: #eff6ff; border-radius: 6px; }

        .action-section { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; min-width: 100px; }
        .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.02em; }
        .status-badge.scheduled { background-color: #dbeafe; color: #1e40af; }
        .status-badge.completed { background-color: #dcfce7; color: #166534; }
        .status-badge.cancelled { background-color: #fee2e2; color: #991b1b; }

        .btn-group { display: flex; flex-direction: column; gap: 6px; width: 100%; }
        .action-btn { padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 0.75rem; font-weight: 500; transition: all 0.2s; width: 100%; text-align: center; }
        .action-btn.cancel { background-color: white; color: #e11d48; border: 1px solid #ffe4e6; }
        .action-btn.cancel:hover { background-color: #fff1f2; }
        .action-btn.complete { background-color: #16a34a; color: white; }
        .action-btn.complete:hover { background-color: #15803d; }

        .empty-card { text-align: center; padding: 40px; background-color: white; border-radius: 12px; border: 1px dashed #cbd5e1; display: flex; flex-direction: column; align-items: center; }
        .empty-title { color: #334155; margin: 0 0 8px 0; font-size: 1.1rem; }
        .empty-text { color: #94a3b8; font-size: 0.9rem; margin: 0; }
        .state-msg { text-align: center; padding: 40px; color: #94a3b8; }

        .link-btn { 
          margin-top: 14px; 
          color: #2563eb; 
          background: transparent; 
          border: 1px solid transparent; 
          cursor: pointer; 
          text-decoration: none; 
          font-size: 0.9rem; 
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 6px;
          transition: background 0.2s;
        }
        .link-btn:hover {
            background-color: #eff6ff;
            text-decoration: underline;
        }

        /* --- MOBILE RESPONSIVE --- */
        @media (max-width: 768px) {
            .app-container { padding: 10px; padding-bottom: 80px; }

            .header-section { margin-bottom: 16px; gap: 12px; }
            .page-title { font-size: 1.5rem; } 
            .page-subtitle { font-size: 0.75rem; }

            .controls-container { width: 100%; overflow: hidden; }
            .filter-container { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 4px; }
            .filter-container::-webkit-scrollbar { display: none; }
            .filter-btn { padding: 5px 12px; font-size: 0.75rem; flex-shrink: 0; }

            .appt-card { padding: 12px; } 
            .card-content { flex-direction: column; gap: 12px; } 
            
            .top-section { width: 100%; gap: 10px; }
            
            .date-box { width: 48px; height: 48px; border-radius: 8px; }
            .date-day { font-size: 1.1rem; }
            .date-month { font-size: 0.6rem; }

            .person-name { font-size: 0.95rem; margin-bottom: 4px; }
            .meta-row { font-size: 0.75rem; gap: 8px; margin-bottom: 4px; }
            .reason-text { font-size: 0.75rem; padding: 5px; }
            .video-link { font-size: 0.75rem; margin-top: 6px; width: fit-content; }

            .action-section { 
                width: 100%; 
                flex-direction: row; 
                justify-content: space-between; 
                align-items: center; 
                padding-top: 10px; 
                border-top: 1px solid #f1f5f9; 
            }
            
            .btn-group { 
                flex-direction: row; 
                width: auto; 
                gap: 8px; 
            }
            .action-btn { 
                width: auto; 
                padding: 6px 12px; 
                font-size: 0.7rem; 
            }
        }
      `}</style>
    </div>
  );
};

export default MyAppointments;