package com.leduc.spring.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;

import java.util.List;

@Data
@AllArgsConstructor
public class ApiResponse<T> {
    private int statusCode;
    private String message;
    private String path;
    private T data;

    public static <T> ApiResponse<T> success(T data, String message, String path) {
        return new ApiResponse<>(HttpStatus.OK.value(), message, path, data);
    }

    public static <T> ApiResponse<T> error(int statusCode, String message, String path) {
        return new ApiResponse<>(statusCode, message, path, null);
    }

    // Thêm phương thức mới để hỗ trợ danh sách lỗi
    public static <T> ApiResponse<List<String>> error(HttpStatus status, List<String> errors, String message, String path) {
        return new ApiResponse<>(status.value(), message, path, errors);
    }
}