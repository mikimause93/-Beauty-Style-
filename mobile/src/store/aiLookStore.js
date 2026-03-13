import { create } from 'zustand';

// ─── API Base URLs ────────────────────────────────────────────────────────────
const AI_SERVICE_URL = process.env.EXPO_PUBLIC_AI_SERVICE_URL || 'http://localhost:4005';
const BOOKING_SERVICE_URL = process.env.EXPO_PUBLIC_BOOKING_SERVICE_URL || 'http://localhost:4002';

// ─── AI Look Store ────────────────────────────────────────────────────────────
export const useAiLookStore = create((set, get) => ({
  uploadId: null,
  jobId: null,
  jobStatus: null,
  resultUrls: [],
  selectedPreset: 'natural',
  isUploading: false,
  isGenerating: false,
  error: null,
  savedLooks: [],

  setSelectedPreset: (preset) => set({ selectedPreset: preset }),

  uploadPhoto: async (photoUri) => {
    set({ isUploading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('photo', {
        uri: photoUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });
      formData.append('consentAccepted', 'true');

      const response = await fetch(`${AI_SERVICE_URL}/api/ai-look/upload`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');

      set({ uploadId: data.uploadId, isUploading: false });
      return data.uploadId;
    } catch (err) {
      set({ error: err.message, isUploading: false });
      throw err;
    }
  },

  generateLook: async (userId) => {
    const { uploadId, selectedPreset } = get();
    if (!uploadId) throw new Error('No photo uploaded');

    set({ isGenerating: true, error: null, jobStatus: 'queued', resultUrls: [] });
    try {
      const response = await fetch(`${AI_SERVICE_URL}/api/ai-look/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId, preset: selectedPreset, userId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Generation failed');

      set({ jobId: data.jobId, jobStatus: 'queued' });
      return data.jobId;
    } catch (err) {
      set({ error: err.message, isGenerating: false });
      throw err;
    }
  },

  pollStatus: async () => {
    const { jobId } = get();
    if (!jobId) return;

    try {
      const response = await fetch(`${AI_SERVICE_URL}/api/ai-look/status/${jobId}`);
      const data = await response.json();

      set({ jobStatus: data.state });

      if (data.state === 'completed' && data.result?.resultUrls) {
        set({
          resultUrls: data.result.resultUrls,
          isGenerating: false,
        });
      } else if (data.state === 'failed') {
        set({ isGenerating: false, error: data.failedReason || 'Generation failed' });
      }

      return data.state;
    } catch (err) {
      console.warn('Status poll failed:', err.message);
    }
  },

  saveLook: async (jobId, userId, resultUrl, preset) => {
    const response = await fetch(`${AI_SERVICE_URL}/api/ai-look/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, userId, resultUrl, preset }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Save failed');

    set((state) => ({ savedLooks: [...state.savedLooks, data] }));
    return data;
  },

  reset: () =>
    set({ uploadId: null, jobId: null, jobStatus: null, resultUrls: [], isUploading: false, isGenerating: false, error: null }),
}));

// ─── Music Player Store ───────────────────────────────────────────────────────
export const useMusicStore = create((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  playlist: [],
  searchQuery: '',
  searchResults: [],

  setPlaylist: (playlist) => set({ playlist }),

  playTrack: async (track) => {
    set({ currentTrack: track, isPlaying: true });
    // Actual audio playback handled in MusicPlayer component via expo-av
  },

  pauseTrack: () => set({ isPlaying: false }),
  resumeTrack: () => set({ isPlaying: true }),

  nextTrack: () => {
    const { playlist, currentTrack } = get();
    if (!playlist.length) return;
    const idx = playlist.findIndex((t) => t.id === currentTrack?.id);
    const next = playlist[(idx + 1) % playlist.length];
    set({ currentTrack: next, isPlaying: true });
  },

  prevTrack: () => {
    const { playlist, currentTrack } = get();
    if (!playlist.length) return;
    const idx = playlist.findIndex((t) => t.id === currentTrack?.id);
    const prev = playlist[(idx - 1 + playlist.length) % playlist.length];
    set({ currentTrack: prev, isPlaying: true });
  },

  searchTracks: async (query) => {
    set({ searchQuery: query });
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    // Search against royalty-free library catalog
    // In production, this would query a music catalog API (e.g., Free Music Archive)
    const mockResults = ROYALTY_FREE_CATALOG.filter(
      (t) =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.artist.toLowerCase().includes(query.toLowerCase()) ||
        t.genre.toLowerCase().includes(query.toLowerCase())
    );
    set({ searchResults: mockResults });
  },
}));

// Mock royalty-free music catalog
const ROYALTY_FREE_CATALOG = [
  { id: 'rf-1', title: 'Peaceful Beauty', artist: 'Ambient Studio', genre: 'Ambient', duration: 183, url: 'https://cdn.beautyapp.com/music/peaceful-beauty.mp3', coverUrl: 'https://cdn.beautyapp.com/music/covers/peaceful-beauty.jpg' },
  { id: 'rf-2', title: 'Glamour Hour', artist: 'Fashion Beats', genre: 'Pop', duration: 214, url: 'https://cdn.beautyapp.com/music/glamour-hour.mp3', coverUrl: 'https://cdn.beautyapp.com/music/covers/glamour-hour.jpg' },
  { id: 'rf-3', title: 'Morning Ritual', artist: 'Chill Collective', genre: 'Lo-Fi', duration: 196, url: 'https://cdn.beautyapp.com/music/morning-ritual.mp3', coverUrl: 'https://cdn.beautyapp.com/music/covers/morning-ritual.jpg' },
  { id: 'rf-4', title: 'Style Icons', artist: 'Urban Groove', genre: 'R&B', duration: 228, url: 'https://cdn.beautyapp.com/music/style-icons.mp3', coverUrl: 'https://cdn.beautyapp.com/music/covers/style-icons.jpg' },
  { id: 'rf-5', title: 'Glow Up', artist: 'Electric Dreams', genre: 'Electronic', duration: 241, url: 'https://cdn.beautyapp.com/music/glow-up.mp3', coverUrl: 'https://cdn.beautyapp.com/music/covers/glow-up.jpg' },
];

export { ROYALTY_FREE_CATALOG };
