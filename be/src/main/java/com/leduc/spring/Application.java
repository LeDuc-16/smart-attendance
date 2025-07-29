package com.leduc.spring;

import com.leduc.spring.auth.AuthenticationService;
import com.leduc.spring.auth.RegisterRequest;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import static com.leduc.spring.user.Role.ADMIN;
import static com.leduc.spring.user.Role.TEACHER;
import static com.leduc.spring.user.Role.STUDENT;

@SpringBootApplication
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	@Bean
	public CommandLineRunner commandLineRunner(AuthenticationService service) {
		return args -> {
			var admin = RegisterRequest.builder()
					.firstname("Admin")
					.lastname("User")
					.account("ADM001")
					.email("ng@gmail.com")
					.password("password")
					.role(ADMIN)
					.build();
			var adminResult = service.createAccount(admin);
			if (adminResult.statusCode() == 200) {
				System.out.println("Admin token: " + adminResult.data().getAccessToken());
			} else {
				System.err.println("Lỗi tạo Admin: " + adminResult.message());
			}

			var teacher = RegisterRequest.builder()
					.firstname("Teacher")
					.lastname("User")
					.account("TCH001")
					.email("ngnlduc@gmail.com")
					.password("password")
					.role(TEACHER)
					.build();
			var teacherResult = service.createAccount(teacher);
			if (teacherResult.statusCode() == 200) {
				System.out.println("Teacher token: " + teacherResult.data().getAccessToken());
			} else {
				System.err.println("Lỗi tạo Teacher: " + teacherResult.message());
			}

			var student = RegisterRequest.builder()
					.firstname("Student")
					.lastname("User")
					.account("STD001")
					.email("student@gmail.com")
					.password("password")
					.role(STUDENT)
					.build();
			var studentResult = service.createAccount(student);
			if (studentResult.statusCode() == 200) {
				System.out.println("Student token: " + studentResult.data().getAccessToken());
			} else {
				System.err.println("Lỗi tạo Student: " + studentResult.message());
			}
		};
	}
}
