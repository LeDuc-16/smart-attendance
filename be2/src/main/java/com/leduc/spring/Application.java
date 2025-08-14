package com.leduc.spring;

import com.leduc.spring.auth.AuthenticationService;
import com.leduc.spring.auth.RegisterRequest;
import com.leduc.spring.s3.S3Buckets;
import com.leduc.spring.s3.S3Service;
import com.leduc.spring.user.Role;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import static com.leduc.spring.user.Role.*;

@SpringBootApplication
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	// Tạo các tài khoản mẫu
	@Bean
	public CommandLineRunner accountRunner(AuthenticationService service) {
		return args -> {
			createUser(service, "ad", "ad", "ng@gmail.com", "ad", ADMIN);
			createUser(service, "lec", "lec", "ngnlduc@gmail.com", "lec", LECTURER);
			createUser(service, "st", "st", "student@gmail.com", "st", STUDENT);
		};
	}

	private void createUser(AuthenticationService service, String name, String account, String email, String password, Role role) {
		var request = RegisterRequest.builder()
				.name(name)
				.account(account)
				.email(email)
				.password(password)
				.role(role)
				.build();
		var result = service.createAccount(request);
		System.out.println(name + " account creation result: " + result.getMessage());
		if (result.getData() != null) {
			System.out.println(name + " access token: " + result.getData().getAccessToken());
		}
	}


	// Test S3 bucket upload/download
	@Bean
	public CommandLineRunner s3TestRunner(S3Service s3Service, S3Buckets s3Buckets) {
		return args -> {
			System.out.println("Testing S3 upload/download...");

			String bucket = s3Buckets.getStudent(); // smartsmart-attendance-student
			String key = "hello";
			byte[] content = "Hello S3 World!".getBytes();

			// Upload
			s3Service.putObject(bucket, key, content, "text/plain");
			System.out.println("Uploaded file to S3: " + key);

			// Download
			byte[] downloaded = s3Service.getObject(bucket, key);
			System.out.println("Downloaded content: " + new String(downloaded));
		};
	}
}
