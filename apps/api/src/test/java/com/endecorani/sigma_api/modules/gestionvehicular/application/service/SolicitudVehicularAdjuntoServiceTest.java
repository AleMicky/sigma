package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response.SolicitudVehicularAdjuntoResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.SolicitudVehicularAdjuntoMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SolicitudVehicularAdjunto;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SolicitudVehicularAdjuntoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SolicitudVehicularRepository;
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
class SolicitudVehicularAdjuntoServiceTest {

    @Mock
    private SolicitudVehicularAdjuntoRepository repository;
    @Mock
    private SolicitudVehicularRepository solicitudVehicularRepository;
    @Mock
    private SolicitudVehicularAdjuntoMapper mapper;
    @Mock
    private DocumentStorageService documentStorageService;

    @InjectMocks
    private SolicitudVehicularAdjuntoService service;

    @Test
    void replaceFile_dosReemplazosPdfConsecutivos_generanUuidsNuevosYPreservanArchivoNuevo() {
        UUID adjuntoId = UUID.randomUUID();
        String initialUrl = "/api/v1/files/solicitud_vehicular_adjuntos/" + UUID.randomUUID() + ".pdf";
        SolicitudVehicularAdjunto domain = SolicitudVehicularAdjunto.builder()
                .id(adjuntoId)
                .solicitudVehicularId(UUID.randomUUID())
                .nombreArchivo("inicial.pdf")
                .nombreOriginal("inicial.pdf")
                .url(initialUrl)
                .mimeType("application/pdf")
                .size(100L)
                .build();

        List<UUID> capturedIds = new ArrayList<>();
        when(repository.findById(adjuntoId)).thenReturn(Optional.of(domain));
        when(documentStorageService.store(eq("solicitud_vehicular_adjuntos"), any(UUID.class), any(MultipartFile.class)))
                .thenAnswer(inv -> {
                    UUID fileId = inv.getArgument(1);
                    capturedIds.add(fileId);
                    String url = "/api/v1/files/solicitud_vehicular_adjuntos/" + fileId + ".pdf";
                    return new DocumentStorageService.StoredFile(url, "nuevo.pdf", fileId + ".pdf", "pdf", "application/pdf", 300L);
                });
        when(repository.save(any(SolicitudVehicularAdjunto.class))).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toResponse(any(SolicitudVehicularAdjunto.class))).thenAnswer(inv -> {
            SolicitudVehicularAdjunto a = inv.getArgument(0);
            return new SolicitudVehicularAdjuntoResponse(
                    a.getId(), a.getSolicitudVehicularId(), a.getNombreArchivo(), a.getNombreOriginal(),
                    a.getUrl(), a.getMimeType(), a.getSize(), a.getDescripcion(), null
            );
        });

        MockMultipartFile pdf1 = new MockMultipartFile("file", "r1.pdf", "application/pdf", "%PDF-1.4".getBytes());
        SolicitudVehicularAdjuntoResponse r1 = service.replaceFile(adjuntoId, pdf1);
        String url1 = r1.url();

        MockMultipartFile pdf2 = new MockMultipartFile("file", "r2.pdf", "application/pdf", "%PDF-1.5".getBytes());
        SolicitudVehicularAdjuntoResponse r2 = service.replaceFile(adjuntoId, pdf2);
        String url2 = r2.url();

        assertEquals(2, capturedIds.size());
        assertNotEquals(adjuntoId, capturedIds.get(0));
        assertNotEquals(adjuntoId, capturedIds.get(1));
        assertNotEquals(capturedIds.get(0), capturedIds.get(1));
        assertNotEquals(url1, url2);

        InOrder inOrder = inOrder(documentStorageService, repository);
        inOrder.verify(documentStorageService).store(eq("solicitud_vehicular_adjuntos"), eq(capturedIds.get(0)), eq(pdf1));
        inOrder.verify(repository).save(domain);
        inOrder.verify(documentStorageService).delete(initialUrl);
        inOrder.verify(documentStorageService).store(eq("solicitud_vehicular_adjuntos"), eq(capturedIds.get(1)), eq(pdf2));
        inOrder.verify(repository).save(domain);
        inOrder.verify(documentStorageService).delete(url1);

        verify(documentStorageService, never()).delete(url2);
    }

    @Test
    void replaceFile_cuandoStoreFallaValidacion_noEliminaArchivoAnteriorNiGuardaBd() {
        UUID adjuntoId = UUID.randomUUID();
        String existingUrl = "/api/v1/files/solicitud_vehicular_adjuntos/valido.pdf";
        SolicitudVehicularAdjunto domain = SolicitudVehicularAdjunto.builder()
                .id(adjuntoId)
                .url(existingUrl)
                .build();

        MockMultipartFile invalidFile = new MockMultipartFile("file", "bad.exe", "application/octet-stream", "MZ".getBytes());
        when(repository.findById(adjuntoId)).thenReturn(Optional.of(domain));
        when(documentStorageService.store(eq("solicitud_vehicular_adjuntos"), any(UUID.class), eq(invalidFile)))
                .thenThrow(new BusinessException("INVALID_MIME", "Formato no soportado"));

        assertThrows(BusinessException.class, () -> service.replaceFile(adjuntoId, invalidFile));

        verify(documentStorageService, never()).delete(any());
        verify(repository, never()).save(any());
        assertEquals(existingUrl, domain.getUrl());
    }
}
