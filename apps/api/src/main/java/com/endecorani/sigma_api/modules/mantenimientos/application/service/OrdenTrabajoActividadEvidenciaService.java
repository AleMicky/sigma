package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.response.OrdenTrabajoActividadEvidenciaResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.OrdenTrabajoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoActividadEvidencia;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoActividadEvidenciaRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringOrdenTrabajoActividadRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.storage.DocumentStorageService;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrdenTrabajoActividadEvidenciaService {

    private static final String EVIDENCIA_FOLDER = "orden_trabajo_evidencias";

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "nombreArchivo",
            "tipoMime",
            "tamanio",
            "createdAt",
            "updatedAt"
    );

    private final OrdenTrabajoActividadEvidenciaRepository repository;
    private final SpringOrdenTrabajoActividadRepository actividadRepository;
    private final OrdenTrabajoMapper mapper;
    private final DocumentStorageService documentStorageService;

    @Transactional
    public OrdenTrabajoActividadEvidenciaResponse createWithFile(UUID ordenTrabajoActividadId, MultipartFile file) {
        validarActividad(ordenTrabajoActividadId);

        UUID fileId = UUID.randomUUID();
        DocumentStorageService.StoredFile stored = documentStorageService.store(
                EVIDENCIA_FOLDER,
                fileId,
                file
        );

        OrdenTrabajoActividadEvidencia domain = OrdenTrabajoActividadEvidencia.builder()
                .ordenTrabajoActividadId(ordenTrabajoActividadId)
                .nombreArchivo(stored.nombreOriginal())
                .tipoMime(stored.mimeType())
                .tamanio(stored.tamanoBytes())
                .url(stored.publicUrl())
                .build();

        return mapper.toEvidenciaResponse(repository.save(domain));
    }

    @Transactional
    public OrdenTrabajoActividadEvidenciaResponse replaceFile(UUID ordenTrabajoActividadId, UUID id, MultipartFile file) {
        OrdenTrabajoActividadEvidencia domain = obtenerPorId(ordenTrabajoActividadId, id);
        String oldUrl = domain.getUrl();

        UUID fileId = UUID.randomUUID();
        DocumentStorageService.StoredFile stored = documentStorageService.store(
                EVIDENCIA_FOLDER,
                fileId,
                file
        );

        domain.setNombreArchivo(stored.nombreOriginal());
        domain.setTipoMime(stored.mimeType());
        domain.setTamanio(stored.tamanoBytes());
        domain.setUrl(stored.publicUrl());

        OrdenTrabajoActividadEvidencia saved = repository.save(domain);

        if (oldUrl != null && !oldUrl.equals(stored.publicUrl())) {
            documentStorageService.delete(oldUrl);
        }

        return mapper.toEvidenciaResponse(saved);
    }

    @Transactional(readOnly = true)
    public OrdenTrabajoActividadEvidenciaResponse findById(UUID ordenTrabajoActividadId, UUID id) {
        OrdenTrabajoActividadEvidencia domain = obtenerPorId(ordenTrabajoActividadId, id);
        return mapper.toEvidenciaResponse(domain);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrdenTrabajoActividadEvidenciaResponse> findByOrdenTrabajoActividadId(
            UUID ordenTrabajoActividadId,
            PageRequestDto pageRequest
    ) {
        validarActividad(ordenTrabajoActividadId);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<OrdenTrabajoActividadEvidencia> resultado = repository.findByOrdenTrabajoActividadId(ordenTrabajoActividadId, pageable);
        return PageResponse.from(resultado, mapper::toEvidenciaResponse);
    }

    @Transactional
    public void delete(UUID ordenTrabajoActividadId, UUID id) {
        OrdenTrabajoActividadEvidencia domain = obtenerPorId(ordenTrabajoActividadId, id);
        if (domain.getUrl() != null) {
            documentStorageService.delete(domain.getUrl());
        }
        repository.deleteById(id);
    }

    private void validarActividad(UUID ordenTrabajoActividadId) {
        if (ordenTrabajoActividadId == null || !actividadRepository.existsById(ordenTrabajoActividadId)) {
            throw new ResourceNotFoundException("Actividad de orden de trabajo", ordenTrabajoActividadId);
        }
    }

    /** REQ-MANT-002: el ID de la actividad padre es obligatorio; evidencias cruzadas se ocultan como 404. */
    private OrdenTrabajoActividadEvidencia obtenerPorId(UUID ordenTrabajoActividadId, UUID id) {
        validarActividad(ordenTrabajoActividadId);
        return repository.findByIdAndOrdenTrabajoActividadId(id, ordenTrabajoActividadId)
                .orElseThrow(() -> new ResourceNotFoundException("Evidencia de actividad de orden de trabajo", id));
    }
}
