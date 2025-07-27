package com.leduc.spring;

import com.leduc.spring.auth.AuthenticationService;
import com.leduc.spring.auth.RegisterRequest;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import static com.leduc.spring.user.Role.ADMIN;

@SpringBootApplication
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	@Bean
	public CommandLineRunner commandLineRunner(
			AuthenticationService service
	) {
		return args -> {
			var admin = RegisterRequest.builder()
					.firstname("Admin")
					.lastname("Admin")
					.email("accc26348@gmail.com")
					.password("password")
					.role(ADMIN)
					.build();
			System.out.println("Admin token: " + service.register(admin).getAccessToken());

			var manager = RegisterRequest.builder()
					.firstname("Admin")
					.lastname("Admin")
					.email("ngnlduc@gmail.com")
					.password("password")
					.role(ADMIN)
					.build();
			System.out.println("Manager token: " + service.register(manager).getAccessToken());

			var friend = RegisterRequest.builder()
					.firstname("Admin")
					.lastname("Admin")
					.email("manhdo1234x@gmail.com")
					.password("password")
					.role(ADMIN)
					.build();
			System.out.println("Friend token: " + service.register(friend).getAccessToken());

		};
	}
}
