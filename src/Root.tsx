import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import BottomTabs from './Navigation/BottomTabs';

export default function Root() {
  // return (
  //   <View style={styles.container}>
  //     <Text>Open up App.tsx to start working on your app!</Text>
  //     <StatusBar style="auto" />
  //   </View>
  // );
  return <BottomTabs />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});