package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.request.ActivoRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.modules.parametros.domain.repository.UbicacionRepository;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaMapper;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.storage.ImageStorageService;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
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
public class ActivoService {

    private static final String IMAGE_FOLDER = "activos";
    private static final int CODIGO_MIN_LENGTH = 2;
    private static final int CODIGO_MAX_LENGTH = 50;
    private static final int NOMBRE_MIN_LENGTH = 2;
    private static final int NOMBRE_MAX_LENGTH = 100;
    private static final int DESCRIPCION_MAX_LENGTH = 255;

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "tipoActivoId",
            "ubicacionId",
            "fechaAdquisicion",
            "activo",
            "createdAt",
            "updatedAt"
    );

    private final ActivoRepository activoRepository;
    private final TipoActivoRepository tipoActivoRepository;
    private final UbicacionRepository ubicacionRepository;
    private final ImageStorageService imageStorageService;

    @Transactional
    public ActivoResponse create(ActivoRequest request) {
        requireTipoActivoExists(request.tipoActivoId());
        requireUbicacionExists(request.ubicacionId());

        String codigo = requireNormalizedCodigo(request.codigo());
        validateUniqueCodigoForCreate(codigo);

        Activo domain = Activo.builder()
                .codigo(codigo)
                .nombre(requireNormalizedNombre(request.nombre()))
                .descripcion(normalizeDescripcion(request.descripcion()))
                .tipoActivoId(request.tipoActivoId())
                .ubicacionId(request.ubicacionId())
                .fechaAdquisicion(request.fechaAdquisicion())
                .activo(resolveActivo(request.activo()))
                .build();

        return toResponse(activoRepository.save(domain));
    }

    @Transactional
    public ActivoResponse update(UUID id, ActivoRequest request) {
        requireTipoActivoExists(request.tipoActivoId());
        requireUbicacionExists(request.ubicacionId());

        Activo domain = findDomainById(id);

        String codigo = requireNormalizedCodigo(request.codigo());
        validateUniqueCodigoForUpdate(codigo, domain.getId());

        domain.setCodigo(codigo);
        domain.setNombre(requireNormalizedNombre(request.nombre()));
        domain.setDescripcion(normalizeDescripcion(request.descripcion()));
        domain.setTipoActivoId(request.tipoActivoId());
        domain.setUbicacionId(request.ubicacionId());
        domain.setFechaAdquisicion(request.fechaAdquisicion());
        domain.setActivo(resolveActivo(request.activo()));

        return toResponse(activoRepository.save(domain));
    }

    @Transactional(readOnly = true)
    public ActivoResponse findById(UUID id) {
        return toResponse(findDomainById(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<ActivoResponse> findAll(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        if (normalized == null) {
            return PageResponse.from(
                    activoRepository.findAll(pageable),
                    this::toResponse
            );
        }

        return PageResponse.from(
                activoRepository.search(normalized, pageable),
                this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<ActivoResponse> findByTipoActivoId(
            UUID tipoActivoId,
            String query,
            PageRequestDto pageRequest
    ) {
        requireTipoActivoExists(tipoActivoId);

        String normalized = StringUtils.normalize(query);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        if (normalized == null) {
            return PageResponse.from(
                    activoRepository.findByTipoActivoId(tipoActivoId, pageable),
                    this::toResponse
            );
        }

        return PageResponse.from(
                activoRepository.searchByTipoActivoId(
                        tipoActivoId,
                        normalized,
                        pageable
                ),
                this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<ActivoResponse> search(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        if (normalized == null) {
            return PageResponse.from(
                    activoRepository.findAll(pageable),
                    this::toResponse
            );
        }

        return PageResponse.from(
                activoRepository.search(normalized, pageable),
                this::toResponse
        );
    }

    @Transactional
    public ActivoResponse uploadImagen(UUID id, MultipartFile file) {
        Activo domain = findDomainById(id);
        String url = imageStorageService.store(IMAGE_FOLDER, id, file);
        domain.setUrlImagen(url);
        return toResponse(activoRepository.save(domain));
    }

    @Transactional
    public ActivoResponse deleteImagen(UUID id) {
        Activo domain = findDomainById(id);
        if (domain.getUrlImagen() != null) {
            imageStorageService.delete(domain.getUrlImagen());
            domain.setUrlImagen(null);
            domain = activoRepository.save(domain);
        }
        return toResponse(domain);
    }

    @Transactional
    public ActivoResponse toggleActivo(UUID id, Boolean activo) {
        Activo domain = findDomainById(id);
        domain.setActivo(resolveActivo(activo));
        Activo updated = activoRepository.save(domain);
        return toResponse(updated);
    }

    @Transactional
    public void delete(UUID id) {
        Activo domain = findDomainById(id);
        if (domain.getUrlImagen() != null) {
            imageStorageService.delete(domain.getUrlImagen());
        }
        activoRepository.deleteById(id);
    }

    private Activo findDomainById(UUID id) {
        return activoRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Activo", id)
                );
    }

    private ActivoResponse toResponse(Activo domain) {
        ActivoResponse.TipoActivoInfo tipoActivoInfo = null;
        if (domain.getTipoActivoId() != null) {
            tipoActivoInfo = tipoActivoRepository.findById(domain.getTipoActivoId())
                    .map(tipo -> new ActivoResponse.TipoActivoInfo(
                            tipo.getId(),
                            tipo.getCategoriaId(),
                            tipo.getNombre(),
                            tipo.getDescripcion()
                    ))
                    .orElse(null);
        }

        ActivoResponse.UbicacionInfo ubicacionInfo = null;
        if (domain.getUbicacionId() != null) {
            ubicacionInfo = ubicacionRepository.findById(domain.getUbicacionId())
                    .map(ubicacion -> new ActivoResponse.UbicacionInfo(
                            ubicacion.getId(),
                            ubicacion.getCodigo(),
                            ubicacion.getNombre()
                    ))
                    .orElse(null);
        }

        return new ActivoResponse(
                domain.getId(),
                domain.getCodigo(),
                domain.getNombre(),
                domain.getDescripcion(),
                tipoActivoInfo,
                ubicacionInfo,
                domain.getFechaAdquisicion(),
                domain.getUrlImagen(),
                domain.getActivo(),
                AuditoriaMapper.from(domain)
        );
    }

    private Boolean resolveActivo(Boolean value) {
        return value != null ? value : Boolean.TRUE;
    }

    private void requireTipoActivoExists(UUID tipoActivoId) {
        if (!tipoActivoRepository.existsById(tipoActivoId)) {
            throw new ResourceNotFoundException("Tipo de activo", tipoActivoId);
        }
    }

    private void requireUbicacionExists(UUID ubicacionId) {
        if (ubicacionId != null && !ubicacionRepository.existsById(ubicacionId)) {
            throw new ResourceNotFoundException("Ubicación", ubicacionId);
        }
    }

    private void validateUniqueCodigoForCreate(String codigo) {
        if (activoRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException(
                    "ACTIVO_ALREADY_EXISTS",
                    "Ya existe un activo con el código '%s'".formatted(codigo)
            );
        }
    }

    private void validateUniqueCodigoForUpdate(String codigo, UUID currentId) {
        if (activoRepository.existsByCodigoIgnoreCaseAndIdNot(codigo, currentId)) {
            throw new ConflictException(
                    "ACTIVO_ALREADY_EXISTS",
                    "Ya existe otro activo con el código '%s'".formatted(codigo)
            );
        }
    }

    private String requireNormalizedCodigo(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < CODIGO_MIN_LENGTH
                || normalized.length() > CODIGO_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_ACTIVO_CODIGO",
                    "El código debe tener entre %d y %d caracteres"
                            .formatted(CODIGO_MIN_LENGTH, CODIGO_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String requireNormalizedNombre(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < NOMBRE_MIN_LENGTH
                || normalized.length() > NOMBRE_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_ACTIVO_NOMBRE",
                    "El nombre debe tener entre %d y %d caracteres"
                            .formatted(NOMBRE_MIN_LENGTH, NOMBRE_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String normalizeDescripcion(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized != null && normalized.length() > DESCRIPCION_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_ACTIVO_DESCRIPCION",
                    "La descripción no puede superar los %d caracteres"
                            .formatted(DESCRIPCION_MAX_LENGTH)
            );
        }

        return normalized;
    }
}
