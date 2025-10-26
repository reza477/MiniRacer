import { create } from 'zustand';

type Vector2 = {
  x: number;
  y: number;
};

type LapData = {
  currentTime: number;
  lastTime: number | null;
  bestTime: number | null;
  bestLap: number | null;
  lapCount: number;
  lapTimes: number[];
  currentLap: number;
  distance: number;
};

type GameState = {
  runActive: boolean;
  carPosition: Vector2;
  carVelocity: Vector2;
  angle: number;
  lap: LapData;
  startRun: () => void;
  finishRun: () => void;
  reset: () => void;
  update: (dt: number) => void;
  completeLap: (lapTime: number) => void;
  hydrateBestLap: (bestLap: number) => void;
  settings: {
    inputMode: 'touchZones' | 'joystick';
  };
  setInputMode: (mode: 'touchZones' | 'joystick') => void;
};

const defaultCarState = {
  carPosition: { x: 0, y: 0 },
  carVelocity: { x: 0, y: 0 },
  angle: 0,
};

const initialState: Pick<
  GameState,
  'runActive' | 'carPosition' | 'carVelocity' | 'angle' | 'lap' | 'settings'
> = {
  runActive: false,
  ...defaultCarState,
  lap: {
    currentTime: 0,
    lastTime: null,
    bestTime: null,
    bestLap: null,
    lapCount: 0,
    lapTimes: [],
    currentLap: 1,
    distance: 0,
  },
  settings: {
    inputMode: 'touchZones',
  },
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const angleToVector = (angle: number, magnitude: number): Vector2 => {
  const radians = (angle * Math.PI) / 180;
  return {
    x: Math.cos(radians) * magnitude,
    y: Math.sin(radians) * magnitude,
  };
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,
  startRun: () =>
    set((state) => ({
      ...state,
      ...defaultCarState,
      runActive: true,
      lap: {
        ...state.lap,
        currentTime: 0,
        distance: 0,
        lapTimes: [],
        lapCount: 0,
        currentLap: 1,
        lastTime: null,
      },
    })),
  finishRun: () =>
    set((state) => ({
      ...state,
      runActive: false,
    })),
  reset: () =>
    set((state) => ({
      ...initialState,
      settings: state.settings,
      lap: {
        ...initialState.lap,
        bestLap: state.lap.bestLap,
        bestTime: state.lap.bestLap,
      },
    })),
  setInputMode: (mode) =>
    set((state) => ({
      ...state,
      settings: {
        ...state.settings,
        inputMode: mode,
      },
    })),
  completeLap: (lapTime) =>
    set((state) => {
      const lapTimes = [...state.lap.lapTimes, lapTime];
      const bestLap =
        state.lap.bestLap === null ? lapTime : Math.min(state.lap.bestLap, lapTime);

      return {
        ...state,
        lap: {
          ...state.lap,
          lapTimes,
          lapCount: lapTimes.length,
          lastTime: lapTime,
          bestTime: bestLap,
          bestLap,
          currentLap: state.lap.currentLap + 1,
          currentTime: 0,
          distance: 0,
        },
      };
    }),
  hydrateBestLap: (bestLap) =>
    set((state) => ({
      ...state,
      lap: {
        ...state.lap,
        bestLap,
        bestTime: bestLap,
      },
    })),
  update: (dt) =>
    set((state) => {
      if (!state.runActive) {
        return state;
      }

      const MAX_SPEED = 220;
      const ACCELERATION = 60;
      const TURN_RATE = 12;

      const currentSpeed = Math.hypot(state.carVelocity.x, state.carVelocity.y);
      const nextSpeed = clamp(currentSpeed + ACCELERATION * dt, 0, MAX_SPEED);
      const nextAngle = (state.angle + TURN_RATE * dt) % 360;
      const nextVelocity = angleToVector(nextAngle, nextSpeed);
      const nextPosition = {
        x: state.carPosition.x + nextVelocity.x * dt,
        y: state.carPosition.y + nextVelocity.y * dt,
      };

      return {
        ...state,
        angle: nextAngle,
        carVelocity: nextVelocity,
        carPosition: nextPosition,
        lap: {
          ...state.lap,
          currentTime: state.lap.currentTime + dt,
          distance: state.lap.distance + nextSpeed * dt,
        },
      };
    }),
}));
