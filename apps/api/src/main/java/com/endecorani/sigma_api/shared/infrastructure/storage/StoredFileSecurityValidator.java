package com.endecorani.sigma_api.shared.infrastructure.storage;

import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import org.springframework.http.MediaType;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Validaciones centralizadas de seguridad para carga y descarga de archivos locales:
 * whitelist de carpetas, validación de magic bytes y resolución segura de MIME/Content-Disposition.
 */
public final class StoredFileSecurityValidator {

    public static final Set<String> ALLOWED_FOLDERS = Set.of(
            "activos",
            "conductores",
            "activo_documentos",
            "conductor_licencias",
            "solicitud_vehicular_adjuntos",
            "orden_trabajo_evidencias",
            "orden_trabajo_adjuntos",
            "solicitud_mantenimiento_adjuntos",
            "incidente_evidencias"
    );

    private static final Map<String, MediaType> SAFE_MEDIA_TYPE_BY_EXTENSION = Map.ofEntries(
            Map.entry("jpg", MediaType.IMAGE_JPEG),
            Map.entry("jpeg", MediaType.IMAGE_JPEG),
            Map.entry("png", MediaType.IMAGE_PNG),
            Map.entry("webp", MediaType.parseMediaType("image/webp")),
            Map.entry("gif", MediaType.IMAGE_GIF),
            Map.entry("pdf", MediaType.APPLICATION_PDF),
            Map.entry("doc", MediaType.parseMediaType("application/msword")),
            Map.entry("docx", MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document")),
            Map.entry("xls", MediaType.parseMediaType("application/vnd.ms-excel")),
            Map.entry("xlsx", MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
    );

    private static final Set<String> SAFE_INLINE_EXTENSIONS = Set.of(
            "jpg",
            "jpeg",
            "png",
            "webp",
            "gif",
            "pdf"
    );

    private static final byte[] JPEG_MAGIC = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    private static final byte[] PNG_MAGIC = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
    private static final byte[] GIF87A_MAGIC = new byte[]{0x47, 0x49, 0x46, 0x38, 0x37, 0x61};
    private static final byte[] GIF89A_MAGIC = new byte[]{0x47, 0x49, 0x46, 0x38, 0x39, 0x61};
    private static final byte[] RIFF_MAGIC = new byte[]{0x52, 0x49, 0x46, 0x46};
    private static final byte[] WEBP_MAGIC = new byte[]{0x57, 0x45, 0x42, 0x50};
    private static final byte[] PDF_MAGIC = new byte[]{0x25, 0x50, 0x44, 0x46, 0x2D}; // %PDF-
    private static final byte[] ZIP_OOXML_MAGIC = new byte[]{0x50, 0x4B, 0x03, 0x04}; // PK\x03\x04
    private static final byte[] OLE2_MAGIC = new byte[]{(byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0};

    private StoredFileSecurityValidator() {
    }

    public static void validateAllowedFolder(String folder) {
        if (!StringUtils.hasText(folder)
                || folder.contains("..")
                || folder.contains("/")
                || folder.contains("\\")
                || !ALLOWED_FOLDERS.contains(folder)) {
            throw new BusinessException(
                    "INVALID_FILE_FOLDER",
                    "La carpeta de almacenamiento no es válida o no está permitida"
            );
        }
    }

    public static void validateMagicBytes(String normalizedMimeType, MultipartFile file) {
        if (!StringUtils.hasText(normalizedMimeType) || file == null) {
            throw new BusinessException(
                    "INVALID_FILE_SIGNATURE",
                    "No se pudo validar la firma binaria del archivo"
            );
        }

        byte[] header;
        try (InputStream inputStream = file.getInputStream()) {
            header = inputStream.readNBytes(12);
        } catch (IOException ex) {
            throw new BusinessException(
                    "INVALID_FILE_SIGNATURE",
                    "No se pudo leer el contenido del archivo para validar su formato"
            );
        }

        boolean valid = matchesMagicBytes(normalizedMimeType, header);
        if (!valid) {
            throw new BusinessException(
                    "INVALID_FILE_SIGNATURE",
                    "El contenido binario del archivo no coincide con el tipo MIME declarado '%s'"
                            .formatted(normalizedMimeType)
            );
        }
    }

    public static boolean matchesMagicBytes(String normalizedMimeType, byte[] header) {
        if (header == null || header.length == 0 || !StringUtils.hasText(normalizedMimeType)) {
            return false;
        }
        return switch (normalizedMimeType) {
            case "image/jpeg" -> startsWith(header, JPEG_MAGIC);
            case "image/png" -> startsWith(header, PNG_MAGIC);
            case "image/gif" -> startsWith(header, GIF87A_MAGIC) || startsWith(header, GIF89A_MAGIC);
            case "image/webp" -> header.length >= 12
                    && matchesAt(header, 0, RIFF_MAGIC)
                    && matchesAt(header, 8, WEBP_MAGIC);
            case "application/pdf" -> startsWith(header, PDF_MAGIC);
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                 "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ->
                    startsWith(header, ZIP_OOXML_MAGIC);
            case "application/msword",
                 "application/vnd.ms-excel" ->
                    startsWith(header, OLE2_MAGIC);
            default -> false;
        };
    }

    public static MediaType resolveSafeMediaType(String filename) {
        String ext = extractExtension(filename);
        if (ext == null) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
        return SAFE_MEDIA_TYPE_BY_EXTENSION.getOrDefault(ext, MediaType.APPLICATION_OCTET_STREAM);
    }

    public static boolean isSafeForInlineDisposition(String filename) {
        String ext = extractExtension(filename);
        return ext != null && SAFE_INLINE_EXTENSIONS.contains(ext);
    }

    public static String extractExtension(String filename) {
        if (!StringUtils.hasText(filename)) {
            return null;
        }
        int dot = filename.lastIndexOf('.');
        if (dot < 0 || dot >= filename.length() - 1) {
            return null;
        }
        return filename.substring(dot + 1).trim().toLowerCase(Locale.ROOT);
    }

    private static boolean startsWith(byte[] data, byte[] prefix) {
        return matchesAt(data, 0, prefix);
    }

    private static boolean matchesAt(byte[] data, int offset, byte[] expected) {
        if (data.length < offset + expected.length) {
            return false;
        }
        for (int i = 0; i < expected.length; i++) {
            if (data[offset + i] != expected[i]) {
                return false;
            }
        }
        return true;
    }
}
