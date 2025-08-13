# Face Recognition API Documentation

## Overview

Hệ thống Face Recognition cho Smart Attendance với các chức năng:

1. Đăng ký khuôn mặt sau khi đăng nhập
2. Lưu trữ face descriptor
3. Điểm danh bằng nhận dạng khuôn mặt

## API Endpoints

### 1. Đăng ký Face Descriptor

**POST** `/api/v1/face-recognition/register`

```json
{
  "descriptor": "face_descriptor_string_from_face_api_js"
}
```

**Response:**

```json
{
  "id": 1,
  "userId": 123,
  "userName": "Nguyễn Văn A",
  "message": "Face descriptor registered successfully"
}
```

### 2. Kiểm tra đã đăng ký khuôn mặt chưa

**GET** `/api/v1/face-recognition/check-registration`

**Response:**

```json
{
  "hasRegistered": true,
  "userId": 123,
  "userName": "Nguyễn Văn A"
}
```

### 3. Lấy descriptor của user hiện tại

**GET** `/api/v1/face-recognition/my-descriptor`

**Response:**

```json
{
  "id": 1,
  "userId": 123,
  "userName": "Nguyễn Văn A",
  "descriptor": "face_descriptor_string"
}
```

### 4. Lấy tất cả descriptors (cho điểm danh)

**GET** `/api/v1/face-recognition/all-descriptors`

**Response:**

```json
[
  {
    "id": 1,
    "userId": 123,
    "userName": "Nguyễn Văn A",
    "descriptor": "descriptor_string_1"
  },
  {
    "id": 2,
    "userId": 124,
    "userName": "Trần Thị B",
    "descriptor": "descriptor_string_2"
  }
]
```

### 5. Điểm danh bằng khuôn mặt

**POST** `/api/v1/face-recognition/attendance`

```json
{
  "descriptor": "face_descriptor_from_camera",
  "threshold": 0.6
}
```

**Response:**

```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "userId": 123,
  "userName": "Nguyễn Văn A",
  "timestamp": "2025-08-12T10:30:00",
  "similarityScore": 0.85
}
```

### 6. Xóa descriptor

**DELETE** `/api/v1/face-recognition/my-descriptor`

## Frontend Integration Flow

### 1. Sau khi đăng nhập thành công:

```javascript
// 1. Kiểm tra đã đăng ký face chưa
const checkResponse = await fetch(
  "/api/v1/face-recognition/check-registration",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

const { hasRegistered } = await checkResponse.json();

if (!hasRegistered) {
  // Chuyển đến trang đăng ký khuôn mặt
  navigation.navigate("FaceRegister");
}
```

### 2. Đăng ký khuôn mặt với face-api.js:

```javascript
import * as faceapi from "face-api.js";

// Load models
await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
await faceapi.nets.faceRecognitionNet.loadFromUri("/models");

// Detect face và tạo descriptor
const detection = await faceapi
  .detectSingleFace(video)
  .withFaceLandmarks()
  .withFaceDescriptor();

if (detection) {
  const descriptor = Array.from(detection.descriptor);

  // Gửi descriptor lên server
  const response = await fetch("/api/v1/face-recognition/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      descriptor: JSON.stringify(descriptor),
    }),
  });

  if (response.ok) {
    Alert.alert("Thành công", "Đăng ký khuôn mặt thành công!");
  }
}
```

### 3. Điểm danh bằng khuôn mặt:

```javascript
// 1. Lấy tất cả descriptors
const allDescriptorsResponse = await fetch(
  "/api/v1/face-recognition/all-descriptors",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

const allDescriptors = await allDescriptorsResponse.json();

// 2. Detect face hiện tại
const detection = await faceapi
  .detectSingleFace(video)
  .withFaceLandmarks()
  .withFaceDescriptor();

if (detection) {
  const currentDescriptor = detection.descriptor;

  // 3. So sánh với tất cả descriptors
  let bestMatch = null;
  let bestDistance = 1.0;

  allDescriptors.forEach((stored) => {
    const storedDescriptor = new Float32Array(JSON.parse(stored.descriptor));
    const distance = faceapi.euclideanDistance(
      currentDescriptor,
      storedDescriptor
    );

    if (distance < bestDistance && distance < 0.6) {
      // threshold
      bestDistance = distance;
      bestMatch = stored;
    }
  });

  if (bestMatch) {
    // Gọi API điểm danh
    const attendanceResponse = await fetch(
      "/api/v1/face-recognition/attendance",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          descriptor: JSON.stringify(Array.from(currentDescriptor)),
          threshold: 0.6,
        }),
      }
    );

    Alert.alert(
      "Thành công",
      `Điểm danh thành công cho ${bestMatch.userName}!`
    );
  } else {
    Alert.alert("Lỗi", "Không nhận dạng được khuôn mặt!");
  }
}
```

## Database Migration

Cần tạo bảng `face_descriptors`:

```sql
CREATE SEQUENCE face_descriptor_sequence START 1 INCREMENT 1;

CREATE TABLE face_descriptors (
    id BIGINT NOT NULL DEFAULT nextval('face_descriptor_sequence'),
    user_id BIGINT NOT NULL,
    descriptor TEXT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (user_id),
    FOREIGN KEY (user_id) REFERENCES _user(id)
);
```

## Notes

1. **Security**: Tất cả API đều require authentication
2. **Face Descriptor**: Sử dụng JSON string để lưu trữ array descriptor
3. **Threshold**: Ngưỡng 0.6 thường cho kết quả tốt (càng thấp càng nghiêm ngặt)
4. **Performance**: Nên cache descriptors ở client để giảm API calls
5. **Error Handling**: Luôn kiểm tra response status và handle errors appropriately
