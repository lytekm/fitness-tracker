import { Box, Button, Card, Text } from '@/src/components/UI/Themed';
import { useThemeContext } from '@/src/theme/ThemeProvider';

export default function Home() {
  const { theme, toggle, setMode, mode } = useThemeContext();

  return (
    <Box style={{ flex: 1, padding: theme.spacing.lg, backgroundColor: theme.colors.bg }}>
      <Text variant="headline" style={{ marginTop: theme.spacing.xl }}>Scan • Score • Decide</Text>
      <Text muted style={{ marginTop: theme.spacing.xs }}>
        Personalized health scoring for your goals.
      </Text>

      <Card style={{ marginTop: theme.spacing.lg }}>
        <Text variant="title">Theme</Text>
        <Text muted style={{ marginTop: theme.spacing.xs }}>Mode: {mode}</Text>
        <Box style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
          <Button onPress={() => setMode('system')}>System</Button>
          <Button variant="ghost" onPress={() => setMode('light')}>Light</Button>
          <Button variant="ghost" onPress={() => setMode('dark')}>Dark</Button>
          <Button onPress={toggle}>Toggle</Button>
        </Box>
      </Card>
    </Box>
  );
}
