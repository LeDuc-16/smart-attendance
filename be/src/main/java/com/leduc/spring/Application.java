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
					.email("ng@gmail.com")
					.password("password")
					.role(ADMIN)
					.build();
			System.out.println("Admin token: " + service.register(admin).getAccessToken());

			var teacher = RegisterRequest.builder()
					.firstname("Teacher")
					.lastname("User")
					.email("n@gmail.com")
					.password("password")
					.role(TEACHER)
					.build();
			System.out.println("Teacher token: " + service.register(teacher).getAccessToken());

			var student = RegisterRequest.builder()
					.firstname("Student")
					.lastname("User")
					.email("ngnlduc@gmail.com")
					.password("password")
					.role(STUDENT)
					.build();
			System.out.println("Student token: " + service.register(student).getAccessToken());
		};
	}
}
