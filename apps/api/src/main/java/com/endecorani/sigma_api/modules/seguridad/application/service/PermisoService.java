package com.endecorani.sigma_api.modules.seguridad.application.service;

import com.endecorani.sigma_api.modules.seguridad.application.dto.request.PermisoRequest;
import com.endecorani.sigma_api.modules.seguridad.application.dto.response.PermisoResponse;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Permiso;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.MenuRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.PermisoRepository;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaMapper;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PermisoService {

    private static final int CODIGO_MIN_LENGTH = 2;
    private static final int CODIGO_MAX_LENGTH = 200;
    private static final int NOMBRE_MIN_LENGTH = 2;
    private static final int NOMBRE_MAX_LENGTH = 200;
    private static final int DESCRIPCION_MAX_LENGTH = 500;
    private static final int METODO_HTTP_MAX_LENGTH = 10;
    private static final int RUTA_MAX_LENGTH = 500;

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "metodoHttp",
            "ruta",
            "activo",
            "createdAt",
            "updatedAt"
    );

    private final PermisoRepository permisoRepository;
    private final MenuRepository menuRepository;

    @Transactional
    public PermisoResponse create(PermisoRequest request) {
        Permiso domain = toDomain(request);
        Permiso saved = permisoRepository.save(domain);
        return toResponse(saved);
    }

    @Transactional
    public PermisoResponse update(UUID id, PermisoRequest request) {
        Permiso domain = findDomainById(id);
        updateDomain(domain, request);
        Permiso updated = permisoRepository.save(domain);
        return toResponse(updated);
    }

    @Transactional(readOnly = true)
    public PermisoResponse findById(UUID id) {
        return toResponse(findDomainById(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<PermisoResponse> findAll(PageRequestDto pageRequest) {
        var page = permisoRepository.findAll(pageRequest.toPageable(SORT_FIELDS));
        return PageResponse.from(page, this::toResponse);
    }

    @Transactional(readOnly = true)
    public PageResponse<PermisoResponse> findByMenuId(UUID menuId, PageRequestDto pageRequest) {
        var page = permisoRepository.findByMenuId(menuId, pageRequest.toPageable(SORT_FIELDS));
        return PageResponse.from(page, this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<PermisoResponse> findAllList() {
        return permisoRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PermisoResponse> findByMenuIdList(UUID menuId) {
        return permisoRepository.findByMenuId(menuId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<PermisoResponse> search(String query, PageRequestDto pageRequest) {
        String normalized = StringUtils.normalize(query);

        if (normalized == null) {
            return findAll(pageRequest);
        }

        return PageResponse.from(
                permisoRepository.search(normalized, pageRequest.toPageable(SORT_FIELDS)),
                this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<PermisoResponse> searchByMenuId(
            UUID menuId,
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);

        if (normalized == null) {
            return findByMenuId(menuId, pageRequest);
        }

        return PageResponse.from(
                permisoRepository.searchByMenuId(menuId, normalized, pageRequest.toPageable(SORT_FIELDS)),
                this::toResponse
        );
    }

    @Transactional
    public void delete(UUID id) {
        if (!permisoRepository.existsById(id)) {
            throw new ResourceNotFoundException(resourceName(), id);
        }
        permisoRepository.deleteById(id);
    }

    public PermisoResponse toResponse(Permiso permiso) {
        return new PermisoResponse(
                permiso.getId(),
                permiso.getMenuId(),
                permiso.getCodigo(),
                permiso.getNombre(),
                permiso.getDescripcion(),
                permiso.getMetodoHttp(),
                permiso.getRuta(),
                permiso.isActivo(),
                AuditoriaMapper.from(permiso)
        );
    }

    private Permiso toDomain(PermisoRequest request) {
        String codigo = requireNormalizedCodigo(request.codigo());
        validateMenuExists(request.menuId());
        validateUniqueCodigoForCreate(codigo);

        return Permiso.builder()
                .menuId(request.menuId())
                .codigo(codigo)
                .nombre(requireNormalizedNombre(request.nombre()))
                .descripcion(normalizeDescripcion(request.descripcion()))
                .metodoHttp(requireNormalizedMetodoHttp(request.metodoHttp()))
                .ruta(requireNormalizedRuta(request.ruta()))
                .activo(request.activo() == null || request.activo())
                .build();
    }

    private void updateDomain(Permiso domain, PermisoRequest request) {
        rejectCodigoChange(domain.getCodigo(), request.codigo());
        validateMenuExists(request.menuId());

        domain.setMenuId(request.menuId());
        domain.setNombre(requireNormalizedNombre(request.nombre()));
        domain.setDescripcion(normalizeDescripcion(request.descripcion()));
        domain.setMetodoHttp(requireNormalizedMetodoHttp(request.metodoHttp()));
        domain.setRuta(requireNormalizedRuta(request.ruta()));
        domain.setActivo(request.activo() == null || request.activo());
    }

    private Permiso findDomainById(UUID id) {
        return permisoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(resourceName(), id));
    }

    private String resourceName() {
        return "Permiso";
    }

    private void validateUniqueCodigoForCreate(String codigo) {
        if (permisoRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException(
                    "PERMISO_ALREADY_EXISTS",
                    "Ya existe un permiso con el código '%s'".formatted(codigo)
            );
        }
    }

    private void rejectCodigoChange(String currentCodigo, String requestedCodigo) {
        if (requestedCodigo == null || requestedCodigo.isBlank()) {
            return;
        }
        String normalized = StringUtils.normalize(requestedCodigo);

        if (normalized != null && !normalized.equalsIgnoreCase(currentCodigo)) {
            throw new BusinessException(
                    "PERMISO_CODIGO_IMMUTABLE",
                    "El código del permiso no se puede modificar"
            );
        }
    }

    private void validateMenuExists(UUID menuId) {
        if (!menuRepository.existsById(menuId)) {
            throw new ResourceNotFoundException("Menú", menuId);
        }
    }

    private String requireNormalizedCodigo(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < CODIGO_MIN_LENGTH
                || normalized.length() > CODIGO_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_PERMISO_CODIGO",
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
                    "INVALID_PERMISO_NOMBRE",
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
                    "INVALID_PERMISO_DESCRIPCION",
                    "La descripción no puede superar los %d caracteres"
                            .formatted(DESCRIPCION_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String requireNormalizedMetodoHttp(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < 1
                || normalized.length() > METODO_HTTP_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_PERMISO_METODO_HTTP",
                    "El método HTTP debe tener entre 1 y %d caracteres"
                            .formatted(METODO_HTTP_MAX_LENGTH)
            );
        }

        return normalized.toUpperCase();
    }

    private String requireNormalizedRuta(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < 1
                || normalized.length() > RUTA_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_PERMISO_RUTA",
                    "La ruta debe tener entre 1 y %d caracteres"
                            .formatted(RUTA_MAX_LENGTH)
            );
        }

        return normalized;
    }
}
