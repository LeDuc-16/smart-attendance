package com.leduc.spring.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;

@OpenAPIDefinition(info = @Info(contact = @Contact(name = "LeDuc", email = "ngnlduc@gmail.com", url = "https://github.com/ngnlduc"), description = "OpenApi documentation for Smart Attendance System", title = "Smart Attendance API", version = "1.0", license = @License(name = "Licence name", url = "https://some-url.com"), termsOfService = "Terms of service"), servers = {
                @Server(description = "Local ENV", url = "http://localhost:8080"),
                @Server(description = "PROD ENV", url = "https://your-production-url.com")
}, security = {
                @SecurityRequirement(name = "bearerAuth")
})
@SecurityScheme(name = "bearerAuth", description = "JWT auth description", scheme = "bearer", type = SecuritySchemeType.HTTP, bearerFormat = "JWT", in = SecuritySchemeIn.HEADER)
public class OpenApiConfig {

}