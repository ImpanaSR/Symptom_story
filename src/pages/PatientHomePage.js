// src/pages/PatientHomePage.js
import React, { useState, useEffect } from 'react';
import { analysisAPI } from '../services/api';
import '../styles/PatientHomePage.css';

/*
  PatientHomePage - API INTEGRATED VERSION
  - Two tabs: BOOK A SLOT (default) and ADVISORY
  - Book flow: select doctor via dropdown with search, pick date & time, click Book
  - Shows booked slots history on the right side in BOOK A SLOT tab
  - Advisory tab shows instructions and prescriptions from past appointments
  - NOW FETCHES DATA FROM BACKEND API
  - Accessibility: aria-pressed on interactive buttons
  - Logout functionality to return to login page
*/

export default function PatientHomePage({ onLogout }) {
  // Hardcoded sample doctors data (can be replaced with API call later)
  const doctors = [
    { id: 1, name: 'Dr. Priya Rao', specialization: 'Cardiology' },
    { id: 2, name: 'Dr. Amit Kumar', specialization: 'Neurology' },
    { id: 3, name: 'Dr. Sarah Johnson', specialization: 'Pediatrics' },
    { id: 4, name: 'Dr. Rajesh Sharma', specialization: 'Orthopedics' },
    { id: 5, name: 'Dr. Emily Chen', specialization: 'Dermatology' },
    { id: 6, name: 'Dr. Michael Brown', specialization: 'Psychiatry' }
  ];

  // State for past appointments - NOW FETCHED FROM API
  const [pastAppointments, setPastAppointments] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');

  // State for symptom analysis results
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

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

  // NEW: Add these 3 lines after your existing useState declarations
const [consultations, setConsultations] = useState([]);
const [latestConsultation, setLatestConsultation] = useState(null);
const [loadingConsultations, setLoadingConsultations] = useState(true);

// NEW: Fetch consultations on component mount
useEffect(() => {
  fetchConsultations();
}, []);

const fetchConsultations = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/patient/my-consultations', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      setConsultations(data);
      if (data.length > 0) {
        setLatestConsultation(data[0]); // Most recent
      }
    }
    setLoadingConsultations(false);
  } catch (error) {
    console.error('Failed to fetch consultations:', error);
    setLoadingConsultations(false);
  }
};



  // Fetch analysis history from API when component mounts
  useEffect(() => {
    fetchAnalysisHistory();
  }, []);

  // Function to fetch analysis history from backend
  const fetchAnalysisHistory = async () => {
    setLoadingHistory(true);
    setHistoryError('');
    
    try {
      const history = await analysisAPI.getHistory();
      
      // Transform API response to match UI format
      const transformedHistory = history.map((item, index) => ({
        id: item.id || index + 1,
        doctorName: 'AI Analysis', // Since backend doesn't have doctor info
        specialization: 'Automated Diagnosis',
        date: new Date(item.created_at || Date.now()).toISOString().split('T')[0],
        time: new Date(item.created_at || Date.now()).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        prescription: extractPrescriptions(item.llm_final_summary),
        instructions: extractInstructions(item.llm_final_summary),
        diagnosis: item.ml_results?.top_disease || 'Symptom Analysis',
        rawData: item // Store original data for reference
      }));
      
      setPastAppointments(transformedHistory);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setHistoryError('Failed to load analysis history');
      
      // Fallback to sample data if API fails
      setPastAppointments([
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
        }
      ]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Helper function to extract prescriptions from summary
  const extractPrescriptions = (summary) => {
    if (!summary) return ['Consult doctor for prescription'];
    
    // Simple extraction logic - can be enhanced
    const prescriptionMatch = summary.match(/medication[s]?:([^.]*)/i);
    if (prescriptionMatch) {
      return prescriptionMatch[1].split(',').map(p => p.trim());
    }
    
    return ['Refer to detailed analysis for medication recommendations'];
  };

  // Helper function to extract instructions from summary
  const extractInstructions = (summary) => {
    if (!summary) return ['Follow up with healthcare provider'];
    
    // Simple extraction logic - can be enhanced
    const lines = summary.split('.').filter(line => line.trim().length > 0);
    return lines.slice(0, 4).map(line => line.trim());
  };

  // Function to trigger symptom analysis
  const handleSymptomAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisError('');
    
    try {
      const response = await analysisAPI.analyze({
        // You can add audio_data here when implementing audio recording
      });
      
      setAnalysisResults(response);
      
      // Refresh history after new analysis
      await fetchAnalysisHistory();
      
      // Show success message
      setBookingMessage('Symptom analysis completed successfully!');
      setTimeout(() => setBookingMessage(''), 3000);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisError(error.message || 'Failed to analyze symptoms');
    } finally {
      setAnalyzing(false);
    }
  };

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
    setSearchTerm('');
    setIsDropdownOpen(false);
    setBookingMessage('');
    setBookingError('');
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
  };

  // Handle dropdown toggle
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle booking button click
  const handleBook = () => {
    setBookingMessage('');
    setBookingError('');

    if (!selectedDoctorId) {
      setBookingError('Please select a doctor before booking.');
      return;
    }

    if (!appointmentDate || !appointmentTime) {
      setBookingError('Please select both date and time.');
      return;
    }

    const newBooking = {
      id: Date.now(),
      doctorId: selectedDoctorId,
      doctorName: selectedDoctor.name,
      specialization: selectedDoctor.specialization,
      date: appointmentDate,
      time: appointmentTime,
      bookedAt: new Date().toLocaleString()
    };

    setBookedSlots([newBooking, ...bookedSlots]);
    setBookingMessage(`Booked with ${selectedDoctor.name} on ${appointmentDate} at ${appointmentTime}`);
    
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
              {/* NEW: Add this follow-up alert block */}
              {latestConsultation?.followup_date && (
                <div className="followup-alert">
                  <h3>📅 You have a Follow-up Appointment!</h3>
                  <div className="followup-details">
                    <p><strong>Date:</strong> {latestConsultation.followup_date}</p>
                    <p><strong>Time:</strong> {latestConsultation.followup_time}</p>
                    <p><strong>Doctor:</strong> {latestConsultation.doctor_name}</p>
                    <p><strong>For:</strong> {latestConsultation.diagnosis}</p>
                  </div>
                  <p className="followup-note">
                    ⚠️ Please arrive 15 minutes early. Bring your previous prescription.
                  </p>
                </div>
              )}
              <h2 id="book-title" className="section-title">Choose a doctor</h2>

              {/* Doctor dropdown with search */}
              <div className="doctor-dropdown-container">
                <label htmlFor="doctor-search" className="dropdown-label">
                  Search or select a doctor
                </label>
                
                <div className="dropdown-wrapper">
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

              {/* NEW: Symptom Analysis Button */}
              <div className="book-actions" style={{ marginTop: '20px' }}>
                <button 
                  className="book-button" 
                  onClick={handleSymptomAnalysis}
                  disabled={analyzing}
                  style={{ 
                    backgroundColor: analyzing ? '#ccc' : '#28a745',
                    cursor: analyzing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {analyzing ? 'Analyzing Symptoms...' : '🔬 Analyze Symptoms (AI)'}
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
              {analysisError && (
                <div className="message message-error" role="alert">
                  {analysisError}
                </div>
              )}

              {/* Selected doctor display */}
              <div className="selected-info">
                Selected: {selectedDoctor ? selectedDoctor.name : 'No doctor selected'}
              </div>

              {/* Display latest analysis results */}
              {analysisResults && (
                <div className="message message-success" style={{ marginTop: '20px', textAlign: 'left' }}>
                  <h4>Latest Analysis Results:</h4>
                  <p><strong>Symptoms:</strong> {analysisResults.extracted_symptoms?.join(', ')}</p>
                  <p><strong>Summary:</strong> {analysisResults.final_summary}</p>
                </div>
              )}
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
              
              <div className="advisory-instructions">
  <h3>📋 General Instructions</h3>
  <ul className="instructions-list">
    <li>Bring your ID proof and insurance card</li>
    <li>Arrive 15 minutes before your appointment time</li>
    <li>Carry all previous medical reports</li>
    <li>List current medications you are taking</li>
    <li>Wear comfortable clothing for examination</li>
  </ul>

  {/* NEW: Real Prescription Section */}
  {loadingConsultations ? (
    <p>Loading your prescription...</p>
  ) : latestConsultation ? (
    <div className="prescription-section">
      <h3>📥 Your Latest Prescription</h3>
      
      <div className="prescription-card">
        <div className="prescription-header">
          <div>
            <h4>{latestConsultation.doctor_name}</h4>
            <p className="prescription-date">
              {new Date(latestConsultation.consultation_date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          <button className="btn-download" onClick={() => window.print()}>
            📥 Download PDF
          </button>
        </div>

        <div className="prescription-body">
          <div className="prescription-detail">
            <h5>🔍 Diagnosis</h5>
            <p className="diagnosis-text">{latestConsultation.diagnosis}</p>
            <p className="confidence-text">Confidence: {latestConsultation.diagnosis_confidence}</p>
          </div>

          <div className="prescription-detail">
            <h5>🩺 Symptoms</h5>
            <div className="symptoms-tags">
              {latestConsultation.symptoms.map((symptom, idx) => (
                <span key={idx} className="symptom-tag-item">{symptom}</span>
              ))}
            </div>
          </div>

          {latestConsultation.medications && latestConsultation.medications.length > 0 && (
            <div className="prescription-detail">
              <h5>💊 Medications</h5>
              <table className="medications-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Duration</th>
                    <th>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {latestConsultation.medications.map((med, idx) => (
                    <tr key={idx}>
                      <td><strong>{med.name}</strong></td>
                      <td>{med.dosage}</td>
                      <td>{med.duration}</td>
                      <td>{med.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="ai-disclaimer-text">
                ⚠️ AI-generated prescription for educational review.
              </p>
            </div>
          )}

          {latestConsultation.precautions && latestConsultation.precautions.length > 0 && (
            <div className="prescription-detail">
              <h5>⚠️ Precautions</h5>
              <ul className="precautions-list-items">
                {latestConsultation.precautions.map((precaution, idx) => (
                  <li key={idx}>{precaution}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="prescription-detail">
            <h5>📝 Summary</h5>
            <p className="summary-text">{latestConsultation.summary}</p>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="no-prescription-message">
      <p>No consultations yet. Your prescription will appear here after your first visit.</p>
    </div>
  )}
</div>

            </section>

            {/* Right side - Past appointments with prescriptions FROM API */}
            <aside className="prescriptions-panel" aria-labelledby="prescriptions-title">
              <h3 id="prescriptions-title" className="prescriptions-title">
                Past Appointments & Prescriptions
                {loadingHistory && <span style={{ fontSize: '12px', marginLeft: '10px' }}>Loading...</span>}
              </h3>

              {historyError && (
                <div className="message message-error" style={{ margin: '10px' }}>
                  {historyError}
                </div>
              )}

              {pastAppointments.length === 0 && !loadingHistory ? (
                <div className="no-prescriptions">
                  <p>No past appointments found.</p>
                  <p className="no-bookings-hint">Complete a symptom analysis to see your history.</p>
                </div>
              ) : (
                <div className="prescriptions-container">
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

                      {/* Show raw ML results if available */}
                      {selectedPastAppointment.rawData && (
                        <div className="prescription-section">
                          <h5 className="prescription-section-title">🔬 ML Analysis</h5>
                          <pre style={{ 
                            background: '#f5f5f5', 
                            padding: '10px', 
                            borderRadius: '5px',
                            fontSize: '12px',
                            overflow: 'auto'
                          }}>
                            {JSON.stringify(selectedPastAppointment.rawData.ml_results, null, 2)}
                          </pre>
                        </div>
                      )}
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
