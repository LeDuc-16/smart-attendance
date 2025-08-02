package com.leduc.spring.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.leduc.spring.config.JwtService;
import com.leduc.spring.email.EmailDao;
import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.exception.DuplicateResourceException;
import com.leduc.spring.exception.RequestValidationException;
import com.leduc.spring.exception.ResourceNotFoundException;
import com.leduc.spring.token.Token;
import com.leduc.spring.token.TokenRepository;
import com.leduc.spring.token.TokenType;
import com.leduc.spring.user.User;
import com.leduc.spring.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
  private final UserRepository repository;
  private final TokenRepository tokenRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final AuthenticationManager authenticationManager;
  private final EmailDao emailDao;

  /**
   * Validate register request input
   */
  private void validateRegisterRequest(RegisterRequest request) {
    // Validate required fields using utility methods
    validateRequiredString(request.getEmail(), "Email");
    validatePassword(request.getPassword(), 6);
    validateRequiredString(request.getFirstname(), "Tên");
    validateRequiredString(request.getLastname(), "Họ");
    validateRequiredString(request.getAccount(), "Mã tài khoản");

    // Check if email already exists
    if (repository.findByEmail(request.getEmail()).isPresent()) {
      throw new DuplicateResourceException("Email đã tồn tại trong hệ thống");
    }

    // Check if account already exists
    if (repository.findByAccount(request.getAccount()).isPresent()) {
      throw new DuplicateResourceException("Mã tài khoản đã tồn tại trong hệ thống");
    }
  }

  /**
   * Validate login request input
   */
  private void validateLoginRequest(AuthenticationRequest request) {
    validateRequiredString(request.getAccount(), "Mã tài khoản");
    validateRequiredString(request.getPassword(), "Mật khẩu");
  }

  /**
   * Generic validator utility - validate string fields
   */
  private void validateRequiredString(String value, String fieldName) {
    if (value == null || value.trim().isEmpty()) {
      throw new RequestValidationException(fieldName + " không được để trống");
    }
  }

  /**
   * Validate password with minimum length
   */
  private void validatePassword(String password, int minLength) {
    if (password == null || password.length() < minLength) {
      throw new RequestValidationException("Mật khẩu phải có ít nhất " + minLength + " ký tự");
    }
  }

  public ApiResponse<AuthenticationResponse> createAccount(RegisterRequest request) {
    try {
      // Validate input
      validateRegisterRequest(request);

      var user = User.builder()
          .firstname(request.getFirstname())
          .lastname(request.getLastname())
          .account(request.getAccount())
          .email(request.getEmail())
          .password(passwordEncoder.encode(request.getPassword()))
          .role(request.getRole())
          .build();
      var savedUser = repository.save(user);
      var jwtToken = jwtService.generateToken(user);
      var refreshToken = jwtService.generateRefreshToken(user);
      saveUserToken(savedUser, jwtToken);

      var authResponse = AuthenticationResponse.builder()
          .accessToken(jwtToken)
          .refreshToken(refreshToken)
          .build();

      return ApiResponse.success(authResponse, "Tạo tài khoản thành công", "/api/v1/auth/register");

    } catch (DuplicateResourceException | RequestValidationException e) {
      return ApiResponse.error(
          e instanceof DuplicateResourceException ? 409 : 400,
          e.getMessage(),
          "/api/v1/auth/register");

    } catch (Exception e) {
      return ApiResponse.error(
          500,
          "Lỗi khi tạo tài khoản: " + e.getMessage(),
          "/api/v1/auth/register");
    }
  }

  public ApiResponse<AuthenticationResponse> login(AuthenticationRequest request) {
    try {
      // Validate input - sử dụng hàm validate chung
      validateLoginRequest(request);

      // Tìm user theo account
      User user = repository.findByAccount(request.getAccount())
          .orElseThrow(
              () -> new ResourceNotFoundException(
                  "Không tìm thấy người dùng với mã tài khoản: " + request.getAccount()));

      try {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getAccount(),
                request.getPassword()));
      } catch (Exception e) {
        throw new ResourceNotFoundException("Thông tin đăng nhập không chính xác");
      }

      var jwtToken = jwtService.generateToken(user);
      var refreshToken = jwtService.generateRefreshToken(user);
      revokeAllUserTokens(user);
      saveUserToken(user, jwtToken);

      // Send notification emails
      try {
        emailDao.sendSimpleNotificationEmail(
            user,
            "Hello " + user.getUsername() + ",\nWelcome to my LeDuc Dep Trai App!",
            "Login Notification");

        // Gửi email dạng HTML
        String html = String.format("""
            <html>
              <body>
                <h2 style="color: #2e6c80;">Xin chào %s!</h2>
                <p>Bạn vừa đăng nhập thành công vào lúc <b>%s</b>.</p>
                <p>Chúc bạn một ngày tốt lành cùng với <b>LeDuc Dep Trai App</b> ✨.</p>
              </body>
            </html>
            """, user.getFirstname(), LocalDateTime.now());

        emailDao.sendComplexNotificationEmail(
            user,
            "🔐 Login Notification - LeDuc Dep Trai App",
            html);
      } catch (Exception emailException) {
        // Log email error but don't fail the login process
        System.err.println("Lỗi gửi email thông báo: " + emailException.getMessage());
      }

      var authResponse = AuthenticationResponse.builder()
          .accessToken(jwtToken)
          .refreshToken(refreshToken)
          .build();

      return ApiResponse.success(authResponse, "Đăng nhập thành công!", "/api/v1/auth/login");

    } catch (DuplicateResourceException | RequestValidationException | ResourceNotFoundException e) {
      return ApiResponse.error(
          e instanceof ResourceNotFoundException ? 404 : 400,
          e.getMessage(),
          "/api/v1/auth/login");

    } catch (Exception e) {
      return ApiResponse.error(
          500,
          "Lỗi khi đăng nhập: " + e.getMessage(),
          "/api/v1/auth/login");
    }
  }

  public void saveUserToken(User user, String jwtToken) {
    var token = Token.builder()
        .user(user)
        .token(jwtToken)
        .tokenType(TokenType.BEARER)
        .expired(false)
        .revoked(false)
        .build();
    tokenRepository.save(token);
  }

  public void revokeAllUserTokens(User user) {
    var validUserTokens = tokenRepository.findAllValidTokenByUser(user.getId());
    if (validUserTokens.isEmpty())
      return;
    validUserTokens.forEach(token -> {
      token.setExpired(true);
      token.setRevoked(true);
    });
    tokenRepository.saveAll(validUserTokens);
  }

  public void refreshToken(
      HttpServletRequest request,
      HttpServletResponse response) throws IOException {
    final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
    final String refreshToken;
    final String username;

    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      throw new RequestValidationException("Authorization header không hợp lệ");
    }

    refreshToken = authHeader.substring(7);

    try {
      username = jwtService.extractUsername(refreshToken);
    } catch (Exception e) {
      throw new RequestValidationException("Refresh token không hợp lệ");
    }

    if (username != null) {
      // Tìm user bằng account (username trong JWT chính là account)
      var user = repository.findByAccount(username)
          .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với mã tài khoản: " + username));

      if (jwtService.isTokenValid(refreshToken, user)) {
        try {
          var accessToken = jwtService.generateToken(user);
          revokeAllUserTokens(user);
          saveUserToken(user, accessToken);
          var authResponse = AuthenticationResponse.builder()
              .accessToken(accessToken)
              .refreshToken(refreshToken)
              .build();
          new ObjectMapper().writeValue(response.getOutputStream(), authResponse);
        } catch (Exception e) {
          throw new RuntimeException("Lỗi khi làm mới token: " + e.getMessage());
        }
      } else {
        throw new RequestValidationException("Refresh token đã hết hạn hoặc không hợp lệ");
      }
    } else {
      throw new RequestValidationException("Không thể trích xuất thông tin từ refresh token");
    }
  }
}
