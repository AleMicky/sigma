package com.endecorani.sigma_api.config.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "app.storage")
public record StorageProperties(
        String baseDir,
        long maxFileSizeBytes,
        List<String> allowedContentTypes
) {
}
