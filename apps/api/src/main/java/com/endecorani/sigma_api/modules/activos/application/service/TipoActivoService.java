package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.TipoActivoRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.TipoActivoResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivo;
import com.endecorani.sigma_api.modules.activos.domain.repository.CategoriaRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.shared.application.crud.AbstractCrudService;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
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
            "categoriaId",
            "nombre",
            "descripcion",
            "color",
            "icono",
            "createdAt",
            "updatedAt"
    );

    private final TipoActivoRepository tipoActivoRepository;
    private final CategoriaRepository categoriaRepository;

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
        requireCategoriaExists(request.categoriaId());

        String nombre = StringUtils.normalize(request.nombre());
        validateUniqueNameForCreate(nombre);

        return TipoActivo.builder()
                .categoriaId(request.categoriaId())
                .nombre(nombre)
                .descripcion(StringUtils.normalize(request.descripcion()))
                .color(normalizeColor(request.color()))
                .icono(normalizeIcono(request.icono()))
                .build();
    }

    @Override
    protected void updateDomain(
            TipoActivo domain,
            TipoActivoRequest request
    ) {
        requireCategoriaExists(request.categoriaId());

        String nombre = StringUtils.normalize(request.nombre());
        validateUniqueNameForUpdate(nombre, domain.getId());

        domain.setCategoriaId(request.categoriaId());
        domain.setNombre(nombre);
        domain.setDescripcion(StringUtils.normalize(request.descripcion()));
        domain.setColor(normalizeColor(request.color()));
        domain.setIcono(normalizeIcono(request.icono()));
    }

    @Override
    protected TipoActivoResponse toResponse(TipoActivo domain) {
        return new TipoActivoResponse(
                domain.getId(),
                domain.getCategoriaId(),
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

    private void requireCategoriaExists(UUID categoriaId) {
        if (categoriaId == null
                || !categoriaRepository.existsById(categoriaId)) {
            throw new ResourceNotFoundException("Categoría", categoriaId);
        }
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
