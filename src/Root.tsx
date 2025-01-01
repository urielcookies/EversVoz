import BottomTabs from './Navigation/BottomTabs';
import { DarkModeProvider } from './Contexts/DarkModeContext';
import { UserSessionProvider } from './Contexts/UserSessionContext';

const Root = () => (
  <UserSessionProvider>
    <DarkModeProvider>
      <BottomTabs/>
    </DarkModeProvider>
  </UserSessionProvider>
)

export default Root;
