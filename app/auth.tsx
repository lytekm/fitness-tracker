import { Box, Text } from '@/src/components/UI/Themed';
import { useTheme } from '@/src/theme/useTheme';

export default function AuthPage() {
  const t = useTheme();
  return (
    <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.bg }}>
      <Text variant="headline">Auth Page</Text>
      <Text muted>Login/Register goes here.</Text>
    </Box>
  );
}
