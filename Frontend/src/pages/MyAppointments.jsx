import React, { useEffect, useState } from 'react';
import { getMyAppointments, updateAppointmentStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiDatabase, FiCalendar, FiClock, FiMapPin, FiVideo } from 'react-icons/fi';

// --- DEMO DATA CONSTANTS ---
const DEMO_SCHEDULE_DATA = [
  {
    _id: 'demo_1',
    appointmentDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), // Tomorrow
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
    appointmentDate: new Date().toISOString(), // Today
    timeSlot: '02:30 PM',
    type: 'Offline',
    status: 'Scheduled',
    reason: 'General Checkup & Blood Test',
    patientId: { name: 'Sneha Patel', email: 'sneha@example.com' },
    doctorId: { name: 'Dr. A. Gupta', email: 'doctor@algomed.com' }
  },
  {
    _id: 'demo_3',
    appointmentDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), // 2 Days Ago
    timeSlot: '11:00 AM',
    type: 'Online',
    status: 'Completed',
    reason: 'Skin Rash Consultation',
    patientId: { name: 'Vikram Singh', email: 'vikram@example.com' },
    doctorId: { name: 'Dr. A. Gupta', email: 'doctor@algomed.com' }
  },
  {
    _id: 'demo_4',
    appointmentDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), // 5 Days Ago
    timeSlot: '04:00 PM',
    type: 'Offline',
    status: 'Cancelled',
    reason: 'High Fever',
    patientId: { name: 'Anjali Verma', email: 'anjali@example.com' },
    doctorId: { name: 'Dr. A. Gupta', email: 'doctor@algomed.com' }
  },
  {
    _id: 'demo_5',
    appointmentDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(), // 3 Days Later
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

  // Filter Logic
  const filteredAppointments = appointments.filter(appt => {
    if (filter === 'All') return true;
    return appt.status === filter;
  });

  // --- Styles ---
  const containerStyle = {
    maxWidth: '1000px',
    margin: '0 auto',
    width: '100%',
    paddingBottom: '40px'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    flexWrap: 'wrap',
    gap: '15px'
  };

  const titleStyle = {
    fontSize: '1.8rem',
    color: '#1e293b',
    margin: 0,
    fontWeight: '700'
  };

  const controlsContainer = {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      flexWrap: 'wrap'
  };

  const filterContainer = {
    display: 'flex',
    backgroundColor: '#e2e8f0',
    padding: '4px',
    borderRadius: '8px'
  };

  const filterBtn = (active) => ({
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: active ? 'white' : 'transparent',
    color: active ? '#2563eb' : '#64748b',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.2s',
    boxShadow: active ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
  });

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

  const listContainer = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    border: '1px solid #f1f5f9',
    display: 'flex',
    flexDirection: 'column', 
    gap: '15px',
    transition: 'transform 0.2s, box-shadow 0.2s'
  };

  const cardContentStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px'
  };

  const dateBox = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '80px',
    height: '80px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  };

  const dateDay = { fontSize: '1.8rem', fontWeight: '800', color: '#334155', lineHeight: 1 };
  const dateMonth = { fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' };

  const infoBox = {
    flex: 1,
    minWidth: '220px'
  };

  const nameStyle = { fontSize: '1.15rem', fontWeight: '700', color: '#1e293b', marginBottom: '6px' };
  
  const metaRow = {
      display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '6px', fontSize: '0.9rem', color: '#64748b'
  };

  const statusBadge = (status) => {
    let bg = '#f1f5f9';
    let color = '#64748b';
    
    if(status === 'Scheduled') { bg = '#eff6ff'; color = '#2563eb'; }
    else if(status === 'Completed') { bg = '#dcfce7'; color = '#16a34a'; }
    else if(status === 'Cancelled') { bg = '#fee2e2'; color = '#dc2626'; }

    return {
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        backgroundColor: bg,
        color: color,
        display: 'inline-block'
    };
  };

  const actionBtn = (type) => ({
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    backgroundColor: type === 'cancel' ? '#fff1f2' : '#f0fdf4',
    color: type === 'cancel' ? '#e11d48' : '#16a34a',
    transition: 'all 0.2s',
    marginTop: '5px'
  });

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
            <h1 style={titleStyle}>Schedule</h1>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.95rem' }}>Manage your appointments and visits</p>
        </div>
        
        <div style={controlsContainer}>
            {/* Demo Button */}
            <button onClick={loadDemoData} style={demoBtn} title="Load sample data">
                <FiDatabase /> {isDemoMode ? 'Demo Active' : 'Load Demo'}
            </button>

            {/* Filter Toggle */}
            <div style={filterContainer}>
            {['All', 'Scheduled', 'Completed', 'Cancelled'].map(f => (
                <button key={f} style={filterBtn(filter === f)} onClick={() => setFilter(f)}>
                {f}
                </button>
            ))}
            </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Loading schedule...</div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <h3 style={{ color: '#334155', marginTop: 0 }}>No appointments found.</h3>
          <p style={{ color: '#94a3b8' }}>You don't have any appointments in this category.</p>
          {!isDemoMode && (
              <button onClick={loadDemoData} style={{ marginTop: '15px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  Load Demo Data
              </button>
          )}
        </div>
      ) : (
        <div style={listContainer}>
          {filteredAppointments.map(appt => {
            const dateObj = new Date(appt.appointmentDate);
            // Determine who to show: If I'm patient, show Doctor name. If I'm Doctor, show Patient name.
            const otherPartyName = user.role === 'patient' ? appt.doctorId?.name : appt.patientId?.name;
            const otherPartyLabel = user.role === 'patient' ? 'Doctor' : 'Patient';

            return (
              <div key={appt._id} style={cardStyle}>
                <div style={cardContentStyle}>
                  {/* Left: Date */}
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flex: 1 }}>
                    <div style={dateBox}>
                        <span style={dateMonth}>{dateObj.toLocaleString('default', { month: 'short' })}</span>
                        <span style={dateDay}>{dateObj.getDate()}</span>
                    </div>

                    {/* Middle: Info */}
                    <div style={infoBox}>
                        <div style={nameStyle}>{otherPartyName || 'Unknown User'}</div>
                        
                        <div style={metaRow}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FiClock /> {appt.timeSlot}</span>
                            <span style={{ color: '#cbd5e1' }}>|</span>
                            {appt.type === 'Online' ? 
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#6366f1' }}><FiVideo /> Online</span> : 
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#059669' }}><FiMapPin /> In-Clinic</span>
                            }
                        </div>
                        
                        <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: '6px' }}>
                            <span style={{ fontWeight: '600' }}>Reason:</span> {appt.reason}
                        </div>

                        {appt.videoLink && appt.status === 'Scheduled' && (
                        <a href={appt.videoLink} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '8px', color: '#2563eb', fontSize: '0.9rem', textDecoration: 'none', fontWeight: '500' }}>
                            <FiVideo /> Join Video Call
                        </a>
                        )}
                    </div>
                  </div>

                  {/* Right: Status & Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', minWidth: '140px' }}>
                    <span style={statusBadge(appt.status)}>{appt.status}</span>

                    {/* Logic for Buttons */}
                    {appt.status === 'Scheduled' && (
                      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'flex-end' }}>
                        {/* Patient can Cancel */}
                        {user.role === 'patient' && (
                          <button 
                            style={actionBtn('cancel')}
                            onClick={() => handleStatusUpdate(appt._id, 'Cancelled')}
                          >
                            Cancel Visit
                          </button>
                        )}

                        {/* Doctor can Mark Complete or Cancel */}
                        {user.role === 'doctor' && (
                          <>
                            <button 
                              style={actionBtn('complete')}
                              onClick={() => handleStatusUpdate(appt._id, 'Completed')}
                            >
                              Mark Completed
                            </button>
                            <button 
                              style={actionBtn('cancel')}
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
    </div>
  );
};

export default MyAppointments;