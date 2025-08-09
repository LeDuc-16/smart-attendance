package com.leduc.spring.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;
import java.util.stream.Collectors;

@ControllerAdvice
public class DefaultExceptionHandler {

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ApiResponse<Object>> handleException(ResourceNotFoundException e, HttpServletRequest request) {
                ApiResponse<Object> apiResponse = ApiResponse.error(
                        HttpStatus.NOT_FOUND.value(),
                        e.getMessage(),
                        request.getRequestURI());
                return new ResponseEntity<>(apiResponse, HttpStatus.NOT_FOUND);
        }

        @ExceptionHandler(InsufficientAuthenticationException.class)
        public ResponseEntity<ApiResponse<Object>> handleException(InsufficientAuthenticationException e, HttpServletRequest request) {
                ApiResponse<Object> apiResponse = ApiResponse.error(
                        HttpStatus.FORBIDDEN.value(),
                        e.getMessage(),
                        request.getRequestURI());
                return new ResponseEntity<>(apiResponse, HttpStatus.FORBIDDEN);
        }

        @ExceptionHandler(BadCredentialsException.class)
        public ResponseEntity<ApiResponse<Object>> handleException(BadCredentialsException e, HttpServletRequest request) {
                ApiResponse<Object> apiResponse = ApiResponse.error(
                        HttpStatus.UNAUTHORIZED.value(),
                        e.getMessage(),
                        request.getRequestURI());
                return new ResponseEntity<>(apiResponse, HttpStatus.UNAUTHORIZED);
        }

        @ExceptionHandler(DuplicateResourceException.class)
        public ResponseEntity<ApiResponse<Object>> handleException(DuplicateResourceException e, HttpServletRequest request) {
                ApiResponse<Object> apiResponse = ApiResponse.error(
                        HttpStatus.CONFLICT.value(),
                        e.getMessage(),
                        request.getRequestURI());
                return new ResponseEntity<>(apiResponse, HttpStatus.CONFLICT);
        }

        @ExceptionHandler(RequestValidationException.class)
        public ResponseEntity<ApiResponse<Object>> handleException(RequestValidationException e, HttpServletRequest request) {
                ApiResponse<Object> apiResponse = ApiResponse.error(
                        HttpStatus.BAD_REQUEST.value(),
                        e.getMessage(),
                        request.getRequestURI());
                return new ResponseEntity<>(apiResponse, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(IllegalStateException.class)
        public ResponseEntity<ApiResponse<Object>> handleException(IllegalStateException e, HttpServletRequest request) {
                ApiResponse<Object> apiResponse = ApiResponse.error(
                        HttpStatus.BAD_REQUEST.value(),
                        e.getMessage(),
                        request.getRequestURI());
                return new ResponseEntity<>(apiResponse, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ApiResponse<Object>> handleException(IllegalArgumentException e, HttpServletRequest request) {
                ApiResponse<Object> apiResponse = ApiResponse.error(
                        HttpStatus.BAD_REQUEST.value(),
                        e.getMessage(),
                        request.getRequestURI());
                return new ResponseEntity<>(apiResponse, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(ImportException.class)
        public ResponseEntity<ApiResponse<List<String>>> handleImportException(ImportException e, HttpServletRequest request) {
                ApiResponse<List<String>> apiResponse = ApiResponse.error(
                        HttpStatus.BAD_REQUEST,
                        e.getErrors(),
                        e.getMessage(),
                        request.getRequestURI());
                return new ResponseEntity<>(apiResponse, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiResponse<List<String>>> handleValidationException(MethodArgumentNotValidException e, HttpServletRequest request) {
                List<String> errors = e.getBindingResult().getFieldErrors().stream()
                        .map(FieldError::getDefaultMessage)
                        .collect(Collectors.toList());
                ApiResponse<List<String>> apiResponse = ApiResponse.error(
                        HttpStatus.BAD_REQUEST,
                        errors,
                        "Validation failed",
                        request.getRequestURI());
                return new ResponseEntity<>(apiResponse, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiResponse<Object>> handleException(Exception e, HttpServletRequest request) {
                ApiResponse<Object> apiResponse = ApiResponse.error(
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        e.getMessage(),
                        request.getRequestURI());
                return new ResponseEntity<>(apiResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
}