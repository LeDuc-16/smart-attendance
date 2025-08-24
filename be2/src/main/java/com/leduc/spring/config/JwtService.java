package com.leduc.spring.config;

import com.leduc.spring.exception.ResourceNotFoundException;
import com.leduc.spring.user.User;
import com.leduc.spring.user.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class JwtService {

  @Value("${application.security.jwt.secret-key}")
  private String secretKey;
  @Value("${application.security.jwt.expiration}")
  private long jwtExpiration;
  @Value("${application.security.jwt.refresh-token.expiration}")
  private long refreshExpiration;

  private final UserRepository userRepository;

  public String extractUsername(String token) {
    return extractClaim(token, Claims::getSubject);
  }

  public Long extractUserId(String token) {
    // Giả định userId được lưu trong claims của JWT với key là "userId"
    String userId = extractClaim(token, claims -> claims.get("userId", String.class));
    if (userId == null) {
      // Nếu userId không có trong token, lấy từ UserRepository dựa trên username
      String username = extractUsername(token);
      User user = userRepository.findByAccount(username)
              .orElseThrow(() -> new ResourceNotFoundException("User not found with account: " + username));
      return user.getId();
    }
    try {
      return Long.parseLong(userId);
    } catch (NumberFormatException e) {
      throw new ResourceNotFoundException("Invalid userId format in JWT token: " + userId);
    }
  }

  public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
    final Claims claims = extractAllClaims(token);
    return claimsResolver.apply(claims);
  }

  public String generateToken(UserDetails userDetails) {
    Map<String, Object> extraClaims = new HashMap<>();
    // Thêm userId vào claims nếu cần
    User user = userRepository.findByAccount(userDetails.getUsername())
            .orElseThrow(() -> new ResourceNotFoundException("User not found with account: " + userDetails.getUsername()));
    extraClaims.put("userId", user.getId().toString());
    return generateToken(extraClaims, userDetails);
  }

  public String generateToken(
          Map<String, Object> extraClaims,
          UserDetails userDetails
  ) {
    return buildToken(extraClaims, userDetails, jwtExpiration);
  }

  public String generateRefreshToken(
          UserDetails userDetails
  ) {
    Map<String, Object> extraClaims = new HashMap<>();
    // Thêm userId vào refresh token nếu cần
    User user = userRepository.findByAccount(userDetails.getUsername())
            .orElseThrow(() -> new ResourceNotFoundException("User not found with account: " + userDetails.getUsername()));
    extraClaims.put("userId", user.getId().toString());
    return buildToken(extraClaims, userDetails, refreshExpiration);
  }

  private String buildToken(
          Map<String, Object> extraClaims,
          UserDetails userDetails,
          long expiration
  ) {
    return Jwts
            .builder()
            .setClaims(extraClaims)
            .setSubject(userDetails.getUsername())
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getSignInKey(), SignatureAlgorithm.HS256)
            .compact();
  }

  public boolean isTokenValid(String token, UserDetails userDetails) {
    final String username = extractUsername(token);
    return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
  }

  private boolean isTokenExpired(String token) {
    return extractExpiration(token).before(new Date());
  }

  private Date extractExpiration(String token) {
    return extractClaim(token, Claims::getExpiration);
  }

  private Claims extractAllClaims(String token) {
    return Jwts
            .parser()
            .verifyWith(getSignInKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
  }

  private SecretKey getSignInKey() {
    byte[] keyBytes = Decoders.BASE64.decode(secretKey);
    return Keys.hmacShaKeyFor(keyBytes);
  }

  public User getUserFromToken(String account) {
    return userRepository.findByAccount(account)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with account: " + account));
  }
}