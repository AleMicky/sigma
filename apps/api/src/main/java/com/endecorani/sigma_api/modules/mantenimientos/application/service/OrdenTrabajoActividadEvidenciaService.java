package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.OrdenTrabajoActividadEvidenciaResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoActividadEvidencia;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoActividadEvidenciaRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoActividadRepository;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaMapper;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.storage.DocumentStorageService;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrdenTrabajoActividadEvidenciaService {

    private static final String EVIDENCIA_FOLDER = "orden_trabajo_actividad_evidencias";

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "nombreArchivo",
            "tipoMime",
            "tamanio",
            "createdAt",
            "updatedAt"
    );

    private final OrdenTrabajoActividadEvidenciaRepository repository;
    private final OrdenTrabajoActividadRepository ordenTrabajoActividadRepository;
    private final DocumentStorageService documentStorageService;

    @Transactional
    public OrdenTrabajoActividadEvidenciaResponse createWithFile(
            UUID ordenTrabajoActividadId,
            MultipartFile file
    ) {
        requireOrdenTrabajoActividadExists(ordenTrabajoActividadId);

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

        return toResponse(repository.save(domain));
    }

    @Transactional
    public OrdenTrabajoActividadEvidenciaResponse replaceFile(
            UUID id,
            MultipartFile file
    ) {
        OrdenTrabajoActividadEvidencia domain = findDomainById(id);

        DocumentStorageService.StoredFile stored = documentStorageService.store(
                EVIDENCIA_FOLDER,
                domain.getId(),
                file
        );

        if (domain.getUrl() != null) {
            documentStorageService.delete(domain.getUrl());
        }

        domain.setNombreArchivo(stored.nombreOriginal());
        domain.setTipoMime(stored.mimeType());
        domain.setTamanio(stored.tamanoBytes());
        domain.setUrl(stored.publicUrl());

        return toResponse(repository.save(domain));
    }

    @Transactional(readOnly = true)
    public OrdenTrabajoActividadEvidenciaResponse findById(UUID id) {
        return toResponse(findDomainById(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<OrdenTrabajoActividadEvidenciaResponse> findByOrdenTrabajoActividadId(
            UUID ordenTrabajoActividadId,
            PageRequestDto pageRequest
    ) {
        requireOrdenTrabajoActividadExists(ordenTrabajoActividadId);

        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        return PageResponse.from(
                repository.findByOrdenTrabajoActividadId(ordenTrabajoActividadId, pageable),
                this::toResponse
        );
    }

    @Transactional
    public void delete(UUID id) {
        OrdenTrabajoActividadEvidencia domain = findDomainById(id);

        if (domain.getUrl() != null) {
            documentStorageService.delete(domain.getUrl());
        }

        repository.deleteById(id);
    }

    private OrdenTrabajoActividadEvidencia findDomainById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evidencia de actividad de orden de trabajo", id));
    }

    private void requireOrdenTrabajoActividadExists(UUID id) {
        if (!ordenTrabajoActividadRepository.existsById(id)) {
            throw new ResourceNotFoundException("Actividad de orden de trabajo", id);
        }
    }

    private OrdenTrabajoActividadEvidenciaResponse toResponse(OrdenTrabajoActividadEvidencia domain) {
        var actividadInfo = domain.getOrdenTrabajoActividadId() != null
                ? ordenTrabajoActividadRepository.findById(domain.getOrdenTrabajoActividadId())
                .map(a -> new OrdenTrabajoActividadEvidenciaResponse.OrdenTrabajoActividadInfo(
                        a.getId(),
                        a.getDescripcion()
                ))
                .orElse(null)
                : null;

        return new OrdenTrabajoActividadEvidenciaResponse(
                domain.getId(),
                actividadInfo,
                domain.getNombreArchivo(),
                domain.getTipoMime(),
                domain.getTamanio(),
                domain.getUrl(),
                AuditoriaMapper.from(domain)
        );
    }
}
