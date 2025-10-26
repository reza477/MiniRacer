import { create } from 'zustand';

type GameState = {
  runActive: boolean;
  coins: number;
  topSpeed: number;
  startRun: () => void;
  finishRun: () => void;
  reset: () => void;
};

export const useGameStore = create<GameState>((set) => ({
  runActive: false,
  coins: 0,
  topSpeed: 120,
  startRun: () =>
    set(() => ({
      runActive: true,
      coins: 0,
    })),
  finishRun: () =>
    set((state) => ({
      runActive: false,
      coins: state.coins + Math.floor(Math.random() * 15 + 5),
      topSpeed: Math.max(state.topSpeed, Math.floor(Math.random() * 80) + 120),
    })),
  reset: () => set({ runActive: false, coins: 0, topSpeed: 120 }),
}));
