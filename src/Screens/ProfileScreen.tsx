import React, { useState } from 'react';
import { Button, View, Text, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

const EversVozAPIURL = process.env.EXPO_PUBLIC_EVERSVOZ_URL;

const ProfileScreen = () => {
  const [sound, setSound] = useState();

  async function playSound() {
    const response = await fetch(`${EversVozAPIURL}/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hello, world!',
        language_code: 'en-US',
        gender: 'MALE',
        speaking_rate: 1.0,
        pitch: 0.0,
        volume_gain_db: 0.0,
      }),
    });

    const audioFile = await response.blob();
    const reader = new FileReader();
    reader.readAsDataURL(audioFile);
    reader.onloadend = async () => {
      const base64data = reader.result;
      const { sound } = await Audio.Sound.createAsync({ uri: base64data });
      setSound(sound);
      await sound.playAsync();
    };
  }

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <View style={styles.container}>
      <Text>Profile Screen</Text>
      <Button title="Play Sound" onPress={playSound} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen;
