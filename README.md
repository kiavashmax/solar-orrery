# Solar Orrery

Real heliocentric positions of the planets for any date, one sun in the
middle, all orbits concentric.

Live: https://kiavashmax.github.io/solar-orrery/

## Accuracy

Positions come from [Astronomy Engine](https://github.com/cosinekitty/astronomy),
which implements VSOP87 and NOVAS C 3.1. Accuracy is within about one
arcminute for all supported planets.

## Layout

- One sun at the centre.
- Eight evenly spaced concentric orbits (not to scale, for visibility).
- Each planet sits at its real heliocentric longitude for the chosen day.

Planet positions are computed with `Astronomy.HelioVector` and converted
to an angle with `atan2(y, x)`. The SVG y-axis is flipped so the ecliptic
renders counter-clockwise, matching the astronomical convention.

## Smooth motion

The planet angles are interpolated in a `requestAnimationFrame` loop
using the shortest angular path. This means scrubbing the date slider
moves the planets smoothly toward each new position, without the visual
jumps a CSS `transition` would cause.

## Controls

- **Date input** - jump to any day
- **Today** - back to today
- **Random** - a random day between 2000 and 2050
- **Slider** - scrub through 50 years
- **R** - random, **T** - today
- `?date=YYYY-MM-DD` in the URL - share a specific day

## Run

Open `index.html`, or use `run.bat` / `run.sh`.

## License

MIT - see LICENSE. Astronomy Engine is MIT.