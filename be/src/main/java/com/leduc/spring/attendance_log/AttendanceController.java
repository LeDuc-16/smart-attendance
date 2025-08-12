package com.leduc.spring.attendance_log;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestController
@RequestMapping("/api/faces")
public class AttendanceController {

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public String registerFace(@RequestParam("video") MultipartFile video) {
        System.out.println("📥 Nhận video: " + video.getOriginalFilename());
        System.out.println("Dung lượng: " + video.getSize() + " bytes");

        return "Nhận file thành công!";
    }

    // Bắt lỗi upload quá dung lượng
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<String> handleMaxSizeException(MaxUploadSizeExceededException exc) {
        return ResponseEntity
                .status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body("❌ File quá dung lượng cho phép. Vui lòng quay video ngắn hơn hoặc giảm chất lượng.");
    }
}
