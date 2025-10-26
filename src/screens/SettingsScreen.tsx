import React, { useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { RootStackParamList } from '@app/navigation/types';
import Screen from '@ui/Screen';
import PrimaryButton from '@ui/PrimaryButton';
import { theme } from '@app/theme/colors';
import { useGameStore } from '@game/useGameStore';

const controlModes = [
  {
    value: 'touchZones' as const,
    label: 'Touch Zones',
    description: 'Left/right sides steer, brake button bottom right.',
  },
  {
    value: 'joystick' as const,
    label: 'Virtual Joystick',
    description: 'Thumbstick controls steering + throttle.',
  },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const SettingsScreen = ({ navigation }: Props) => {
  const { settings, setInputMode, setSoundEnabled, hydrateSettings, resetBestLap } =
    useGameStore((state) => ({
      settings: state.settings,
      setInputMode: state.setInputMode,
      setSoundEnabled: state.setSoundEnabled,
      hydrateSettings: state.hydrateSettings,
      resetBestLap: state.resetBestLap,
    }));

  useEffect(() => {
    hydrateSettings();
  }, [hydrateSettings]);

  return (
    <Screen scrollable testID="SettingsScreen">
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>
        Choose your preferred control and audio profile.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Control Mode</Text>
        <View style={styles.segmentedControl}>
          {controlModes.map((mode) => {
            const active = settings.inputMode === mode.value;
            return (
              <Pressable
                key={mode.value}
                onPress={() => setInputMode(mode.value)}
                style={[styles.segment, active && styles.segmentActive]}
              >
                <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
                  {mode.label}
                </Text>
                <Text style={styles.segmentDescription}>{mode.description}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowContent}>
            <Text style={styles.rowTitle}>Sound effects</Text>
            <Text style={styles.rowSubtitle}>Toggle engine audio and UI cues.</Text>
          </View>
          <Switch
            value={settings.soundEnabled}
            onValueChange={setSoundEnabled}
            thumbColor={settings.soundEnabled ? theme.accent : '#1f2937'}
            trackColor={{ false: '#1f2937', true: theme.accentAlt }}
          />
        </View>
      </View>

      <View style={styles.dangerZone}>
        <Text style={styles.dangerTitle}>Lap Data</Text>
        <Text style={styles.dangerCopy}>Reset your stored best lap time.</Text>
        <PrimaryButton
          label="Reset Best Lap"
          variant="secondary"
          onPress={resetBestLap}
        />
      </View>

      <PrimaryButton label="Done" variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: theme.textPrimary,
  },
  subtitle: {
    color: theme.textSecondary,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  segmentedControl: {
    gap: 12,
  },
  segment: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
  },
  segmentActive: {
    borderColor: theme.accent,
    backgroundColor: '#1c1d2b',
  },
  segmentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  segmentLabelActive: {
    color: theme.accent,
  },
  segmentDescription: {
    color: theme.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    borderRadius: 18,
    backgroundColor: theme.surface,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    color: theme.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  rowSubtitle: {
    color: theme.textSecondary,
  },
  dangerZone: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#b91c1c',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    gap: 8,
    marginBottom: 24,
  },
  dangerTitle: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  dangerCopy: {
    color: theme.textSecondary,
  },
});

export default SettingsScreen;
