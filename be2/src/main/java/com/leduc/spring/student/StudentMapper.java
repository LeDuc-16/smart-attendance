package com.leduc.spring.student;

public class StudentMapper {
    public static StudentResponse fromEntity(Student student) {
        return StudentResponse.builder()
                .id(student.getId())
                .studentCode(student.getStudentCode())
                .studentName(student.getUser() != null ? student.getUser().getName() : null)
                .className(student.getClasses() != null ? student.getClasses().getClassName() : "N/A")
                .majorName(student.getMajor() != null ? student.getMajor().getMajorName() : null)
                .facultyName(student.getFaculty() != null ? student.getFaculty().getFacultyName() : null)
                .account(student.getUser() != null ? student.getUser().getAccount() : null)
                .email(student.getUser() != null ? student.getUser().getEmail() : null)
                .isRegistered(student.isRegistered()) // Thêm field isRegistered
                .role(student.getUser() != null ? student.getUser().getRole() : null)
                .build();
    }
}
