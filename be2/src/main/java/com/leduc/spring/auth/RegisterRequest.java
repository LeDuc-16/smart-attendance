package com.leduc.spring.auth;

import com.leduc.spring.user.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

  private String name;
  private String account;
  private String email;
  private String password;
  private Role role;
}
