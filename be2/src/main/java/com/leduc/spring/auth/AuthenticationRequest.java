package com.leduc.spring.auth;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationRequest {

  @JsonIgnore
  @Schema(hidden = true)
  private String email;

  @Schema(description = "Mã tài khoản", example = "TCH001", required = true)
  private String account;

  @Schema(description = "Mật khẩu", example = "password", required = true)
  private String password;
}
