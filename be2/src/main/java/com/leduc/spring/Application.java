package com.leduc.spring;

import com.leduc.spring.auth.AuthenticationService;
import com.leduc.spring.auth.RegisterRequest;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import static com.leduc.spring.user.Role.ADMIN;
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
					.name("A")
					.account("A")
					.email("ng@gmail.com")
					.password("a")
					.role(ADMIN)
					.build();
			var adminResult = service.createAccount(admin);
			System.out.println("Admin account creation result: " + adminResult.getMessage());
			if (adminResult.getData() != null) {
				System.out.println("Admin access token: " + adminResult.getData().getAccessToken());
			}

			var teacher = RegisterRequest.builder()
					.name("User")
					.account("TCH001")
					.email("ngnlduc@gmail.com")
					.password("password")
					.role(ADMIN)
					.build();
			var teacherResult = service.createAccount(teacher);
			System.out.println("Teacher account creation result: " + teacherResult.getMessage());
			if (teacherResult.getData() != null) {
				System.out.println("Teacher access token: " + teacherResult.getData().getAccessToken());
			}

			var student = RegisterRequest.builder()
					.name("Student")
					.account("STD001")
					.email("student@gmail.com")
					.password("password")
					.role(STUDENT)
					.build();
			var studentResult = service.createAccount(student);
			System.out.println("Student account creation result: " + studentResult.getMessage());
			if (studentResult.getData() != null) {
				System.out.println("Student access token: " + studentResult.getData().getAccessToken());
			}
		};
	}
}