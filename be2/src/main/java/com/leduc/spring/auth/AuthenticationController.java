package com.leduc.spring.auth;

import com.leduc.spring.exception.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

  // chi admin duoc tao tai khoan
  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping("/create-account")
  public ResponseEntity<ApiResponse<AuthenticationResponse>> createAccount(@RequestBody RegisterRequest request) {
    ApiResponse<AuthenticationResponse> response = service.createAccount(request);
    return ResponseEntity.status(response.getStatusCode()).body(response);
  }

  // ai cung co the login
  @PostMapping("/login")
  public ResponseEntity<ApiResponse<AuthenticationResponse>> authenticate(@RequestBody AuthenticationRequest request) {
    ApiResponse<AuthenticationResponse> response = service.login(request);
    return ResponseEntity.status(response.getStatusCode()).body(response);
  }

  // chi admin
  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping("/refresh-token")
  public void refreshToken(HttpServletRequest request, HttpServletResponse response) throws IOException {
    service.refreshToken(request, response);
  }
}
