package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.CategoriaRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.CategoriaResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.Categoria;
import com.endecorani.sigma_api.modules.activos.domain.repository.CategoriaRepository;
import com.endecorani.sigma_api.shared.application.crud.AbstractCrudService;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoriaService extends AbstractCrudService<
        Categoria,
        CategoriaRequest,
        CategoriaResponse,
        UUID
        > {

    private static final int CODIGO_MIN_LENGTH = 2;
    private static final int CODIGO_MAX_LENGTH = 50;
    private static final int NOMBRE_MIN_LENGTH = 2;
    private static final int NOMBRE_MAX_LENGTH = 100;
    private static final int DESCRIPCION_MAX_LENGTH = 255;

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "descripcion",
            "orden",
            "createdAt",
            "updatedAt"
    );

    private final CategoriaRepository categoriaRepository;

    @Override
    protected CrudRepository<Categoria, UUID> repository() {
        return categoriaRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Override
    protected Categoria toDomain(CategoriaRequest request) {
        String codigo = requireNormalizedCodigo(request.codigo());
        validateUniqueCodigoForCreate(codigo);

        return Categoria.builder()
                .codigo(codigo)
                .nombre(requireNormalizedNombre(request.nombre()))
                .descripcion(normalizeDescripcion(request.descripcion()))
                .orden(resolveOrden(request.orden()))
                .build();
    }

    @Override
    protected void updateDomain(
            Categoria domain,
            CategoriaRequest request
    ) {
        String codigo = requireNormalizedCodigo(request.codigo());
        validateUniqueCodigoForUpdate(codigo, domain.getId());

        domain.setCodigo(codigo);
        domain.setNombre(requireNormalizedNombre(request.nombre()));
        domain.setDescripcion(normalizeDescripcion(request.descripcion()));
        domain.setOrden(resolveOrden(request.orden()));
    }

    @Override
    protected CategoriaResponse toResponse(Categoria domain) {
        return new CategoriaResponse(
                domain.getId(),
                domain.getCodigo(),
                domain.getNombre(),
                domain.getDescripcion(),
                domain.getOrden(),
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );
    }

    @Override
    protected String resourceName() {
        return "Categoría";
    }

    private void validateUniqueCodigoForCreate(String codigo) {
        if (categoriaRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException(
                    "CATEGORIA_ALREADY_EXISTS",
                    "Ya existe una categoría con el código '%s'"
                            .formatted(codigo)
            );
        }
    }

    private void validateUniqueCodigoForUpdate(
            String codigo,
            UUID currentId
    ) {
        if (categoriaRepository.existsByCodigoIgnoreCaseAndIdNot(
                codigo,
                currentId
        )) {
            throw new ConflictException(
                    "CATEGORIA_ALREADY_EXISTS",
                    "Ya existe otra categoría con el código '%s'"
                            .formatted(codigo)
            );
        }
    }

    private String requireNormalizedCodigo(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < CODIGO_MIN_LENGTH
                || normalized.length() > CODIGO_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_CATEGORIA_CODIGO",
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
                    "INVALID_CATEGORIA_NOMBRE",
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
                    "INVALID_CATEGORIA_DESCRIPCION",
                    "La descripción no puede superar los %d caracteres"
                            .formatted(DESCRIPCION_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private int resolveOrden(Integer orden) {
        if (orden == null) {
            return 0;
        }

        if (orden < 0) {
            throw new BusinessException(
                    "INVALID_CATEGORIA_ORDEN",
                    "El orden no puede ser negativo"
            );
        }

        return orden;
    }
}
