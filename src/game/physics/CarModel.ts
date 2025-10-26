type Vector2 = {
  x: number;
  y: number;
};

export type CarParams = {
  maxSpeed: number;
  accel: number;
  brakePower: number;
  friction: number;
  turnRate: number;
};

export type CarControls = {
  accelerate?: boolean;
  brake?: boolean;
  steer?: number; // -1 (left) to 1 (right)
};

export type SurfaceInfo = {
  grip?: number;
  frictionMultiplier?: number;
  drag?: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const normalizeAngle = (angle: number) => {
  let next = angle % 360;
  if (next < 0) {
    next += 360;
  }
  return next;
};

const defaultSurface: Required<SurfaceInfo> = {
  grip: 1,
  frictionMultiplier: 1,
  drag: 0,
};

export class CarModel {
  position: Vector2;
  velocity: Vector2;
  angle: number;
  speed: number;
  private readonly params: CarParams;

  constructor(params: CarParams, initialPosition: Vector2 = { x: 0, y: 0 }, angle = 0) {
    this.params = params;
    this.position = { ...initialPosition };
    this.velocity = { x: 0, y: 0 };
    this.angle = angle;
    this.speed = 0;
  }

  update(dt: number, controls: CarControls = {}, surface: SurfaceInfo = {}) {
    const steerInput = clamp(controls.steer ?? 0, -1, 1);
    const mergedSurface = { ...defaultSurface, ...surface };
    const { accel, brakePower, friction, maxSpeed, turnRate } = this.params;

    let nextSpeed = this.speed;
    if (controls.accelerate) {
      nextSpeed += accel * dt;
    }
    if (controls.brake) {
      nextSpeed -= brakePower * dt;
    }

    const rollingFriction = mergedSurface.frictionMultiplier * friction * nextSpeed;
    nextSpeed -= rollingFriction * dt;
    nextSpeed -= mergedSurface.drag * nextSpeed * nextSpeed * dt;
    nextSpeed = clamp(nextSpeed, 0, maxSpeed);

    const speedFactor = maxSpeed === 0 ? 0 : nextSpeed / maxSpeed;
    const turnAmount = steerInput * turnRate * mergedSurface.grip * dt * speedFactor;
    this.angle = normalizeAngle(this.angle + turnAmount);

    const radians = (this.angle * Math.PI) / 180;
    this.velocity = {
      x: Math.cos(radians) * nextSpeed,
      y: Math.sin(radians) * nextSpeed,
    };

    this.position = {
      x: this.position.x + this.velocity.x * dt,
      y: this.position.y + this.velocity.y * dt,
    };

    this.speed = nextSpeed;
  }
}

export const resetCarToStart = (
  car: CarModel,
  position: Vector2 = { x: 0, y: 0 },
  angle = 0,
) => {
  car.position = { ...position };
  car.velocity = { x: 0, y: 0 };
  car.speed = 0;
  car.angle = angle;
};
