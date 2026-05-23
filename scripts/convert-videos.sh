#!/usr/bin/env bash
# Re-convert mascot videos from the BoardMate Flutter project into web-friendly
# MP4 (H.264) + WebM (VP9) at 720p with audio stripped and faststart enabled.
#
# Usage:  ./scripts/convert-videos.sh
# Requires: ffmpeg on PATH (brew install ffmpeg).

set -euo pipefail

SRC="${SRC:-/Users/balaji/StudioProjects/boardmate/assets/videos}"
DST="${DST:-$(cd "$(dirname "$0")/.." && pwd)/public/assets/videos}"

mkdir -p "$DST"

names=(welcome teaching thinking celebrating)

for name in "${names[@]}"; do
  if [[ ! -f "$SRC/$name.mov" ]]; then
    echo "skip: $SRC/$name.mov not found"
    continue
  fi
  echo "==> $name.mp4"
  ffmpeg -y -loglevel error -i "$SRC/$name.mov" \
    -vf "scale='min(720,iw)':-2" \
    -c:v libx264 -preset slow -crf 24 -movflags +faststart -an \
    "$DST/$name.mp4"
  echo "==> $name.webm"
  ffmpeg -y -loglevel error -i "$SRC/$name.mov" \
    -vf "scale='min(720,iw)':-2" \
    -c:v libvpx-vp9 -b:v 0 -crf 34 -an \
    "$DST/$name.webm"
done

echo "done."
ls -lh "$DST"
