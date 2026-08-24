package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.OrdenTrabajoAdjuntoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.OrdenTrabajoAdjuntoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoAdjunto;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoAdjuntoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoRepository;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaMapper;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.storage.DocumentStorageService;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrdenTrabajoAdjuntoService {

    private static final String ADJUNTO_FOLDER = "orden_trabajo_adjuntos";

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "nombreArchivo",
            "tipoMime",
            "tamanio",
            "createdAt",
            "updatedAt"
    );

    private final OrdenTrabajoAdjuntoRepository repository;
    private final OrdenTrabajoRepository ordenTrabajoRepository;
    private final DocumentStorageService documentStorageService;

    @Transactional
    public OrdenTrabajoAdjuntoResponse createWithFile(
            UUID ordenTrabajoId,
            OrdenTrabajoAdjuntoRequest request,
            MultipartFile file
    ) {
        requireOrdenTrabajoExists(ordenTrabajoId);

        UUID fileId = UUID.randomUUID();
        DocumentStorageService.StoredFile stored = documentStorageService.store(
                ADJUNTO_FOLDER,
                fileId,
                file
        );

        OrdenTrabajoAdjunto domain = OrdenTrabajoAdjunto.builder()
                .ordenTrabajoId(ordenTrabajoId)
                .nombreArchivo(stored.nombreOriginal())
                .tipoMime(stored.mimeType())
                .tamanio(stored.tamanoBytes())
                .url(stored.publicUrl())
                .descripcion(StringUtils.normalize(
                        request != null ? request.descripcion() : null
                ))
                .build();

        return toResponse(repository.save(domain));
    }

    @Transactional
    public OrdenTrabajoAdjuntoResponse replaceFile(
            UUID id,
            MultipartFile file
    ) {
        OrdenTrabajoAdjunto domain = findDomainById(id);

        DocumentStorageService.StoredFile stored = documentStorageService.store(
                ADJUNTO_FOLDER,
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
    public OrdenTrabajoAdjuntoResponse findById(UUID id) {
        return toResponse(findDomainById(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<OrdenTrabajoAdjuntoResponse> findByOrdenTrabajoId(
            UUID ordenTrabajoId,
            PageRequestDto pageRequest
    ) {
        requireOrdenTrabajoExists(ordenTrabajoId);

        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        return PageResponse.from(
                repository.findByOrdenTrabajoId(ordenTrabajoId, pageable),
                this::toResponse
        );
    }

    @Transactional
    public void delete(UUID id) {
        OrdenTrabajoAdjunto domain = findDomainById(id);

        if (domain.getUrl() != null) {
            documentStorageService.delete(domain.getUrl());
        }

        repository.deleteById(id);
    }

    private OrdenTrabajoAdjunto findDomainById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Adjunto de orden de trabajo", id));
    }

    private void requireOrdenTrabajoExists(UUID id) {
        if (!ordenTrabajoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Orden de trabajo", id);
        }
    }

    private OrdenTrabajoAdjuntoResponse toResponse(OrdenTrabajoAdjunto domain) {
        var ordenTrabajoInfo = domain.getOrdenTrabajoId() != null
                ? ordenTrabajoRepository.findById(domain.getOrdenTrabajoId())
                .map(o -> new OrdenTrabajoAdjuntoResponse.OrdenTrabajoInfo(
                        o.getId(),
                        o.getNumero()
                ))
                .orElse(null)
                : null;

        return new OrdenTrabajoAdjuntoResponse(
                domain.getId(),
                ordenTrabajoInfo,
                domain.getNombreArchivo(),
                domain.getTipoMime(),
                domain.getTamanio(),
                domain.getUrl(),
                domain.getDescripcion(),
                AuditoriaMapper.from(domain)
        );
    }
}
