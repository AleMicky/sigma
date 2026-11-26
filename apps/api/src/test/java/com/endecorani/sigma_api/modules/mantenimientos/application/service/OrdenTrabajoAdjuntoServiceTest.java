package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.response.OrdenTrabajoAdjuntoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.OrdenTrabajoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoAdjunto;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoAdjuntoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoRepository;
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
class OrdenTrabajoAdjuntoServiceTest {

    @Mock
    private OrdenTrabajoAdjuntoRepository repository;
    @Mock
    private OrdenTrabajoRepository ordenTrabajoRepository;
    @Mock
    private OrdenTrabajoMapper mapper;
    @Mock
    private DocumentStorageService documentStorageService;

    @InjectMocks
    private OrdenTrabajoAdjuntoService service;

    @Test
    void replaceFile_dosReemplazosPdfConsecutivos_generanUuidsNuevosYPreservanArchivoNuevo() {
        UUID adjuntoId = UUID.randomUUID();
        String initialUrl = "/api/v1/files/orden_trabajo_adjuntos/" + UUID.randomUUID() + ".pdf";
        OrdenTrabajoAdjunto domain = OrdenTrabajoAdjunto.builder()
                .id(adjuntoId)
                .ordenTrabajoId(UUID.randomUUID())
                .nombreArchivo("inicial.pdf")
                .tipoMime("application/pdf")
                .tamanio(100L)
                .url(initialUrl)
                .build();

        List<UUID> capturedIds = new ArrayList<>();
        when(repository.findById(adjuntoId)).thenReturn(Optional.of(domain));
        when(documentStorageService.store(eq("orden_trabajo_adjuntos"), any(UUID.class), any(MultipartFile.class)))
                .thenAnswer(inv -> {
                    UUID fileId = inv.getArgument(1);
                    capturedIds.add(fileId);
                    String url = "/api/v1/files/orden_trabajo_adjuntos/" + fileId + ".pdf";
                    return new DocumentStorageService.StoredFile(url, "nuevo.pdf", fileId + ".pdf", "pdf", "application/pdf", 400L);
                });
        when(repository.save(any(OrdenTrabajoAdjunto.class))).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toAdjuntoResponse(any(OrdenTrabajoAdjunto.class))).thenAnswer(inv -> {
            OrdenTrabajoAdjunto a = inv.getArgument(0);
            return new OrdenTrabajoAdjuntoResponse(
                    a.getId(), a.getOrdenTrabajoId(), a.getNombreArchivo(), a.getTipoMime(),
                    a.getTamanio(), a.getUrl(), a.getDescripcion()
            );
        });

        MockMultipartFile pdf1 = new MockMultipartFile("file", "ot1.pdf", "application/pdf", "%PDF-1.4".getBytes());
        OrdenTrabajoAdjuntoResponse r1 = service.replaceFile(adjuntoId, pdf1);
        String url1 = r1.url();

        MockMultipartFile pdf2 = new MockMultipartFile("file", "ot2.pdf", "application/pdf", "%PDF-1.5".getBytes());
        OrdenTrabajoAdjuntoResponse r2 = service.replaceFile(adjuntoId, pdf2);
        String url2 = r2.url();

        assertEquals(2, capturedIds.size());
        assertNotEquals(adjuntoId, capturedIds.get(0));
        assertNotEquals(adjuntoId, capturedIds.get(1));
        assertNotEquals(capturedIds.get(0), capturedIds.get(1));
        assertNotEquals(url1, url2);

        InOrder inOrder = inOrder(documentStorageService, repository);
        inOrder.verify(documentStorageService).store(eq("orden_trabajo_adjuntos"), eq(capturedIds.get(0)), eq(pdf1));
        inOrder.verify(repository).save(domain);
        inOrder.verify(documentStorageService).delete(initialUrl);
        inOrder.verify(documentStorageService).store(eq("orden_trabajo_adjuntos"), eq(capturedIds.get(1)), eq(pdf2));
        inOrder.verify(repository).save(domain);
        inOrder.verify(documentStorageService).delete(url1);

        verify(documentStorageService, never()).delete(url2);
    }

    @Test
    void replaceFile_cuandoStoreFallaValidacion_noEliminaArchivoAnteriorNiGuardaBd() {
        UUID adjuntoId = UUID.randomUUID();
        String existingUrl = "/api/v1/files/orden_trabajo_adjuntos/valido.pdf";
        OrdenTrabajoAdjunto domain = OrdenTrabajoAdjunto.builder()
                .id(adjuntoId)
                .url(existingUrl)
                .build();

        MockMultipartFile invalidFile = new MockMultipartFile("file", "bad.svg", "image/svg+xml", "<svg/>".getBytes());
        when(repository.findById(adjuntoId)).thenReturn(Optional.of(domain));
        when(documentStorageService.store(eq("orden_trabajo_adjuntos"), any(UUID.class), eq(invalidFile)))
                .thenThrow(new BusinessException("INVALID_MIME", "Formato no soportado"));

        assertThrows(BusinessException.class, () -> service.replaceFile(adjuntoId, invalidFile));

        verify(documentStorageService, never()).delete(any());
        verify(repository, never()).save(any());
        assertEquals(existingUrl, domain.getUrl());
    }
}
