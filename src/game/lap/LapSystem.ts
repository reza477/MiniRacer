import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGameStore } from '@game/useGameStore';
import { Track, TrackZone } from '@game/track/Track';
import { STORAGE_KEYS } from '@game/storageKeys';

type Vector2 = { x: number; y: number };

const MIN_LAP_TIME = 2; // seconds

type LapSystemOptions = {
  storageKey?: string;
  forwardDirection?: 1 | -1;
  minLapTime?: number;
};

export class LapSystem {
  private readonly track: Track;
  private readonly storageKey: string;
  private readonly forwardDirection: 1 | -1;
  private readonly minLapTime: number;
  private readonly startLineZone: TrackZone | undefined;
  private readonly crossingAxis: 'x' | 'y';
  private readonly spanAxis: 'x' | 'y';
  private readonly forwardVector: Vector2;
  private cachedBestLap: number | null = null;
  private lastPosition: Vector2 | null = null;
  private lapStarted = false;
  private wasRunActive = false;

  constructor(track: Track, options: LapSystemOptions = {}) {
    this.track = track;
    this.storageKey = options.storageKey ?? STORAGE_KEYS.bestLap;
    this.forwardDirection = options.forwardDirection ?? 1;
    this.minLapTime = options.minLapTime ?? MIN_LAP_TIME;
    this.startLineZone = this.track.getZonesByType('startLine')[0];

    const isVertical =
      this.startLineZone &&
      this.startLineZone.bounds.height > this.startLineZone.bounds.width;
    if (isVertical) {
      this.crossingAxis = 'x';
      this.spanAxis = 'y';
      this.forwardVector = { x: 1, y: 0 };
    } else {
      this.crossingAxis = 'y';
      this.spanAxis = 'x';
      this.forwardVector = { x: 0, y: 1 };
    }

    this.loadStoredBestLap();
  }

  update() {
    const state = useGameStore.getState();
    if (!state.runActive || !this.startLineZone) {
      this.resetTracking(state.runActive);
      return;
    }

    if (!this.wasRunActive) {
      this.wasRunActive = true;
      this.lastPosition = { ...state.carPosition };
      this.lapStarted = false;
      return;
    }

    const previous = this.lastPosition;
    const current = state.carPosition;
    if (!previous) {
      this.lastPosition = { ...current };
      return;
    }

    if (this.crossedStartLine(previous, current, state.carVelocity)) {
      if (!this.lapStarted) {
        this.lapStarted = true;
      } else if (state.lap.currentTime >= this.minLapTime) {
        const lapTime = state.lap.currentTime;
        useGameStore.getState().completeLap(lapTime);
        this.persistBestLap();
      }
    }

    this.lastPosition = { ...current };
  }

  private resetTracking(runActive: boolean) {
    if (!runActive) {
      this.wasRunActive = false;
      this.lapStarted = false;
      this.lastPosition = null;
    }
  }

  private crossedStartLine(prev: Vector2, current: Vector2, velocity: Vector2) {
    if (!this.startLineZone) {
      return false;
    }

    const { bounds } = this.startLineZone;
    const center =
      bounds[this.crossingAxis] +
      bounds[this.crossingAxis === 'x' ? 'width' : 'height'] / 2;
    const prevSide = prev[this.crossingAxis] - center;
    const currSide = current[this.crossingAxis] - center;

    const forwardCross =
      this.forwardDirection > 0
        ? prevSide <= 0 && currSide > 0
        : prevSide >= 0 && currSide < 0;

    if (!forwardCross) {
      return false;
    }

    const spanStart = bounds[this.spanAxis];
    const spanEnd =
      spanStart + (this.crossingAxis === 'x' ? bounds.height : bounds.width);
    const prevSpan = prev[this.spanAxis];
    const currSpan = current[this.spanAxis];
    const withinSpan =
      (prevSpan >= spanStart && prevSpan <= spanEnd) ||
      (currSpan >= spanStart && currSpan <= spanEnd);

    if (!withinSpan) {
      return false;
    }

    const forwardVelocity =
      (velocity.x * this.forwardVector.x + velocity.y * this.forwardVector.y) *
      this.forwardDirection;

    return forwardVelocity > 1;
  }

  private async loadStoredBestLap() {
    try {
      const stored = await AsyncStorage.getItem(this.storageKey);
      if (!stored) {
        return;
      }

      const parsed = Number(stored);
      if (!Number.isNaN(parsed)) {
        this.cachedBestLap = parsed;
        useGameStore.getState().hydrateBestLap(parsed);
      }
    } catch (error) {
      console.warn('[LapSystem] Failed to load best lap', error);
    }
  }

  private async persistBestLap() {
    const { lap } = useGameStore.getState();
    if (lap.bestLap === null) {
      return;
    }

    if (this.cachedBestLap !== null && lap.bestLap >= this.cachedBestLap) {
      return;
    }

    this.cachedBestLap = lap.bestLap;
    try {
      await AsyncStorage.setItem(this.storageKey, lap.bestLap.toString());
    } catch (error) {
      console.warn('[LapSystem] Failed to persist best lap', error);
    }
  }
}
