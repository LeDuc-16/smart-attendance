package com.leduc.spring.facedescriptor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckRegistrationResponse {
    private boolean hasRegistered;
    private Long userId;
    private String userName;
}
