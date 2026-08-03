package com.endecorani.sigma_api.shared.application.storage;

import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface ImageStorageService {

    String store(String folder, UUID entityId, MultipartFile file);

    void delete(String publicUrl);
}
