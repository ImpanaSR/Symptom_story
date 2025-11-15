// src/pages/DoctorHomePage.js
import React, { useState, useEffect } from 'react';
import { analysisAPI } from '../services/api';
import '../styles/DoctorHomePage.css';

export default function DoctorHomePage({ onLogout }) {
  // Audio recording state
const [audioBlob, setAudioBlob] = useState(null);
const [mediaRecorder, setMediaRecorder] = useState(null);
const [audioChunks, setAudioChunks] = useState([]);

  const [view, setView] = useState('list');
  const [activePatient, setActivePatient] = useState(null);

const [patients, setPatients] = useState([]);
const [loading, setLoading] = useState(true);

// Fetch real patients on component mount
useEffect(() => {
  fetchPatients();
}, []);

const fetchPatients = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/doctor/patients', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      // Transform to match UI format
      const formattedPatients = data.map((p, idx) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        slotDate: new Date().toISOString().split('T')[0],
        slotTime: `${9 + idx}:00 AM`,
        reason: 'General Consultation'
      }));
      setPatients(formattedPatients);
    }
    setLoading(false);
  } catch (error) {
    console.error('Failed to fetch patients:', error);
    setLoading(false);
  }
};


  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  // Analysis state - NOW INTEGRATED WITH API
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analysisError, setAnalysisError] = useState('');

  // Symptoms state
  const [detectedSymptoms, setDetectedSymptoms] = useState([]);
  const [riskLevel, setRiskLevel] = useState('');

  // Prescription state
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [prescriptionGenerated, setPrescriptionGenerated] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Revisit state
  const [revisitDate, setRevisitDate] = useState('');
  const [revisitTime, setRevisitTime] = useState('');
  const [scheduledRevisits, setScheduledRevisits] = useState([]);
  const [scheduleMessage, setScheduleMessage] = useState('');

  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

const handleStartRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Record as WebM/Opus, then convert to MP3-compatible format
    const options = { mimeType: 'audio/webm' };
    const recorder = new MediaRecorder(stream, options);
    
    let chunks = [];
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      setAudioBlob(blob);
      stream.getTracks().forEach(track => track.stop());
      await analyzeAudioWithBlob(blob);
    };
    
    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
    setRecordingDuration(0);
    setAnalysisComplete(false);
    setDetectedSymptoms([]);
    setRiskLevel('');
    setAnalysisError('');
    
  } catch (error) {
    setAnalysisError('Microphone access denied');
  }
};


const handleStopRecording = () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    setIsRecording(false);
  }
};

// New function that accepts blob as parameter
const analyzeAudioWithBlob = async (blob) => {
  setIsAnalyzing(true);
  setAnalysisError('');

  try {
    if (!blob) {
      throw new Error('No audio recorded');
    }

    console.log('Sending audio blob:', blob.size, 'bytes');

    // Call backend API with audio file
    const response = await analysisAPI.analyzeWithAudio(blob);

    // Store full analysis results
    setAnalysisResults(response);

    // Transform API response to match UI format
    if (response.extracted_symptoms && response.extracted_symptoms.length > 0) {
      const transformedSymptoms = response.extracted_symptoms.map((symptom, index) => ({
        id: index + 1,
        name: symptom,
        severity: Math.floor(Math.random() * 5) + 5
      }));
      setDetectedSymptoms(transformedSymptoms);
      
      // Calculate risk level
      const avgSeverity = transformedSymptoms.reduce((sum, s) => sum + s.severity, 0) / transformedSymptoms.length;
      let risk = 'Low';
      if (avgSeverity >= 7) risk = 'High';
      else if (avgSeverity >= 4) risk = 'Medium';
      setRiskLevel(risk);
    } else {
      const fallbackSymptoms = [
        { id: 1, name: 'Headache', severity: 7 },
        { id: 2, name: 'Fever', severity: 6 }
      ];
      setDetectedSymptoms(fallbackSymptoms);
      setRiskLevel('Medium');
    }

    // Auto-generate prescription suggestions
    // if (response.ml_predictions) {
    //   const suggestedMeds = extractMedicationsFromAnalysis(response.final_summary);
    //   if (suggestedMeds.length > 0) {
    //     setPrescriptionItems(suggestedMeds);
    //   }
    // }

    // ========== ADD THIS CODE HERE (BEFORE setAnalysisComplete) ==========
    // Auto-populate prescription from AI
    if (response.ai_prescription && response.ai_prescription.medications) {
      const aiMeds = response.ai_prescription.medications.map((med, idx) => ({
        id: Date.now() + idx,
        medicine: med.name,
        dosage: `${med.dosage} - ${med.duration} - ${med.instructions}`
      }));
      setPrescriptionItems(aiMeds);
      console.log('✅ Auto-populated', aiMeds.length, 'medications');
    }
    // ========== END NEW CODE ==========


    setAnalysisComplete(true);

  } catch (error) {
    console.error('Analysis failed:', error);
    setAnalysisError(error.message || 'Failed to analyze symptoms');
    
    // Fallback to mock data
    const fallbackSymptoms = [
      { id: 1, name: 'Fever', severity: 6 },
      { id: 2, name: 'Headache', severity: 7 },
      { id: 3, name: 'Fatigue', severity: 5 }
    ];
    setDetectedSymptoms(fallbackSymptoms);
    setRiskLevel('Medium');
    setAnalysisComplete(true);
  } finally {
    setIsAnalyzing(false);
  }
};



  // Helper function to extract medications from analysis summary
  const extractMedicationsFromAnalysis = (summary) => {
    const medications = [];
    
    if (summary && summary.toLowerCase().includes('paracetamol')) {
      medications.push({ id: 1, medicine: 'Paracetamol 500mg', dosage: '1 tablet twice daily after meals' });
    }
    if (summary && summary.toLowerCase().includes('aspirin')) {
      medications.push({ id: 2, medicine: 'Aspirin 75mg', dosage: '1 tablet once daily after breakfast' });
    }
    
    return medications;
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
    setAnalysisResults(null);
    setAnalysisError('');
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
            <span className="logout-icon"></span>
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

              {analysisError && (
                <div className="error-message" role="alert">
                  ⚠️ {analysisError}
                </div>
              )}
            </div>

            {analysisComplete && (
              <div className="session-card">
                <h3 className="card-title">Analysis Results</h3>
                
                {/* Show API Results */}
                {analysisResults && (
                  <div className="api-analysis-results">
                    <div className="analysis-item">
                      <strong>Transcription:</strong>
                      <p>{analysisResults.transcription}</p>
                    </div>
                    <div className="analysis-item">
                      <strong>Summary:</strong>
                      <p>{analysisResults.final_summary}</p>
                    </div>
                    {analysisResults.ml_predictions && (
                      <details style={{ marginTop: '10px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                          View ML Predictions
                        </summary>
                        <pre style={{ 
                          background: '#f5f5f5', 
                          padding: '10px', 
                          borderRadius: '5px',
                          fontSize: '12px',
                          overflow: 'auto',
                          marginTop: '10px'
                        }}>
                          {JSON.stringify(analysisResults.ml_predictions, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
                
                <div className="risk-badge-container">
                  <span className={`risk-badge risk-${riskLevel.toLowerCase()}`}>
                    Risk Level: {riskLevel}
                  </span>
                </div>

                <h4 className="subsection-title">Detected Symptoms</h4>
                <div className="symptoms-list">
                  {detectedSymptoms.map((symptom) => (
                    <div key={symptom.id} className="symptom-item">
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
                        {detectedSymptoms.map((symptom) => (
                          <li key={symptom.id}>
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

                  {analysisResults && (
                    <div className="prescription-section">
                      <h3>Clinical Analysis</h3>
                      <p>{analysisResults.final_summary}</p>
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
