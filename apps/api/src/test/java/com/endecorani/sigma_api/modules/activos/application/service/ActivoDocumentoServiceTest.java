package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoDocumentoResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.ActivoDocumento;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoDocumentoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TiposDocumentoRepository;
import com.endecorani.sigma_api.shared.application.storage.DocumentStorageService;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActivoDocumentoServiceTest {

    @Mock
    private ActivoDocumentoRepository repository;
    @Mock
    private ActivoRepository activoRepository;
    @Mock
    private TiposDocumentoRepository tiposDocumentoRepository;
    @Mock
    private DocumentStorageService documentStorageService;

    @InjectMocks
    private ActivoDocumentoService service;

    @Test
    void replaceFile_dosReemplazosPdfConsecutivos_generanUuidsNuevosYPreservanArchivoNuevo() {
        UUID docId = UUID.randomUUID();
        String initialUrl = "/api/v1/files/activo_documentos/" + UUID.randomUUID() + ".pdf";
        ActivoDocumento domain = ActivoDocumento.builder()
                .id(docId)
                .activoId(UUID.randomUUID())
                .tipoDocumentoId(UUID.randomUUID())
                .nombre("Manual")
                .nombreArchivo("inicial.pdf")
                .rutaArchivo(initialUrl)
                .mimeType("application/pdf")
                .size(100L)
                .build();

        List<UUID> capturedIds = new ArrayList<>();
        when(repository.findById(docId)).thenReturn(Optional.of(domain));
        when(documentStorageService.store(eq("activo_documentos"), any(UUID.class), any(MultipartFile.class)))
                .thenAnswer(inv -> {
                    UUID fileId = inv.getArgument(1);
                    capturedIds.add(fileId);
                    String url = "/api/v1/files/activo_documentos/" + fileId + ".pdf";
                    return new DocumentStorageService.StoredFile(url, "nuevo.pdf", fileId + ".pdf", "pdf", "application/pdf", 250L);
                });
        when(repository.save(any(ActivoDocumento.class))).thenAnswer(inv -> inv.getArgument(0));

        MockMultipartFile pdf1 = new MockMultipartFile("file", "v2.pdf", "application/pdf", "%PDF-1.4".getBytes());
        ActivoDocumentoResponse firstResponse = service.replaceFile(docId, pdf1);
        String urlAfterFirst = firstResponse.rutaArchivo();

        MockMultipartFile pdf2 = new MockMultipartFile("file", "v3.pdf", "application/pdf", "%PDF-1.5".getBytes());
        ActivoDocumentoResponse secondResponse = service.replaceFile(docId, pdf2);
        String urlAfterSecond = secondResponse.rutaArchivo();

        assertEquals(2, capturedIds.size());
        assertNotEquals(docId, capturedIds.get(0));
        assertNotEquals(docId, capturedIds.get(1));
        assertNotEquals(capturedIds.get(0), capturedIds.get(1));
        assertNotEquals(urlAfterFirst, urlAfterSecond);

        InOrder inOrder = inOrder(documentStorageService, repository);
        inOrder.verify(documentStorageService).store(eq("activo_documentos"), eq(capturedIds.get(0)), eq(pdf1));
        inOrder.verify(repository).save(domain);
        inOrder.verify(documentStorageService).delete(initialUrl);
        inOrder.verify(documentStorageService).store(eq("activo_documentos"), eq(capturedIds.get(1)), eq(pdf2));
        inOrder.verify(repository).save(domain);
        inOrder.verify(documentStorageService).delete(urlAfterFirst);

        verify(documentStorageService, never()).delete(urlAfterSecond);
    }

    @Test
    void replaceFile_cuandoStoreFallaValidacion_noEliminaArchivoAnteriorNiGuardaBd() {
        UUID docId = UUID.randomUUID();
        String existingUrl = "/api/v1/files/activo_documentos/valido.pdf";
        ActivoDocumento domain = ActivoDocumento.builder()
                .id(docId)
                .rutaArchivo(existingUrl)
                .nombreArchivo("valido.pdf")
                .build();

        MockMultipartFile invalidFile = new MockMultipartFile("file", "malicioso.html", "text/html", "<script/>".getBytes());
        when(repository.findById(docId)).thenReturn(Optional.of(domain));
        when(documentStorageService.store(eq("activo_documentos"), any(UUID.class), eq(invalidFile)))
                .thenThrow(new BusinessException("INVALID_MIME", "Tipo de archivo no permitido"));

        assertThrows(BusinessException.class, () -> service.replaceFile(docId, invalidFile));

        verify(documentStorageService, never()).delete(any());
        verify(repository, never()).save(any());
        assertEquals(existingUrl, domain.getRutaArchivo());
    }
}
