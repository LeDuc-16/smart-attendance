package com.leduc.spring.auth;

import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.exception.RequestValidationException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthenticationController {

  private final AuthenticationService service;

  @Operation(summary = "Tạo tài khoản mới", description = "Tạo tài khoản mới trong hệ thống với thông tin người dùng")
  @ApiResponses(value = {
      @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Tạo tài khoản thành công"),
      @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ"),
      @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Email hoặc mã tài khoản đã tồn tại")
  })
  @SecurityRequirement(name = "") // Không yêu cầu authentication
  @PostMapping("/create-account")
  public ResponseEntity<ApiResponse<AuthenticationResponse>> createAccount(
      @RequestBody RegisterRequest request) {
    // Basic validation
    if (request == null) {
      throw new RequestValidationException("Dữ liệu đăng ký không được để trống");
    }

    ApiResponse<AuthenticationResponse> response = service.createAccount(request);

    // Return the response with appropriate HTTP status
    return ResponseEntity.status(response.statusCode()).body(response);
  }

  @Operation(summary = "Đăng nhập", description = "Đăng nhập vào hệ thống bằng mã tài khoản và mật khẩu")
  @ApiResponses(value = {
      @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Đăng nhập thành công"),
      @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ"),
      @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy tài khoản hoặc sai thông tin")
  })
  @SecurityRequirement(name = "") // Không yêu cầu authentication
  @PostMapping("/login")
  public ResponseEntity<ApiResponse<AuthenticationResponse>> authenticate(
      @RequestBody AuthenticationRequest request) {
    // Basic validation
    if (request == null) {
      throw new RequestValidationException("Dữ liệu đăng nhập không được để trống");
    }

    ApiResponse<AuthenticationResponse> response = service.login(request);
    // Return the response with appropriate HTTP status
    return ResponseEntity.status(response.statusCode()).body(response);
  }

  @Operation(summary = "Làm mới token", description = "Làm mới access token bằng refresh token")
  @ApiResponses(value = {
      @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Làm mới token thành công"),
      @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Refresh token không hợp lệ"),
      @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy người dùng")
  })
  @SecurityRequirement(name = "bearerAuth") // Yêu cầu refresh token
  @PostMapping("/refresh-token")
  public void refreshToken(
      HttpServletRequest request,
      HttpServletResponse response) throws IOException {
    // Basic validation
    if (request == null) {
      throw new RequestValidationException("Request không hợp lệ");
    }
    if (response == null) {
      throw new RequestValidationException("Response không hợp lệ");
    }

    service.refreshToken(request, response);
  }
}
