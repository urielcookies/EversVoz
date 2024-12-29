import BottomTabs from './Navigation/BottomTabs';
import { DarkModeProvider } from './Contexts/DarkModeContext';

const Root = () => (
  <DarkModeProvider>
    <BottomTabs />
  </DarkModeProvider>
)

export default Root;
