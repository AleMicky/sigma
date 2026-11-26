package com.endecorani.sigma_api.shared.infrastructure.storage;

import com.endecorani.sigma_api.config.storage.StorageProperties;
import com.endecorani.sigma_api.shared.application.storage.ImageStorageService;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LocalImageStorageService implements ImageStorageService {

    private static final String FILES_PREFIX = ApiConstants.API_V1 + "/files/";

    private static final Map<String, String> EXTENSION_BY_CONTENT_TYPE = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp",
            "image/gif", "gif"
    );

    private final StorageProperties storageProperties;

    @Override
    public String store(String folder, UUID entityId, MultipartFile file) {
        validateFolder(folder);
        validateFile(file);

        String contentType = normalizeContentType(file.getContentType());
        Set<String> allowed = allowedContentTypes();
        String extension = EXTENSION_BY_CONTENT_TYPE.get(contentType);

        if (extension == null || !allowed.contains(contentType)) {
            throw new BusinessException(
                    "INVALID_IMAGE_CONTENT_TYPE",
                    "El tipo de archivo '%s' no está permitido. Use: %s"
                            .formatted(
                                    contentType,
                                    allowedContentTypesLabel()
                            )
            );
        }

        StoredFileSecurityValidator.validateMagicBytes(contentType, file);

        Path directory = resolveFolder(folder);
        try {
            Files.createDirectories(directory);
            deleteExistingFiles(directory, entityId);

            Path target = directory.resolve(entityId + "." + extension).normalize();
            if (!target.startsWith(directory)) {
                throw new BusinessException(
                        "INVALID_IMAGE_PATH",
                        "La ruta del archivo no es válida"
                );
            }
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }

            return FILES_PREFIX + folder + "/" + target.getFileName();
        } catch (IOException exception) {
            log.error("No se pudo guardar la imagen en {}", directory, exception);
            throw new BusinessException(
                    "IMAGE_STORAGE_FAILED",
                    "No se pudo guardar la imagen"
            );
        }
    }

    @Override
    public void delete(String publicUrl) {
        if (!StringUtils.hasText(publicUrl)) {
            return;
        }

        Path file = resolvePublicUrl(publicUrl);
        if (file == null) {
            return;
        }

        try {
            Files.deleteIfExists(file);
        } catch (IOException exception) {
            log.warn("No se pudo eliminar la imagen {}", file, exception);
        }
    }

    public Path resolveStoredFile(String folder, String filename) {
        validateFolder(folder);
        validateFilename(filename);

        Path folderPath = resolveFolder(folder);
        Path file = folderPath.resolve(filename).normalize();
        Path baseDir = baseDir().normalize();

        if (!file.startsWith(folderPath) || !file.startsWith(baseDir)) {
            throw new BusinessException(
                    "INVALID_IMAGE_PATH",
                    "La ruta del archivo no es válida"
            );
        }

        return file;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(
                    "INVALID_IMAGE_FILE",
                    "Debe enviar un archivo de imagen"
            );
        }

        if (file.getSize() > storageProperties.maxFileSizeBytes()) {
            throw new BusinessException(
                    "INVALID_IMAGE_SIZE",
                    "La imagen no puede superar los %d bytes"
                            .formatted(storageProperties.maxFileSizeBytes())
            );
        }
    }

    private void validateFolder(String folder) {
        StoredFileSecurityValidator.validateAllowedFolder(folder);
    }

    private void validateFilename(String filename) {
        if (!StringUtils.hasText(filename)
                || filename.contains("..")
                || filename.contains("/")
                || filename.contains("\\")
                || filename.contains("\0")) {
            throw new BusinessException(
                    "INVALID_IMAGE_FILENAME",
                    "El nombre del archivo no es válido"
            );
        }
    }

    private Path resolvePublicUrl(String publicUrl) {
        String normalized = publicUrl.trim();
        if (!normalized.startsWith(FILES_PREFIX)) {
            return null;
        }

        String relative = normalized.substring(FILES_PREFIX.length());
        String[] parts = relative.split("/");
        if (parts.length != 2) {
            return null;
        }

        try {
            return resolveStoredFile(parts[0], parts[1]);
        } catch (BusinessException exception) {
            return null;
        }
    }

    private Path resolveFolder(String folder) {
        return baseDir().resolve(folder).normalize();
    }

    private Path baseDir() {
        return Paths.get(storageProperties.baseDir()).toAbsolutePath().normalize();
    }

    private void deleteExistingFiles(Path directory, UUID entityId) throws IOException {
        if (!Files.isDirectory(directory)) {
            return;
        }

        String prefix = entityId + ".";
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(
                directory,
                path -> path.getFileName().toString().startsWith(prefix)
        )) {
            for (Path existing : stream) {
                Files.deleteIfExists(existing);
            }
        }
    }

    private String normalizeContentType(String contentType) {
        if (!StringUtils.hasText(contentType)) {
            return "";
        }
        return contentType.split(";")[0].trim().toLowerCase(Locale.ROOT);
    }

    private String allowedContentTypesLabel() {
        Set<String> allowed = allowedContentTypes();
        return allowed.stream().sorted().collect(Collectors.joining(", "));
    }

    private Set<String> allowedContentTypes() {
        if (storageProperties.allowedContentTypes() == null
                || storageProperties.allowedContentTypes().isEmpty()) {
            return EXTENSION_BY_CONTENT_TYPE.keySet();
        }

        return storageProperties.allowedContentTypes().stream()
                .map(this::normalizeContentType)
                .filter(StringUtils::hasText)
                .collect(Collectors.toSet());
    }
}
