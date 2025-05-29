import { useState } from 'react';
import { Audio } from 'expo-av';
import { Alert } from 'react-native';

export const useVoiceRecorder = (onRecordingComplete?: (text: string) => void) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'completed' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) throw new Error('Permission denied');

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setTranscript('');
      setError(null);
      setStatus('idle');
    } catch (err) {
      console.error('Start error:', err);
      Alert.alert('Error', 'Could not start audio recording');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsRecording(false);
      setRecording(null);

      if (uri) {
        setStatus('loading');

        const formData = new FormData();
        formData.append('file', {
          uri,
          name: 'audio.m4a',
          type: 'audio/m4a',
        } as any);
        formData.append('model', 'whisper-1');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        const data = await response.json();

        if (data.error) {
          setStatus('error');
          setError(data.error.message || 'Transcription failed.');
        } else {
          setTranscript(data.text);
          setStatus('completed');
          if (onRecordingComplete) onRecordingComplete(data.text);
        }
      }
    } catch (err) {
      console.error('Stop error:', err);
      setStatus('error');
      setError('Could not stop or process audio');
    }
  };

  const toggleRecording = async () => {
    isRecording ? await stopRecording() : await startRecording();
  };

  const reset = () => {
    setRecording(null);
    setIsRecording(false);
    setTranscript('');
    setError(null);
    setStatus('idle');
  };

  return {
    isRecording,
    transcript,
    error,
    status,
    startRecording,
    stopRecording,
    toggleRecording,
    reset,
  };
};
