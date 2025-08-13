package com.leduc.spring.user;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

  Optional<User> findByEmail(String email);

  Optional<User> findByAccount(String account);

  boolean existsByEmail(String email);

  boolean existsByAccount(String account);

}
