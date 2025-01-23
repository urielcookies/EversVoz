import Root from './src/Root';
import { adapty } from 'react-native-adapty';

adapty.activate(process.env.EXPO_PUBLIC_ADAPTY_KEY as string);

export default function App() {
  return <Root />;
}
