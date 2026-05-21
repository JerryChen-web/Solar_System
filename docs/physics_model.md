# Physics Model

## V0.1 Kepler Mode

The MVP computes approximate positions from J2000 orbital elements. Each orbit uses:

- Semi-major axis in AU.
- Eccentricity.
- Inclination.
- Mean longitude.
- Longitude of perihelion.
- Longitude of ascending node.

The app solves Kepler's equation with Newton-Raphson iteration and then rotates the orbital-plane position into the J2000-like scene frame.

## V0.1 Moon Model

The Moon uses a simplified local orbit around Earth. This is acceptable for the MVP and should be replaced with Horizons state vectors in a later phase.

## N-body Placeholder

The N-body modules define body state vectors, gravitational acceleration, and a Velocity Verlet stepper. The UI exposes the future mode as a placeholder, but V0.1 keeps Kepler mode as the active simulation path.

## Units

All physical values are SI unless a file explicitly declares another unit system. Visual scale is applied only in rendering code.

