import React, { useRef, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { X, Mic } from 'lucide-react-native';
import { useDeepSeek } from '@/hooks/useDeepSeek';
import { useVoiceRecorder } from '@/hooks/useTranscription';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import IngredientsEditPopup from './IngredientsEditPopup';
import { useTheme } from '@/contexts/ThemeContext';

const client = generateClient<Schema>();

interface VoicePopupProps {
  visible: boolean;
  onClose: () => void;
  onSaveIngredients?: (ingredients: Array<{ name: string; quantity: number; unit: string }>) => void;
}

const { width } = Dimensions.get('window');

const VoicePopup: React.FC<VoicePopupProps> = ({ visible, onClose, onSaveIngredients }) => {
  const {
    isRecording,
    transcript,
    error,
    status,
    toggleRecording,
    reset,
    stopRecording,
  } = useVoiceRecorder();
  const { colors } = useTheme();
  const { callDeepSeek } = useDeepSeek();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [unitTypes] = React.useState(() => client.enums.UnitType.values());
  const [showIngredientsEdit, setShowIngredientsEdit] = useState(false);
  const [extractedIngredients, setExtractedIngredients] = useState<Array<{ name: string; quantity: number; unit: string }>>([]);

  useEffect(() => {
    if (status === 'completed' && transcript) {
      convertTranscription();
    }
  }, [status, transcript]);

  const handleClose = async () => {
    if (isRecording) {
      await stopRecording();
    }
    reset();
    setShowIngredientsEdit(false);
    setExtractedIngredients([]);
    onClose();
  };

  const handleSaveIngredients = (ingredients: Array<{ name: string; quantity: number; unit: string }>) => {
    if (onSaveIngredients) {
      onSaveIngredients(ingredients);
    }
    handleClose();
  };

  const convertTranscription = async () => {
    const prompt = `You will be given a user's spoken input describing ingredients. Extract all ingredients mentioned in the text. If none are found, return an empty array [].
      If theres a possible ingredient but misspelled, you can give what you think it it.
      The response must be a valid json array of ingredient objects with this structure:
      [
        {
          "name": string (start with a capital letter),
          "quantity": number,
          "unit": string (this should be one of the units from the list below)
        },
        ...
      ]

      Guidelines:
      - Do not return any extra text or explanation.
      - If no ingredients are found, return exactly: []

      Input:
      trasncript: "${transcript.trim()}"
      units: "${unitTypes.join(', ')}"`;
    
    abortControllerRef.current = new AbortController();

    const aiResult = await callDeepSeek(prompt, {
      signal: abortControllerRef.current.signal,
    });
    console.log('AI Result:', aiResult);

    if (aiResult) {
      try {
        const cleanedResult = aiResult
          .trim()
          .replace(/^```json\s*/, '')
          .replace(/```$/, '')
          .replace(/^\s*|\s*$/g, '');

        console.log('Cleaned Result:', cleanedResult);
        
        const parsedResult = JSON.parse(cleanedResult);
        console.log('Parsed Result:', parsedResult);

        if (Array.isArray(parsedResult)) {
          console.log('Setting extracted ingredients:', parsedResult);
          setExtractedIngredients(parsedResult);
          setShowIngredientsEdit(true);
          return parsedResult;
        } else {
          console.error('Invalid response format:', cleanedResult);
          return [];
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
        console.error('Raw AI result:', aiResult);
        return [];
      }
    } else {
      console.error('No result from AI');
      return [];
    }
  };

  if (showIngredientsEdit) {
    console.log('Showing IngredientsEditPopup with ingredients:', extractedIngredients);
    return (
      <IngredientsEditPopup
        visible={true}
        onClose={() => {
          setShowIngredientsEdit(false);
          handleClose();
        }}
        ingredients={extractedIngredients}
        onSave={handleSaveIngredients}
      />
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.closeIcon} onPress={handleClose}>
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.content}>
            <TouchableOpacity
              style={[
                styles.micButton,
                isRecording && { borderColor: colors.warning, backgroundColor: colors.surface },
              ]}
              onPress={toggleRecording}
              activeOpacity={0.7}
            >
              <Mic size={48} color={isRecording ? colors.warning : colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
              {isRecording
                ? 'Listening...'
                : status === 'loading'
                  ? 'Transcribing...'
                  : 'Tap to start speaking'}
            </Text>

            {status === 'completed' && transcript && (
              <>
                <Text style={styles.resultText} numberOfLines={3}>
                  {transcript}
                </Text>
                {/* <TouchableOpacity 
                  style={styles.convertButton} 
                  onPress={convertTranscription}
                >
                  <Text style={styles.convertButtonText}>Convert to Ingredients</Text>
                </TouchableOpacity> */}
              </>
            )}
            {status === 'error' && error && (
              <Text style={[styles.resultText, { color: 'red' }]} numberOfLines={3}>
                {error}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(30,30,30,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.8,
    borderRadius: 14,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 8,
    position: 'relative',
  },
  closeIcon: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 2,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  micButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  instructionText: {
    marginBottom: 24,
    textAlign: 'center',
  },
  resultText: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  closeButton: {
    backgroundColor: '#000',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 32,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  convertButton: {
    backgroundColor: '#22C55E',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  convertButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default React.memo(VoicePopup);