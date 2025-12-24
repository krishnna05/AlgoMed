import React, { useState, useEffect, useMemo } from 'react';
import { getAllDoctors, bookAppointment } from '../services/api';
import { 
    FiSearch, FiMapPin, FiStar, FiActivity, FiCheckCircle, 
    FiX, FiVideo, FiFilter, FiCalendar, FiDatabase 
} from 'react-icons/fi';

// --- DEMO DATA CONSTANTS ---
const DEMO_DOCTORS = [
    {
        _id: 'd1', name: 'Dr. Sarah Jenkins', specialization: 'Cardiologist', experience: 12,
        qualifications: ['MBBS', 'MD', 'FACC'], fees: 1500, clinicAddress: 'Heart Care Center, NYC',
        rating: 4.9, reviewCount: 120, nextAvailable: 'Today, 2:00 PM',
        availableSlots: [{ day: 'Monday', startTime: '09:00', endTime: '17:00' }]
    },
    {
        _id: 'd2', name: 'Dr. Raj Malhotra', specialization: 'Dermatologist', experience: 8,
        qualifications: ['MBBS', 'DDVL'], fees: 800, clinicAddress: 'Skin & Glow, Mumbai',
        rating: 4.7, reviewCount: 85, nextAvailable: 'Tomorrow, 10:00 AM',
        availableSlots: [{ day: 'Tuesday', startTime: '10:00', endTime: '14:00' }]
    },
    {
        _id: 'd3', name: 'Dr. Emily Chen', specialization: 'Pediatrician', experience: 15,
        qualifications: ['MBBS', 'MD'], fees: 1200, clinicAddress: 'Little Steps, SF',
        rating: 4.8, reviewCount: 210, nextAvailable: 'Available Now',
        availableSlots: [{ day: 'Monday', startTime: '08:00', endTime: '12:00' }]
    },
    {
        _id: 'd4', name: 'Dr. Alan Grant', specialization: 'General Physician', experience: 20,
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

    // --- Styles ---
    const styles = {
        container: { maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' },
        
        // Header
        header: {
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px',
            backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
        },
        searchBar: {
            display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', 
            border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 16px', width: '300px'
        },
        input: { border: 'none', background: 'transparent', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '0.95rem' },
        
        // Filters
        filterBar: { display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px', marginBottom: '10px' },
        chip: (active) => ({
            padding: '8px 18px', borderRadius: '30px', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '500',
            backgroundColor: active ? '#2563eb' : 'white', color: active ? 'white' : '#64748b',
            border: active ? '1px solid #2563eb' : '1px solid #e2e8f0', transition: 'all 0.2s'
        }),

        // Grid
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' },
        card: {
            backgroundColor: 'white', borderRadius: '16px', border: '1px solid #f1f5f9',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)', overflow: 'hidden',
            transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column'
        },
        cardHead: { padding: '20px', borderBottom: '1px solid #f8fafc', display: 'flex', gap: '16px' },
        avatar: {
            width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#eff6ff', color: '#2563eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: '700'
        },
        cardBody: { padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' },
        infoRow: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#64748b' },
        cardFoot: { padding: '16px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        btnPrimary: {
            padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px',
            fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', transition: 'background 0.2s'
        },

        // --- MODAL STYLES ---
        overlay: { 
            position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', 
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' 
        },
        modal: { 
            width: '90%', maxWidth: '500px', maxHeight: '90vh', 
            backgroundColor: 'white', borderRadius: '20px', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex', flexDirection: 'column', 
            overflow: 'hidden' 
        },
        modalHeader: {
            padding: '20px 25px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            backgroundColor: 'white', flexShrink: 0
        },
        modalBody: {
            padding: '25px', 
            overflowY: 'auto', 
            flex: 1 
        },
        modalFooter: {
            padding: '20px 25px', borderTop: '1px solid #f1f5f9',
            backgroundColor: '#f8fafc', flexShrink: 0,
            display: 'flex', gap: '10px'
        },
        inputGroup: { marginBottom: '18px' },
        label: { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.03em' },
        inputField: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', transition: 'border-color 0.2s' }
    };

    return (
        <div style={styles.container}>
            {/* Header Section */}
            <div style={styles.header}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 5px 0', color: '#1e293b' }}>Find Specialists</h1>
                    <p style={{ margin: 0, color: '#64748b' }}>Book consultations with top doctors.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '15px' }}>
                     <div style={styles.searchBar}>
                        <FiSearch color="#94a3b8" />
                        <input 
                            placeholder="Search doctors, clinics..." 
                            style={styles.input}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={toggleDemoData}
                        style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiDatabase /> {isDemoMode ? 'Exit Demo' : 'Load Demo'}
                    </button>
                </div>
            </div>

            {/* Specialty Filters */}
            <div style={styles.filterBar}>
                {SPECIALTIES.map(spec => (
                    <button 
                        key={spec} 
                        onClick={() => setSelectedSpecialty(spec)}
                        style={styles.chip(selectedSpecialty === spec)}
                    >
                        {spec}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading specialists...</div>
            ) : filteredDoctors.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', backgroundColor: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                    <FiSearch size={40} color="#cbd5e1" style={{marginBottom: '10px'}}/>
                    <div style={{color: '#64748b', fontWeight: '600'}}>No doctors found.</div>
                </div>
            ) : (
                <div style={styles.grid}>
                    {filteredDoctors.map(doc => (
                        <div key={doc._id} style={styles.card} className="hover-card">
                            <div style={styles.cardHead}>
                                <div style={styles.avatar}>{(doc.name || 'D').charAt(0)}</div>
                                <div>
                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#1e293b' }}>{doc.name}</h3>
                                    <div style={{ color: '#2563eb', fontWeight: '500', fontSize: '0.9rem' }}>{doc.specialization}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px', fontSize: '0.8rem', color: '#64748b' }}>
                                        <FiStar fill="#f59e0b" color="#f59e0b" /> 
                                        <span style={{fontWeight:'700', color: '#1e293b'}}>{doc.rating || '4.5'}</span> 
                                        <span>({doc.reviewCount || 10} reviews)</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div style={styles.cardBody}>
                                <div style={styles.infoRow}><FiActivity /> {doc.experience} Years Exp.</div>
                                <div style={styles.infoRow}><FiMapPin /> {doc.clinicAddress || 'Clinic Address'}</div>
                                <div style={styles.infoRow}>
                                    <FiCheckCircle color={doc.nextAvailable?.includes('Now') ? '#22c55e' : '#64748b'} />
                                    <span style={{ fontWeight: '500', color: doc.nextAvailable?.includes('Now') ? '#16a34a' : '#64748b' }}>
                                        Available: {doc.nextAvailable || 'Check Slots'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '5px' }}>
                                    {(doc.qualifications || []).slice(0, 3).map((q, i) => (
                                        <span key={i} style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#475569' }}>{q}</span>
                                    ))}
                                </div>
                            </div>

                            <div style={styles.cardFoot}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Fee</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>₹{doc.fees}</div>
                                </div>
                                <button style={styles.btnPrimary} onClick={() => handleBookClick(doc)}>Book Visit</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- BOOKING MODAL --- */}
            {selectedDoctor && (
                <div style={styles.overlay} onClick={() => setSelectedDoctor(null)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        
                        {/* Header */}
                        <div style={styles.modalHeader}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Book Appointment</h2>
                                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>with {selectedDoctor.name}</p>
                            </div>
                            <button onClick={() => setSelectedDoctor(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}><FiX /></button>
                        </div>
                        
                        {/* Scrollable Body */}
                        <div style={styles.modalBody}>
                            {bookingStatus.message && (
                                <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem', backgroundColor: bookingStatus.error ? '#fee2e2' : '#dcfce7', color: bookingStatus.error ? '#991b1b' : '#166534' }}>
                                    {bookingStatus.message}
                                </div>
                            )}

                            <form id="booking-form" onSubmit={handleBookingSubmit}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Select Date</label>
                                    <input 
                                        type="date" 
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={handleDateChange}
                                        style={styles.inputField}
                                        required
                                    />
                                </div>

                                {bookingData.date && (
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Available Slots</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                            {availableSlots.length > 0 ? availableSlots.map(slot => (
                                                <div 
                                                    key={slot}
                                                    onClick={() => setBookingData(prev => ({ ...prev, timeSlot: slot }))}
                                                    style={{ 
                                                        padding: '10px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem',
                                                        border: bookingData.timeSlot === slot ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                                        backgroundColor: bookingData.timeSlot === slot ? '#eff6ff' : 'white',
                                                        color: bookingData.timeSlot === slot ? '#2563eb' : '#64748b'
                                                    }}
                                                >
                                                    {slot}
                                                </div>
                                            )) : <div style={{ gridColumn: '1/-1', padding: '10px', color: '#94a3b8', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px' }}>No slots available on this date.</div>}
                                        </div>
                                    </div>
                                )}
                                
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Consultation Type</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {['Online', 'Offline'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setBookingData(prev => ({ ...prev, type }))}
                                                style={{
                                                    flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                                                    border: bookingData.type === type ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                                    backgroundColor: bookingData.type === type ? '#eff6ff' : 'white',
                                                    color: bookingData.type === type ? '#2563eb' : '#64748b',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                                }}
                                            >
                                                {type === 'Online' ? <FiVideo /> : <FiMapPin />} {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '10px' }}>
                                    <label style={styles.label}>Reason for Visit</label>
                                    <textarea 
                                        rows="3" 
                                        required
                                        placeholder="Briefly describe your symptoms..."
                                        onChange={(e) => setBookingData(prev => ({ ...prev, reason: e.target.value }))}
                                        style={{ ...styles.inputField, resize: 'vertical' }}
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div style={styles.modalFooter}>
                            <button 
                                type="button"
                                onClick={() => setSelectedDoctor(null)}
                                style={{ padding: '12px 20px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#475569', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                form="booking-form"
                                disabled={bookingStatus.loading}
                                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '1rem' }}
                            >
                                {bookingStatus.loading ? 'Processing...' : 'Confirm Appointment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`.hover-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }`}</style>
        </div>
    );
};

export default FindDoctors;