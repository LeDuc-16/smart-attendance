import sys, json
import cv2
import face_recognition

video_path = sys.argv[1]  # video input
cap = cv2.VideoCapture(video_path)

descriptors = []
frame_count = 0

while True:
    ret, frame = cap.read()
    if not ret:
        break
    frame_count += 1

    if frame_count % 10 != 0:  # lấy 1 frame mỗi 10 frame
        continue

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    faces = face_recognition.face_locations(rgb_frame)
    encodings = face_recognition.face_encodings(rgb_frame, faces)

    descriptors.extend(encodings)

cap.release()

print(json.dumps({"count": len(descriptors), "descriptors": [d.tolist() for d in descriptors]}))
