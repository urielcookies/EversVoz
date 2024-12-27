import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import InputField from '../Components/InputField';
import CustomButton from '../Components/CustomButton';
import { isEmpty, map } from 'lodash';

const EversVozAPIURL = process.env.EXPO_PUBLIC_EVERSVOZ_URL;
const TRANSCRIBE_API = process.env.EXPO_PUBLIC_TRANSCRIBE_API;

interface Response {
  english_phrase: string,
  phonetic_explanation: string,
}

const HomeScreen = () => {
  const [formData, setFormData] = useState({ text: '', lang: 'en' });

  const [currentSound, setCurrentSound] = useState<Blob | null>(null);
  const [response, setResponse] = useState<Response>({
    english_phrase: '',
    phonetic_explanation: '',
  });

  const [pronounciationLoading, setPronounciationLoading] = useState(false);
  const [audiFileLoading, setAudiFileLoading] = useState(false);

  const [error, setError] = useState('');

  const formDataHandler = (field: string, value: string) => {
    setFormData(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (isEmpty(formData.text)) {
      setError('Input field can not be empty');
      return;
    }

    try {
      setError('')
      setPronounciationLoading(true);
      setAudiFileLoading(true);
      const results = await axios.post<Response>(`${EversVozAPIURL}/transcribe`, formData, {
        headers: {
          'Content-Type': 'application/json',
          'transcribe-api-key': TRANSCRIBE_API
        }
      });

      setResponse(results.data);
      setPronounciationLoading(false);
      formDataHandler('text', '');

      const response = await fetch(`${EversVozAPIURL}/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: results.data.english_phrase,
          language_code: 'es-US',
          gender: 'MALE',
          speaking_rate: 0.8,
          pitch: 0.0,
          volume_gain_db: 0.0,
        })
      })

      const audioFile = await response.blob();
      setCurrentSound(audioFile)
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setAudiFileLoading(false);
    }
  };

  function getPhoneticText(inputString: string) {
    // Split into lines and filter empty lines
    const lines = inputString.split('\n').filter(line => line.trim());
    
    // Extract phonetic text in parentheses and join with spaces
    const phoneticWords = lines
      .map((line: string) => {
        const match = line.match(/\((.*?)\)/);
        return match ? match[1] : '';
      })
      .filter((word: string) => word)
      .join(' ');
      
    return phoneticWords;
  }

  const renderWordExplanation = (text: string) => {
    // Split the explanation into word sections
    const wordSections = text.split('\n\n').filter(section => section.trim());

    return map(wordSections, (section, index) => {
      // Split each section into word and explanation
      const [wordPart, ...explanationParts] = section.split('\n-');
      const explanation = explanationParts.join('\n-');

      return (
        <View key={index} style={styles.wordSection}>
          <Text style={styles.wordTitle}>{wordPart.trim()}</Text>
          <Text style={styles.explanationText}>
            {explanation.trim()}
          </Text>
        </View>
      );
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputContainer}>
        <InputField
          value={formData.text}
          placeholder="Enter text to pronounce..."
          disabled={pronounciationLoading}
          onChangeText={(text) => formDataHandler('text', text)}
          error={!isEmpty(error)}
          errorMessage={!isEmpty(error) ? error : ''} />

        <View style={styles.buttonContainer}>
          <CustomButton
            title={pronounciationLoading ? '' : 'Get Pronunciation'}
            loading={pronounciationLoading}
            disabled={pronounciationLoading}
            onPress={handleSubmit}
            width={!isEmpty(response.english_phrase) ? '48%' : '100%'} />

          {!isEmpty(response.english_phrase) && (
            <CustomButton
              title={audiFileLoading ? '' : 'Play Sound'}
              loading={audiFileLoading}
              disabled={audiFileLoading}
              onPress={() => {
                const reader = new FileReader();
                reader.readAsDataURL(currentSound as Blob);
                reader.onloadend = async () => {
                  const base64data = reader.result;
                  const { sound } = await Audio.Sound.createAsync({ uri: base64data });
                  sound.playAsync()
                };
              }}
              width='48%' />
          )}
        </View>
      </View>

      {!isEmpty(response.english_phrase) && (
        <View style={styles.responseContainer}>
          <View style={styles.phraseContainer}>
            <Text style={styles.label}>English Phrase:</Text>
            <Text style={styles.phraseText}>{response.english_phrase}</Text>
          </View>

          <View style={styles.phoneticContainer}>
            <Text style={styles.label}>Phonetic Transcription:</Text>
            <Text style={styles.phoneticText}>{getPhoneticText(response.phonetic_explanation)}</Text>
          </View>

          <View style={styles.explanationContainer}>
            <Text style={styles.label}>Pronunciation Guide:</Text>
            {renderWordExplanation(response.phonetic_explanation)}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playSoundButton: {
    // marginLeft: 10,
  },
  responseContainer: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  phraseContainer: {
    marginBottom: 16,
  },
  phoneticContainer: {
    marginBottom: 16,
    backgroundColor: '#f0f7ff',
    padding: 12,
    borderRadius: 6,
  },
  explanationContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  phraseText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  phoneticText: {
    fontSize: 18,
    color: '#4A90E2',
    fontWeight: '500',
  },
  wordSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  wordTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
});

export default HomeScreen;
