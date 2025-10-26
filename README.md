# MiniRacer

MiniRacer is an Expo + React Native playground for experimenting with an arcade micro-racer loop. It ships with a fixed timestep engine, basic track + lap detection, HUD telemetry, and reactive audio to help you iterate quickly.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Start Expo**
   ```bash
   npm run start
   ```
   Use the on-screen prompts (press `i`, `a`, or `w`) or scan the QR code with Expo Go.
3. **Quality gates**
   ```bash
   npm run lint
   npx tsc --noEmit
   ```

## Controls & Settings

- **Touch Zones** – left/right halves steer; press bottom-right to brake.
- **Virtual Joystick** – drag to steer + accelerate from a single thumbstick.
- Swap modes under *Settings* (persisted through `AsyncStorage`).
- Toggle "Sound effects" to mute both engine and UI clicks, or reset best lap data at any time.

## Audio

- `src/assets/audio/engine.mp3`: synthesized loop that keys off car speed. Pitch ranges roughly 0.8–1.3× and volume ramps from ~0.25–0.85.
- `src/assets/audio/click.mp3`: used for UI haptics. Playback is centralized in `src/game/audio/soundManager.ts`.

## Tuning Pointers

- **Physics**: tweak the placeholder numbers in `useGameStore.update` or evolve the `CarModel` in `src/game/physics`.
- **Track Zones**: edit `src/assets/tracks/default.json` for quick layout experiments (asphalt/grass/barrier/startLine). Collision + surface sampling automatically follow.
- **Lap Logic**: adjust `MIN_LAP_TIME` or the forward direction inside `LapSystem` for different circuits.
- **HUD/Rendering**: the car sprite is just a rectangle. Replace with SVG/Canvas (Skia, Reanimated) once visuals matter.

## Project Structure Highlights

- `src/game/loop/FixedStepLoop.ts` – deterministic 60 Hz scheduler.
- `src/game/useGameStore.ts` – zustand store for car state, laps, user settings.
- `src/game/lap/LapSystem.ts` – start-line detection + AsyncStorage persistence.
- `src/screens/GameScreen.tsx` – track rendering, HUD overlay, engine audio control.
- `src/screens/SettingsScreen.tsx` – control mode + audio toggles and best-lap reset.

Happy racing! Modify, profile, and iterate until the telemetry + feel matches your target experience.
