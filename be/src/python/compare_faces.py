import sys, json
import face_recognition
import numpy as np

# descriptor lưu trong DB (list 128 số)
stored_descriptor = json.loads(sys.argv[1])
video_path = sys.argv[2]

cap = cv2.VideoCapture(video_path)
frame_count = 0
match_found = False

while True:
    ret, frame = cap.read()
    if not ret:
        break
    frame_count += 1
    if frame_count % 10 != 0:
        continue

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    faces = face_recognition.face_locations(rgb_frame)
    encodings = face_recognition.face_encodings(rgb_frame, faces)

    for encoding in encodings:
        match = face_recognition.compare_faces([np.array(stored_descriptor)], encoding, tolerance=0.45)
        if match[0]:
            match_found = True
            break
    if match_found:
        break

cap.release()
print(json.dumps({"match": match_found}))
