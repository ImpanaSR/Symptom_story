const API_BASE_URL = 'http://localhost:8000';

// Helper to get token from localStorage
const getToken = () => localStorage.getItem('token');

// Helper to set auth header
const getHeaders = (includeAuth = false, isFormData = false) => {
  const headers = {};
  
  // Don't set Content-Type for FormData - browser will set it with boundary
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Auth API calls
export const authAPI = {
  signup: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        username: userData.email,  // Use email as username
        email: userData.email,
        password: userData.password,
        role: userData.role || 'patient'
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Signup failed');
    }
    
    return response.json();
  },

  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);  // Send email as username
    formData.append('password', password);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    
    return response.json();
  },

  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: getHeaders(true),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }
    
    return response.json();
  },
};

// Analysis API calls
export const analysisAPI = {
  // Analyze with audio file (Speech-to-Text)
  analyzeWithAudio: async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio_file', audioBlob, 'recording.wav');
    
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: getHeaders(true, true), // isFormData = true
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Analysis failed');
    }
    
    return response.json();
  },

  // Analyze with text (no audio)
  analyzeWithText: async (text) => {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Analysis failed');
    }
    
    return response.json();
  },

  getHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/api/history`, {
      method: 'GET',
      headers: getHeaders(true),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }
    
    return response.json();
  },
};
