# THE PEOPLE WHO SHAPED THE FUTURE — Offline Kiosk

This branch is intentionally separate from `main`.

- `main` = approved online version used for client testing on Vercel.
- `offline-kiosk` = Windows touchscreen/offline exhibition package.
- Do **not** merge this branch into `main` unless the offline architecture is intentionally adopted online later.

## First-time preparation

The first preparation needs internet access once so the approved portrait images can be copied locally.

1. Install Node.js LTS on the exhibition PC.
2. Clone or copy this `offline-kiosk` branch to the PC.
3. Double-click `offline/BUILD-OFFLINE.bat`.
4. Wait until the health check says `SYSTEM READY`.
5. Disconnect Wi-Fi/LAN and double-click `offline/START-EXHIBITION.bat`.
6. Walk through all 12 people, swipe, Previous/Next, QR display and the 90-second idle return.

After the first successful build, the kiosk does not need internet access.

## Starting the exhibition

Double-click:

`offline/START-EXHIBITION.bat`

It starts the local server at:

`http://127.0.0.1:4173`

and opens Chrome or Edge in kiosk mode.

To stop the local server:

`offline/STOP-EXHIBITION.bat`

## Portrait files

Offline portraits live here:

`offline/media/people/`

File names are based on person IDs:

- `ajong.jpg`
- `virul.jpg`
- `prawase.jpg`
- `rawi.jpg`
- `einstein.jpg`
- `asimov.jpg`
- `armstrong.jpg`
- `linus.jpg`
- `beeple.jpg`
- `nolan.jpg`
- `musk.jpg`
- `knuth.jpg`

Recommended portrait format:

- JPG
- 720 × 960 px or larger
- 3:4 portrait ratio
- face/head positioned safely away from the top edge

You can replace a portrait file later using the same filename. **No rebuild is required.** Refresh/reopen the kiosk.

To copy the latest approved online portraits again, connect to the internet and run:

`offline/REFRESH-MEDIA.bat`

## Optional background image/video

Place background media in:

`offline/media/backgrounds/`

Example:

`offline/media/backgrounds/background.mp4`

Then edit:

`offline/content/display.json`

Video example:

```json
{
  "background": {
    "enabled": true,
    "type": "video",
    "src": "/media/backgrounds/background.mp4",
    "opacity": 0.28,
    "fit": "cover"
  }
}
```

Image example:

```json
{
  "background": {
    "enabled": true,
    "type": "image",
    "src": "/media/backgrounds/background.webp",
    "opacity": 0.24,
    "fit": "cover"
  }
}
```

Changing `display.json` or files under `offline/media/` does not require rebuilding the React app.

Recommended background video:

- MP4 / H.264
- 1920×1080
- 30 fps
- muted loop
- keep bitrate moderate for stable all-day playback

## Future videos and sounds

Reserved folders:

- `offline/media/videos/`
- `offline/media/sounds/`

These media files are intentionally outside the React build so future media can be replaced without rebuilding the main UI. A later feature can reference them as `/media/videos/...` or `/media/sounds/...`.

## Health check

Run:

`offline/HEALTH-CHECK.bat`

It checks:

- Node.js
- offline build
- all 12 portraits
- runtime display config
- configured background file (when enabled)

The local server also exposes:

`http://127.0.0.1:4173/__health`

## Auto-start on Windows

After final on-site testing, create a shortcut to `offline/START-EXHIBITION.bat` and place it in:

`Win + R` → `shell:startup`

Recommended exhibition PC settings:

- automatic Windows sign-in for the kiosk account
- disable sleep/hibernate while plugged in
- disable screen saver
- set display scaling and resolution before final calibration
- hide desktop notifications
- disable Windows Update active restarts during exhibition hours
- set BIOS `Restore on AC Power Loss` to On/Last State if supported

## Important acceptance test

Before delivery, physically disconnect Wi-Fi/LAN and verify:

1. Home screen loads.
2. All 12 portraits load.
3. People Archive opens.
4. Every profile opens.
5. Previous / Next works.
6. Swipe works on the touchscreen.
7. QR codes render.
8. Optional local video/background plays.
9. Idle reset returns to Home.
10. Restart the PC and confirm kiosk startup.

QR codes may point to online Google searches. The kiosk PC does not need internet to render them; the visitor's phone needs internet only after scanning.
