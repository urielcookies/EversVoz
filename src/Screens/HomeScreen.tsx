import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import { isEmpty, map } from 'lodash';
import { useDarkMode } from '../Contexts/DarkModeContext';
import ScrollViewElement from '../Components/ScrollViewElement';
import ButtonElement from '../Components/ButtonElement';
import CardElement from '../Components/CardElement';
import TextElement from '../Components/TextElement';
import InputElement from '../Components/InputElement';

const EversVozAPIURL = process.env.EXPO_PUBLIC_EVERSVOZ_URL;
const TRANSCRIBE_API = process.env.EXPO_PUBLIC_TRANSCRIBE_API;

interface Response {
  english_phrase: string,
  phonetic_explanation: string,
}

const HomeScreen = () => {
  const { isDarkMode } = useDarkMode();
  const [inputValue, setInputValue] = useState('');
  const [currentSound, setCurrentSound] = useState<Blob | null>(null);
  const [pronounciationLoading, setPronounciationLoading] = useState(false);
  const [audioFileLoading, setAudioFileLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState<Response>({
    english_phrase: '',
    phonetic_explanation: '',
  });

  const handleSubmit = async () => {
    if (isEmpty(inputValue)) {
      setError('Input field can not be empty');
      return;
    }
    setError('');
    const results = await getTranscription();
    const phrase = results?.data.english_phrase;
    if (phrase) {
      getAudio(phrase);
    }
  };

  const getTranscription = async () => {
    try {
      setPronounciationLoading(true);
      const results = await axios.post<Response>(`${EversVozAPIURL}/transcribe`, {text: inputValue}, {
        headers: {
          'Content-Type': 'application/json',
          'transcribe-api-key': TRANSCRIBE_API
        }
      });
      setResponse(results.data);
      return results;
    } catch (error: any) {
      setInputValue('');
      setPronounciationLoading(false);
      console.error('Transcribe Error:', error.response.data.error);
      setError(error.response.data.error)
    } finally {
      setInputValue('');
      setPronounciationLoading(false);
    }
  };

  const getAudio = async (phrase: string) => {
    if (isEmpty(phrase)) {
      return;
    }

    try {
      setAudioFileLoading(true);
      const response = await fetch(`${EversVozAPIURL}/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'transcribe-api-key': TRANSCRIBE_API
        },
        body: JSON.stringify({
          text: phrase,
          language_code: 'en-US',
          gender: 'FEMALE',
          speaking_rate: 0.8,
          pitch: 0.0,
          volume_gain_db: 0.0,
        })
      })

      const audioFile = await response.blob();
      setCurrentSound(audioFile)
    }
    catch (error) {
      console.error('Audio Error:', error);
      setAudioFileLoading(false);
    }
    finally {
      setAudioFileLoading(false);
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
          <TextElement style={styles.wordTitle}>{wordPart.trim()}</TextElement>
          <TextElement style={styles.explanationText}>
            {explanation.trim()}
          </TextElement>
        </View>
      );
    });
  };

  return (
    <ScrollViewElement>
      <CardElement>
        <InputElement
          value={inputValue}
          placeholder="Ingresa para pronunciar, español o inglés..."
          disabled={pronounciationLoading || audioFileLoading}
          onChangeText={setInputValue}
          error={!isEmpty(error)}
          errorMessage={!isEmpty(error) ? error : ''} />

        <View style={styles.buttonContainer}>
          <ButtonElement
            title={pronounciationLoading ? '' : 'Pronuncia'}
            loading={pronounciationLoading}
            disabled={pronounciationLoading || audioFileLoading}
            onPress={handleSubmit}
            width={!isEmpty(response.english_phrase) ? '48%' : '100%'} />

          {!isEmpty(response.english_phrase) && (
            <ButtonElement
              title={audioFileLoading ? '' : 'Sonido'}
              loading={audioFileLoading}
              disabled={pronounciationLoading || audioFileLoading}
              onPress={() => {
                const reader = new FileReader();
                reader.readAsDataURL(currentSound as Blob);
                reader.onloadend = async () => {
                  const base64data = reader.result as string;
                  const { sound } = await Audio.Sound.createAsync({ uri: base64data });
                  sound.playAsync()
                };
              }}
              width='48%'
              icon='play-circle-o' />
          )}
        </View>
      </CardElement>

      {!isEmpty(response.english_phrase) && (
        <CardElement>
          <View style={styles.phraseContainer}>
            <TextElement
              style={[styles.label, {color: isDarkMode ? '#999999' : '#666'}]}>
              Frase en inglés:
            </TextElement>
            <TextElement
              style={[styles.phraseText, {color: isDarkMode ? '#FFFFFF' : '#333'}]}>
              {response.english_phrase}
            </TextElement>
          </View>

          <View style={[styles.phoneticContainer,
            {
              backgroundColor: isDarkMode ? '#2A2A2A' : '#F0F7FF',
              borderColor: isDarkMode ? '#444444' : '#E0E0E0',
            },
          ]}>
          <TextElement style={[styles.label,
              { color: isDarkMode ? '#999999' : '#666666' },
          ]}>
            Transcripción fonética:
          </TextElement>
          <TextElement style={[styles.phoneticText,
            { color: isDarkMode ? '#62AFFF' : '#4A90E2' },
          ]}>
            {getPhoneticText(response.phonetic_explanation)}
          </TextElement>
        </View>

          <View style={styles.explanationContainer}>
            <TextElement
              style={[styles.label, {color: isDarkMode ? '#999999' : '#666'}]}>
              Guía de pronunciación:
            </TextElement>
            {renderWordExplanation(response.phonetic_explanation)}
          </View>
        </CardElement>
      )}
    </ScrollViewElement>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginBottom: 4,
    fontWeight: '500',
  },
  phraseText: {
    fontSize: 18,
    fontWeight: '600',
  },
  phoneticText: {
    fontSize: 18,
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
    fontWeight: '600',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 22,
  },
});

export default HomeScreen;
