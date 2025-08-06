package com.leduc.spring.attendance_log;

public enum AttendanceStatus {
    PRESENT("Có mặt"),
    ABSENT("Vắng mặt"),
    LATE("Đi muộn"),
    EXCUSED("Vắng có phép");
    
    private final String description;
    
    AttendanceStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
