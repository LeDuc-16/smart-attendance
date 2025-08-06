package com.leduc.spring.student;

import com.leduc.spring.exception.ApiResponse;
import com.leduc.spring.user.Role;
import com.leduc.spring.user.User;
import com.leduc.spring.user.UserRepository;
import com.leduc.spring.classes.ClassRepository;
import com.leduc.spring.major.MajorRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;
    private final MajorRepository majorRepository;
    private final PasswordEncoder passwordEncoder;

    public ApiResponse<ImportStudentExcelResponse> importFromExcel(MultipartFile file, ImportStudentExcelRequest request) {
        List<String> successAccounts = new ArrayList<>();
        List<String> failedAccounts = new ArrayList<>();

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                try {
                    ImportStudentExcelDTO dto = mapRowToDTO(row);

                    if (userRepository.existsByEmail(dto.getEmail())
                            || userRepository.existsByAccount(dto.getAccount())) {
                        failedAccounts.add(dto.getAccount() + ": Email hoặc tài khoản đã tồn tại");
                        continue;
                    }

                    var clazz = classRepository.findById(dto.getClassId())
                            .orElseThrow(() -> new RuntimeException("Lớp không tồn tại"));
                    var major = majorRepository.findById(dto.getMajorId())
                            .orElseThrow(() -> new RuntimeException("Ngành không tồn tại"));

                    // Đếm số sinh viên hiện tại
                    long currentStudentCount = studentRepository.countByClasses_ClassName(clazz.getClassName());
                    if (currentStudentCount >= clazz.getCapacityStudent()) {
                        failedAccounts.add(dto.getAccount() + ": Lớp " + clazz.getClassName() + " đã đủ số lượng sinh viên");
                        continue;
                    }

                    User user = User.builder()
                            .firstname(dto.getFirstname())
                            .lastname(dto.getLastname())
                            .email(dto.getEmail())
                            .account(dto.getAccount())
                            .password(passwordEncoder.encode(dto.getPassword()))
                            .role(Role.STUDENT)
                            .build();

                    User savedUser = userRepository.save(user);

                    Student student = Student.builder()
                            .user(savedUser)
                            .studentCode(dto.getStudentCode())
                            .phoneNumber(dto.getPhoneNumber())
                            .address(dto.getAddress())
                            .major(major)
                            .classes(clazz)
                            .build();

                    studentRepository.save(student);

                    successAccounts.add(dto.getAccount());
                } catch (Exception e) {
                    failedAccounts.add(getCellValue(row.getCell(3)) + ": " + e.getMessage());
                }
            }

        } catch (IOException e) {
            throw new RuntimeException("Không thể đọc file: " + e.getMessage());
        }

        ImportStudentExcelResponse response = ImportStudentExcelResponse.builder()
                .successAccounts(successAccounts)
                .failedAccounts(failedAccounts)
                .totalImported(successAccounts.size() + failedAccounts.size())
                .build();

        return ApiResponse.success(response, "Import sinh viên thành công", "/api/students/import");
    }


    private ImportStudentExcelDTO mapRowToDTO(Row row) {
        return ImportStudentExcelDTO.builder()
                .firstname(getCellValue(row.getCell(0)))
                .lastname(getCellValue(row.getCell(1)))
                .email(getCellValue(row.getCell(2)))
                .account(getCellValue(row.getCell(3)))
                .password(getCellValue(row.getCell(4)))
                .studentCode(getCellValue(row.getCell(5)))
                .phoneNumber(getCellValue(row.getCell(6)))
                .address(getCellValue(row.getCell(7)))
                .majorId(Long.parseLong(getCellValue(row.getCell(8))))
                .classId(Long.parseLong(getCellValue(row.getCell(9))))
                .build();
    }

    private String getCellValue(Cell cell) {
        if (cell == null)
            return "";
        if (cell.getCellType() == CellType.NUMERIC) {
            return String.valueOf((long) cell.getNumericCellValue());
        } else {
            return cell.getStringCellValue().trim();
        }
    }
}
