import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import { isEmpty, isEqual, isNull, map } from 'lodash';
import { useDarkMode } from '../Contexts/DarkModeContext';
import ScrollViewElement from '../Components/ScrollViewElement';
import ButtonElement from '../Components/ButtonElement';
import CardElement from '../Components/CardElement';
import TextElement from '../Components/TextElement';
import InputElement from '../Components/InputElement';
import { supabase } from '../Utils/supabase';
import { useUserSession } from '../Contexts/UserSessionContext';

const EversVozAPIURL = process.env.EXPO_PUBLIC_EVERSVOZ_URL;
const TRANSCRIBE_API = process.env.EXPO_PUBLIC_TRANSCRIBE_API;

interface Response {
  english_phrase: string,
  phonetic_explanation: string,
  user_input: string,
}

interface PhoneticUsage {
  monthlyRequestCount: number,
  totalRequestCount: number,
  tierType: keyof typeof MAX_RESPONSES,
}

const MAX_RESPONSES = {
  FREE_TIER: 10,
  BASIC_TIER: 200,
}

const HomeScreen = () => {
  const { isDarkMode } = useDarkMode();
  const { user } = useUserSession();
  const [inputValue, setInputValue] = useState('');
  const [currentSound, setCurrentSound] = useState<Blob | null>(null);
  const [pronounciationLoading, setPronounciationLoading] = useState(false);
  const [audioFileLoading, setAudioFileLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneticUsage, setPhoneticUsage] = useState<PhoneticUsage>({
    monthlyRequestCount: 0,
    totalRequestCount: 0,
    tierType: 'FREE_TIER',
  });
  const [response, setResponse] = useState<Response>({
    english_phrase: '',
    phonetic_explanation: '',
    user_input: '',
  });

  useEffect(() => {
    fetchUsageData();
  }, [])

  // Add real-time subscription to PhoneticUsage
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`public:PhoneticUsage:user_id=eq.${user.id}`)
      .on(
        'postgres_changes', 
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'PhoneticUsage',
          filter: `user_id=eq.${user.id}`
        },
        (payload: { new: { monthly_request_count: number, total_request_count: number, tier_type: 'FREE_TIER' | 'BASIC_TIER' } }) => {
          console.log('Real-time update received:', payload);
          if (payload.new) {
            setPhoneticUsage({
              monthlyRequestCount: payload.new.monthly_request_count,
              totalRequestCount: payload.new.total_request_count,
              tierType: payload.new.tier_type,
            });
          } else {
            console.log('???', payload)
          }
        }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchUsageData = async () => {
    if (!user?.id) {
      console.error('User ID is missing.');
      return;
    }
  
    const { data, error } = await supabase
      .from('PhoneticUsage')
      .select('monthly_request_count, total_request_count, tier_type')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching usage data:', error.message);
    } else {
      setPhoneticUsage({
        monthlyRequestCount: data.monthly_request_count,
        totalRequestCount: data.total_request_count,
        tierType: data.tier_type,
      });
    }
  };

  const incrementRequestCount = async () => {
    if (isNull(user)) return;
    const { error } = await supabase
    .from('PhoneticUsage')
    .update({ 
      monthly_request_count: phoneticUsage.monthlyRequestCount + 1,
      total_request_count: phoneticUsage.totalRequestCount + 1,
      updated_at: new Date().toISOString(),

    })
    .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching usage data:', error.message);
    } 
  };

  const payup = async () => {
    if (isNull(user)) return;
    setTimeout(async () => {
      const { error } = await supabase
      .from('PhoneticUsage')
      .update({ 
        tier_type: 'BASIC_TIER',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
  
      if (error) {
        console.error('Error updating data:', error.message);
      } 
    }, 2000);
  };

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

    if (isEqual(phoneticUsage.monthlyRequestCount, MAX_RESPONSES[phoneticUsage.tierType])) {
      Alert.alert(
        "SAMPLE PAYWAL",
        "SAMPLE PAYWALL",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "PAGAR", style: 'default', onPress: payup }
        ],
        { cancelable: false }
      );
      return;
    };

    try {
      setPronounciationLoading(true);
      const results = await axios.post<Response>(`${EversVozAPIURL}/transcribe`, {text: inputValue}, {
        headers: {
          'Content-Type': 'application/json',
          'transcribe-api-key': TRANSCRIBE_API || ''
        }
      });

      if (isEqual(results.status, 200)) {
        setResponse(results.data);
        incrementRequestCount();
      }
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
          'transcribe-api-key': TRANSCRIBE_API as string
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

  console.log(inputValue)
  console.log(phoneticUsage)
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
        <View style={{ alignItems: 'flex-end' }}>
          <TextElement>Usage {phoneticUsage.monthlyRequestCount}/{MAX_RESPONSES[phoneticUsage.tierType]}</TextElement>
        </View>
      </CardElement>

      {!isEmpty(response.english_phrase) && (
      <CardElement>
        {!isNull(response.user_input) && (
          <View style={[styles.phraseContainer, {borderBottomColor: '#eee', borderBottomWidth: 1, paddingBottom: 16,}]}>
            <TextElement
              style={[styles.label, {color: isDarkMode ? '#999999' : '#666'}]}>
              Frase original:
            </TextElement>
            <TextElement
              style={[styles.phraseText, {color: isDarkMode ? '#FFFFFF' : '#333'}]}>
              {response.user_input}
            </TextElement>
          </View>
        )}

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
