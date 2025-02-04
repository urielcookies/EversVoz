import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import { adapty } from 'react-native-adapty';
import { createPaywallView } from '@adapty/react-native-ui';
import { isEmpty, isEqual, isNull, map } from 'lodash';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; 
import { User } from '@supabase/supabase-js';
import { useDarkMode } from '../Contexts/DarkModeContext';
import ScrollViewElement from '../Components/ScrollViewElement';
import ButtonElement from '../Components/ButtonElement';
import CardElement from '../Components/CardElement';
import TextElement from '../Components/TextElement';
import InputElement from '../Components/InputElement';
import { supabase } from '../Utils/supabase';
import { useUserSession } from '../Contexts/UserSessionContext';
import { basicTierUser, fetchPhoneticUsage, resetCredits, updatePhoneticUsage } from '../Utils/adaptyFunctions';

const EversVozAPIURL = __DEV__ ? process.env.EXPO_PUBLIC_EVERSVOZ_URL_DEV : process.env.EXPO_PUBLIC_EVERSVOZ_URL_PROD;
const TRANSCRIBE_API = process.env.EXPO_PUBLIC_TRANSCRIBE_API;

interface Response {
  english_phrase: string,
  phonetic_explanation: string,
  user_input: string,
}

interface PhoneticUsage {
  monthlyRequestCount: number,
  totalRequestCount: number,
  resetMonthlyRequestsDate: Date | null;
}

const MAX_RESPONSES = {
  FREE_TIER: 10,
  BASIC_TIER: 200,
}


const HomeScreen = () => {
  const { isDarkMode } = useDarkMode();
  const { user } = useUserSession();
  const [inputValue, setInputValue] = useState('');
  const [userTierResponses, setUserTierResponses] = useState<number>(MAX_RESPONSES.FREE_TIER);
  const [currentSound, setCurrentSound] = useState<Blob | null>(null);
  const [pronounciationLoading, setPronounciationLoading] = useState(false);
  const [audioFileLoading, setAudioFileLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneticUsage, setPhoneticUsage] = useState<PhoneticUsage>({
    monthlyRequestCount: 0,
    totalRequestCount: 0,
    resetMonthlyRequestsDate: null,
  });
  const [response, setResponse] = useState<Response>({
    english_phrase: '',
    phonetic_explanation: '',
    user_input: '',
  });

  useEffect(() => {
    const initialFetch = async () => {
      await resetCredits({
        onMount: true,
        DBUpdate: true,
        user: user as User
      });
      await fetchuserTierResponses();
      fetchUsageData(user as User);
    }
    initialFetch();
  }, [])

  // Add real-time subscription to PhoneticUsage
  useEffect(() => {
    if (!user?.id) return;

    // Create a real-time subscription to listen for updates
    const channel = supabase
      .channel(`phonetic_usage_${user.id}`) // Unique channel name per user
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'PhoneticUsage',
          filter: `user_id=eq.${user.id}`, // Ensure filter is properly formatted
        },
        (payload) => {
          console.log("Real-time update received:", payload);
          if (payload.new) {
            setPhoneticUsage({
              monthlyRequestCount: payload.new.monthly_request_count,
              totalRequestCount: payload.new.total_request_count,
              resetMonthlyRequestsDate: payload.new.reset_monthly_requests_date, // Ensure correct property reference
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchuserTierResponses = async () => {
    try {
      const basicUser = await basicTierUser();
      setUserTierResponses(
        basicUser?.isActive
        ? MAX_RESPONSES.BASIC_TIER
        : MAX_RESPONSES.FREE_TIER
      );
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUsageData = async (user: User) => {
    const phoneticUsage = await fetchPhoneticUsage(user);
    const { data, error } = phoneticUsage;

    if (data) {
      setPhoneticUsage({
        monthlyRequestCount: data.monthly_request_count,
        totalRequestCount: data.total_request_count,
        resetMonthlyRequestsDate: data.reset_monthly_requests_date,
      });
    }
    if (error) {
      console.error('Error fetching usage data:', error.message);
      return error
    }

    return data;
  };

  const incrementRequestCount = async (isExpired: Date | null) => {
    if (isNull(user)) return;
      const { error } = await supabase
      .from('PhoneticUsage')
      .update({ 
        monthly_request_count: isNull(isExpired) ? phoneticUsage.monthlyRequestCount + 1 : 1,
        total_request_count: phoneticUsage.totalRequestCount + 1,
        updated_at: new Date(),
        reset_monthly_requests_date: isNull(isExpired) ? phoneticUsage.resetMonthlyRequestsDate : isExpired,
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching usage data:', error.message);
    } 
  };

  const payup = async () => {
    if (isNull(user)) return;
    const paywall = await adapty.getPaywall('basic_tier_placement');
    const view = await createPaywallView(paywall);
    await view.registerEventHandlers({
      onCloseButtonPress() {
        return true;
      },
      onPurchaseStarted() {},
      onPurchaseCancelled() {},
      onPurchaseFailed() {},
      onPurchaseCompleted(prop) {
        const updateProfile = async () => {
          const basicUser = await basicTierUser();
          await updatePhoneticUsage(user, {
            reset_monthly_requests_date: basicUser?.expiresAt,
            monthly_request_count: 0,
          });
          await fetchuserTierResponses();
        }
        updateProfile()
      },
      onRestoreFailed() {},
      onProductSelected() {},
      onRenderingFailed() {},
      onLoadingProductsFailed() {},
    });
    view.present()
  };

  const handleSubmit = async () => {
    setPronounciationLoading(true);
    if (isEmpty(inputValue)) {
      setError('El campo de entrada no puede estar vacío');
      return;
    }
    const basicUser = await basicTierUser();
    const isExpired = await resetCredits({
      onMount: false,
      DBUpdate: false,
      user: user as User
    });

    const maxRequestReached = isEqual( 
      isNull(isExpired) ? phoneticUsage.monthlyRequestCount : 0,
      basicUser?.isActive ? MAX_RESPONSES.BASIC_TIER : MAX_RESPONSES.FREE_TIER
    );

    if (maxRequestReached && basicUser?.isActive) {
      Alert.alert(
        "Límite Alcanzado",
        `Esperar hasta ${
          basicUser.expiresAt
          ? format(basicUser.expiresAt, "d 'de' MMMM 'de' yyyy 'a las' hh:mm:ss a", { locale: es })
          : 'una fecha desconocida'
        } para uso para reiniciar`,
      );
      setPronounciationLoading(false);
      return;
    }

    if (maxRequestReached && !basicUser?.isActive) {
      payup();
      setPronounciationLoading(false);
      return;
    }

    setError('');
    const results = await getTranscription();
    if (isEqual(results?.status, 200)) {
      incrementRequestCount(isExpired);
    }
    const phrase = results?.data.english_phrase;
    if (phrase) {
      getAudio(phrase);
    }
  };

  const getTranscription = async () => {
    try {
      const results = await axios.post<Response>(`${EversVozAPIURL}/transcribe`, {text: inputValue}, {
        headers: {
          'Content-Type': 'application/json',
          'transcribe-api-key': TRANSCRIBE_API || ''
        }
      });

      if (isEqual(results.status, 200)) {
        setResponse(results.data);
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
          <TextElement>Créditos {phoneticUsage.monthlyRequestCount}/{userTierResponses}</TextElement>
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
