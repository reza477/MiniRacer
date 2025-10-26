import { CarModel } from './CarModel';
import { Track, pointInBounds } from '@game/track/Track';

const EPSILON = 0.5;

export const resolveBarrierCollision = (car: CarModel, track: Track) => {
  const barrierZone = track
    .getZonesByType('barrier')
    .find((zone) => pointInBounds(car.position, zone.bounds));

  if (!barrierZone) {
    return;
  }

  const { bounds } = barrierZone;
  const distances = {
    left: car.position.x - bounds.x,
    right: bounds.x + bounds.width - car.position.x,
    top: car.position.y - bounds.y,
    bottom: bounds.y + bounds.height - car.position.y,
  };

  const smallest = Object.entries(distances).sort((a, b) => a[1] - b[1])[0][0];

  switch (smallest) {
    case 'left':
      car.position.x = bounds.x - EPSILON;
      if (car.velocity.x > 0) car.velocity.x = 0;
      break;
    case 'right':
      car.position.x = bounds.x + bounds.width + EPSILON;
      if (car.velocity.x < 0) car.velocity.x = 0;
      break;
    case 'top':
      car.position.y = bounds.y - EPSILON;
      if (car.velocity.y > 0) car.velocity.y = 0;
      break;
    case 'bottom':
      car.position.y = bounds.y + bounds.height + EPSILON;
      if (car.velocity.y < 0) car.velocity.y = 0;
      break;
  }

  car.speed = Math.hypot(car.velocity.x, car.velocity.y);
};
