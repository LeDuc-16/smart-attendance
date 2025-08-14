#!/bin/bash

# Script để tải xuống face-api models
echo "Tải xuống face-api models..."

# Tạo thư mục models nếu chưa có
mkdir -p assets/models

# URLs của models
declare -a models=(
    "https://raw.githubusercontent.com/vladmandic/face-api/master/model/tiny_face_detector_model-weights_manifest.json"
    "https://raw.githubusercontent.com/vladmandic/face-api/master/model/tiny_face_detector_model-shard1"
    "https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_landmark_68_model-weights_manifest.json"
    "https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_landmark_68_model-shard1"
    "https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_recognition_model-weights_manifest.json"
    "https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_recognition_model-shard1"
    "https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_recognition_model-shard2"
)

# Tải xuống từng model
for url in "${models[@]}"
do
    filename=$(basename "$url")
    echo "Đang tải: $filename"
    curl -L "$url" -o "assets/models/$filename"
done

echo "Hoàn thành tải xuống models!"
