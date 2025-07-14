import api from './api';

export const noteService = {
  // Get all notes with pagination and search
  getNotes: async (params = {}) => {
    const response = await api.get('/api/notes', { params });
    return response.data;
  },

  // Get note by ID
  getNoteById: async (id) => {
    const response = await api.get(`/api/notes/${id}`);
    return response.data;
  },

  // Create new note
  createNote: async (noteData) => {
    const response = await api.post('/api/notes', noteData);
    return response.data;
  },

  // Update note
  updateNote: async (id, noteData) => {
    const response = await api.put(`/api/notes/${id}`, noteData);
    return response.data;
  },

  // Delete note
  deleteNote: async (id) => {
    const response = await api.delete(`/api/notes/${id}`);
    return response.data;
  },

  // Search notes
  searchNotes: async (searchParams) => {
    const response = await api.get('/api/notes', { params: searchParams });
    return response.data;
  }
};

export const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/api/user/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/api/user/profile', profileData);
    return response.data;
  }
};

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  // Register
  register: async (email, password) => {
    const response = await api.post('/api/auth/register', { email, password });
    return response.data;
  }
};

export default {
  noteService,
  userService,
  authService
};
