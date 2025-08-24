package com.leduc.spring.student_face_data;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LivenessSessionResponse {
    private String sessionId;
    private String clientRequestToken;
}
