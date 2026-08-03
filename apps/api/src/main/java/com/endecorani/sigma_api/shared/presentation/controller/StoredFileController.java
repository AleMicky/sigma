package com.endecorani.sigma_api.shared.presentation.controller;

import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.infrastructure.storage.LocalImageStorageService;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Hidden;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.MalformedURLException;
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
        Path file = imageStorageService.resolveStoredFile(folder, filename);

        if (!Files.exists(file) || !Files.isRegularFile(file)) {
            throw new ResourceNotFoundException("Archivo", filename);
        }

        try {
            Resource resource = new UrlResource(file.toUri());
            String contentType = Files.probeContentType(file);
            MediaType mediaType = contentType != null
                    ? MediaType.parseMediaType(contentType)
                    : MediaType.APPLICATION_OCTET_STREAM;

            return ResponseEntity.ok()
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + filename + "\""
                    )
                    .contentType(mediaType)
                    .body(resource);
        } catch (MalformedURLException exception) {
            throw new ResourceNotFoundException("Archivo", filename);
        } catch (Exception exception) {
            throw new ResourceNotFoundException("Archivo", filename);
        }
    }
}
