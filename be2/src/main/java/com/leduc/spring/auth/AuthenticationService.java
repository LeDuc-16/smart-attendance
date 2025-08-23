package com.leduc.spring.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.leduc.spring.config.JwtService;
import com.leduc.spring.email.EmailDao;
import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.exception.DuplicateResourceException;
import com.leduc.spring.exception.RequestValidationException;
import com.leduc.spring.exception.ResourceNotFoundException;
import com.leduc.spring.lecturer.Lecturer;
import com.leduc.spring.lecturer.LecturerMapper;
import com.leduc.spring.lecturer.LecturerRepository;
import com.leduc.spring.lecturer.LecturerResponse;
import com.leduc.spring.student.Student;
import com.leduc.spring.student.StudentMapper;
import com.leduc.spring.student.StudentRepository;
import com.leduc.spring.student.StudentResponse;
import com.leduc.spring.token.Token;
import com.leduc.spring.token.TokenRepository;
import com.leduc.spring.token.TokenType;
import com.leduc.spring.user.User;
import com.leduc.spring.user.UserDTO;
import com.leduc.spring.user.UserMapper;
import com.leduc.spring.user.UserRepository;
import jakarta.persistence.PersistenceException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
  private final UserRepository repository;
  private final StudentRepository studentRepository;
  private final LecturerRepository lecturerRepository;
  private final TokenRepository tokenRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final AuthenticationManager authenticationManager;
  private final EmailDao emailDao;


  @Transactional
  public ApiResponse<AuthenticationResponse> createAccount(RegisterRequest request) {
    try {
      // Kiểm tra tài khoản đã tồn tại chưa
      if (repository.findByAccount(request.getAccount()).isPresent()) {
        return ApiResponse.error(
                409,
                "Tài khoản đã tồn tại: " + request.getAccount(),
                "/api/v1/auth/register"
        );
      }
      if (repository.findByEmail(request.getEmail()).isPresent()) {
        return ApiResponse.error(
                409,
                "Email đã tồn tại: " + request.getEmail(),
                "/api/v1/auth/register"
        );
      }

      var user = User.builder()
              .name(request.getName())
              .account(request.getAccount())
              .email(request.getEmail())
              .password(passwordEncoder.encode(request.getPassword()))
              .role(request.getRole())
              .build();

      var savedUser = repository.save(user);
      System.out.println("Saved User: " + savedUser.getAccount());

      // Tạo bản ghi phụ thuộc role
      switch (request.getRole()) {
        case STUDENT:
          try {
            // Tạo studentCode tự động
            String studentCode = "STU-" + UUID.randomUUID().toString().substring(0, 8);
            // Kiểm tra studentCode đã tồn tại
            while (studentRepository.existsByStudentCode(studentCode)) {
              studentCode = "STU-" + UUID.randomUUID().toString().substring(0, 8);
            }

            Student student = Student.builder()
                    .user(savedUser)
                    .studentCode(studentCode)
                    .build();
            studentRepository.save(student);
            System.out.println("Saved Student for user: " + savedUser.getAccount() + " with studentCode: " + studentCode);
          } catch (PersistenceException e) {
            System.err.println("Error saving Student: " + e.getMessage());
            throw new RuntimeException("Không thể lưu Student: " + e.getMessage(), e);
          }
          break;
        case LECTURER:
          try {
            // Tạo lecturerCode tự động
            String lecturerCode = "LEC-" + UUID.randomUUID().toString().substring(0, 8);
            // Kiểm tra lecturerCode đã tồn tại
            while (lecturerRepository.existsByLecturerCode(lecturerCode)) {
              lecturerCode = "LEC-" + UUID.randomUUID().toString().substring(0, 8);
            }

            Lecturer lecturer = Lecturer.builder()
                    .user(savedUser)
                    .lecturerCode(lecturerCode)
                    .build();
            lecturerRepository.save(lecturer);
            System.out.println("Saved Lecturer for user: " + savedUser.getAccount() + " with lecturerCode: " + lecturerCode);
          } catch (PersistenceException e) {
            System.err.println("Error saving Lecturer: " + e.getMessage());
            throw new RuntimeException("Không thể lưu Lecturer: " + e.getMessage(), e);
          }
          break;
        default:
          // ADMIN không cần tạo bản ghi phụ
          System.out.println("No additional record needed for ADMIN");
          break;
      }

      var jwtToken = jwtService.generateToken(savedUser);
      var refreshToken = jwtService.generateRefreshToken(savedUser);
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
      System.err.println("Lỗi khi tạo tài khoản: " + e.getMessage());
      return ApiResponse.error(
              500,
              "Lỗi khi tạo tài khoản: " + e.getMessage(),
              "/api/v1/auth/register");
    }
  }



  public ApiResponse<AuthenticationResponse> login(AuthenticationRequest request) {
    User user = repository.findByAccount(request.getAccount())
            .orElseThrow(() -> new ResourceNotFoundException(
                    "Không tìm thấy người dùng với mã tài khoản: " + request.getAccount()));

    authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                    request.getAccount(),
                    request.getPassword()));

    var jwtToken = jwtService.generateToken(user);
    var refreshToken = jwtService.generateRefreshToken(user);

    saveUserToken(user, jwtToken);

    Object userData;
    switch (user.getRole()) {
      case STUDENT:
        userData = studentRepository.findByUserId(user.getId())
                .map(StudentMapper::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên"));
        break;
      case LECTURER:
        userData = lecturerRepository.findByUserId(user.getId())
                .map(LecturerMapper::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên"));
        break;
      default:
        userData = UserMapper.fromEntity(user);
        break;
    }

    AuthenticationResponse response = AuthenticationResponse.builder()
            .accessToken(jwtToken)
            .refreshToken(refreshToken)
            .user(userData)
            .build();

    return ApiResponse.success(
            response,
            "Đăng nhập thành công",
            "/api/v1/auth/login"
    );
  }



  public Object getAccountInfoByRole(User user) {
    switch (user.getRole()) {
      case STUDENT:
        return studentRepository.findById(user.getId())
                .map(StudentMapper::fromEntity)
                .orElseThrow();
      case LECTURER:
        return lecturerRepository.findByUserId(user.getId())
                .map(LecturerMapper::fromEntity)
                .orElseThrow();
      default:
        return UserMapper.fromEntity(user);
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
