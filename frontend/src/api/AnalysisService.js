import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const AnalysisService = {
  getPersonas: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/personas/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching personas:', error);
      return [];
    }
  },

  analyzeText: async (text, personaId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/analyze/`, {
        text,
        persona_id: personaId
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing text:', error);
      throw error;
    }
  }
};

export default AnalysisService;
