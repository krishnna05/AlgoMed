import React, { useEffect, useState } from 'react';
import { getMyAppointments, updateAppointmentStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // 'All', 'Scheduled', 'Completed', 'Cancelled'

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await getMyAppointments();
      // Sort by date (newest first for history, but typically you want upcoming first)
      // Let's sort: Upcoming (Scheduled) first, then by date descending
      const sorted = (res.data || []).sort((a, b) => {
        return new Date(b.appointmentDate) - new Date(a.appointmentDate);
      });
      setAppointments(sorted);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this appointment as ${newStatus}?`)) return;

    try {
      await updateAppointmentStatus(id, { status: newStatus });
      fetchAppointments(); // Refresh list
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
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  };

  const titleStyle = {
    fontSize: '1.8rem',
    color: '#2c3e50',
    margin: 0
  };

  const filterContainer = {
    display: 'flex',
    gap: '10px'
  };

  const filterBtn = (active) => ({
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid #ddd',
    backgroundColor: active ? '#3498db' : 'white',
    color: active ? 'white' : '#7f8c8d',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s'
  });

  const listContainer = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    border: '1px solid #eee',
    display: 'flex',
    flexDirection: 'column', // Mobile first
    gap: '15px'
  };

  // Desktop adjustment via media query logic simulation
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
    minWidth: '70px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef'
  };

  const dateDay = { fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50', lineHeight: 1 };
  const dateMonth = { fontSize: '0.8rem', color: '#7f8c8d', textTransform: 'uppercase' };

  const infoBox = {
    flex: 1,
    minWidth: '200px'
  };

  const nameStyle = { fontSize: '1.1rem', fontWeight: '600', color: '#2c3e50', marginBottom: '5px' };
  const detailStyle = { fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '3px' };

  const statusBadge = (status) => ({
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    backgroundColor: status === 'Scheduled' ? '#e3f2fd' : 
                     status === 'Completed' ? '#d4edda' : 
                     status === 'Cancelled' ? '#f8d7da' : '#f1f2f6',
    color: status === 'Scheduled' ? '#1976d2' : 
           status === 'Completed' ? '#155724' : 
           status === 'Cancelled' ? '#721c24' : '#636e72',
    textAlign: 'center',
    minWidth: '100px'
  });

  const actionBtn = (type) => ({
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    backgroundColor: type === 'cancel' ? '#ffebee' : '#e8f5e9',
    color: type === 'cancel' ? '#c62828' : '#2e7d32',
    transition: 'background-color 0.2s',
    marginTop: '10px'
  });

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>My Appointments</h1>
        <div style={filterContainer}>
          {['All', 'Scheduled', 'Completed', 'Cancelled'].map(f => (
            <button key={f} style={filterBtn(filter === f)} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>Loading history...</div>
      ) : filteredAppointments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '10px' }}>
          <h3>No appointments found.</h3>
          <p style={{ color: '#95a5a6' }}>You don't have any appointments in this category.</p>
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
                  {/* Date */}
                  <div style={dateBox}>
                    <span style={dateMonth}>{dateObj.toLocaleString('default', { month: 'short' })}</span>
                    <span style={dateDay}>{dateObj.getDate()}</span>
                    <span style={{ fontSize: '0.8rem', color: '#adb5bd', marginTop: '4px' }}>{dateObj.getFullYear()}</span>
                  </div>

                  {/* Details */}
                  <div style={infoBox}>
                    <div style={nameStyle}>{otherPartyLabel}: {otherPartyName || 'Unknown'}</div>
                    <div style={detailStyle}>🕒 {appt.timeSlot} • {appt.type} Visit</div>
                    <div style={detailStyle}>📝 Reason: {appt.reason}</div>
                    {appt.videoLink && appt.status === 'Scheduled' && (
                       <a href={appt.videoLink} target="_blank" rel="noreferrer" style={{ color: '#3498db', fontSize: '0.9rem', textDecoration: 'underline' }}>
                         Join Video Call
                       </a>
                    )}
                  </div>

                  {/* Status & Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                    <span style={statusBadge(appt.status)}>{appt.status}</span>

                    {/* Logic for Buttons */}
                    {appt.status === 'Scheduled' && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {/* Patient can Cancel */}
                        {user.role === 'patient' && (
                          <button 
                            style={actionBtn('cancel')}
                            onClick={() => handleStatusUpdate(appt._id, 'Cancelled')}
                          >
                            Cancel Appointment
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