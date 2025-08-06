package com.leduc.spring.student;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ImportStudentExcelDTO {
    // USER fields
    private String firstname;
    private String lastname;
    private String email;
    private String account;
    private String password;

    // STUDENT fields
    private String studentCode;
    private String phoneNumber;
    private String address;

    private Long majorId;
    private Long classId;
}
