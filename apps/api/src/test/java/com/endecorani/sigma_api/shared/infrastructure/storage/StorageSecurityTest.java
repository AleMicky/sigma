package com.endecorani.sigma_api.shared.infrastructure.storage;

import com.endecorani.sigma_api.config.storage.DocumentStorageProperties;
import com.endecorani.sigma_api.config.storage.StorageProperties;
import com.endecorani.sigma_api.shared.application.storage.DocumentStorageService;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.presentation.controller.StoredFileController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class StorageSecurityTest {

    @TempDir
    Path tempDir;

    private LocalDocumentStorageService documentStorageService;
    private LocalImageStorageService imageStorageService;
    private StoredFileController storedFileController;

    @BeforeEach
    void setUp() {
        StorageProperties storageProperties = new StorageProperties(
                tempDir.toString(),
                5 * 1024 * 1024L,
                List.of("image/jpeg", "image/png", "image/webp", "image/gif")
        );
        DocumentStorageProperties documentProperties = new DocumentStorageProperties(
                20 * 1024 * 1024L,
                List.of(
                        "application/pdf",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        "application/vnd.ms-excel",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        "image/jpeg",
                        "image/png",
                        "image/webp",
                        "image/gif"
                )
        );

        documentStorageService = new LocalDocumentStorageService(documentProperties, storageProperties);
        imageStorageService = new LocalImageStorageService(storageProperties);
        storedFileController = new StoredFileController(imageStorageService);
    }

    @Test
    void documentStore_htmlDisfrazadoComoPdf_debeLanzarBusinessException422() {
        MockMultipartFile htmlDisfrazado = new MockMultipartFile(
                "file",
                "payload.html",
                "application/pdf",
                "<html><script>alert(1)</script></html>".getBytes(StandardCharsets.UTF_8)
        );

        BusinessException ex = assertThrows(
                BusinessException.class,
                () -> documentStorageService.store("activo_documentos", UUID.randomUUID(), htmlDisfrazado)
        );
        assertEquals("INVALID_FILE_SIGNATURE", ex.getCode());
    }

    @Test
    void documentStore_svgDisfrazadoComoPng_debeLanzarBusinessException422() {
        MockMultipartFile svgDisfrazado = new MockMultipartFile(
                "file",
                "vector.svg",
                "image/png",
                "<svg xmlns=\"http://www.w3.org/2000/svg\" onload=\"alert(1)\"/>".getBytes(StandardCharsets.UTF_8)
        );

        BusinessException ex = assertThrows(
                BusinessException.class,
                () -> documentStorageService.store("activo_documentos", UUID.randomUUID(), svgDisfrazado)
        );
        assertEquals("INVALID_FILE_SIGNATURE", ex.getCode());
    }

    @Test
    void documentStore_pdfValidoConNombreMaliciosoHtml_debeDerivarExtensionSoloDelMime() {
        UUID fileId = UUID.randomUUID();
        byte[] pdfBytes = "%PDF-1.7\n1 0 obj\n<<>>\nendobj\n".getBytes(StandardCharsets.US_ASCII);
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "../../xss.html",
                "application/pdf",
                pdfBytes
        );

        DocumentStorageService.StoredFile stored = documentStorageService.store("activo_documentos", fileId, file);

        assertEquals("pdf", stored.extension());
        assertEquals(fileId + ".pdf", stored.nombreArchivo());
        assertEquals("/api/v1/files/activo_documentos/" + fileId + ".pdf", stored.publicUrl());
        assertTrue(Files.exists(tempDir.resolve("activo_documentos").resolve(fileId + ".pdf")));
    }

    @Test
    void documentStore_docxYDocValidos_debenAceptarMagicBytesOffice() {
        byte[] ooxmlBytes = new byte[]{0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00};
        byte[] ole2Bytes = new byte[]{(byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0, (byte) 0xA1, (byte) 0xB1, 0x1A, (byte) 0xE1};

        MockMultipartFile docx = new MockMultipartFile(
                "file",
                "informe.exe",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ooxmlBytes
        );
        MockMultipartFile doc = new MockMultipartFile(
                "file",
                "informe.js",
                "application/msword",
                ole2Bytes
        );

        DocumentStorageService.StoredFile storedDocx = documentStorageService.store("orden_trabajo_adjuntos", UUID.randomUUID(), docx);
        DocumentStorageService.StoredFile storedDoc = documentStorageService.store("orden_trabajo_adjuntos", UUID.randomUUID(), doc);

        assertEquals("docx", storedDocx.extension());
        assertEquals("doc", storedDoc.extension());
    }

    @Test
    void imageStore_mimeFalso_debeRechazarYNoEliminarImagenPrevia() throws Exception {
        UUID entityId = UUID.randomUUID();
        byte[] pngHeader = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D};
        MockMultipartFile validPng = new MockMultipartFile("file", "foto.png", "image/png", pngHeader);

        String url = imageStorageService.store("activos", entityId, validPng);
        assertEquals("/api/v1/files/activos/" + entityId + ".png", url);
        Path savedPath = tempDir.resolve("activos").resolve(entityId + ".png");
        assertTrue(Files.exists(savedPath));

        MockMultipartFile fakePng = new MockMultipartFile(
                "file",
                "evil.png",
                "image/png",
                "<html>fake</html>".getBytes(StandardCharsets.UTF_8)
        );
        BusinessException ex = assertThrows(
                BusinessException.class,
                () -> imageStorageService.store("activos", entityId, fakePng)
        );
        assertEquals("INVALID_FILE_SIGNATURE", ex.getCode());
        assertTrue(Files.exists(savedPath), "La imagen válida previa no debe eliminarse ante una carga falsificada");
    }

    @Test
    void imageStore_jpegWebpGifValidos_debenGuardarCorrectamente() {
        byte[] jpeg = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0};
        byte[] webp = new byte[]{0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50};
        byte[] gif = "GIF89a0000".getBytes(StandardCharsets.US_ASCII);

        assertTrue(imageStorageService.store("conductores", UUID.randomUUID(),
                new MockMultipartFile("file", "a.jpg", "image/jpeg", jpeg)).endsWith(".jpg"));
        assertTrue(imageStorageService.store("conductores", UUID.randomUUID(),
                new MockMultipartFile("file", "b.webp", "image/webp", webp)).endsWith(".webp"));
        assertTrue(imageStorageService.store("conductores", UUID.randomUUID(),
                new MockMultipartFile("file", "c.gif", "image/gif", gif)).endsWith(".gif"));
    }

    @Test
    void storedFileController_carpetaNoPermitidaOPathTraversal_debeLanzarBusinessException() {
        assertThrows(BusinessException.class, () -> storedFileController.getFile("carpeta_privada", "doc.pdf"));
        assertThrows(BusinessException.class, () -> storedFileController.getFile("..", "secret.txt"));
        assertThrows(BusinessException.class, () -> storedFileController.getFile("activos", "../secret.txt"));
    }

    @Test
    void storedFileController_documentosYHtmlLegacy_debenServirseComoAttachmentConNosniff() throws Exception {
        Path docsDir = tempDir.resolve("activo_documentos");
        Files.createDirectories(docsDir);
        Files.write(docsDir.resolve("manual.docx"), new byte[]{0x50, 0x4B, 0x03, 0x04});
        Files.writeString(docsDir.resolve("legacy.html"), "<script>alert(1)</script>");

        ResponseEntity<Resource> docxResp = storedFileController.getFile("activo_documentos", "manual.docx");
        assertTrue(docxResp.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION).startsWith("attachment"));
        assertEquals("nosniff", docxResp.getHeaders().getFirst("X-Content-Type-Options"));

        ResponseEntity<Resource> htmlResp = storedFileController.getFile("activo_documentos", "legacy.html");
        assertTrue(htmlResp.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION).startsWith("attachment"));
        assertEquals(MediaType.APPLICATION_OCTET_STREAM, htmlResp.getHeaders().getContentType());
        assertEquals("nosniff", htmlResp.getHeaders().getFirst("X-Content-Type-Options"));
    }

    @Test
    void storedFileController_imagenesSegurasYPdf_debenServirseComoInlineConNosniff() throws Exception {
        Path imgDir = tempDir.resolve("activos");
        Files.createDirectories(imgDir);
        Files.write(imgDir.resolve("vehiculo.png"), new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A});
        Files.write(imgDir.resolve("ficha.pdf"), "%PDF-1.4\n".getBytes(StandardCharsets.US_ASCII));

        ResponseEntity<Resource> pngResp = storedFileController.getFile("activos", "vehiculo.png");
        assertTrue(pngResp.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION).startsWith("inline"));
        assertEquals(MediaType.IMAGE_PNG, pngResp.getHeaders().getContentType());
        assertEquals("nosniff", pngResp.getHeaders().getFirst("X-Content-Type-Options"));

        ResponseEntity<Resource> pdfResp = storedFileController.getFile("activos", "ficha.pdf");
        assertTrue(pdfResp.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION).startsWith("inline"));
        assertEquals(MediaType.APPLICATION_PDF, pdfResp.getHeaders().getContentType());
        assertEquals("nosniff", pdfResp.getHeaders().getFirst("X-Content-Type-Options"));
    }
}
