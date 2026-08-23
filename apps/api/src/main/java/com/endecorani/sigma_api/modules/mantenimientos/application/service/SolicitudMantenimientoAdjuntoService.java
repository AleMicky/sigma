package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.SolicitudMantenimientoAdjuntoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.SolicitudMantenimientoAdjuntoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimientoAdjunto;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoAdjuntoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoRepository;
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
public class SolicitudMantenimientoAdjuntoService {

    private static final String ADJUNTO_FOLDER =
            "solicitud_mantenimiento_adjuntos";
    private static final int DESCRIPCION_MAX_LENGTH = 500;

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "nombreArchivo",
            "tipoContenido",
            "size",
            "createdAt",
            "updatedAt"
    );

    private final SolicitudMantenimientoAdjuntoRepository repository;
    private final SolicitudMantenimientoRepository
            solicitudMantenimientoRepository;
    private final DocumentStorageService documentStorageService;

    @Transactional
    public SolicitudMantenimientoAdjuntoResponse createWithFile(
            UUID solicitudMantenimientoId,
            SolicitudMantenimientoAdjuntoRequest request,
            MultipartFile file
    ) {
        requireSolicitudMantenimientoExists(
                solicitudMantenimientoId
        );

        UUID fileId = UUID.randomUUID();
        DocumentStorageService.StoredFile stored =
                documentStorageService.store(
                        ADJUNTO_FOLDER,
                        fileId,
                        file
                );

        SolicitudMantenimientoAdjunto domain =
                SolicitudMantenimientoAdjunto.builder()
                        .solicitudMantenimientoId(
                                solicitudMantenimientoId
                        )
                        .nombreArchivo(stored.nombreOriginal())
                        .tipoContenido(stored.mimeType())
                        .size(stored.tamanoBytes())
                        .url(stored.publicUrl())
                        .descripcion(
                                StringUtils.normalize(
                                        request != null
                                                ? request.descripcion()
                                                : null
                                )
                        )
                        .build();

        return toResponse(repository.save(domain));
    }

    @Transactional
    public SolicitudMantenimientoAdjuntoResponse replaceFile(
            UUID id,
            MultipartFile file
    ) {
        SolicitudMantenimientoAdjunto domain =
                findDomainById(id);

        DocumentStorageService.StoredFile stored =
                documentStorageService.store(
                        ADJUNTO_FOLDER,
                        domain.getId(),
                        file
                );

        if (domain.getUrl() != null) {
            documentStorageService.delete(domain.getUrl());
        }

        domain.setNombreArchivo(stored.nombreOriginal());
        domain.setTipoContenido(stored.mimeType());
        domain.setSize(stored.tamanoBytes());
        domain.setUrl(stored.publicUrl());

        return toResponse(repository.save(domain));
    }

    @Transactional(readOnly = true)
    public SolicitudMantenimientoAdjuntoResponse findById(
            UUID id
    ) {
        return toResponse(findDomainById(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudMantenimientoAdjuntoResponse>
    findBySolicitudMantenimientoId(
            UUID solicitudMantenimientoId,
            PageRequestDto pageRequest
    ) {
        requireSolicitudMantenimientoExists(
                solicitudMantenimientoId
        );
        Pageable pageable =
                pageRequest.toPageable(SORT_FIELDS);

        return PageResponse.from(
                repository.findBySolicitudMantenimientoId(
                        solicitudMantenimientoId,
                        pageable
                ),
                this::toResponse
        );
    }

    @Transactional
    public void delete(UUID id) {
        SolicitudMantenimientoAdjunto domain =
                findDomainById(id);

        if (domain.getUrl() != null) {
            documentStorageService.delete(domain.getUrl());
        }

        repository.deleteById(id);
    }

    private SolicitudMantenimientoAdjunto findDomainById(
            UUID id
    ) {
        return repository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Adjunto de solicitud de mantenimiento",
                                id
                        )
                );
    }

    private void requireSolicitudMantenimientoExists(UUID id) {
        if (!solicitudMantenimientoRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Solicitud de mantenimiento",
                    id
            );
        }
    }

    private SolicitudMantenimientoAdjuntoResponse toResponse(
            SolicitudMantenimientoAdjunto domain
    ) {
       ;

        return new SolicitudMantenimientoAdjuntoResponse(
                domain.getId(),
                domain.getSolicitudMantenimientoId(),
                domain.getNombreArchivo(),
                domain.getTipoContenido(),
                domain.getSize(),
                domain.getUrl(),
                domain.getDescripcion(),
                AuditoriaMapper.from(domain)
        );
    }
}
