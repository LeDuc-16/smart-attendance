package com.leduc.spring;

import com.leduc.spring.auth.AuthenticationService;
import com.leduc.spring.auth.RegisterRequest;
import com.leduc.spring.aws.S3Buckets;
import com.leduc.spring.aws.S3Service;
import com.leduc.spring.user.Role;
import com.leduc.spring.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class Application {

	private final UserRepository userRepository;

	public Application(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	@Bean
	public CommandLineRunner accountRunner(AuthenticationService service) {
		return args -> {
			createUser(service, "ad", "ad", "vinhtlustudy1892004@gmail.com", "ad", Role.ADMIN);
			createUser(service, "lec", "lec", "doanthanhtu16@gmail.com", "lec", Role.LECTURER);
			createUser(service, "st", "st", "student@gmail.com", "st", Role.STUDENT);
		};
	}

	private void createUser(AuthenticationService service, String name, String account, String email, String password, Role role) {
		if (userRepository.findByAccount(account).isEmpty()) {
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
		} else {
			System.out.println(name + " đã tồn tại, bỏ qua.");
		}
	}

	// Giữ nguyên S3 test runner
	@Bean
	public CommandLineRunner s3TestRunner(S3Service s3Service, S3Buckets s3Buckets) {
		return args -> {
			// System.out.println("Testing S3 upload/download...");
			// String bucket = s3Buckets.getStudent();
			// String key = "hello";
			// byte[] content = "Hello S3 World!".getBytes();
			// s3Service.putObject(bucket, key, content, "text/plain");
			// System.out.println("Uploaded file to S3: " + key);
			// byte[] downloaded = s3Service.getObject(bucket, key);
			// System.out.println("Downloaded content: " + new String(downloaded));
			System.out.println("Skipping S3 test for now");
		};
	}
}