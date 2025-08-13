# Hướng dẫn sử dụng tính năng Import Excel cho sinh viên

## Cấu trúc file Excel cần thiết:

File Excel phải có định dạng `.xlsx` hoặc `.xls` với các cột theo thứ tự:

| Cột A           | Cột B         | Cột C        | Cột D     | Cột E               |
| --------------- | ------------- | ------------ | --------- | ------------------- |
| **StudentCode** | **FirstName** | **LastName** | **Email** | **Password**        |
| Mã sinh viên    | Tên           | Họ           | Email     | Mật khẩu (tùy chọn) |

### Ví dụ dữ liệu:

| StudentCode | FirstName | LastName   | Email               | Password   |
| ----------- | --------- | ---------- | ------------------- | ---------- |
| SV001       | An        | Nguyen Van | an.nguyen@email.com | 123456     |
| SV002       | Binh      | Le Thanh   | binh.le@email.com   |            |
| SV003       | Chi       | Tran Thi   | chi.tran@email.com  | mypassword |

### Lưu ý:

- **StudentCode** (Mã sinh viên): Bắt buộc, duy nhất
- **FirstName** (Tên): Bắt buộc
- **LastName** (Họ): Bắt buộc
- **Email**: Bắt buộc
- **Password** (Mật khẩu): Tùy chọn, nếu để trống sẽ dùng mật khẩu mặc định "123456"

## API Endpoint:

```
POST /api/v1/classes/{classId}/import-students
```

### Phân quyền:

- **ADMIN**: Có thể import sinh viên vào bất kỳ lớp nào
- **TEACHER**: Có thể import sinh viên vào lớp mình phụ trách

### Cách sử dụng:

1. Chuẩn bị file Excel theo định dạng trên
2. Gọi API với `classId` và file Excel
3. Nhận kết quả import với thông tin chi tiết về số lượng thành công/thất bại

### Response format:

````json
### Response format:
```json
{
    "statusCode": 200,
    "message": "Import hoàn tất: 2 thành công, 1 thất bại",
    "path": "/api/v1/classes/1/import-students",
    "timestamp": "2025-08-04T09:38:00",
    "data": {
        "totalProcessed": 3,
        "successCount": 2,
        "failureCount": 1,
        "errors": [
            "Dòng 3: Email đã tồn tại trong hệ thống"
        ]
    }
}
````

### Validation và Error Handling:

Tất cả validation được xử lý tại service layer:

1. **File validation**:

   - File không được để trống
   - Định dạng phải là .xlsx hoặc .xls
   - Kích thước file không vượt quá 5MB
   - File phải có dữ liệu (không chỉ header)

2. **Data validation**:

   - Mã sinh viên không được để trống
   - Tên và họ không được để trống
   - Email không được để trống
   - Password tùy chọn (mặc định: "123456")

3. **Business validation**:
   - Lớp học phải tồn tại
   - Kiểm tra trùng lặp mã sinh viên
   - Kiểm tra trùng lặp email

### Error Codes:

- **400**: Lỗi validation (file, format, size, data)
- **404**: Không tìm thấy lớp học
- **500**: Lỗi hệ thống hoặc đọc file

```

```
