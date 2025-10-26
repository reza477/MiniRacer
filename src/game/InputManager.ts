import {
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { useGameStore } from '@game/useGameStore';

type TouchModeState = {
  steering: number;
  braking: boolean;
};

type JoystickState = {
  steer: number;
  throttle: number;
};

type InputState = TouchModeState & JoystickState;

type InputMode = 'touchZones' | 'joystick';

type InputHandlers = {
  mode: InputMode;
  touchResponder: ReturnType<(typeof PanResponder)['create']>;
  joystickResponder: ReturnType<(typeof PanResponder)['create']>;
  getState: () => InputState;
  setMode: (mode: InputMode) => void;
};

type Dimensions = { width: number; height: number };

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const createTouchResponder = (
  setState: (updater: (prev: InputState) => InputState) => void,
  dimensions: Dimensions,
) =>
  PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_: GestureResponderEvent, gesture: PanResponderGestureState) => {
      setState((prev) => {
        const isLeft = gesture.moveX < dimensions.width / 2;
        const steering = isLeft ? -1 : 1;
        const braking =
          gesture.moveY > dimensions.height * 0.75 &&
          gesture.moveX > dimensions.width * 0.5;
        return { ...prev, steering, braking };
      });
    },
    onPanResponderRelease: () =>
      setState((prev) => ({ ...prev, steering: 0, braking: false })),
  });

const createJoystickResponder = (
  setState: (updater: (prev: InputState) => InputState) => void,
  center: { x: number; y: number },
  radius: number,
) =>
  PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_: GestureResponderEvent, gesture: PanResponderGestureState) => {
      const dx = gesture.moveX - center.x;
      const dy = center.y - gesture.moveY; // invert for screen coords
      const distance = Math.min(Math.sqrt(dx * dx + dy * dy), radius);
      const normalized = distance / radius;
      const angle = Math.atan2(dy, dx);

      setState((prev) => ({
        ...prev,
        steer: clamp(Math.cos(angle) * normalized, -1, 1),
        throttle: clamp(Math.sin(angle) * normalized, 0, 1),
      }));
    },
    onPanResponderRelease: () => setState((prev) => ({ ...prev, steer: 0, throttle: 0 })),
  });

export const createInputManager = (
  initialMode: InputMode,
  dimensions: Dimensions,
  joystickCenter: { x: number; y: number },
  joystickRadius: number,
): InputHandlers => {
  let currentMode = initialMode;
  const store = useGameStore.getState();
  const setState = (updater: (prev: InputState) => InputState) => {
    inputState = updater(inputState);
  };

  let inputState: InputState = {
    steering: 0,
    braking: false,
    steer: 0,
    throttle: 0,
  };

  const touchResponder = createTouchResponder(setState, dimensions);
  const joystickResponder = createJoystickResponder(
    setState,
    joystickCenter,
    joystickRadius,
  );

  const setMode = (mode: InputMode) => {
    currentMode = mode;
    store.setInputMode(mode);
  };

  const getState = () => inputState;

  return {
    mode: currentMode,
    touchResponder,
    joystickResponder,
    getState,
    setMode,
  };
};
