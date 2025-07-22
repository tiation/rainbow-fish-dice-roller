# Sound Assets

This directory contains sound effects for the Rainbow Fish Dice Roller PWA:

- `dice-roll.mp3` - Sound played when rolling dice (ocean waves + dice clatter)
- `success.mp3` - Pleasant chime for successful rolls
- `critical.mp3` - Celebratory sound for critical successes
- `button-click.mp3` - UI interaction feedback
- `notification.mp3` - System notification sound

## Audio Requirements:

- Format: MP3, OGG, WAV (multiple formats for browser compatibility)
- Volume: Normalized to -12dB
- Duration: 0.5-2 seconds for UI sounds
- Theme: Ocean/underwater ambiance with fish-like sounds

## Sources:

Sound effects should be royalty-free or created specifically for this application.
Suggested sources:
- Freesound.org (CC licensed)
- Generated using WebAudio API
- Custom recordings with ocean/water themes

## Implementation:

Sounds are loaded via Howler.js for optimal browser compatibility and performance.
All sounds are cached for offline playback.
