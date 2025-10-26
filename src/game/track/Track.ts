import defaultTrackData from '@assets/tracks/default.json';

export type TrackZoneType = 'asphalt' | 'grass' | 'barrier' | 'startLine';

export type Bounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TrackZone = {
  id: string;
  label?: string;
  type: TrackZoneType;
  bounds: Bounds;
};

export type TrackData = {
  name: string;
  dimensions: {
    width: number;
    height: number;
  };
  zones: TrackZone[];
};

const ZONE_PRIORITY: TrackZoneType[] = ['barrier', 'startLine', 'asphalt', 'grass'];

export const pointInBounds = (point: { x: number; y: number }, bounds: Bounds) =>
  point.x >= bounds.x &&
  point.x <= bounds.x + bounds.width &&
  point.y >= bounds.y &&
  point.y <= bounds.y + bounds.height;

export class Track {
  readonly name: string;
  readonly dimensions: TrackData['dimensions'];
  readonly zones: TrackZone[];

  constructor(config: TrackData) {
    this.name = config.name;
    this.dimensions = config.dimensions;
    this.zones = config.zones;
  }

  getZonesByType(type: TrackZoneType) {
    return this.zones.filter((zone) => zone.type === type);
  }

  getSurfaceAt(x: number, y: number): TrackZoneType {
    for (const type of ZONE_PRIORITY) {
      const match = this.getZonesByType(type).find((zone) =>
        pointInBounds({ x, y }, zone.bounds),
      );
      if (match) {
        return match.type;
      }
    }

    return 'grass';
  }
}

const trackData = defaultTrackData as TrackData;
const defaultTrack = new Track(trackData);

export const getDefaultTrack = () => defaultTrack;
