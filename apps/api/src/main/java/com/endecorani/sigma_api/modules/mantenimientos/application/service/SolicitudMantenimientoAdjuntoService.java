package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.SolicitudMantenimientoAdjuntoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.SolicitudMantenimientoAdjuntoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimientoAdjunto;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoAdjuntoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoRepository;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SolicitudMantenimientoAdjuntoService {

    private static final int NOMBRE_ARCHIVO_MAX_LENGTH = 255;
    private static final int TIPO_CONTENIDO_MAX_LENGTH = 100;
    private static final int URL_MAX_LENGTH = 1000;
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

    @Transactional
    public SolicitudMantenimientoAdjuntoResponse create(
            SolicitudMantenimientoAdjuntoRequest request
    ) {
        requireSolicitudMantenimientoExists(
                request.solicitudMantenimientoId()
        );

        String nombreArchivo =
                requireNormalizedNombreArchivo(
                        request.nombreArchivo()
                );
        String tipoContenido =
                requireNormalizedTipoContenido(
                        request.tipoContenido()
                );
        String url = requireNormalizedUrl(request.url());

        SolicitudMantenimientoAdjunto domain =
                SolicitudMantenimientoAdjunto.builder()
                        .solicitudMantenimientoId(
                                request.solicitudMantenimientoId()
                        )
                        .nombreArchivo(nombreArchivo)
                        .tipoContenido(tipoContenido)
                        .size(request.size())
                        .url(url)
                        .descripcion(
                                StringUtils.normalize(
                                        request.descripcion()
                                )
                        )
                        .build();

        return toResponse(repository.save(domain));
    }

    @Transactional
    public SolicitudMantenimientoAdjuntoResponse update(
            UUID id,
            SolicitudMantenimientoAdjuntoRequest request
    ) {
        requireSolicitudMantenimientoExists(
                request.solicitudMantenimientoId()
        );

        SolicitudMantenimientoAdjunto domain =
                findDomainById(id);

        String nombreArchivo =
                requireNormalizedNombreArchivo(
                        request.nombreArchivo()
                );
        String tipoContenido =
                requireNormalizedTipoContenido(
                        request.tipoContenido()
                );
        String url = requireNormalizedUrl(request.url());

        domain.setSolicitudMantenimientoId(
                request.solicitudMantenimientoId()
        );
        domain.setNombreArchivo(nombreArchivo);
        domain.setTipoContenido(tipoContenido);
        domain.setSize(request.size());
        domain.setUrl(url);
        domain.setDescripcion(
                StringUtils.normalize(request.descripcion())
        );

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
        findDomainById(id);
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

    private String requireNormalizedNombreArchivo(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < 1
                || normalized.length()
                > NOMBRE_ARCHIVO_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_ADJUNTO_NOMBRE_ARCHIVO",
                    "El nombre del archivo debe tener entre 1 y %d caracteres"
                            .formatted(NOMBRE_ARCHIVO_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String requireNormalizedTipoContenido(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < 1
                || normalized.length()
                > TIPO_CONTENIDO_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_ADJUNTO_TIPO_CONTENIDO",
                    "El tipo de contenido debe tener entre 1 y %d caracteres"
                            .formatted(TIPO_CONTENIDO_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String requireNormalizedUrl(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < 1
                || normalized.length() > URL_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_ADJUNTO_URL",
                    "La URL debe tener entre 1 y %d caracteres"
                            .formatted(URL_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private SolicitudMantenimientoAdjuntoResponse toResponse(
            SolicitudMantenimientoAdjunto domain
    ) {
        AuditoriaResponse auditoria = new AuditoriaResponse(
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );

        return new SolicitudMantenimientoAdjuntoResponse(
                domain.getId(),
                domain.getSolicitudMantenimientoId(),
                domain.getNombreArchivo(),
                domain.getTipoContenido(),
                domain.getSize(),
                domain.getUrl(),
                domain.getDescripcion(),
                auditoria
        );
    }
}
