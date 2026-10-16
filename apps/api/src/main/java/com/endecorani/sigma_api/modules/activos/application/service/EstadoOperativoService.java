package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.request.EstadoOperativoRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.EstadoOperativoResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.EstadoOperativo;
import com.endecorani.sigma_api.modules.activos.domain.repository.EstadoOperativoRepository;
import com.endecorani.sigma_api.shared.application.crud.AbstractCrudService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class EstadoOperativoService extends AbstractCrudService<
        EstadoOperativo,
        EstadoOperativoRequest,
        EstadoOperativoResponse,
        UUID
        > {

    private static final int COLOR_MAX_LENGTH = 7;
    private static final Pattern COLOR_PATTERN = Pattern.compile(
            "^#(?:[0-9A-Fa-f]{6})$"
    );

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "descripcion",
            "color",
            "createdAt",
            "updatedAt"
    );

    private final EstadoOperativoRepository estadoOperativoRepository;

    @Override
    protected CrudRepository<EstadoOperativo, UUID> repository() {
        return estadoOperativoRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Transactional(readOnly = true)
    public PageResponse<EstadoOperativoResponse> search(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);

        if (normalized == null) {
            return findAll(pageRequest);
        }

        return PageResponse.from(
                estadoOperativoRepository.search(
                        normalized,
                        pageRequest.toPageable(allowedSortFields())
                ),
                this::toResponse
        );
    }

    @Override
    protected EstadoOperativo toDomain(EstadoOperativoRequest request) {
        String codigo = StringUtils.normalize(request.codigo());
        validateUniqueCodigoForCreate(codigo);

        String nombre = StringUtils.normalize(request.nombre());
        validateUniqueNombreForCreate(nombre);

        return EstadoOperativo.builder()
                .codigo(codigo)
                .nombre(nombre)
                .descripcion(StringUtils.normalize(request.descripcion()))
                .color(normalizeColor(request.color()))
                .build();
    }

    @Override
    protected void updateDomain(
            EstadoOperativo domain,
            EstadoOperativoRequest request
    ) {
        String codigo = StringUtils.normalize(request.codigo());
        validateUniqueCodigoForUpdate(codigo, domain.getId());

        String nombre = StringUtils.normalize(request.nombre());
        validateUniqueNombreForUpdate(nombre, domain.getId());

        domain.setCodigo(codigo);
        domain.setNombre(nombre);
        domain.setDescripcion(StringUtils.normalize(request.descripcion()));
        domain.setColor(normalizeColor(request.color()));
    }

    @Override
    protected EstadoOperativoResponse toResponse(EstadoOperativo domain) {
        return new EstadoOperativoResponse(
                domain.getId(),
                domain.getCodigo(),
                domain.getNombre(),
                domain.getDescripcion(),
                domain.getColor(),
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );
    }

    @Override
    protected String resourceName() {
        return "Estado operativo";
    }

    private void validateUniqueCodigoForCreate(String codigo) {
        if (estadoOperativoRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException(
                    "ESTADO_OPERATIVO_ALREADY_EXISTS",
                    "Ya existe un estado operativo con el código '%s'"
                            .formatted(codigo)
            );
        }
    }

    private void validateUniqueCodigoForUpdate(
            String codigo,
            UUID currentId
    ) {
        if (estadoOperativoRepository.existsByCodigoIgnoreCaseAndIdNot(
                codigo,
                currentId
        )) {
            throw new ConflictException(
                    "ESTADO_OPERATIVO_ALREADY_EXISTS",
                    "Ya existe otro estado operativo con el código '%s'"
                            .formatted(codigo)
            );
        }
    }

    private void validateUniqueNombreForCreate(String nombre) {
        if (estadoOperativoRepository.existsByNombreIgnoreCase(nombre)) {
            throw new ConflictException(
                    "ESTADO_OPERATIVO_ALREADY_EXISTS",
                    "Ya existe un estado operativo con el nombre '%s'"
                            .formatted(nombre)
            );
        }
    }

    private void validateUniqueNombreForUpdate(
            String nombre,
            UUID currentId
    ) {
        if (estadoOperativoRepository.existsByNombreIgnoreCaseAndIdNot(
                nombre,
                currentId
        )) {
            throw new ConflictException(
                    "ESTADO_OPERATIVO_ALREADY_EXISTS",
                    "Ya existe otro estado operativo con el nombre '%s'"
                            .formatted(nombre)
            );
        }
    }

    private String normalizeColor(String value) {
        String trimmed = StringUtils.trimToNull(value);
        if (trimmed == null) {
            return null;
        }

        String color = trimmed.toUpperCase();
        if (color.length() > COLOR_MAX_LENGTH
                || !COLOR_PATTERN.matcher(color).matches()) {
            throw new BusinessException(
                    "INVALID_ESTADO_OPERATIVO_COLOR",
                    "El color debe tener el formato #RRGGBB"
            );
        }

        return color;
    }
}
