import { Track, TrackData } from './Track';

export type TrackRegistry = Record<string, Track>;

const registry: TrackRegistry = {};

export const registerTrack = (id: string, data: TrackData) => {
  registry[id] = new Track(data);
  return registry[id];
};

export const loadTrack = (id: string) => registry[id];

export const loadTrackFromData = (data: TrackData) => new Track(data);
