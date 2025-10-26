import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '@ui/PrimaryButton';
import Screen from '@ui/Screen';
import { RootStackParamList } from '@app/navigation/types';
import { theme } from '@app/theme/colors';
import { useGameStore } from '@game/useGameStore';

const vehicleStats = [
  { label: 'Energy', value: 82 },
  { label: 'Traction', value: 68 },
  { label: 'Aero', value: 91 },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

const GameScreen = ({ navigation }: Props) => {
  const { runActive, coins, topSpeed, startRun, finishRun, reset } = useGameStore();

  return (
    <Screen testID="GameScreen">
      <Text style={styles.title}>Weekly Sprint</Text>
      <Text style={styles.subtitle}>
        {runActive
          ? 'Hold the line and chase clean apexes.'
          : 'Tap start to begin your warmup.'}
      </Text>

      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Coins</Text>
          <Text style={styles.statValue}>{coins}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Top speed</Text>
          <Text style={styles.statValue}>{topSpeed} km/h</Text>
        </View>
      </View>

      <View style={styles.buttonColumn}>
        <PrimaryButton
          label={runActive ? 'Complete Run' : 'Start Run'}
          onPress={runActive ? finishRun : startRun}
        />
        {runActive ? (
          <PrimaryButton label="Abort" variant="secondary" onPress={reset} />
        ) : (
          <PrimaryButton
            label="Back to Menu"
            variant="secondary"
            onPress={() => navigation.navigate('Menu')}
          />
        )}
      </View>

      <View style={styles.metaBlock}>
        {vehicleStats.map((item) => (
          <View key={item.label} style={styles.metaCard}>
            <Text style={styles.metaLabel}>{item.label}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: `${item.value}%` }]} />
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    color: theme.textSecondary,
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 18,
    borderRadius: 16,
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
  },
  statLabel: {
    color: theme.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    color: theme.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  buttonColumn: {
    gap: 12,
    marginBottom: 24,
  },
  metaBlock: {
    gap: 14,
  },
  metaCard: {
    padding: 16,
    backgroundColor: theme.elevated,
    borderRadius: 14,
  },
  metaLabel: {
    color: theme.textSecondary,
    marginBottom: 10,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#1f2937',
  },
  progressBar: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: theme.accent,
  },
});

export default GameScreen;
