export interface AudioMessage {
  id: string;
  url: string;
  duration: number; // Duration in seconds
  waveform: number[]; // Audio visualization data
  transcription?: string; // AI-generated transcription
  createdAt: Date;
  updatedAt: Date;
}

export interface AudioRecording {
  blob: Blob;
  url: string;
  duration: number;
  waveform: number[];
}

export type PlaybackSpeed = 0.5 | 1 | 1.5 | 2;

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: PlaybackSpeed;
}

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  waveform: number[];
}

export interface AudioVisualizerData {
  waveform: number[]; // Array of amplitudes (0-100)
  duration: number;
  samplesPerSecond?: number; // How many samples to store per second of audio
}

export interface CreateAudioMessageInput {
  audioBlob: Blob;
  duration: number;
  waveform: number[];
  chatId?: string; // Optional - for chat messages
  commentId?: string; // Optional - for comments
  postId?: string; // Optional - for post comments
  reelId?: string; // Optional - for reel comments
  storyId?: string; // Optional - for story responses
}

export interface AudioTranscriptResult {
  text: string;
  confidence: number;
  languageCode?: string;
}

export interface AudioMessageWithSender extends AudioMessage {
  sender: {
    id: string;
    name: string | null;
    image: string | null;
    username: string | null;
  };
}

export enum AudioProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}