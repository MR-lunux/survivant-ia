#!/usr/bin/env python3
"""
Sample frames from a video at SAMPLE_FPS, detect the face center via MediaPipe
Tasks Vision FaceDetector, and emit JSON to stdout:
  { "width", "height", "track": [{ "t", "cx", "cy" }] }

Usage: track-face.py <video-path>

The blaze_face_short_range model is downloaded once on first use into
~/.local/mediapipe-models/ (~230 KB).
"""

import sys
import json
import os
import urllib.request
import cv2
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision

SAMPLE_FPS = 5
DETECTION_CONFIDENCE = 0.5
MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite"
MODEL_PATH = os.path.expanduser("~/.local/mediapipe-models/blaze_face_short_range.tflite")


def ensure_model() -> str:
    if not os.path.exists(MODEL_PATH):
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        print(f"Downloading face detection model to {MODEL_PATH}", file=sys.stderr)
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
    return MODEL_PATH


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: track-face.py <video-path>", file=sys.stderr)
        return 1

    video_path = sys.argv[1]
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Cannot open video: {video_path}", file=sys.stderr)
        return 2

    source_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    sample_every_n = max(1, round(source_fps / SAMPLE_FPS))

    base_options = mp_python.BaseOptions(model_asset_path=ensure_model())
    options = mp_vision.FaceDetectorOptions(
        base_options=base_options,
        min_detection_confidence=DETECTION_CONFIDENCE,
    )
    detector = mp_vision.FaceDetector.create_from_options(options)

    track = []
    frame_idx = 0
    last_detection = None
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_idx % sample_every_n == 0:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
            result = detector.detect(mp_image)
            t = round(frame_idx / source_fps, 3)
            if result.detections:
                box = result.detections[0].bounding_box
                cx = round(box.origin_x + box.width / 2, 1)
                cy = round(box.origin_y + box.height / 2, 1)
                h = round(box.height, 1)
                track.append({"t": t, "cx": cx, "cy": cy, "h": h})
                last_detection = (cx, cy, h)
            elif last_detection is not None:
                track.append({"t": t, "cx": last_detection[0], "cy": last_detection[1], "h": last_detection[2]})

        frame_idx += 1

    cap.release()
    detector.close()

    print(json.dumps({"width": width, "height": height, "track": track}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
