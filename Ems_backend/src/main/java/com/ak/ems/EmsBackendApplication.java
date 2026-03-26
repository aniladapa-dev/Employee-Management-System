package com.ak.ems;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
@EnableScheduling
public class EmsBackendApplication {

	public static void main(String[] args) {

		// TEMP: Generate password hash
		BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
		String hash = encoder.encode("admin123");
		System.out.println("Generated Hash: " + hash);

		SpringApplication.run(EmsBackendApplication.class, args);
	}
}