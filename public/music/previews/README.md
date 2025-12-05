# Music Preview Files

This directory contains 30-second preview clips of music tracks for the shop preview system.

## File Naming Convention
- Files should be named exactly as the track IDs used in the shop
- Format: `{trackId}.mp3`
- Duration: 15-30 seconds
- Quality: 128kbps MP3 recommended for web

## Current Track IDs
- `yw1_springdale.mp3` - Springdale Theme from Yo-kai Watch 1
- `yw1_battle_normal.mp3` - Normal Battle Theme from Yo-kai Watch 1
- `yw2_harrisville.mp3` - Harrisville Theme from Yo-kai Watch 2
- `yw3_bbq.mp3` - BBQ Festival Theme from Yo-kai Watch 3
- `yww_medal_moments.mp3` - Medal Moments from Yo-kai Watch World

## Adding New Previews
1. Add the audio file to this directory
2. Ensure the filename matches the track ID in the shop data
3. Test the preview in the shop interface

## Fallback Behavior
If a preview file is not found, the music preview component will:
1. Show a loading state briefly
2. Display an error state
3. Log a warning to the console
4. Not break the shop interface

## Audio Format Requirements
- Format: MP3
- Sample Rate: 44.1kHz
- Bitrate: 128kbps (recommended for web)
- Channels: Stereo
- Duration: 15-30 seconds (30 seconds max for auto-stop)
