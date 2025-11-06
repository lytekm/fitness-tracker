// app/_layout.tsx
import { Navbar } from '@/src/components/UI/Navbar';
import { Box } from '@/src/components/UI/Themed';
import { ThemeProvider } from '@/src/theme/ThemeProvider';
import { useTheme } from '@/src/theme/useTheme';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

function AppShell() {
  const t = useTheme();
  return (
    <Box style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <StatusBar style={t.isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
      <Navbar />
    </Box>
  );
}

export default function Root() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}
