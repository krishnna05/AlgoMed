import React, { useState, useEffect, useMemo } from 'react';
import { getAllDoctors, bookAppointment } from '../services/api';
import { 
    FiSearch, FiMapPin, FiStar, FiActivity, FiCheckCircle, 
    FiX, FiVideo, FiFilter, FiCalendar, FiDatabase 
} from 'react-icons/fi';

const DEMO_DOCTORS = [
    {
        _id: 'd1', name: 'Sara Chauhan', specialization: 'Cardiologist', experience: 12,
        qualifications: ['MBBS', 'MD', 'FACC'], fees: 1500, clinicAddress: 'Heart Care Center, NYC',
        rating: 4.9, reviewCount: 120, nextAvailable: 'Today, 2:00 PM',
        availableSlots: [{ day: 'Monday', startTime: '09:00', endTime: '17:00' }]
    },
    {
        _id: 'd2', name: 'Raghav Malhotra', specialization: 'Dermatologist', experience: 8,
        qualifications: ['MBBS', 'DDVL'], fees: 800, clinicAddress: 'Skin & Glow, Mumbai',
        rating: 4.7, reviewCount: 85, nextAvailable: 'Tomorrow, 10:00 AM',
        availableSlots: [{ day: 'Tuesday', startTime: '10:00', endTime: '14:00' }]
    },
    {
        _id: 'd3', name: 'Saumya Upadhyay', specialization: 'Pediatrician', experience: 15,
        qualifications: ['MBBS', 'MD'], fees: 1200, clinicAddress: 'Little Steps, SF',
        rating: 4.8, reviewCount: 210, nextAvailable: 'Available Now',
        availableSlots: [{ day: 'Monday', startTime: '08:00', endTime: '12:00' }]
    },
    {
        _id: 'd4', name: 'Kriti Menon', specialization: 'General Physician', experience: 20,
        qualifications: ['MBBS', 'MD'], fees: 600, clinicAddress: 'City Health, Chicago',
        rating: 4.6, reviewCount: 95, nextAvailable: 'Today, 4:30 PM',
        availableSlots: [{ day: 'Monday', startTime: '09:00', endTime: '20:00' }]
    }
];

const SPECIALTIES = ["All", "General Physician", "Cardiologist", "Dermatologist", "Pediatrician", "Neurologist"];

const FindDoctors = () => {
    // State
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDemoMode, setIsDemoMode] = useState(false);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');
    
    // Booking Modal
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [bookingData, setBookingData] = useState({ date: '', timeSlot: '', type: 'Online', reason: '' });
    const [availableSlots, setAvailableSlots] = useState([]);
    const [bookingStatus, setBookingStatus] = useState({ loading: false, message: '', error: false });

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const res = await getAllDoctors();
            setDoctors(Array.isArray(res.data) ? res.data : []);
            setIsDemoMode(false);
        } catch (err) {
            console.error("Failed to load doctors", err);
            setDoctors([]); 
        } finally {
            setLoading(false);
        }
    };

    const toggleDemoData = () => {
        if (isDemoMode) {
            fetchDoctors();
        } else {
            setLoading(true);
            setTimeout(() => {
                setDoctors(DEMO_DOCTORS);
                setIsDemoMode(true);
                setLoading(false);
            }, 500);
        }
    };

    const filteredDoctors = useMemo(() => {
        return doctors.filter(doc => {
            if (!doc) return false;
            const docName = (doc.name || '').toLowerCase();
            const query = searchQuery.toLowerCase();
            const matchesSearch = docName.includes(query) || (doc.specialization || '').toLowerCase().includes(query);
            const matchesSpecialty = selectedSpecialty === 'All' || (doc.specialization || '') === selectedSpecialty;
            return matchesSearch && matchesSpecialty;
        });
    }, [doctors, searchQuery, selectedSpecialty]);

    // --- Booking Logic ---
    const handleBookClick = (doctor) => {
        setSelectedDoctor(doctor);
        setBookingData({ date: '', timeSlot: '', type: 'Online', reason: '' });
        setAvailableSlots([]);
        setBookingStatus({ loading: false, message: '', error: false });
    };

    const handleDateChange = (e) => {
        const dateStr = e.target.value;
        setBookingData(prev => ({ ...prev, date: dateStr, timeSlot: '' }));
        if (!dateStr || !selectedDoctor) return;

        const dateObj = new Date(dateStr);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        const slots = selectedDoctor.availableSlots || [];
        const daySchedule = slots.find(s => s.day === dayName);

        if (daySchedule) {
            const timeSlots = generateTimeSlots(daySchedule.startTime, daySchedule.endTime);
            setAvailableSlots(timeSlots);
        } else {
            setAvailableSlots([]);
        }
    };

    const generateTimeSlots = (start, end) => {
        if (!start || !end) return [];
        const slots = [];
        let current = new Date(`2000-01-01T${start}`);
        const endTime = new Date(`2000-01-01T${end}`);
        while (current < endTime) {
            slots.push(current.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
            current.setMinutes(current.getMinutes() + 30);
        }
        return slots;
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (isDemoMode) {
            alert("This is a demo booking. In a real app, this would save to the database.");
            setSelectedDoctor(null);
            return;
        }
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
            setBookingStatus({ loading: false, message: 'Booking Successful!', error: false });
            setTimeout(() => setSelectedDoctor(null), 1500);
        } catch (err) {
            setBookingStatus({ loading: false, message: err.response?.data?.message || 'Booking failed.', error: true });
        }
    };

    return (
        <div className="app-container">
            {/* Header Section */}
            <div className="header-section">
                <div className="header-title">
                    <h1 className="main-title">Find Specialists</h1>
                    <p className="subtitle">Book consultations with top doctors.</p>
                </div>
                
                <div className="header-actions">
                     <div className="search-bar">
                        <FiSearch className="icon-search" />
                        <input 
                            placeholder="Search doctors, clinics..." 
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={toggleDemoData}
                        className="demo-btn">
                        <FiDatabase /> {isDemoMode ? 'Exit Demo' : 'Load Demo'}
                    </button>
                </div>
            </div>

            {/* Specialty Filters */}
            <div className="filter-container">
                <div className="filter-scroll">
                    {SPECIALTIES.map(spec => (
                        <button 
                            key={spec} 
                            onClick={() => setSelectedSpecialty(spec)}
                            className={`chip ${selectedSpecialty === spec ? 'active' : ''}`}
                        >
                            {spec}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="loading-state">Loading specialists...</div>
            ) : filteredDoctors.length === 0 ? (
                <div className="empty-state">
                    <FiSearch size={32} color="#cbd5e1" style={{marginBottom: '8px'}}/>
                    <div className="empty-text">No doctors found.</div>
                </div>
            ) : (
                <div className="doctor-grid">
                    {filteredDoctors.map(doc => (
                        <div key={doc._id} className="card hover-card">
                            <div className="card-head">
                                <div className="avatar">{(doc.name || 'D').charAt(0)}</div>
                                <div>
                                    <h3 className="doc-name"> Dr. {doc.name}</h3>
                                    <div className="doc-spec">{doc.specialization}</div>
                                    <div className="rating-row">
                                        <FiStar fill="#f59e0b" color="#f59e0b" size={12}/> 
                                        <span className="rating-val">{doc.rating || '4.5'}</span> 
                                        <span>({doc.reviewCount || 10} reviews)</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="card-body">
                                <div className="info-row"><FiActivity className="icon-sm" /> {doc.experience} Years Exp.</div>
                                <div className="info-row"><FiMapPin className="icon-sm" /> <span className="address-trunc">{doc.clinicAddress || 'Clinic Address'}</span></div>
                                <div className="info-row">
                                    <FiCheckCircle className="icon-sm" color={doc.nextAvailable?.includes('Now') ? '#22c55e' : '#64748b'} />
                                    <span style={{ fontWeight: '500', color: doc.nextAvailable?.includes('Now') ? '#16a34a' : '#64748b' }}>
                                        Available: {doc.nextAvailable || 'Check Slots'}
                                    </span>
                                </div>
                                <div className="qualifications">
                                    {(doc.qualifications || []).slice(0, 3).map((q, i) => (
                                        <span key={i} className="qual-tag">{q}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="card-foot">
                                <div>
                                    <div className="fee-label">Fee</div>
                                    <div className="fee-val">₹{doc.fees}</div>
                                </div>
                                <button className="btn-primary" onClick={() => handleBookClick(doc)}>Book Visit</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- BOOKING MODAL --- */}
            {selectedDoctor && (
                <div className="modal-overlay" onClick={() => setSelectedDoctor(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        
                        {/* Header */}
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">Book Appointment</h2>
                                <p className="modal-subtitle">with {selectedDoctor.name}</p>
                            </div>
                            <button onClick={() => setSelectedDoctor(null)} className="close-btn"><FiX /></button>
                        </div>
                        
                        <div className="modal-body">
                            {bookingStatus.message && (
                                <div className={`status-msg ${bookingStatus.error ? 'error' : 'success'}`}>
                                    {bookingStatus.message}
                                </div>
                            )}

                            <form id="booking-form" onSubmit={handleBookingSubmit}>
                                <div className="input-group">
                                    <label className="input-label">Select Date</label>
                                    <input 
                                        type="date" 
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={handleDateChange}
                                        className="input-field"
                                        required
                                    />
                                </div>

                                {bookingData.date && (
                                    <div className="input-group">
                                        <label className="input-label">Available Slots</label>
                                        <div className="slots-grid">
                                            {availableSlots.length > 0 ? availableSlots.map(slot => (
                                                <div 
                                                    key={slot}
                                                    onClick={() => setBookingData(prev => ({ ...prev, timeSlot: slot }))}
                                                    className={`slot-item ${bookingData.timeSlot === slot ? 'active' : ''}`}
                                                >
                                                    {slot}
                                                </div>
                                            )) : <div className="no-slots">No slots available.</div>}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="input-group">
                                    <label className="input-label">Consultation Type</label>
                                    <div className="type-toggle">
                                        {['Online', 'Offline'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setBookingData(prev => ({ ...prev, type }))}
                                                className={`type-btn ${bookingData.type === type ? 'active' : ''}`}
                                            >
                                                {type === 'Online' ? <FiVideo /> : <FiMapPin />} {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '8px' }}>
                                    <label className="input-label">Reason for Visit</label>
                                    <textarea 
                                        rows="3" 
                                        required
                                        placeholder="Briefly describe your symptoms..."
                                        onChange={(e) => setBookingData(prev => ({ ...prev, reason: e.target.value }))}
                                        className="input-field textarea"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer">
                            <button 
                                type="button"
                                onClick={() => setSelectedDoctor(null)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                form="booking-form"
                                disabled={bookingStatus.loading}
                                className="btn-submit"
                            >
                                {bookingStatus.loading ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                .app-container { max-width: 1000px; margin: 0 auto; padding: 20px; padding-bottom: 40px; }
                .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; background-color: white; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
                .main-title { font-size: 1.5rem; font-weight: 800; margin: 0 0 4px 0; color: #1e293b; }
                .subtitle { margin: 0; color: #64748b; font-size: 0.9rem; }
                .header-actions { display: flex; gap: 12px; align-items: center; }
                .search-bar { display: flex; align-items: center; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; width: 240px; }
                .search-input { border: none; background: transparent; outline: none; margin-left: 8px; width: 100%; font-size: 0.9rem; }
                .icon-search { color: #94a3b8; font-size: 16px; }
                .demo-btn { padding: 10px 16px; border-radius: 10px; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-weight: 600; font-size: 0.8rem; display: flex; align-items: center; gap: 8px; color: #475569; white-space: nowrap; }

                /* Filters */
                .filter-container { margin-bottom: 20px; width: 100%; overflow: hidden; }
                .filter-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px; scrollbar-width: none; }
                .filter-scroll::-webkit-scrollbar { display: none; }
                .chip { padding: 8px 16px; border-radius: 24px; font-size: 0.8rem; cursor: pointer; white-space: nowrap; font-weight: 500; background: white; color: #64748b; border: 1px solid #e2e8f0; transition: all 0.2s; flex-shrink: 0; }
                .chip.active { background-color: #2563eb; color: white; border-color: #2563eb; }

                /* Grid & Cards */
                .doctor-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
                .card { background-color: white; border-radius: 12px; border: 1px solid #f1f5f9; box-shadow: 0 2px 4px rgba(0,0,0,0.02); overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; }
                .hover-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }
                
                .card-head { padding: 16px; border-bottom: 1px solid #f8fafc; display: flex; gap: 12px; }
                .avatar { width: 50px; height: 50px; border-radius: 12px; background-color: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 700; flex-shrink: 0; }
                .doc-name { margin: 0 0 4px 0; font-size: 1rem; color: #1e293b; }
                .doc-spec { color: #2563eb; font-weight: 500; font-size: 0.85rem; }
                .rating-row { display: flex; align-items: center; gap: 4px; margin-top: 4px; font-size: 0.75rem; color: #64748b; }
                .rating-val { font-weight: 700; color: #1e293b; }

                .card-body { padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
                .info-row { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #64748b; }
                .icon-sm { flex-shrink: 0; font-size: 16px; }
                .address-trunc { text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }
                .qualifications { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 4px; }
                .qual-tag { font-size: 0.7rem; background-color: #f1f5f9; padding: 2px 8px; border-radius: 4px; color: #475569; }

                .card-foot { padding: 12px 16px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
                .fee-label { font-size: 0.7rem; color: #64748b; text-transform: uppercase; font-weight: 600; }
                .fee-val { font-size: 1rem; font-weight: 700; color: #1e293b; }
                .btn-primary { padding: 8px 16px; background-color: #2563eb; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem; transition: background 0.2s; }

                /* Modal */
                .modal-overlay { position: fixed; inset: 0; background-color: rgba(15, 23, 42, 0.7); display: flex; justify-content: center; align-items: center; z-index: 1100; backdrop-filter: blur(4px); padding: 20px; }
                .modal-content { width: 100%; max-width: 450px; max-height: 90vh; background-color: white; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); display: flex; flex-direction: column; overflow: hidden; animation: slideUp 0.3s ease-out; }
                .modal-header { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background-color: white; flex-shrink: 0; }
                .modal-title { margin: 0; font-size: 1.2rem; color: #1e293b; }
                .modal-subtitle { margin: 2px 0 0; font-size: 0.85rem; color: #64748b; }
                .close-btn { background: none; border: none; font-size: 1.4rem; cursor: pointer; color: #94a3b8; display: flex; align-items: center; }
                
                .modal-body { padding: 24px; overflow-y: auto; flex: 1; }
                .status-msg { padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 0.85rem; }
                .status-msg.error { background-color: #fee2e2; color: #991b1b; }
                .status-msg.success { background-color: #dcfce7; color: #166534; }
                
                .input-group { margin-bottom: 16px; }
                .input-label { display: block; font-size: 0.75rem; font-weight: 700; color: #475569; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.03em; }
                .input-field { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; font-size: 0.95rem; box-sizing: border-box; }
                .textarea { resize: vertical; font-family: inherit; }
                
                .slots-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
                .slot-item { padding: 10px; text-align: center; border-radius: 8px; cursor: pointer; font-size: 0.85rem; border: 1px solid #e2e8f0; background: white; color: #64748b; }
                .slot-item.active { border: 2px solid #2563eb; background-color: #eff6ff; color: #2563eb; }
                .no-slots { grid-column: 1/-1; padding: 12px; color: #94a3b8; text-align: center; background-color: #f8fafc; border-radius: 8px; font-size: 0.85rem; }
                
                .type-toggle { display: flex; gap: 10px; }
                .type-btn { flex: 1; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; border: 1px solid #e2e8f0; background: white; color: #64748b; display: flex; align-items: center; justify-content: center; gap: 6px; }
                .type-btn.active { border: 2px solid #2563eb; background-color: #eff6ff; color: #2563eb; }

                .modal-footer { padding: 20px 24px; border-top: 1px solid #f1f5f9; background-color: #f8fafc; flex-shrink: 0; display: flex; gap: 12px; }
                .btn-secondary { padding: 12px 20px; border: 1px solid #cbd5e1; background-color: white; color: #475569; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
                .btn-submit { flex: 1; padding: 12px; border-radius: 8px; border: none; background-color: #2563eb; color: white; font-weight: 700; cursor: pointer; font-size: 0.95rem; }
                .loading-state, .empty-state { padding: 50px; text-align: center; color: #94a3b8; font-size: 0.9rem; }
                .empty-state { background-color: white; border-radius: 12px; border: 1px dashed #cbd5e1; }

                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) {
                    .app-container { padding: 10px; padding-bottom: 80px; } /* Reduced padding */
                    .header-section { flex-direction: column; align-items: stretch; gap: 12px; padding: 14px; margin-bottom: 16px; }
                    .header-actions { flex-direction: row; }
                    .search-bar { width: 100%; flex: 1; padding: 8px 10px; }
                    .demo-btn { padding: 8px 12px; font-size: 0.7rem; }
                    .doctor-grid { grid-template-columns: 1fr; gap: 12px; } /* Tighter gap */

                    .main-title { font-size: 1.25rem; }
                    .subtitle { font-size: 0.8rem; }
                    .search-input { font-size: 0.8rem; margin-left: 6px; }
                    .icon-search { font-size: 14px; }
                    
                    .filter-container { margin-bottom: 14px; }
                    .chip { padding: 6px 12px; font-size: 0.75rem; border-radius: 20px; }

                    .card-head { padding: 12px; gap: 10px; }
                    .avatar { width: 42px; height: 42px; font-size: 1.1rem; border-radius: 10px; }
                    .doc-name { font-size: 0.95rem; margin-bottom: 2px; }
                    .doc-spec { font-size: 0.75rem; }
                    .rating-row { font-size: 0.7rem; margin-top: 2px; }
                    
                    .card-body { padding: 12px; gap: 6px; }
                    .info-row { font-size: 0.75rem; gap: 6px; }
                    .icon-sm { font-size: 14px; }
                    .qual-tag { font-size: 0.65rem; padding: 2px 6px; }

                    .card-foot { padding: 10px 12px; }
                    .fee-label { font-size: 0.65rem; }
                    .fee-val { font-size: 0.9rem; }
                    .btn-primary { padding: 6px 12px; font-size: 0.75rem; border-radius: 5px; }

                    .modal-overlay { padding: 10px; align-items: flex-end; } 
                    .modal-content { border-radius: 16px 16px 0 0; max-height: 85vh; }
                    .modal-header { padding: 16px; }
                    .modal-title { font-size: 1.1rem; }
                    .modal-subtitle { font-size: 0.8rem; }
                    .close-btn { font-size: 1.2rem; }

                    .modal-body { padding: 16px; }
                    .input-group { margin-bottom: 12px; }
                    .input-label { font-size: 0.7rem; margin-bottom: 4px; }
                    .input-field { padding: 10px; font-size: 0.85rem; border-radius: 6px; }
                    
                    .slots-grid { gap: 8px; }
                    .slot-item { padding: 8px; font-size: 0.75rem; border-radius: 6px; }
                    
                    .type-btn { padding: 8px; font-size: 0.8rem; border-radius: 6px; }
                    
                    .modal-footer { padding: 14px 16px; gap: 10px; }
                    .btn-secondary { padding: 10px 14px; font-size: 0.8rem; border-radius: 6px; }
                    .btn-submit { padding: 10px; font-size: 0.85rem; border-radius: 6px; }
                }
            `}</style>
        </div>
    );
};

export default FindDoctors;