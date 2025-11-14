// src/pages/PatientHomePage.js
import React, { useState } from 'react';
import '../styles/PatientHomePage.css';

/*
  PatientHomePage
  - Two tabs: BOOK A SLOT (default) and ADVISORY
  - Book flow: select doctor via dropdown with search, pick date & time, click Book
  - Shows booked slots history on the right side in BOOK A SLOT tab
  - Advisory tab shows instructions and prescriptions from past appointments
  - Accessibility: aria-pressed on interactive buttons
  - Logout functionality to return to login page
*/

export default function PatientHomePage({ onLogout }) {
  // Hardcoded sample doctors data
  const doctors = [
    { id: 1, name: 'Dr. Priya Rao', specialization: 'Cardiology' },
    { id: 2, name: 'Dr. Amit Kumar', specialization: 'Neurology' },
    { id: 3, name: 'Dr. Sarah Johnson', specialization: 'Pediatrics' },
    { id: 4, name: 'Dr. Rajesh Sharma', specialization: 'Orthopedics' },
    { id: 5, name: 'Dr. Emily Chen', specialization: 'Dermatology' },
    { id: 6, name: 'Dr. Michael Brown', specialization: 'Psychiatry' }
  ];

  // Sample past appointments with prescriptions and instructions
  const [pastAppointments] = useState([
    {
      id: 1,
      doctorName: 'Dr. Priya Rao',
      specialization: 'Cardiology',
      date: '2024-11-01',
      time: '10:00 AM',
      prescription: [
        'Aspirin 75mg - Once daily after breakfast',
        'Atorvastatin 10mg - Once daily before bedtime',
        'Metoprolol 25mg - Twice daily'
      ],
      instructions: [
        'Monitor blood pressure daily',
        'Avoid high-sodium foods',
        'Light exercise for 30 minutes daily',
        'Follow-up appointment in 2 weeks'
      ],
      diagnosis: 'Hypertension management'
    },
    {
      id: 2,
      doctorName: 'Dr. Amit Kumar',
      specialization: 'Neurology',
      date: '2024-10-28',
      time: '02:30 PM',
      prescription: [
        'Paracetamol 500mg - As needed for headache',
        'Vitamin B12 supplement - Once daily'
      ],
      instructions: [
        'Maintain regular sleep schedule (7-8 hours)',
        'Reduce screen time before bed',
        'Stay hydrated - drink at least 8 glasses of water',
        'Avoid caffeine after 4 PM'
      ],
      diagnosis: 'Migraine and vitamin deficiency'
    },
    {
      id: 3,
      doctorName: 'Dr. Emily Chen',
      specialization: 'Dermatology',
      date: '2024-10-15',
      time: '11:00 AM',
      prescription: [
        'Moisturizing cream - Apply twice daily',
        'Sunscreen SPF 50+ - Apply before going out',
        'Antihistamine tablet - Once daily if itching persists'
      ],
      instructions: [
        'Avoid direct sun exposure between 10 AM - 4 PM',
        'Use gentle, fragrance-free soap',
        'Pat dry skin instead of rubbing',
        'Keep skin moisturized at all times'
      ],
      diagnosis: 'Eczema treatment'
    }
  ]);

  // State for active tab: 'book' or 'advisory'
  const [activeTab, setActiveTab] = useState('book');

  // State for selected doctor ID
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  // State for search input in dropdown
  const [searchTerm, setSearchTerm] = useState('');

  // State to toggle dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // State for appointment date and time
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  // State for booking status messages
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');

  // State for booked appointments
  const [bookedSlots, setBookedSlots] = useState([]);

  // State for selected past appointment in advisory view
  const [selectedPastAppointment, setSelectedPastAppointment] = useState(null);

  // Filter doctors based on search term
  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Find selected doctor object
  const selectedDoctor = doctors.find(doc => doc.id === selectedDoctorId);

  // Handle doctor selection from dropdown
  const handleDoctorSelect = (doctor) => {
    setSelectedDoctorId(doctor.id);
    setSearchTerm(''); // Clear search after selection
    setIsDropdownOpen(false); // Close dropdown
    setBookingMessage('');
    setBookingError('');
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true); // Open dropdown when typing
  };

  // Handle dropdown toggle
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle booking button click
  const handleBook = () => {
    // Clear previous messages
    setBookingMessage('');
    setBookingError('');

    // Validate doctor selection
    if (!selectedDoctorId) {
      setBookingError('Please select a doctor before booking.');
      return;
    }

    // Validate date and time
    if (!appointmentDate || !appointmentTime) {
      setBookingError('Please select both date and time.');
      return;
    }

    // Create new booking object
    const newBooking = {
      id: Date.now(), // Simple unique ID
      doctorId: selectedDoctorId,
      doctorName: selectedDoctor.name,
      specialization: selectedDoctor.specialization,
      date: appointmentDate,
      time: appointmentTime,
      bookedAt: new Date().toLocaleString()
    };

    // Add to booked slots
    setBookedSlots([newBooking, ...bookedSlots]);

    // Show success message
    setBookingMessage(`Booked with ${selectedDoctor.name} on ${appointmentDate} at ${appointmentTime}`);

    // Clear date and time but keep doctor selected
    setAppointmentDate('');
    setAppointmentTime('');
  };

  // Handle cancel booking
  const handleCancelBooking = (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      setBookedSlots(bookedSlots.filter(slot => slot.id !== bookingId));
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Handle past appointment selection in advisory view
  const handleSelectPastAppointment = (appointment) => {
    setSelectedPastAppointment(appointment);
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // Call the onLogout callback if provided
      if (onLogout) {
        onLogout();
      }
    }
  };

  return (
    <div className="patient-home-page">
      {/* Header with logout button */}
      <header className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="header-title">Patient Portal</h1>
            <p className="header-subtitle">Manage your appointments and health records</p>
          </div>
          <button 
            className="logout-button"
            onClick={handleLogout}
            aria-label="Logout from patient portal"
          >
            <span className="logout-icon"></span>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </header>

      {/* Top navigation tabs */}
      <nav className="tabs-container" role="tablist" aria-label="Patient home tabs">
        <button
          role="tab"
          aria-selected={activeTab === 'book'}
          className={`tab ${activeTab === 'book' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('book')}
        >
          BOOK A SLOT
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'advisory'}
          className={`tab ${activeTab === 'advisory' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('advisory')}
        >
          ADVISORY
        </button>
      </nav>

      {/* Content area */}
      <main className="content-area">
        {activeTab === 'book' && (
          <div className="book-layout">
            {/* Left side - Booking form */}
            <section className="book-view" aria-labelledby="book-title">
              <h2 id="book-title" className="section-title">Choose a doctor</h2>

              {/* Doctor dropdown with search */}
              <div className="doctor-dropdown-container">
                <label htmlFor="doctor-search" className="dropdown-label">
                  Search or select a doctor
                </label>
                
                <div className="dropdown-wrapper">
                  {/* Selected doctor display / Search input */}
                  <div className="dropdown-input-wrapper">
                    {selectedDoctor && !isDropdownOpen ? (
                      <div className="selected-doctor-display">
                        <div className="selected-doctor-info">
                          <span className="selected-doctor-name">{selectedDoctor.name}</span>
                          <span className="selected-doctor-spec">{selectedDoctor.specialization}</span>
                        </div>
                        <button
                          className="clear-selection-btn"
                          onClick={() => {
                            setSelectedDoctorId(null);
                            setSearchTerm('');
                          }}
                          aria-label="Clear doctor selection"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <input
                        id="doctor-search"
                        type="text"
                        className="dropdown-search-input"
                        placeholder="Type to search by name or specialization..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => setIsDropdownOpen(true)}
                      />
                    )}
                    
                    <button
                      className="dropdown-toggle-btn"
                      onClick={toggleDropdown}
                      aria-label="Toggle doctor dropdown"
                      aria-expanded={isDropdownOpen}
                    >
                      {isDropdownOpen ? '▲' : '▼'}
                    </button>
                  </div>

                  {/* Dropdown list */}
                  {isDropdownOpen && (
                    <ul className="dropdown-list" role="listbox">
                      {filteredDoctors.length > 0 ? (
                        filteredDoctors.map(doctor => (
                          <li
                            key={doctor.id}
                            className={`dropdown-item ${selectedDoctorId === doctor.id ? 'dropdown-item-selected' : ''}`}
                            onClick={() => handleDoctorSelect(doctor)}
                            role="option"
                            aria-selected={selectedDoctorId === doctor.id}
                          >
                            <div className="dropdown-item-content">
                              <span className="dropdown-doctor-name">{doctor.name}</span>
                              <span className="dropdown-doctor-spec">{doctor.specialization}</span>
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="dropdown-no-results">
                          No doctors found matching "{searchTerm}"
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>

              {/* Date and time selection */}
              <div className="datetime-section">
                <h3 className="datetime-title">Choose time &amp; date</h3>
                <div className="datetime-inputs">
                  <label className="input-group">
                    <span className="input-label">Date</span>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                    />
                  </label>

                  <label className="input-group">
                    <span className="input-label">Time</span>
                    <input
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              {/* Book button */}
              <div className="book-actions">
                <button className="book-button" onClick={handleBook}>
                  Book
                </button>
              </div>

              {/* Status messages */}
              {bookingError && (
                <div className="message message-error" role="alert">
                  {bookingError}
                </div>
              )}
              {bookingMessage && (
                <div className="message message-success" role="status">
                  {bookingMessage}
                </div>
              )}

              {/* Selected doctor display */}
              <div className="selected-info">
                Selected: {selectedDoctor ? selectedDoctor.name : 'No doctor selected'}
              </div>
            </section>

            {/* Right side - Booked slots */}
            <aside className="booked-slots-panel" aria-labelledby="booked-slots-title">
              <h3 id="booked-slots-title" className="booked-slots-title">
                Your Booked Appointments
              </h3>

              {bookedSlots.length === 0 ? (
                <div className="no-bookings">
                  <p>No appointments booked yet.</p>
                  <p className="no-bookings-hint">Book your first appointment to see it here.</p>
                </div>
              ) : (
                <ul className="booked-slots-list">
                  {bookedSlots.map(slot => (
                    <li key={slot.id} className="booked-slot-item">
                      <div className="booked-slot-header">
                        <span className="booked-slot-doctor">{slot.doctorName}</span>
                        <button
                          className="cancel-booking-btn"
                          onClick={() => handleCancelBooking(slot.id)}
                          aria-label={`Cancel appointment with ${slot.doctorName}`}
                        >
                          ✕
                        </button>
                      </div>
                      <div className="booked-slot-spec">{slot.specialization}</div>
                      <div className="booked-slot-datetime">
                        <span className="booked-slot-icon">📅</span>
                        <span>{formatDate(slot.date)}</span>
                      </div>
                      <div className="booked-slot-datetime">
                        <span className="booked-slot-icon">🕐</span>
                        <span>{slot.time}</span>
                      </div>
                      <div className="booked-slot-meta">
                        Booked: {slot.bookedAt}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </div>
        )}

        {activeTab === 'advisory' && (
          <div className="advisory-layout">
            {/* Left side - General advisory and instructions */}
            <section className="advisory-view" aria-labelledby="advisory-title">
              <h2 id="advisory-title" className="section-title">Advisory</h2>
              
              <div className="general-advisory">
                <div className="advisory-card">
                  <h3 className="advisory-card-title">📋 General Instructions</h3>
                  <ul className="general-instructions-list">
                    <li>Bring your ID proof and insurance card</li>
                    <li>Arrive 15 minutes before your appointment time</li>
                    <li>Carry all previous medical reports</li>
                    <li>List current medications you are taking</li>
                    <li>Wear comfortable clothing for examination</li>
                  </ul>
                </div>

                <div className="advisory-card">
                  <h3 className="advisory-card-title">📥 Download your Prescription</h3>
                  <p className="advisory-note">
                    Download the prescription for your use. 
                    It includes information about your medications.
                  </p>
                  <button className="download-btn">
                    📄 Download Prescription
                  </button>
                </div>
              </div>
            </section>

            {/* Right side - Past appointments with prescriptions */}
            <aside className="prescriptions-panel" aria-labelledby="prescriptions-title">
              <h3 id="prescriptions-title" className="prescriptions-title">
                Past Appointments & Prescriptions
              </h3>

              {pastAppointments.length === 0 ? (
                <div className="no-prescriptions">
                  <p>No past appointments found.</p>
                </div>
              ) : (
                <div className="prescriptions-container">
                  {/* List of past appointments */}
                  <ul className="past-appointments-list">
                    {pastAppointments.map(appointment => (
                      <li 
                        key={appointment.id} 
                        className={`past-appointment-item ${selectedPastAppointment?.id === appointment.id ? 'past-appointment-selected' : ''}`}
                        onClick={() => handleSelectPastAppointment(appointment)}
                      >
                        <div className="past-appointment-header">
                          <span className="past-doctor-name">{appointment.doctorName}</span>
                        </div>
                        <div className="past-appointment-spec">{appointment.specialization}</div>
                        <div className="past-appointment-date">
                          <span className="past-appointment-icon">📅</span>
                          <span>{formatDate(appointment.date)} at {appointment.time}</span>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Display selected appointment details */}
                  {selectedPastAppointment && (
                    <div className="prescription-details">
                      <div className="prescription-header">
                        <h4 className="prescription-doctor">{selectedPastAppointment.doctorName}</h4>
                        <span className="prescription-badge">Completed</span>
                      </div>
                      
                      <div className="prescription-info">
                        <div className="prescription-meta">
                          <span className="meta-label">Specialization:</span>
                          <span className="meta-value">{selectedPastAppointment.specialization}</span>
                        </div>
                        <div className="prescription-meta">
                          <span className="meta-label">Date:</span>
                          <span className="meta-value">{formatDate(selectedPastAppointment.date)}</span>
                        </div>
                        <div className="prescription-meta">
                          <span className="meta-label">Time:</span>
                          <span className="meta-value">{selectedPastAppointment.time}</span>
                        </div>
                      </div>

                      <div className="prescription-section">
                        <h5 className="prescription-section-title">Diagnosis</h5>
                        <p className="diagnosis-text">{selectedPastAppointment.diagnosis}</p>
                      </div>

                      <div className="prescription-section">
                        <h5 className="prescription-section-title">💊 Prescription</h5>
                        <ul className="prescription-list">
                          {selectedPastAppointment.prescription.map((med, index) => (
                            <li key={index} className="prescription-item">{med}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="prescription-section">
                        <h5 className="prescription-section-title">📝 Instructions</h5>
                        <ul className="instructions-list">
                          {selectedPastAppointment.instructions.map((instruction, index) => (
                            <li key={index} className="instruction-item">{instruction}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {!selectedPastAppointment && (
                    <div className="prescription-placeholder">
                      <p>Select an appointment to view prescription and instructions</p>
                    </div>
                  )}
                </div>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}