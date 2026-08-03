package com.endecorani.sigma_api.config.storage;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({StorageProperties.class, DocumentStorageProperties.class})
public class StorageConfig {
}
