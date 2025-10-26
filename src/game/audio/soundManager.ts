import { Audio } from 'expo-av';
import clickSfx from '@assets/audio/click.mp3';

let configured = false;
let clickSound: Audio.Sound | null = null;
let clickLoadPromise: Promise<void> | null = null;

const configureAudioMode = async () => {
  if (configured) {
    return;
  }

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: false,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
  configured = true;
};

const loadClickSound = async () => {
  if (clickSound) {
    return;
  }
  if (!clickLoadPromise) {
    clickLoadPromise = (async () => {
      await configureAudioMode();
      const { sound } = await Audio.Sound.createAsync(clickSfx, {
        volume: 0.7,
        shouldPlay: false,
      });
      clickSound = sound;
    })();
  }

  await clickLoadPromise;
};

export const playClick = async (enabled: boolean) => {
  if (!enabled) {
    return;
  }

  try {
    await loadClickSound();
    await clickSound?.replayAsync();
  } catch (error) {
    console.warn('[Audio] Failed to play click', error);
  }
};
