package com.leduc.spring.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.leduc.spring.config.JwtService;
import com.leduc.spring.email.EmailDao;
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

  public AuthenticationResponse createAccount(RegisterRequest request) {
    // Validate input
    if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
      throw new RequestValidationException("Email không được để trống");
    }
    if (request.getPassword() == null || request.getPassword().length() < 6) {
      throw new RequestValidationException("Mật khẩu phải có ít nhất 6 ký tự");
    }
    if (request.getFirstname() == null || request.getFirstname().trim().isEmpty()) {
      throw new RequestValidationException("Tên không được để trống");
    }
    if (request.getLastname() == null || request.getLastname().trim().isEmpty()) {
      throw new RequestValidationException("Họ không được để trống");
    }
    if (request.getAccount() == null || request.getAccount().trim().isEmpty()) {
      throw new RequestValidationException("Mã tài khoản không được để trống");
    }

    // Check if email already exists
    if (repository.findByEmail(request.getEmail()).isPresent()) {
      throw new DuplicateResourceException("Email đã tồn tại trong hệ thống");
    }

    // Check if account already exists
    if (repository.findByAccount(request.getAccount()).isPresent()) {
      throw new DuplicateResourceException("Mã tài khoản đã tồn tại trong hệ thống");
    }

    try {
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
      return AuthenticationResponse.builder()
          .accessToken(jwtToken)
          .refreshToken(refreshToken)
          .build();
    } catch (Exception e) {
      throw new RuntimeException("Lỗi khi tạo tài khoản: " + e.getMessage());
    }
  }

  public AuthenticationResponse login(AuthenticationRequest request) {
    // Validate input - cần có ít nhất email hoặc account
    if ((request.getEmail() == null || request.getEmail().trim().isEmpty()) &&
        (request.getAccount() == null || request.getAccount().trim().isEmpty())) {
      throw new RequestValidationException("Email hoặc mã tài khoản không được để trống");
    }
    if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
      throw new RequestValidationException("Mật khẩu không được để trống");
    }

    // Tìm user theo email hoặc account
    User user = null;
    String loginIdentifier = "";

    if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
      loginIdentifier = request.getEmail();
      user = repository.findByEmail(request.getEmail()).orElse(null);
    } else if (request.getAccount() != null && !request.getAccount().trim().isEmpty()) {
      loginIdentifier = request.getAccount();
      user = repository.findByAccount(request.getAccount()).orElse(null);
    }

    if (user == null) {
      throw new ResourceNotFoundException("Không tìm thấy người dùng với thông tin đăng nhập: " + loginIdentifier);
    }

    try {
      // Sử dụng email của user để authenticate (vì Spring Security dùng email làm
      // username)
      authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(
              user.getEmail(),
              request.getPassword()));
    } catch (Exception e) {
      throw new ResourceNotFoundException("Thông tin đăng nhập không chính xác");
    }

    try {
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

      return AuthenticationResponse.builder()
          .accessToken(jwtToken)
          .refreshToken(refreshToken)
          .build();
    } catch (Exception e) {
      throw new RuntimeException("Lỗi khi đăng nhập: " + e.getMessage());
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
    final String userEmail;

    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      throw new RequestValidationException("Authorization header không hợp lệ");
    }

    refreshToken = authHeader.substring(7);

    try {
      userEmail = jwtService.extractUsername(refreshToken);
    } catch (Exception e) {
      throw new RequestValidationException("Refresh token không hợp lệ");
    }

    if (userEmail != null) {
      var user = this.repository.findByEmail(userEmail)
          .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

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
