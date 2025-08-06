package com.leduc.spring.student;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ImportStudentExcelResponse {
    private List<String> successAccounts;
    private List<String> failedAccounts;
    private int totalImported;
}
