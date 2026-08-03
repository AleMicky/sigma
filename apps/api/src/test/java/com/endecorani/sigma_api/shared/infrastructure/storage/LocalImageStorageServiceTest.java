package com.endecorani.sigma_api.shared.infrastructure.storage;

import com.endecorani.sigma_api.config.storage.StorageProperties;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LocalImageStorageServiceTest {

    @TempDir
    Path tempDir;

    private LocalImageStorageService service;

    @BeforeEach
    void setUp() {
        service = new LocalImageStorageService(
                new StorageProperties(
                        tempDir.toString(),
                        1024,
                        List.of("image/jpeg", "image/png")
                )
        );
    }

    @Test
    void storePersistsFileAndReturnsPublicUrl() throws Exception {
        UUID id = UUID.randomUUID();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "foto.png",
                "image/png",
                new byte[] {1, 2, 3, 4}
        );

        String url = service.store("activos", id, file);

        assertEquals("/api/v1/files/activos/" + id + ".png", url);
        assertTrue(Files.exists(tempDir.resolve("activos").resolve(id + ".png")));
    }

    @Test
    void storeRejectsInvalidContentType() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "doc.pdf",
                "application/pdf",
                new byte[] {1, 2, 3}
        );

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.store("activos", UUID.randomUUID(), file)
        );

        assertEquals("INVALID_IMAGE_CONTENT_TYPE", exception.getCode());
    }

    @Test
    void storeRejectsEmptyFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "foto.png",
                "image/png",
                new byte[0]
        );

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.store("activos", UUID.randomUUID(), file)
        );

        assertEquals("INVALID_IMAGE_FILE", exception.getCode());
    }

    @Test
    void deleteRemovesStoredFile() throws Exception {
        UUID id = UUID.randomUUID();
        String url = service.store(
                "activos",
                id,
                new MockMultipartFile(
                        "file",
                        "foto.jpg",
                        "image/jpeg",
                        new byte[] {9, 8, 7}
                )
        );

        service.delete(url);

        assertFalse(Files.exists(tempDir.resolve("activos").resolve(id + ".jpg")));
    }
}
