package com.endecorani.sigma_api.shared.application.storage;

import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface DocumentStorageService {

    StoredFile store(String folder, UUID fileId, MultipartFile file);

    void delete(String publicUrl);

    record StoredFile(
            String publicUrl,
            String nombreOriginal,
            String nombreArchivo,
            String extension,
            String mimeType,
            long tamanoBytes
    ) {
    }
}