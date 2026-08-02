package com.endecorani.sigma_api;

import com.endecorani.sigma_api.config.DotEnvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SigmaApiApplication {

	public static void main(String[] args) {
		DotEnvLoader.load();
		SpringApplication.run(SigmaApiApplication.class, args);
	}

}
