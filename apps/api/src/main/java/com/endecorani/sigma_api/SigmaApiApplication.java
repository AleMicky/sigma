package com.endecorani.sigma_api;

import com.endecorani.sigma_api.config.DotEnvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SigmaApiApplication {

	public static void main(String[] args) {
		// Evita cuelgues de DNS/IPv6 al llamar a Keycloak remoto.
		System.setProperty("java.net.preferIPv4Stack", "true");
		DotEnvLoader.load();
		SpringApplication.run(SigmaApiApplication.class, args);
	}

}
