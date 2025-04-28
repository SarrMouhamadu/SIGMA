import axios from 'axios';

const API_URL = 'http://localhost:5000/api/attendance';

// Check in
export const checkIn = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/check-in`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Erreur lors du pointage d\'entrée'
    };
  }
};

// Check out
export const checkOut = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/check-out`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Erreur lors du pointage de sortie'
    };
  }
};

// Get user attendance history
export const getUserAttendance = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/history`, { params });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Erreur lors de la récupération de l\'historique'
    };
  }
};

// Get company attendance (for managers/admins)
export const getCompanyAttendance = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/company`, { params });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Erreur lors de la récupération des données de l\'entreprise'
    };
  }
};

// Get attendance statistics (for managers/admins)
export const getStatistics = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/statistics`, { params });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Erreur lors de la récupération des statistiques'
    };
  }
};
