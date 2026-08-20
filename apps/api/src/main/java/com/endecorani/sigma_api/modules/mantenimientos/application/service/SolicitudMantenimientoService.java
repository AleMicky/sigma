package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.SolicitudMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.SolicitudMantenimientoAdjuntoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.SolicitudMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimientoAdjunto;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PrioridadRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoAdjuntoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.TipoMantenimientoRepository;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.storage.DocumentStorageService;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SolicitudMantenimientoService {

    private static final int NUMERO_MIN_LENGTH = 1;
    private static final int NUMERO_MAX_LENGTH = 30;
    private static final int TITULO_MIN_LENGTH = 1;
    private static final int TITULO_MAX_LENGTH = 150;
    private static final int DESCRIPCION_MAX_LENGTH = 2000;

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "numero",
            "activoId",
            "tipoMantenimientoId",
            "prioridadId",
            "solicitanteId",
            "estado",
            "fechaSolicitud",
            "createdAt",
            "updatedAt"
    );

    private static final String ADJUNTO_FOLDER = "solicitud_mantenimiento_adjuntos";

    private final SolicitudMantenimientoRepository repository;
    private final ActivoRepository activoRepository;
    private final TipoMantenimientoRepository tipoMantenimientoRepository;
    private final PrioridadRepository prioridadRepository;
    private final SolicitudMantenimientoAdjuntoRepository adjuntoRepository;
    private final DocumentStorageService documentStorageService;

    @Transactional
    public SolicitudMantenimientoResponse create(SolicitudMantenimientoRequest request) {
        requireActivoExists(request.activoId());
        requireTipoMantenimientoExists(request.tipoMantenimientoId());
        requirePrioridadExists(request.prioridadId());

        String numero = requireNormalizedNumero(request.numero());
        validateUniqueNumeroForCreate(numero);

        SolicitudMantenimiento domain = SolicitudMantenimiento.builder()
                        .numero(numero)
                        .activoId(request.activoId())
                        .tipoMantenimientoId(request.tipoMantenimientoId())
                        .motivoMantenimientoId(request.motivoMantenimientoId())
                        .prioridadId(request.prioridadId())
                        .solicitanteId(request.solicitanteId())
                        .titulo(requireNormalizedTitulo(request.titulo()))
                        .descripcion(requireNormalizedDescripcion(request.descripcion()))
                        .estado(requireNormalizedEstado(request.estado()))
                        .fechaSolicitud(request.fechaSolicitud() != null
                                        ? request.fechaSolicitud()
                                        : LocalDateTime.now())
                        .build();

        return toResponse(repository.save(domain));
    }

    @Transactional
    public SolicitudMantenimientoResponse createWithFiles(SolicitudMantenimientoRequest request, List<MultipartFile> files) {
        SolicitudMantenimientoResponse response = create(request);

        if (files != null && !files.isEmpty()) {
            List<SolicitudMantenimientoAdjuntoResponse> adjuntos = new ArrayList<>();

            for (MultipartFile file : files) {
                UUID fileId = UUID.randomUUID();
                DocumentStorageService.StoredFile stored = documentStorageService.store(
                                ADJUNTO_FOLDER,
                                fileId,
                                file);

                SolicitudMantenimientoAdjunto adjuntoDomain =
                        SolicitudMantenimientoAdjunto.builder()
                                .solicitudMantenimientoId(response.id())
                                .nombreArchivo(stored.nombreOriginal())
                                .tipoContenido(stored.mimeType())
                                .size(stored.tamanoBytes())
                                .url(stored.publicUrl())
                                .build();

                adjuntos.add(toAdjuntoResponse(adjuntoRepository.save(adjuntoDomain)));
            }

            return new SolicitudMantenimientoResponse(
                    response.id(),
                    response.numero(),
                    response.activo(),
                    response.tipoMantenimiento(),
                    response.motivoMantenimientoId(),
                    response.prioridad(),
                    response.solicitante(),
                    response.titulo(),
                    response.descripcion(),
                    response.fechaSolicitud(),
                    response.aprobadoPor(),
                    response.fechaAprobacion(),
                    response.observacionAprobacion(),
                    response.responsable(),
                    response.fechaAsignacion(),
                    response.fechaInicioMantenimiento(),
                    response.fechaFinMantenimiento(),
                    response.supervisor(),
                    response.fechaValidacion(),
                    response.observacionValidacion(),
                    response.fechaFinalizacion(),
                    response.recibidoPor(),
                    response.observacionCierre(),
                    response.estado(),
                    response.processInstanceId(),
                    adjuntos,
                    response.auditoria()
            );
        }

        return response;
    }

    @Transactional
    public SolicitudMantenimientoResponse update(UUID id, SolicitudMantenimientoRequest request) {
        requireActivoExists(request.activoId());
        requireTipoMantenimientoExists(request.tipoMantenimientoId());
        requirePrioridadExists(request.prioridadId());
        SolicitudMantenimiento domain = findDomainById(id);
        String numero = requireNormalizedNumero(request.numero());
        validateUniqueNumeroForUpdate(numero, id);
        domain.setNumero(numero);
        domain.setActivoId(request.activoId());
        domain.setTipoMantenimientoId(request.tipoMantenimientoId());
        domain.setMotivoMantenimientoId(request.motivoMantenimientoId());
        domain.setPrioridadId(request.prioridadId());
        domain.setSolicitanteId(request.solicitanteId());
        domain.setTitulo(requireNormalizedTitulo(request.titulo()));
        domain.setDescripcion(requireNormalizedDescripcion(request.descripcion()));
        domain.setEstado(requireNormalizedEstado(request.estado()));

        if (request.fechaSolicitud() != null) {
            domain.setFechaSolicitud(request.fechaSolicitud());
        }

        return toResponse(repository.save(domain));
    }

    @Transactional(readOnly = true)
    public SolicitudMantenimientoResponse findById(UUID id) {
        return toResponse(findDomainById(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudMantenimientoResponse> findAll(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        if (normalized == null) {
            return PageResponse.from(
                    repository.findAll(pageable),
                    this::toResponse
            );
        }

        return PageResponse.from(repository.search(normalized, pageable),
                this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudMantenimientoResponse>
    findByActivoId(UUID activoId, PageRequestDto pageRequest) {
        requireActivoExists(activoId);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        return PageResponse.from(
                repository.findByActivoId(activoId, pageable),
                this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudMantenimientoResponse>
    findByEstado(String estado, PageRequestDto pageRequest) {
        String normalized = requireNormalizedEstado(estado);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        return PageResponse.from(
                repository.findByEstado(normalized, pageable),
                this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudMantenimientoResponse>
    findBySolicitanteId(UUID solicitanteId, PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        return PageResponse.from(
                repository.findBySolicitanteId(
                        solicitanteId, pageable
                ),
                this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudMantenimientoResponse>
    findByResponsableId(UUID responsableId, PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        return PageResponse.from(repository.findByResponsableId(responsableId, pageable),
                this::toResponse
        );
    }

    @Transactional
    public void delete(UUID id) {
        findDomainById(id);
        repository.deleteById(id);
    }

    private SolicitudMantenimiento findDomainById(UUID id) {
        return repository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Solicitud de mantenimiento",
                                id
                        )
                );
    }

    private void requireActivoExists(UUID id) {
        if (!activoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Activo", id);
        }
    }

    private void requireTipoMantenimientoExists(UUID id) {
        if (!tipoMantenimientoRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Tipo de mantenimiento", id
            );
        }
    }

    private void requirePrioridadExists(UUID id) {
        if (!prioridadRepository.existsById(id)) {
            throw new ResourceNotFoundException("Prioridad", id);
        }
    }

    private void validateUniqueNumeroForCreate(String numero) {
        if (repository.existsByNumeroIgnoreCase(numero)) {
            throw new ConflictException(
                    "SOLICITUD_MANTENIMIENTO_ALREADY_EXISTS",
                    "Ya existe una solicitud con el número '%s'"
                            .formatted(numero)
            );
        }
    }

    private void validateUniqueNumeroForUpdate(
            String numero,
            UUID currentId
    ) {
        if (repository.existsByNumeroIgnoreCaseAndIdNot(
                numero,
                currentId
        )) {
            throw new ConflictException(
                    "SOLICITUD_MANTENIMIENTO_ALREADY_EXISTS",
                    "Ya existe otra solicitud con el número '%s'"
                            .formatted(numero)
            );
        }
    }

    private String requireNormalizedNumero(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < NUMERO_MIN_LENGTH
                || normalized.length() > NUMERO_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_SOLICITUD_NUMERO",
                    "El número debe tener entre %d y %d caracteres"
                            .formatted(
                                    NUMERO_MIN_LENGTH,
                                    NUMERO_MAX_LENGTH
                            )
            );
        }

        return normalized;
    }

    private String requireNormalizedTitulo(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < TITULO_MIN_LENGTH
                || normalized.length() > TITULO_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_SOLICITUD_TITULO",
                    "El título debe tener entre %d y %d caracteres"
                            .formatted(
                                    TITULO_MIN_LENGTH,
                                    TITULO_MAX_LENGTH
                            )
            );
        }

        return normalized;
    }

    private String requireNormalizedDescripcion(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() > DESCRIPCION_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_SOLICITUD_DESCRIPCION",
                    "La descripción no puede superar los %d caracteres"
                            .formatted(DESCRIPCION_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String requireNormalizedEstado(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < 1
                || normalized.length() > 50) {
            throw new BusinessException(
                    "INVALID_SOLICITUD_ESTADO",
                    "El estado debe tener entre 1 y 50 caracteres"
            );
        }

        return normalized;
    }

    private SolicitudMantenimientoResponse toResponse(
            SolicitudMantenimiento domain
    ) {
        SolicitudMantenimientoResponse.ActivoInfo activoInfo =
                null;
        if (domain.getActivoId() != null) {
            activoInfo = activoRepository
                    .findById(domain.getActivoId())
                    .map(a ->
                            new SolicitudMantenimientoResponse
                                    .ActivoInfo(
                                    a.getId(),
                                    a.getCodigo(),
                                    a.getNombre()
                            )
                    )
                    .orElse(null);
        }

        SolicitudMantenimientoResponse.TipoMantenimientoInfo
                tipoInfo = null;
        if (domain.getTipoMantenimientoId() != null) {
            tipoInfo = tipoMantenimientoRepository
                    .findById(domain.getTipoMantenimientoId())
                    .map(t ->
                            new SolicitudMantenimientoResponse
                                    .TipoMantenimientoInfo(
                                    t.getId(),
                                    t.getCodigo(),
                                    t.getNombre()
                            )
                    )
                    .orElse(null);
        }

        SolicitudMantenimientoResponse.PrioridadInfo prioridadInfo =
                null;
        if (domain.getPrioridadId() != null) {
            prioridadInfo = prioridadRepository
                    .findById(domain.getPrioridadId())
                    .map(p ->
                            new SolicitudMantenimientoResponse
                                    .PrioridadInfo(
                                    p.getId(),
                                    p.getCodigo(),
                                    p.getNombre(),
                                    p.getNivel()
                            )
                    )
                    .orElse(null);
        }

        AuditoriaResponse auditoria = new AuditoriaResponse(
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );

        return new SolicitudMantenimientoResponse(
                domain.getId(),
                domain.getNumero(),
                activoInfo,
                tipoInfo,
                domain.getMotivoMantenimientoId(),
                prioridadInfo,
                null,
                domain.getTitulo(),
                domain.getDescripcion(),
                domain.getFechaSolicitud(),
                null,
                domain.getFechaAprobacion(),
                domain.getObservacionAprobacion(),
                null,
                domain.getFechaAsignacion(),
                domain.getFechaInicioMantenimiento(),
                domain.getFechaFinMantenimiento(),
                null,
                domain.getFechaValidacion(),
                domain.getObservacionValidacion(),
                domain.getFechaFinalizacion(),
                null,
                domain.getObservacionCierre(),
                domain.getEstado(),
                domain.getProcessInstanceId(),
                List.of(),
                auditoria
        );
    }

    private SolicitudMantenimientoAdjuntoResponse toAdjuntoResponse(
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
