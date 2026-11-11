# Landing page footage

The "weekend in three acts" scroll scene (`components/landing/weekend-acts.tsx`)
can play one short clip per day on top of its code-drawn backdrop.

To add a clip:

1. Put `friday.mp4`, `saturday.mp4`, or `sunday.mp4` here, plus a poster frame
   with the same name ending in `.jpg`.
2. Set `video: true` for that act in `weekend-acts.tsx`.

Keep clips phone friendly: about 6 seconds, 720p, no audio track, under 1.5 MB.
For example:

```bash
ffmpeg -i source.mov -t 6 -an -vf "scale=-2:720" -c:v libx264 -crf 28 -movflags +faststart friday.mp4
ffmpeg -i friday.mp4 -frames:v 1 -q:v 4 friday.jpg
```

Only use footage we have the rights to (our own, public domain, or CC0), and
list where each clip came from below.

## Sources

None yet.
