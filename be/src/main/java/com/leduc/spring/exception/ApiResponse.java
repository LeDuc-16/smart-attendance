package com.leduc.spring.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
public record ApiResponse<T>(
        int statusCode,
        String message,
        String path,
        LocalDateTime timestamp,
        T data) {

    // Static factory methods for convenience
    public static <T> ApiResponse<T> success(T data, String message, String path) {
        return new ApiResponse<>(200, message, path, LocalDateTime.now(), data);
    }

    public static <T> ApiResponse<T> error(int statusCode, String message, String path) {
        return new ApiResponse<>(statusCode, message, path, LocalDateTime.now(), null);
    }
}
