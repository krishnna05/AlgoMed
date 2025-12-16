import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- API Functions ---

// 1. Auth Services
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  let endpoint = '/auth/register-patient'; 
  
  if (userData.role === 'doctor') {
    endpoint = '/auth/register-doctor';
  }

  const response = await api.post(endpoint, userData);
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

// 2. Doctor Services
export const getAllDoctors = async (query = '') => {
  const response = await api.get(`/doctors?query=${query}`);
  return response.data;
};

export const getDoctorById = async (id) => {
  const response = await api.get(`/doctors/${id}`);
  return response.data;
};

export const getDoctorProfileMe = async () => {
  const response = await api.get('/doctors/profile/me');
  return response.data;
};

export const updateDoctorProfile = async (profileData) => {
  const response = await api.put('/doctors/profile', profileData);
  return response.data;
};

// 3. Appointment Services
export const bookAppointment = async (appointmentData) => {
  const response = await api.post('/appointments', appointmentData);
  return response.data;
};

export const getMyAppointments = async () => {
  const response = await api.get('/appointments/my-appointments');
  return response.data;
};

export const updateAppointmentStatus = async (id, data) => {
  const response = await api.put(`/appointments/${id}`, data);
  return response.data;
};

export const completeConsultation = async (id, data) => {
  const response = await api.put(`/appointments/${id}/consultation`, data);
  return response.data;
};

// 4. Chat/AI Services
export const sendChatMessage = async (message, threadId = null) => {
  const response = await api.post('/chat', { message, threadId });
  return response.data;
};

export const getUserThreads = async () => {
  const response = await api.get('/chat/thread');
  return response.data;
};

export const getThreadMessages = async (threadId) => {
  const response = await api.get(`/chat/thread/${threadId}`);
  return response.data;
};

export const deleteThread = async (threadId) => {
  const response = await api.delete(`/chat/thread/${threadId}`);
  return response.data;
};

// 5. Patient Profile Services
export const getPatientProfile = async () => {
  const response = await api.get('/patients/profile/me');
  return response.data;
};

export const updatePatientProfile = async (profileData) => {
  const response = await api.put('/patients/profile', profileData);
  return response.data;
};

export const getPatientSummary = async (patientId) => {
  const response = await api.get(`/patients/${patientId}/summary`);
  return response.data;
};

export const getPatientVitalsHistory = async (patientId) => {
  const response = await api.get(`/patients/${patientId}/vitals`);
  return response.data;
};

// 6. Clinical AI & Analytics
export const generateSOAPNotes = async (text, context) => {
  const response = await api.post('/ai/generate-soap', { text, ...context });
  return response.data;
};

export const getDoctorAnalytics = async () => {
  const response = await api.get('/analytics/doctor');
  return response.data;
};

export default api;