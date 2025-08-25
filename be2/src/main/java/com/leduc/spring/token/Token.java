package com.leduc.spring.token;

import com.leduc.spring.user.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tokens")
public class Token {

        @Id
        @SequenceGenerator(name = "token_seq", sequenceName = "token_sequence", allocationSize = 1)
        @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "token_seq")
        private Integer id;

        @Column(unique = true)
        public String token;

        @Enumerated(EnumType.STRING)
        @Builder.Default
        public TokenType tokenType = TokenType.BEARER;

        public boolean revoked;

        public boolean expired;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id")
        @JsonIgnore
        public User user;
}
