package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.response.OrdenTrabajoActividadEvidenciaResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.OrdenTrabajoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoActividadEvidencia;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoActividadEvidenciaRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringOrdenTrabajoActividadRepository;
import com.endecorani.sigma_api.shared.application.storage.DocumentStorageService;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
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
class OrdenTrabajoActividadEvidenciaServiceTest {

    @Mock
    private OrdenTrabajoActividadEvidenciaRepository repository;
    @Mock
    private SpringOrdenTrabajoActividadRepository actividadRepository;
    @Mock
    private OrdenTrabajoMapper mapper;
    @Mock
    private DocumentStorageService documentStorageService;

    @InjectMocks
    private OrdenTrabajoActividadEvidenciaService service;

    @Test
    void replaceFile_dosReemplazosPdfConsecutivos_generanUuidsNuevosYPreservanArchivoNuevo() {
        UUID evidenciaId = UUID.randomUUID();
        String initialUrl = "/api/v1/files/orden_trabajo_evidencias/" + UUID.randomUUID() + ".pdf";
        OrdenTrabajoActividadEvidencia domain = OrdenTrabajoActividadEvidencia.builder()
                .id(evidenciaId)
                .ordenTrabajoActividadId(UUID.randomUUID())
                .nombreArchivo("inicial.pdf")
                .tipoMime("application/pdf")
                .tamanio(100L)
                .url(initialUrl)
                .build();

        UUID actividadId = domain.getOrdenTrabajoActividadId();
        List<UUID> capturedIds = new ArrayList<>();
        when(actividadRepository.existsById(actividadId)).thenReturn(true);
        when(repository.findByIdAndOrdenTrabajoActividadId(evidenciaId, actividadId)).thenReturn(Optional.of(domain));
        when(documentStorageService.store(eq("orden_trabajo_evidencias"), any(UUID.class), any(MultipartFile.class)))
                .thenAnswer(inv -> {
                    UUID fileId = inv.getArgument(1);
                    capturedIds.add(fileId);
                    String url = "/api/v1/files/orden_trabajo_evidencias/" + fileId + ".pdf";
                    return new DocumentStorageService.StoredFile(url, "evidencia.pdf", fileId + ".pdf", "pdf", "application/pdf", 512L);
                });
        when(repository.save(any(OrdenTrabajoActividadEvidencia.class))).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toEvidenciaResponse(any(OrdenTrabajoActividadEvidencia.class))).thenAnswer(inv -> {
            OrdenTrabajoActividadEvidencia e = inv.getArgument(0);
            return new OrdenTrabajoActividadEvidenciaResponse(
                    e.getId(), e.getOrdenTrabajoActividadId(), e.getNombreArchivo(), e.getTipoMime(),
                    e.getTamanio(), e.getUrl()
            );
        });

        MockMultipartFile pdf1 = new MockMultipartFile("file", "ev1.pdf", "application/pdf", "%PDF-1.4".getBytes());
        OrdenTrabajoActividadEvidenciaResponse r1 = service.replaceFile(actividadId, evidenciaId, pdf1);
        String url1 = r1.url();

        MockMultipartFile pdf2 = new MockMultipartFile("file", "ev2.pdf", "application/pdf", "%PDF-1.5".getBytes());
        OrdenTrabajoActividadEvidenciaResponse r2 = service.replaceFile(actividadId, evidenciaId, pdf2);
        String url2 = r2.url();

        assertEquals(2, capturedIds.size());
        assertNotEquals(evidenciaId, capturedIds.get(0));
        assertNotEquals(evidenciaId, capturedIds.get(1));
        assertNotEquals(capturedIds.get(0), capturedIds.get(1));
        assertNotEquals(url1, url2);

        InOrder inOrder = inOrder(documentStorageService, repository);
        inOrder.verify(documentStorageService).store(eq("orden_trabajo_evidencias"), eq(capturedIds.get(0)), eq(pdf1));
        inOrder.verify(repository).save(domain);
        inOrder.verify(documentStorageService).delete(initialUrl);
        inOrder.verify(documentStorageService).store(eq("orden_trabajo_evidencias"), eq(capturedIds.get(1)), eq(pdf2));
        inOrder.verify(repository).save(domain);
        inOrder.verify(documentStorageService).delete(url1);

        verify(documentStorageService, never()).delete(url2);
    }

    @Test
    void replaceFile_cuandoStoreFallaValidacion_noEliminaArchivoAnteriorNiGuardaBd() {
        UUID evidenciaId = UUID.randomUUID();
        String existingUrl = "/api/v1/files/orden_trabajo_evidencias/valido.pdf";
        OrdenTrabajoActividadEvidencia domain = OrdenTrabajoActividadEvidencia.builder()
                .id(evidenciaId)
                .ordenTrabajoActividadId(UUID.randomUUID())
                .url(existingUrl)
                .build();

        UUID actividadId = domain.getOrdenTrabajoActividadId();
        MockMultipartFile invalidFile = new MockMultipartFile("file", "too-big.pdf", "application/pdf", new byte[10]);
        when(actividadRepository.existsById(actividadId)).thenReturn(true);
        when(repository.findByIdAndOrdenTrabajoActividadId(evidenciaId, actividadId)).thenReturn(Optional.of(domain));
        when(documentStorageService.store(eq("orden_trabajo_evidencias"), any(UUID.class), eq(invalidFile)))
                .thenThrow(new BusinessException("FILE_TOO_LARGE", "El archivo supera el límite permitido"));

        assertThrows(BusinessException.class, () -> service.replaceFile(actividadId, evidenciaId, invalidFile));

        verify(documentStorageService, never()).delete(any());
        verify(repository, never()).save(any());
        assertEquals(existingUrl, domain.getUrl());
    }

    @Test
    void findById_cuandoEvidenciaPerteneceAOtraActividad_debeOcultarlaComo404() {
        UUID actividadId = UUID.randomUUID();
        UUID evidenciaId = UUID.randomUUID();
        when(actividadRepository.existsById(actividadId)).thenReturn(true);
        when(repository.findByIdAndOrdenTrabajoActividadId(evidenciaId, actividadId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.findById(actividadId, evidenciaId));

        verify(repository, never()).findById(any());
    }
}
