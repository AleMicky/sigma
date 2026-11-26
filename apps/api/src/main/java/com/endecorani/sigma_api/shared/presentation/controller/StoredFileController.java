package com.endecorani.sigma_api.shared.presentation.controller;

import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.infrastructure.storage.LocalImageStorageService;
import com.endecorani.sigma_api.shared.infrastructure.storage.StoredFileSecurityValidator;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Hidden;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

@Hidden
@RestController
@RequestMapping(ApiConstants.API_V1 + "/files")
@RequiredArgsConstructor
public class StoredFileController {

    private final LocalImageStorageService imageStorageService;

    @GetMapping("/{folder}/{filename}")
    public ResponseEntity<Resource> getFile(
            @PathVariable String folder,
            @PathVariable String filename
    ) {
        StoredFileSecurityValidator.validateAllowedFolder(folder);
        Path file = imageStorageService.resolveStoredFile(folder, filename);

        if (!Files.exists(file) || !Files.isRegularFile(file)) {
            throw new ResourceNotFoundException("Archivo", filename);
        }

        try {
            Resource resource = new UrlResource(file.toUri());
            MediaType mediaType = StoredFileSecurityValidator.resolveSafeMediaType(filename);
            boolean inline = StoredFileSecurityValidator.isSafeForInlineDisposition(filename);
            ContentDisposition disposition = ContentDisposition.builder(inline ? "inline" : "attachment")
                    .filename(file.getFileName().toString(), StandardCharsets.UTF_8)
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache, must-revalidate")
                    .header("X-Content-Type-Options", "nosniff")
                    .lastModified(Files.getLastModifiedTime(file).toMillis())
                    .contentType(mediaType)
                    .body(resource);
        } catch (IOException exception) {
            throw new ResourceNotFoundException("Archivo", filename);
        }
    }
}
