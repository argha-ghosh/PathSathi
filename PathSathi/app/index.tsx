// app/index.tsx
// Auth gate – redirects to the appropriate screen based on login state.

import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/theme';

export default function Index() {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href={'/(auth)/login' as never} />;
  }

  return <Redirect href="/(tutor)/board" />;
}
