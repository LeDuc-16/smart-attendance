package com.leduc.spring.auth;

import com.leduc.spring.exception.RequestValidationException;
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
public class AuthenticationController {

  private final AuthenticationService service;

  @PostMapping("/create-account")
  public ResponseEntity<AuthenticationResponse> createAccount(
      @RequestBody RegisterRequest request) {
    // Basic validation
    if (request == null) {
      throw new RequestValidationException("Dữ liệu đăng ký không được để trống");
    }

    AuthenticationResponse response = service.createAccount(request);
    return ResponseEntity.ok(response);
  }

  @PostMapping("/login")
  public ResponseEntity<AuthenticationResponse> authenticate(
      @RequestBody AuthenticationRequest request) {
    // Basic validation
    if (request == null) {
      throw new RequestValidationException("Dữ liệu đăng nhập không được để trống");
    }

    AuthenticationResponse response = service.login(request);
    return ResponseEntity.ok(response);
  }

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
