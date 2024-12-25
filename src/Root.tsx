import BottomTabs from './Navigation/BottomTabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const Root = () => (
  <QueryClientProvider client={queryClient}>
    <BottomTabs />
  </QueryClientProvider>
)

export default Root;
