import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '@ui/PrimaryButton';
import Screen from '@ui/Screen';
import { RootStackParamList } from '@app/navigation/types';
import { theme } from '@app/theme/colors';
import { useGameStore } from '@game/useGameStore';
import { FixedStepLoop } from '@game/loop/FixedStepLoop';
import { LapSystem } from '@game/lap/LapSystem';
import { getDefaultTrack, TrackZone } from '@game/track/Track';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

const formatTime = (value: number | null) =>
  value === null ? '--' : `${value.toFixed(2)}s`;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const CAR_WIDTH = 28;
const CAR_HEIGHT = 16;

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
  const [trackSize, setTrackSize] = useState({ width: 0, height: 0 });

  const track = useMemo(() => getDefaultTrack(), []);
  const startLineZone = useMemo<TrackZone | undefined>(
    () => track.getZonesByType('startLine')[0],
    [track],
  );

  useEffect(() => {
    lapSystemRef.current = new LapSystem(track);
    return () => {
      lapSystemRef.current = null;
    };
  }, [track]);

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
  const speedKmh = speed * 3.6;

  const carPixelPosition = useMemo(() => {
    if (!trackSize.width || !trackSize.height) {
      return {
        x: trackSize.width / 2,
        y: trackSize.height / 2,
      };
    }

    return {
      x: clamp01(carPosition.x / track.dimensions.width) * trackSize.width,
      y: clamp01(carPosition.y / track.dimensions.height) * trackSize.height,
    };
  }, [
    carPosition,
    track.dimensions.height,
    track.dimensions.width,
    trackSize.height,
    trackSize.width,
  ]);

  const startLineStyle = useMemo(() => {
    if (!startLineZone || !trackSize.width || !trackSize.height) {
      return {};
    }

    return {
      left: (startLineZone.bounds.x / track.dimensions.width) * trackSize.width,
      top: (startLineZone.bounds.y / track.dimensions.height) * trackSize.height,
      width: (startLineZone.bounds.width / track.dimensions.width) * trackSize.width || 6,
      height:
        (startLineZone.bounds.height / track.dimensions.height) * trackSize.height || 40,
    };
  }, [
    startLineZone,
    track.dimensions.height,
    track.dimensions.width,
    trackSize.height,
    trackSize.width,
  ]);

  return (
    <Screen testID="GameScreen">
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>On Track</Text>
          <Text style={styles.subtitle}>
            {runActive ? 'Lap running...' : 'Start a run to record telemetry.'}
          </Text>
        </View>
        <Pressable style={styles.pauseButton} onPress={() => navigation.navigate('Menu')}>
          <Text style={styles.pauseLabel}>Pause</Text>
        </Pressable>
      </View>

      <View style={styles.trackWrapper}>
        <View
          style={[
            styles.trackSurface,
            { aspectRatio: track.dimensions.width / track.dimensions.height },
          ]}
          onLayout={(event) =>
            setTrackSize({
              width: event.nativeEvent.layout.width,
              height: event.nativeEvent.layout.height,
            })
          }
        >
          <TrackGrid />
          <View style={[styles.startLine, startLineStyle]} />
          <View
            style={[
              styles.car,
              {
                transform: [
                  { translateX: carPixelPosition.x - CAR_WIDTH / 2 },
                  { translateY: carPixelPosition.y - CAR_HEIGHT / 2 },
                  { rotate: `${angle}deg` },
                ],
              },
            ]}
          />
          <View style={styles.hudOverlay}>
            <View style={styles.hudItem}>
              <Text style={styles.hudValue}>{`${speedKmh.toFixed(0)} km/h`}</Text>
              <Text style={styles.hudLabel}>Speed</Text>
            </View>
            <View style={styles.hudDivider} />
            <View style={styles.hudItem}>
              <Text style={styles.hudValue}>{`Lap ${lap.currentLap}`}</Text>
              <Text style={styles.hudLabel}>Counter</Text>
            </View>
            <View style={styles.hudDivider} />
            <View style={styles.hudItem}>
              <Text style={styles.hudValue}>{formatTime(lap.bestLap)}</Text>
              <Text style={styles.hudLabel}>Best</Text>
            </View>
          </View>
        </View>
      </View>

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

const TrackGrid = () => {
  const tiles = useMemo(() => Array.from({ length: 64 }), []);
  return (
    <View style={styles.grid}>
      {tiles.map((_, index) => (
        <View key={`tile-${index}`} style={styles.gridTile} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    color: theme.textSecondary,
  },
  pauseButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  pauseLabel: {
    color: theme.textPrimary,
    fontWeight: '600',
  },
  trackWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  trackSurface: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#1f2937',
    backgroundColor: '#0f172a',
  },
  grid: {
    position: 'absolute',
    inset: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridTile: {
    width: '12.5%',
    height: '12.5%',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  startLine: {
    position: 'absolute',
    backgroundColor: '#f97316',
    opacity: 0.9,
  },
  car: {
    position: 'absolute',
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
    backgroundColor: '#fbbf24',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  hudOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: theme.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hudItem: {
    alignItems: 'flex-start',
  },
  hudValue: {
    color: theme.textPrimary,
    fontWeight: '700',
  },
  hudLabel: {
    color: theme.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  hudDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#1f2937',
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
