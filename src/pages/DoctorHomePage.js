// src/pages/DoctorHomePage.js
import React, { useState, useEffect } from 'react';
import '../styles/DoctorHomePage.css';

export default function DoctorHomePage({ onLogout }) {
  const [view, setView] = useState('list');
  const [activePatient, setActivePatient] = useState(null);

  const patients = [
    { id: 1, name: 'Rajesh Kumar', slotDate: '2024-11-15', slotTime: '09:00 AM', reason: 'Fever and headache' },
    { id: 2, name: 'Priya Sharma', slotDate: '2024-11-15', slotTime: '10:00 AM', reason: 'Chest pain' },
    { id: 3, name: 'Amit Patel', slotDate: '2024-11-15', slotTime: '11:00 AM', reason: 'Diabetes checkup' },
    { id: 4, name: 'Sneha Reddy', slotDate: '2024-11-15', slotTime: '02:00 PM', reason: 'Persistent cough' },
    { id: 5, name: 'Vikram Singh', slotDate: '2024-11-15', slotTime: '03:30 PM', reason: 'Back pain' }
  ];

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const [detectedSymptoms, setDetectedSymptoms] = useState([]);
  const [riskLevel, setRiskLevel] = useState('');

  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [prescriptionGenerated, setPrescriptionGenerated] = useState(false);
  const [validationError, setValidationError] = useState('');

  const [revisitDate, setRevisitDate] = useState('');
  const [revisitTime, setRevisitTime] = useState('');
  const [scheduledRevisits, setScheduledRevisits] = useState([]);
  const [scheduleMessage, setScheduleMessage] = useState('');

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    setAnalysisComplete(false);
    setDetectedSymptoms([]);
    setRiskLevel('');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsAnalyzing(true);

    setTimeout(() => {
      const symptomPool = [
        'Fever', 'Headache', 'Cough', 'Fatigue', 'Chest pain', 
        'Shortness of breath', 'Dizziness', 'Nausea', 'Body ache'
      ];
      
      const numSymptoms = Math.floor(Math.random() * 3) + 2;
      const symptoms = [];
      const usedSymptoms = new Set();
      
      for (let i = 0; i < numSymptoms; i++) {
        let symptom;
        do {
          symptom = symptomPool[Math.floor(Math.random() * symptomPool.length)];
        } while (usedSymptoms.has(symptom));
        usedSymptoms.add(symptom);
        
        symptoms.push({
          name: symptom,
          severity: Math.floor(Math.random() * 6) + 3
        });
      }
      
      setDetectedSymptoms(symptoms);
      
      const avgSeverity = symptoms.reduce((sum, s) => sum + s.severity, 0) / symptoms.length;
      let risk = 'Low';
      if (avgSeverity >= 7) risk = 'High';
      else if (avgSeverity >= 4) risk = 'Medium';
      setRiskLevel(risk);
      
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 2000);
  };

  const handleAddMedicine = () => {
    setValidationError('');
    
    if (!medicineName.trim()) {
      setValidationError('Medicine name is required');
      return;
    }
    
    const newItem = {
      id: Date.now(),
      medicine: medicineName.trim(),
      dosage: dosage.trim() || 'As prescribed'
    };
    
    setPrescriptionItems([...prescriptionItems, newItem]);
    setMedicineName('');
    setDosage('');
    setPrescriptionGenerated(false);
  };

  const handleRemoveMedicine = (id) => {
    setPrescriptionItems(prescriptionItems.filter(item => item.id !== id));
    setPrescriptionGenerated(false);
  };

  const handleGeneratePrescription = () => {
    if (prescriptionItems.length === 0) {
      setValidationError('Add at least one medicine to generate prescription');
      return;
    }
    setPrescriptionGenerated(true);
    setValidationError('');
  };

  const handleScheduleRevisit = () => {
    setScheduleMessage('');
    
    if (!revisitDate || !revisitTime) {
      setScheduleMessage('Please select both date and time');
      return;
    }
    
    const scheduledItem = {
      id: Date.now(),
      date: revisitDate,
      time: revisitTime
    };
    
    setScheduledRevisits([...scheduledRevisits, scheduledItem]);
    
    const formattedDate = new Date(revisitDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    setScheduleMessage(`✓ Re-visit scheduled on ${formattedDate} at ${revisitTime}`);
    setRevisitDate('');
    setRevisitTime('');
    
    setTimeout(() => setScheduleMessage(''), 5000);
  };

  const handleStartSession = (patient) => {
    setActivePatient(patient);
    setView('session');
    setIsRecording(false);
    setRecordingDuration(0);
    setAnalysisComplete(false);
    setDetectedSymptoms([]);
    setRiskLevel('');
    setPrescriptionItems([]);
    setPrescriptionGenerated(false);
    setScheduledRevisits([]);
    setValidationError('');
    setScheduleMessage('');
  };

  const handleBackToList = () => {
    setView('list');
    setActivePatient(null);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      if (onLogout) onLogout();
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="doctor-home-page">
      <header className="dhp-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="header-title">Doctor Portal</h1>
            <p className="header-subtitle">Manage appointments and patient consultations</p>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </header>

      <main className="dhp-main">
        {view === 'list' && (
          <section className="patients-view">
            <h2 className="view-title">Today's Patients</h2>
            <div className="table-wrapper">
              <table className="patients-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Slot</th>
                    <th>Reason for Visit</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(patient => (
                    <tr key={patient.id}>
                      <td data-label="Patient Name">{patient.name}</td>
                      <td data-label="Slot">
                        {patient.slotDate} at {patient.slotTime}
                      </td>
                      <td data-label="Reason">{patient.reason}</td>
                      <td data-label="Action">
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleStartSession(patient)}
                        >
                          Start Session
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {view === 'session' && activePatient && (
          <section className="session-view">
            <div className="session-header">
              <div className="session-info">
                <h2 className="session-title">Session: {activePatient.name}</h2>
                <p className="session-meta">
                  {activePatient.slotDate} at {activePatient.slotTime} | {activePatient.reason}
                </p>
              </div>
              <button className="btn btn-secondary" onClick={handleBackToList}>
                ← Back to Patients
              </button>
            </div>

            <div className="session-card">
              <h3 className="card-title">Audio Recording</h3>
              <div className="recorder-controls">
                {!isRecording && !isAnalyzing && !analysisComplete && (
                  <button 
                    className="btn btn-record"
                    onClick={handleStartRecording}
                  >
                    🎙️ Start Recording
                  </button>
                )}
                
                {isRecording && (
                  <>
                    <div className="recording-indicator">
                      <span className="recording-dot"></span>
                      Recording: {formatDuration(recordingDuration)}
                    </div>
                    <button 
                      className="btn btn-stop"
                      onClick={handleStopRecording}
                    >
                      ⏹️ Stop Recording
                    </button>
                  </>
                )}
                
                {isAnalyzing && (
                  <div className="analyzing-indicator" role="status" aria-live="polite">
                    <div className="spinner"></div>
                    <span>Analyzing audio...</span>
                  </div>
                )}

                {analysisComplete && !isRecording && !isAnalyzing && (
                  <button 
                    className="btn btn-record"
                    onClick={handleStartRecording}
                  >
                    🎙️ Record Again
                  </button>
                )}
              </div>
            </div>

            {analysisComplete && (
              <div className="session-card">
                <h3 className="card-title">Analysis Results</h3>
                
                <div className="risk-badge-container">
                  <span className={`risk-badge risk-${riskLevel.toLowerCase()}`}>
                    Risk Level: {riskLevel}
                  </span>
                </div>

                <h4 className="subsection-title">Detected Symptoms</h4>
                <div className="symptoms-list">
                  {detectedSymptoms.map((symptom, index) => (
                    <div key={index} className="symptom-item">
                      <div className="symptom-header">
                        <span className="symptom-name">{symptom.name}</span>
                        <span className="symptom-severity-value">{symptom.severity}/10</span>
                      </div>
                      <div className="severity-bar">
                        <div 
                          className="severity-bar-fill"
                          style={{ 
                            width: `${(symptom.severity / 10) * 100}%`,
                            backgroundColor: symptom.severity >= 7 ? '#ef4444' : symptom.severity >= 4 ? '#f59e0b' : '#22c55e'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="session-card">
              <h3 className="card-title">Add Prescription</h3>
              
              <div className="prescription-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="medicine-name">Medicine Name *</label>
                    <input
                      id="medicine-name"
                      type="text"
                      className="form-input"
                      placeholder="e.g., Paracetamol"
                      value={medicineName}
                      onChange={(e) => setMedicineName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddMedicine();
                        }
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dosage">Dosage</label>
                    <input
                      id="dosage"
                      type="text"
                      className="form-input"
                      placeholder="e.g., 500mg twice daily"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddMedicine();
                        }
                      }}
                    />
                  </div>
                  <button 
                    className="btn btn-add"
                    onClick={handleAddMedicine}
                  >
                    Add
                  </button>
                </div>
                
                {validationError && (
                  <div className="error-message" role="alert">
                    {validationError}
                  </div>
                )}
              </div>

              {prescriptionItems.length > 0 && (
                <>
                  <h4 className="subsection-title">Prescription Items</h4>
                  <div className="table-wrapper">
                    <table className="prescription-table">
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th>Dosage</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescriptionItems.map(item => (
                          <tr key={item.id}>
                            <td data-label="Medicine">{item.medicine}</td>
                            <td data-label="Dosage">{item.dosage}</td>
                            <td data-label="Action">
                              <button 
                                className="btn btn-remove"
                                onClick={() => handleRemoveMedicine(item.id)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <button 
                    className="btn btn-primary btn-large"
                    onClick={handleGeneratePrescription}
                    style={{ marginTop: '1.5rem' }}
                  >
                    📄 Generate Prescription
                  </button>
                </>
              )}
            </div>

            {prescriptionGenerated && (
              <div className="prescription-document">
                <div className="prescription-header-doc">
                  <h2>Medical Prescription</h2>
                  <div className="clinic-info">
                    <p className="clinic-name">City Health Clinic</p>
                    <p className="doctor-name">Dr. Rajesh Verma, MBBS, MD</p>
                    <p className="clinic-address">123 Medical Street, Bangalore - 560001</p>
                  </div>
                </div>

                <div className="prescription-body">
                  <div className="patient-details">
                    <p><strong>Patient Name:</strong> {activePatient.name}</p>
                    <p><strong>Date:</strong> {activePatient.slotDate}</p>
                    <p><strong>Time:</strong> {activePatient.slotTime}</p>
                  </div>

                  <div className="prescription-section">
                    <h3>Chief Complaint</h3>
                    <p>{activePatient.reason}</p>
                  </div>

                  {analysisComplete && detectedSymptoms.length > 0 && (
                    <div className="prescription-section">
                      <h3>Symptoms Summary</h3>
                      <ul className="symptoms-summary">
                        {detectedSymptoms.map((symptom, index) => (
                          <li key={index}>
                            {symptom.name} (Severity: {symptom.severity}/10)
                          </li>
                        ))}
                      </ul>
                      <p className="risk-summary">
                        <strong>Overall Risk Level:</strong>{' '}
                        <span className={`risk-text-${riskLevel.toLowerCase()}`}>
                          {riskLevel}
                        </span>
                      </p>
                    </div>
                  )}

                  <div className="prescription-section">
                    <h3>Rx</h3>
                    <table className="prescription-medicines-table">
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th>Dosage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescriptionItems.map(item => (
                          <tr key={item.id}>
                            <td>{item.medicine}</td>
                            <td>{item.dosage}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="signature-section">
                    <div className="signature-box">
                      <div className="signature-text">Dr. Rajesh Verma</div>
                      <div className="signature-line"></div>
                      <p className="signature-label">Doctor's Signature</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="session-card">
              <h3 className="card-title">Schedule Re-visit</h3>
              
              <div className="revisit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="revisit-date">Date</label>
                    <input
                      id="revisit-date"
                      type="date"
                      className="form-input"
                      value={revisitDate}
                      onChange={(e) => setRevisitDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="revisit-time">Time</label>
                    <input
                      id="revisit-time"
                      type="time"
                      className="form-input"
                      value={revisitTime}
                      onChange={(e) => setRevisitTime(e.target.value)}
                    />
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={handleScheduleRevisit}
                  >
                    Schedule
                  </button>
                </div>
                
                {scheduleMessage && (
                  <div className={scheduleMessage.includes('select') ? 'error-message' : 'success-message'} 
                       role="status" 
                       aria-live="polite">
                    {scheduleMessage}
                  </div>
                )}
              </div>

              {scheduledRevisits.length > 0 && (
                <>
                  <h4 className="subsection-title">Scheduled Re-visits</h4>
                  <ul className="revisits-list">
                    {scheduledRevisits.map(item => (
                      <li key={item.id} className="revisit-item">
                        📅 {new Date(item.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })} at {item.time}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}