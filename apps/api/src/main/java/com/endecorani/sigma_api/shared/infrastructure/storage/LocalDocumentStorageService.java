package com.endecorani.sigma_api.shared.infrastructure.storage;

import com.endecorani.sigma_api.config.storage.DocumentStorageProperties;
import com.endecorani.sigma_api.config.storage.StorageProperties;
import com.endecorani.sigma_api.shared.application.storage.DocumentStorageService;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
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
public class LocalDocumentStorageService implements DocumentStorageService {

    private static final String FILES_PREFIX = ApiConstants.API_V1 + "/files/";

    private static final Map<String, String> EXTENSION_BY_CONTENT_TYPE = Map.ofEntries(
            Map.entry("application/pdf", "pdf"),
            Map.entry("application/msword", "doc"),
            Map.entry("application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"),
            Map.entry("application/vnd.ms-excel", "xls"),
            Map.entry("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"),
            Map.entry("image/jpeg", "jpg"),
            Map.entry("image/png", "png"),
            Map.entry("image/webp", "webp"),
            Map.entry("image/gif", "gif")
    );

    private final DocumentStorageProperties properties;

    private final StorageProperties storageProperties;

    @Override
    public StoredFile store(String folder, UUID fileId, MultipartFile file) {
        validateFolder(folder);
        validateFile(file);

        String mimeType = normalizeContentType(file.getContentType());
        Set<String> allowed = allowedContentTypes();

        if (!allowed.contains(mimeType)) {
            throw new BusinessException(
                    "INVALID_DOCUMENT_CONTENT_TYPE",
                    "El tipo de archivo '%s' no está permitido. Use: %s"
                            .formatted(mimeType, allowedContentTypesLabel())
            );
        }

        String originalFilename = file.getOriginalFilename();
        String extension = resolveExtension(originalFilename, mimeType);
        String nombreArchivo = fileId + "." + extension;

        Path directory = resolveFolder(folder);
        try {
            Files.createDirectories(directory);
            Path target = directory.resolve(nombreArchivo);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }

            String publicUrl = FILES_PREFIX + folder + "/" + nombreArchivo;
            return new StoredFile(
                    publicUrl,
                    StringUtils.hasText(originalFilename) ? originalFilename : nombreArchivo,
                    nombreArchivo,
                    extension,
                    mimeType,
                    file.getSize()
            );
        } catch (IOException exception) {
            log.error("No se pudo guardar el documento en {}", directory, exception);
            throw new BusinessException(
                    "DOCUMENT_STORAGE_FAILED",
                    "No se pudo guardar el documento"
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
            log.warn("No se pudo eliminar el documento {}", file, exception);
        }
    }

    public Path resolveStoredFile(String folder, String filename) {
        validateFolder(folder);
        validateFilename(filename);

        Path file = resolveFolder(folder).resolve(filename).normalize();
        Path baseDir = baseDir().normalize();

        if (!file.startsWith(baseDir)) {
            throw new BusinessException(
                    "INVALID_DOCUMENT_PATH",
                    "La ruta del archivo no es válida"
            );
        }

        return file;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(
                    "INVALID_DOCUMENT_FILE",
                    "Debe enviar un archivo"
            );
        }

        if (file.getSize() > properties.maxFileSizeBytes()) {
            throw new BusinessException(
                    "INVALID_DOCUMENT_SIZE",
                    "El documento no puede superar los %d bytes"
                            .formatted(properties.maxFileSizeBytes())
            );
        }
    }

    private void validateFolder(String folder) {
        if (!StringUtils.hasText(folder)
                || folder.contains("..")
                || folder.contains("/")
                || folder.contains("\\")) {
            throw new BusinessException(
                    "INVALID_DOCUMENT_FOLDER",
                    "La carpeta de almacenamiento no es válida"
            );
        }
    }

    private void validateFilename(String filename) {
        if (!StringUtils.hasText(filename)
                || filename.contains("..")
                || filename.contains("/")
                || filename.contains("\\")) {
            throw new BusinessException(
                    "INVALID_DOCUMENT_FILENAME",
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

    private String normalizeContentType(String contentType) {
        if (!StringUtils.hasText(contentType)) {
            return "";
        }
        return contentType.split(";")[0].trim().toLowerCase(Locale.ROOT);
    }

    private Set<String> allowedContentTypes() {
        if (properties.allowedContentTypes() == null
                || properties.allowedContentTypes().isEmpty()) {
            return EXTENSION_BY_CONTENT_TYPE.keySet();
        }

        return properties.allowedContentTypes().stream()
                .map(this::normalizeContentType)
                .filter(StringUtils::hasText)
                .collect(Collectors.toSet());
    }

    private String allowedContentTypesLabel() {
        return allowedContentTypes().stream().sorted().collect(Collectors.joining(", "));
    }

    private String resolveExtension(String originalFilename, String mimeType) {
        if (StringUtils.hasText(originalFilename)) {
            int dot = originalFilename.lastIndexOf('.');
            if (dot >= 0 && dot < originalFilename.length() - 1) {
                String ext = originalFilename.substring(dot + 1).toLowerCase(Locale.ROOT);
                if (StringUtils.hasText(ext)) {
                    return ext;
                }
            }
        }

        String byMime = EXTENSION_BY_CONTENT_TYPE.get(mimeType);
        if (byMime != null) {
            return byMime;
        }

        throw new BusinessException(
                "INVALID_DOCUMENT_EXTENSION",
                "No se pudo determinar la extensión del archivo"
        );
    }
}