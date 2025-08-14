package com.leduc.spring.facedescriptor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FaceDescriptorResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String descriptor;
    private String message;
}
