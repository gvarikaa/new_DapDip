/**
 * Creates a new audio context
 * Abstracts browser-specific implementations
 */
export function createAudioContext(): AudioContext {
  if (typeof window === 'undefined') {
    throw new Error('Audio context cannot be created on the server');
  }
  
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  return new AudioContext();
}

/**
 * Converts an audio blob to waveform data
 * @param blob Audio blob to process
 * @param samplesCount Number of samples to include in the waveform (default: 100)
 * @returns Promise resolving to array of values between 0 and 100
 */
export async function blobToWaveform(blob: Blob, samplesCount = 100): Promise<number[]> {
  return new Promise((resolve, reject) => {
    try {
      const audioContext = createAudioContext();
      const fileReader = new FileReader();
      
      fileReader.onloadend = () => {
        const arrayBuffer = fileReader.result as ArrayBuffer;
        
        audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
          // Get the raw audio data from the left channel
          const rawData = audioBuffer.getChannelData(0);
          const blockSize = Math.floor(rawData.length / samplesCount);
          const waveform: number[] = [];
          
          // Calculate average amplitude for each block
          for (let i = 0; i < samplesCount; i++) {
            const blockStart = blockSize * i;
            let sum = 0;
            
            for (let j = 0; j < blockSize; j++) {
              sum += Math.abs(rawData[blockStart + j] || 0);
            }
            
            // Normalize to 0-100 scale and push to waveform
            const average = sum / blockSize;
            const normalized = Math.min(100, Math.max(0, average * 400)); // Scale up for better visibility
            waveform.push(normalized);
          }
          
          resolve(waveform);
        }, reject);
      };
      
      fileReader.onerror = () => {
        reject(new Error('Failed to read audio file'));
      };
      
      fileReader.readAsArrayBuffer(blob);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Compresses an audio blob to reduce file size
 * @param blob Audio blob to compress
 * @param targetSampleRate Target sample rate (default: 22050)
 * @param targetBitDepth Target bit depth (default: 16)
 * @returns Promise resolving to compressed audio blob
 */
export async function compressAudioBlob(
  blob: Blob,
  targetSampleRate = 22050,
  targetBitDepth = 16
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const audioContext = createAudioContext();
      const fileReader = new FileReader();
      
      fileReader.onloadend = () => {
        const arrayBuffer = fileReader.result as ArrayBuffer;
        
        audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
          // Create offline context with target sample rate
          const offlineContext = new OfflineAudioContext(
            audioBuffer.numberOfChannels,
            audioBuffer.duration * targetSampleRate,
            targetSampleRate
          );
          
          // Create source node
          const source = offlineContext.createBufferSource();
          source.buffer = audioBuffer;
          
          // Apply simple lowpass filter to reduce artifacts
          const filter = offlineContext.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = targetSampleRate / 2;
          
          // Apply noise reduction (basic implementation)
          const noiseGate = offlineContext.createGain();
          noiseGate.gain.value = 1.0;
          
          // Connect nodes
          source.connect(filter);
          filter.connect(noiseGate);
          noiseGate.connect(offlineContext.destination);
          
          // Start source and render
          source.start(0);
          offlineContext.startRendering().then((renderedBuffer) => {
            // Convert to WAV format
            const wavBlob = bufferToWav(renderedBuffer, targetBitDepth);
            resolve(wavBlob);
          }).catch(reject);
        }, reject);
      };
      
      fileReader.onerror = () => {
        reject(new Error('Failed to read audio file'));
      };
      
      fileReader.readAsArrayBuffer(blob);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Converts an AudioBuffer to a WAV blob
 * @param buffer AudioBuffer to convert
 * @param bitDepth Bit depth (8, 16, or 24)
 * @returns WAV blob
 */
function bufferToWav(buffer: AudioBuffer, bitDepth: number): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = bitDepth === 8 ? 1 : 3; // PCM format (1 for 8-bit, 3 for floating point)
  const bytesPerSample = bitDepth / 8;
  
  // Extract raw audio data
  const channelData = [];
  for (let i = 0; i < numChannels; i++) {
    channelData.push(buffer.getChannelData(i));
  }
  
  // Calculate sizes
  const dataLength = channelData[0].length * numChannels * bytesPerSample;
  const buffer1 = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer1);
  
  // Write WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);
  
  // Write audio data
  const offset = 44;
  if (bitDepth === 8) {
    writeAudio8bit(view, offset, channelData);
  } else if (bitDepth === 16) {
    writeAudio16bit(view, offset, channelData);
  } else {
    writeAudio24bit(view, offset, channelData);
  }
  
  return new Blob([view], { type: 'audio/wav' });
}

/**
 * Helper function to write a string to a DataView
 */
function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Write 8-bit audio data
 */
function writeAudio8bit(view: DataView, offset: number, channelData: Float32Array[]): void {
  const numChannels = channelData.length;
  const length = channelData[0].length;
  
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
      const value = (sample * 0.5 + 0.5) * 255; // Convert to 0-255 range
      view.setUint8(offset++, value);
    }
  }
}

/**
 * Write 16-bit audio data
 */
function writeAudio16bit(view: DataView, offset: number, channelData: Float32Array[]): void {
  const numChannels = channelData.length;
  const length = channelData[0].length;
  
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
      const value = sample < 0 ? sample * 32768 : sample * 32767; // Convert to -32768-32767 range
      view.setInt16(offset, value, true);
      offset += 2;
    }
  }
}

/**
 * Write 24-bit audio data
 */
function writeAudio24bit(view: DataView, offset: number, channelData: Float32Array[]): void {
  const numChannels = channelData.length;
  const length = channelData[0].length;
  
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
      const value = sample < 0 ? sample * 8388608 : sample * 8388607; // Convert to -8388608-8388607 range
      
      // Write as little-endian
      view.setUint8(offset++, value & 0xFF);
      view.setUint8(offset++, (value >> 8) & 0xFF);
      view.setUint8(offset++, (value >> 16) & 0xFF);
    }
  }
}