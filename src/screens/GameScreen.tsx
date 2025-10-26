import React, { useEffect, useMemo, useRef } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '@ui/PrimaryButton';
import Screen from '@ui/Screen';
import { RootStackParamList } from '@app/navigation/types';
import { theme } from '@app/theme/colors';
import { useGameStore } from '@game/useGameStore';
import { FixedStepLoop } from '@game/loop/FixedStepLoop';
import { LapSystem } from '@game/lap/LapSystem';
import { getDefaultTrack } from '@game/track/Track';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

const formatTime = (value: number | null) =>
  value === null ? '--' : `${value.toFixed(2)}s`;

const GameScreen = ({ navigation }: Props) => {
  const {
    runActive,
    carPosition,
    carVelocity,
    angle,
    lap,
    startRun,
    finishRun,
    reset,
    update,
  } = useGameStore((state) => ({
    runActive: state.runActive,
    carPosition: state.carPosition,
    carVelocity: state.carVelocity,
    angle: state.angle,
    lap: state.lap,
    startRun: state.startRun,
    finishRun: state.finishRun,
    reset: state.reset,
    update: state.update,
  }));

  const loopRef = useRef<FixedStepLoop | null>(null);
  const lapSystemRef = useRef<LapSystem | null>(null);

  useEffect(() => {
    const track = getDefaultTrack();
    lapSystemRef.current = new LapSystem(track);
    return () => {
      lapSystemRef.current = null;
    };
  }, []);

  useEffect(() => {
    loopRef.current = new FixedStepLoop((dt) => {
      update(dt);
      lapSystemRef.current?.update();
    });
    return () => {
      loopRef.current?.stop();
      loopRef.current = null;
    };
  }, [update]);

  useEffect(() => {
    if (runActive) {
      loopRef.current?.start();
    } else {
      loopRef.current?.stop();
    }
  }, [runActive]);

  const speed = useMemo(() => Math.hypot(carVelocity.x, carVelocity.y), [carVelocity]);

  return (
    <Screen testID="GameScreen">
      <Text style={styles.title}>Race Telemetry</Text>
      <Text style={styles.subtitle}>
        {runActive ? 'Lap running...' : 'Start a run to record telemetry.'}
      </Text>

      <View style={styles.statGrid}>
        <StatCard
          label="Position"
          value={`${carPosition.x.toFixed(1)}, ${carPosition.y.toFixed(1)}`}
        />
        <StatCard label="Speed" value={`${speed.toFixed(1)} u/s`} />
        <StatCard label="Angle" value={`${angle.toFixed(0)}°`} />
        <StatCard label="Lap Time" value={formatTime(lap.currentTime)} />
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

      <View style={styles.lapCard}>
        <Text style={styles.lapTitle}>Lap Summary</Text>
        <View style={styles.lapRow}>
          <LapStat label="Last" value={formatTime(lap.lastTime)} />
          <LapStat label="Best" value={formatTime(lap.bestLap)} />
          <LapStat label="Current Lap" value={lap.currentLap.toString()} />
          <LapStat label="Total Laps" value={lap.lapCount.toString()} />
          <LapStat label="Distance" value={`${lap.distance.toFixed(1)} u`} />
        </View>
      </View>
    </Screen>
  );
};

type StatProps = {
  label: string;
  value: string;
};

const StatCard = ({ label, value }: StatProps) => (
  <View style={styles.statCard}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const LapStat = ({ label, value }: StatProps) => (
  <View style={styles.lapStat}>
    <Text style={styles.lapStatLabel}>{label}</Text>
    <Text style={styles.lapStatValue}>{value}</Text>
  </View>
);

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
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flexBasis: '48%',
    flexGrow: 1,
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
    fontSize: 22,
    fontWeight: '700',
  },
  buttonColumn: {
    gap: 12,
    marginBottom: 24,
  },
  lapCard: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: theme.elevated,
    borderColor: theme.border,
    borderWidth: 1,
  },
  lapTitle: {
    color: theme.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  lapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  lapStat: {
    flexBasis: '45%',
  },
  lapStatLabel: {
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  lapStatValue: {
    color: theme.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
});

export default GameScreen;
