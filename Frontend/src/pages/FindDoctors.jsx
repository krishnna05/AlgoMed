import React, { useState, useEffect } from 'react';
import { getAllDoctors, bookAppointment } from '../services/api';

const FindDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingData, setBookingData] = useState({
    date: '',
    timeSlot: '',
    type: 'Online',
    reason: ''
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookingStatus, setBookingStatus] = useState({ loading: false, message: '', error: false });

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Filter when search query changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredDoctors(doctors);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = doctors.filter(doc => 
        (doc.name || '').toLowerCase().includes(lowerQuery) || 
        (doc.specialization || '').toLowerCase().includes(lowerQuery)
      );
      setFilteredDoctors(filtered);
    }
  }, [searchQuery, doctors]);

  const fetchDoctors = async () => {
    try {
      const res = await getAllDoctors();
      setDoctors(res.data || []);
      setFilteredDoctors(res.data || []);
    } catch (err) {
      console.error("Failed to load doctors", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Booking Logic ---

  const handleBookClick = (doctor) => {
    console.log("Booking clicked for:", doctor.name);
    setSelectedDoctor(doctor);
    setBookingData({ date: '', timeSlot: '', type: 'Online', reason: '' });
    setAvailableSlots([]);
    setBookingStatus({ loading: false, message: '', error: false });
  };

  const closeBookingModal = () => {
    setSelectedDoctor(null);
  };

  const handleDateChange = (e) => {
    const dateStr = e.target.value;
    setBookingData(prev => ({ ...prev, date: dateStr, timeSlot: '' }));

    if (!dateStr || !selectedDoctor) return;

    // 1. Get day of week from date 
    const dateObj = new Date(dateStr);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    // 2. Find doctor's availability for this day
    const slots = selectedDoctor.availableSlots || [];
    const daySchedule = slots.find(s => s.day === dayName);

    if (daySchedule) {
      // 3. Generate 30 min slots between startTime and endTime
      const timeSlots = generateTimeSlots(daySchedule.startTime, daySchedule.endTime);
      setAvailableSlots(timeSlots);
    } else {
      setAvailableSlots([]);
    }
  };

  const generateTimeSlots = (start, end) => {
    const slots = [];
    let current = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);

    while (current < endTime) {
      const timeString = current.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      slots.push(timeString);
      current.setMinutes(current.getMinutes() + 30); 
    }
    return slots;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingData.timeSlot) {
      setBookingStatus({ loading: false, message: 'Please select a time slot', error: true });
      return;
    }

    setBookingStatus({ loading: true, message: '', error: false });

    try {
      await bookAppointment({
        doctorId: selectedDoctor._id,
        appointmentDate: bookingData.date,
        timeSlot: bookingData.timeSlot,
        type: bookingData.type,
        reason: bookingData.reason
      });

      setBookingStatus({ loading: false, message: 'Appointment booked successfully!', error: false });
      
      // Close modal after 2 seconds
      setTimeout(() => {
        closeBookingModal();
      }, 2000);

    } catch (err) {
      setBookingStatus({ 
        loading: false, 
        message: err.response?.data?.message || 'Booking failed. Try again.', 
        error: true 
      });
    }
  };

  // --- Styles ---
  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    paddingBottom: '40px'
  };

  const searchContainer = {
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'center'
  };

  const searchInput = {
    width: '100%',
    maxWidth: '500px',
    padding: '15px 20px',
    borderRadius: '30px',
    border: '1px solid #dfe6e9',
    fontSize: '1rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    outline: 'none'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '25px'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
    border: '1px solid #f1f2f6',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s',
    position: 'relative',
    overflow: 'hidden'
  };

  const avatarPlaceholder = {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#e8f4fc',
    color: '#3498db',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '15px'
  };

  const docName = {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: '5px'
  };

  const docSpec = {
    color: '#3498db',
    fontWeight: '600',
    fontSize: '0.95rem',
    marginBottom: '10px'
  };

  const docDetail = {
    color: '#636e72',
    fontSize: '0.9rem',
    marginBottom: '5px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const bookBtn = {
    marginTop: 'auto',
    padding: '12px',
    backgroundColor: '#0984e3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    transition: 'background-color 0.2s',
    zIndex: 1 
  };

  // Modal Styles
  const modalOverlay = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000 
  };

  const modalContent = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  };

  const slotGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '10px',
    marginTop: '10px',
    marginBottom: '20px'
  };

  const slotBtn = (isActive) => ({
    padding: '8px',
    borderRadius: '6px',
    border: isActive ? '2px solid #3498db' : '1px solid #ddd',
    backgroundColor: isActive ? '#e8f4fc' : 'white',
    color: isActive ? '#3498db' : '#333',
    cursor: 'pointer',
    fontSize: '0.85rem'
  });

  const formGroup = { marginBottom: '15px' };
  const label = { display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem', color: '#34495e' };
  const input = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' };

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: 'center', marginBottom: '10px', color: '#2c3e50' }}>Find a Specialist</h1>
      <p style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: '30px' }}>Book appointments with top doctors near you.</p>
      
      {/* Search */}
      <div style={searchContainer}>
        <input 
          type="text" 
          placeholder="Search by doctor name or specialization..." 
          style={searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Doctor List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading doctors...</div>
      ) : filteredDoctors.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#b2bec3', padding: '20px' }}>No doctors found matching your criteria.</div>
      ) : (
        <div style={gridStyle}>
          {filteredDoctors.map(doc => {
             const displayName = doc.name || "Doctor";
             const displayChar = displayName.charAt(0).toUpperCase();

             return (
              <div key={doc._id} style={cardStyle}>
                <div style={avatarPlaceholder}>
                  {displayChar}
                </div>
                <h3 style={docName}>{displayName}</h3>
                <div style={docSpec}>{doc.specialization || 'General'}</div>
                
                <div style={docDetail}>👨‍⚕️ {doc.experience || 0} Years Exp.</div>
                <div style={docDetail}>🏥 {doc.clinicAddress || 'Clinic Address'}</div>
                <div style={docDetail}>💰 ₹{doc.fees || 0} Consultation Fee</div>

                <div style={{ margin: '15px 0', borderTop: '1px solid #f1f2f6' }}></div>

                <button style={bookBtn} onClick={() => handleBookClick(doc)}>
                  Book Appointment
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Modal */}
      {selectedDoctor && (
        <div style={modalOverlay} onClick={closeBookingModal}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#2c3e50' }}>Book Dr. {selectedDoctor.name || 'Doctor'}</h2>
                <button onClick={closeBookingModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#95a5a6' }}>×</button>
            </div>
            
            {bookingStatus.message && (
              <div style={{ 
                padding: '12px', marginBottom: '15px', borderRadius: '6px',
                backgroundColor: bookingStatus.error ? '#ffebee' : '#d4edda',
                color: bookingStatus.error ? '#c62828' : '#155724'
              }}>
                {bookingStatus.message}
              </div>
            )}

            <form onSubmit={handleBookingSubmit}>
              <div style={formGroup}>
                <label style={label}>Select Date</label>
                <input 
                  type="date" 
                  required 
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingData.date}
                  onChange={handleDateChange}
                  style={input}
                />
              </div>

              {bookingData.date && (
                <div style={formGroup}>
                  <label style={label}>Available Slots ({new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'long' })})</label>
                  {availableSlots.length > 0 ? (
                    <div style={slotGrid}>
                      {availableSlots.map(slot => (
                        <div 
                          key={slot} 
                          onClick={() => setBookingData(prev => ({ ...prev, timeSlot: slot }))}
                          style={slotBtn(bookingData.timeSlot === slot)}
                        >
                          {slot}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#e74c3c', fontStyle: 'italic', fontSize: '0.9rem', backgroundColor: '#fff5f5', padding: '10px', borderRadius: '6px' }}>
                      No slots available on this day. Please choose another date.
                    </div>
                  )}
                </div>
              )}

              <div style={formGroup}>
                <label style={label}>Consultation Type</label>
                <select 
                  style={input}
                  value={bookingData.type}
                  onChange={(e) => setBookingData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="Online">Online (Video Call)</option>
                  <option value="Offline">Offline (Clinic Visit)</option>
                </select>
              </div>

              <div style={formGroup}>
                <label style={label}>Reason for Visit</label>
                <textarea 
                  required
                  placeholder="Describe your symptoms..."
                  rows="3"
                  style={{ ...input, resize: 'vertical' }}
                  value={bookingData.reason}
                  onChange={(e) => setBookingData(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  onClick={closeBookingModal}
                  style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer', fontWeight: '500' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={bookingStatus.loading}
                  style={{ flex: 2, padding: '12px', border: 'none', borderRadius: '8px', backgroundColor: '#3498db', color: 'white', fontWeight: 'bold', cursor: 'pointer', opacity: bookingStatus.loading ? 0.7 : 1 }}
                >
                  {bookingStatus.loading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindDoctors;