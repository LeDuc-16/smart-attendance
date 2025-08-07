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
					.name("Admin")
					.account("ADM001")
					.email("ng@gmail.com")
					.password("password")
					.role(ADMIN)
					.build();
			var adminResult = service.createAccount(admin);
			System.out.println("Admin account creation result: " + adminResult.message());
			if (adminResult.data() != null) {
				System.out.println("Admin access token: " + adminResult.data().getAccessToken());
			}

			var teacher = RegisterRequest.builder()
					.name("User")
					.account("TCH001")
					.email("ngnlduc@gmail.com")
					.password("password")
					.role(ADMIN)
					.build();
			var teacherResult = service.createAccount(teacher);
			System.out.println("Teacher account creation result: " + teacherResult.message());
			if (teacherResult.data() != null) {
				System.out.println("Teacher access token: " + teacherResult.data().getAccessToken());
			}

			var student = RegisterRequest.builder()
					.name("Student")
					.account("STD001")
					.email("student@gmail.com")
					.password("password")
					.role(STUDENT)
					.build();
			var studentResult = service.createAccount(student);
			System.out.println("Student account creation result: " + studentResult.message());
			if (studentResult.data() != null) {
				System.out.println("Student access toke: " + studentResult.data().getAccessToken());
			}
		};
	}
}
