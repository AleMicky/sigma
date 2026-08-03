package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.TipoActivoRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.TipoActivoResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivo;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.shared.application.crud.AbstractCrudService;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class TipoActivoService extends AbstractCrudService<
        TipoActivo,
        TipoActivoRequest,
        TipoActivoResponse,
        UUID
        > {

    private static final int NOMBRE_MIN_LENGTH = 2;
    private static final int NOMBRE_MAX_LENGTH = 100;
    private static final int DESCRIPCION_MAX_LENGTH = 255;
    private static final int COLOR_MAX_LENGTH = 7;
    private static final int ICONO_MAX_LENGTH = 50;

    private static final Pattern COLOR_PATTERN = Pattern.compile(
            "^#(?:[0-9A-Fa-f]{6})$"
    );
    private static final Pattern ICONO_PATTERN = Pattern.compile(
            "^[A-Za-z][A-Za-z0-9]*$"
    );

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "nombre",
            "descripcion",
            "color",
            "icono",
            "createdAt",
            "updatedAt"
    );

    private final TipoActivoRepository tipoActivoRepository;

    @Override
    protected CrudRepository<TipoActivo, UUID> repository() {
        return tipoActivoRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Override
    protected TipoActivo toDomain(TipoActivoRequest request) {
        String nombre = requireNormalizedNombre(request.nombre());
        validateUniqueNameForCreate(nombre);

        return TipoActivo.builder()
                .nombre(nombre)
                .descripcion(normalizeDescripcion(request.descripcion()))
                .color(normalizeColor(request.color()))
                .icono(normalizeIcono(request.icono()))
                .build();
    }

    @Override
    protected void updateDomain(
            TipoActivo domain,
            TipoActivoRequest request
    ) {
        String nombre = requireNormalizedNombre(request.nombre());
        validateUniqueNameForUpdate(nombre, domain.getId());

        domain.setNombre(nombre);
        domain.setDescripcion(normalizeDescripcion(request.descripcion()));
        domain.setColor(normalizeColor(request.color()));
        domain.setIcono(normalizeIcono(request.icono()));
    }

    @Override
    protected TipoActivoResponse toResponse(TipoActivo domain) {
        return new TipoActivoResponse(
                domain.getId(),
                domain.getNombre(),
                domain.getDescripcion(),
                domain.getColor(),
                domain.getIcono(),
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );
    }

    @Override
    protected String resourceName() {
        return "Tipo de activo";
    }

    private void validateUniqueNameForCreate(String nombre) {
        if (tipoActivoRepository.existsByNombreIgnoreCase(nombre)) {
            throw new ConflictException(
                    "TIPO_ACTIVO_ALREADY_EXISTS",
                    "Ya existe un tipo de activo con el nombre '%s'"
                            .formatted(nombre)
            );
        }
    }

    private void validateUniqueNameForUpdate(
            String nombre,
            UUID currentId
    ) {
        if (tipoActivoRepository.existsByNombreIgnoreCaseAndIdNot(
                nombre,
                currentId
        )) {
            throw new ConflictException(
                    "TIPO_ACTIVO_ALREADY_EXISTS",
                    "Ya existe otro tipo de activo con el nombre '%s'"
                            .formatted(nombre)
            );
        }
    }

    private String requireNormalizedNombre(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < NOMBRE_MIN_LENGTH
                || normalized.length() > NOMBRE_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_TIPO_ACTIVO_NOMBRE",
                    "El nombre debe tener entre %d y %d caracteres"
                            .formatted(NOMBRE_MIN_LENGTH, NOMBRE_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String normalizeDescripcion(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized != null
                && normalized.length() > DESCRIPCION_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_TIPO_ACTIVO_DESCRIPCION",
                    "La descripción no puede superar los %d caracteres"
                            .formatted(DESCRIPCION_MAX_LENGTH)
            );
        }

        return normalized;
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
                    "INVALID_TIPO_ACTIVO_COLOR",
                    "El color debe tener el formato #RRGGBB"
            );
        }

        return color;
    }

    private String normalizeIcono(String value) {
        String icono = StringUtils.trimToNull(value);
        if (icono == null) {
            return null;
        }

        if (icono.length() > ICONO_MAX_LENGTH
                || !ICONO_PATTERN.matcher(icono).matches()) {
            throw new BusinessException(
                    "INVALID_TIPO_ACTIVO_ICONO",
                    "El icono debe ser un nombre Lucide válido"
            );
        }

        return icono;
    }
}
