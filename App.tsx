import { useEffect, useState } from 'react';
import { AppNavigator } from './navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeExerciseDatabase } from './api/services/exerciseDatabase';
import { initializeExerciseLogDatabase } from './api/services/exerciseLogDatabase';

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    // Initialize SQLite databases on app startup
    Promise.all([
      initializeExerciseDatabase(),
      initializeExerciseLogDatabase(),
    ])
      .then(() => setIsDbReady(true))
      .catch((err) => {
        console.error('Failed to initialize database:', err);
        setIsDbReady(true); // Continue anyway, fallback to JSON
      });
  }, []);


  // Optionally show a loading state, but for fast init we just render immediately
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
