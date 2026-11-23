# Contributing

Thanks for helping with Tiny Dungeon.

## Quick start

1. Fork the repo and create a branch: `git checkout -b my-change`
2. Open `index.html` in a browser (or run `npm start`)
3. Make your change
4. Run `npm run check` to validate and solve every room
5. Open a pull request

## Guidelines

- Keep the game as a single dependency-free `index.html`
- Keep the 4-colour Game Boy palette inside the canvas
- Every room must be solvable without taking damage. `npm run check` proves this, and CI runs it on every pull request
- Test on a phone-sized screen. Swipe and tap must keep working
- Keep sound generated in code, with no audio files

## Adding a room

Add a 9x9 map to the `LV` array in `index.html`. The README lists every tile character. Harder rooms go at the end.

## Reporting bugs

Open an issue and include your device, browser, and the room number.
