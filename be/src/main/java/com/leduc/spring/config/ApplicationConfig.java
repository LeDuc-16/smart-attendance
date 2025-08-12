package com.leduc.spring.config;

import com.leduc.spring.auditing.ApplicationAuditAware;
import com.leduc.spring.user.UserRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.servlet.MultipartConfigElement;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.file.Paths;

import org.springframework.util.unit.DataSize;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

  private final UserRepository repository;

  @Bean
  public MultipartConfigElement multipartConfigElement() {
    MultipartConfigFactory factory = new MultipartConfigFactory();
    factory.setMaxFileSize(DataSize.ofMegabytes(200));
    factory.setMaxRequestSize(DataSize.ofMegabytes(250));
    factory.setLocation(Paths.get(System.getProperty("java.io.tmpdir")).toString());
    return factory.createMultipartConfig();
  }
  
  @Bean
  public UserDetailsService userDetailsService() {
    return username -> {
      // Thử tìm bằng account trước, nếu không thấy thì tìm bằng email
      return repository.findByAccount(username)
          .orElseGet(() -> repository.findByEmail(username)
              .orElseThrow(() -> new UsernameNotFoundException("User not found")));
    };
  }

  @Bean
  public AuthenticationProvider authenticationProvider() {
    DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
    authProvider.setUserDetailsService(userDetailsService());
    authProvider.setPasswordEncoder(passwordEncoder());
    return authProvider;
  }

  @Bean
  public AuditorAware<Long> auditorAware() {
    return new ApplicationAuditAware();
  }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
    return config.getAuthenticationManager();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

}
