package com.endecorani.sigma_api.shared.application.pagination;

import com.endecorani.sigma_api.shared.util.ApiConstants;
import com.endecorani.sigma_api.shared.util.StringUtils;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Set;

/**
 * DTO unificado para solicitudes paginadas con soporte estándar de búsqueda ('search' o 'q').
 * Unifica ambos parámetros para clientes que utilicen cualquiera de las dos convenciones
 * manteniendo total compatibilidad con PageRequestDto.
 */
public record SearchPageRequestDto(
        @Min(
                value = 0,
                message = "La página no puede ser menor a 0"
        )
        Integer page,

        @Min(
                value = 1,
                message = "El tamaño debe ser mayor a 0"
        )
        @Max(
                value = ApiConstants.MAX_PAGE_SIZE,
                message = "El tamaño máximo permitido es 500"
        )
        Integer size,

        String sortBy,
        Sort.Direction direction,
        String search,
        String q
) {

    public SearchPageRequestDto {
        page = page == null || page < 0 ? 0 : page;
        size = size == null || size <= 0 ? ApiConstants.DEFAULT_PAGE_SIZE : Math.min(size, ApiConstants.MAX_PAGE_SIZE);
        sortBy = sortBy == null || sortBy.isBlank()
                ? ApiConstants.DEFAULT_SORT_FIELD
                : sortBy;
        direction = direction == null
                ? Sort.Direction.fromString(ApiConstants.DEFAULT_SORT_DIRECTION)
                : direction;
        search = StringUtils.normalize(search);
        q = StringUtils.normalize(q);
    }

    public SearchPageRequestDto() {
        this(null, null, null, null, null, null);
    }

    public SearchPageRequestDto(PageRequestDto pageRequest, String search) {
        this(
                pageRequest != null ? pageRequest.page() : null,
                pageRequest != null ? pageRequest.size() : null,
                pageRequest != null ? pageRequest.sortBy() : null,
                pageRequest != null ? pageRequest.direction() : null,
                search,
                null
        );
    }

    public SearchPageRequestDto(PageRequestDto pageRequest, String search, String q) {
        this(
                pageRequest != null ? pageRequest.page() : null,
                pageRequest != null ? pageRequest.size() : null,
                pageRequest != null ? pageRequest.sortBy() : null,
                pageRequest != null ? pageRequest.direction() : null,
                search,
                q
        );
    }

    /**
     * Resuelve el término de búsqueda unificado priorizando 'search' y luego 'q'.
     *
     * @return El término de búsqueda normalizado o null si ninguno fue provisto.
     */
    public String getSearchTerm() {
        if (search != null) {
            return search;
        }
        return q;
    }

    /**
     * Indica si se proporcionó un término de búsqueda ('search' o 'q').
     */
    public boolean hasSearch() {
        return getSearchTerm() != null;
    }

    /**
     * Retorna el PageRequestDto subyacente para interoperabilidad inmediata con servicios existentes.
     */
    public PageRequestDto toPageRequest() {
        return new PageRequestDto(page, size, sortBy, direction);
    }

    /**
     * Convierte a Spring Pageable usando los campos de ordenación por defecto.
     */
    public Pageable toPageable() {
        return toPageRequest().toPageable();
    }

    /**
     * Convierte a Spring Pageable validando los campos de ordenación permitidos.
     */
    public Pageable toPageable(Set<String> allowedSortFields) {
        return toPageRequest().toPageable(allowedSortFields);
    }

    /**
     * Método estático de utilidad para resolver el término entre search y q cuando no se use el DTO.
     */
    public static String resolveSearchTerm(String search, String q) {
        String normalizedSearch = StringUtils.normalize(search);
        if (normalizedSearch != null) {
            return normalizedSearch;
        }
        return StringUtils.normalize(q);
    }
}

