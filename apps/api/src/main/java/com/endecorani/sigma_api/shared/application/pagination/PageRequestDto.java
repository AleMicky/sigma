package com.endecorani.sigma_api.shared.application.pagination;

import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Set;

public record PageRequestDto(
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
        Sort.Direction direction
) {

    /** REQ-MANT-030: código del contrato que usan los controllers de mantenimientos para rechazar {@code size > 500}. */
    public static final String INVALID_PAGE_SIZE_CODE = "INVALID_PAGE_SIZE";

    public PageRequestDto {
        page = page == null || page < 0 ? 0 : page;
        // REQ-MANT-030: se restaura el clamp global (heredado): size>500 se recorta a 500
        // y responde 200. El rechazo 400 INVALID_PAGE_SIZE es exclusivo de mantenimientos
        // y se aplica en sus controllers con MantenimientoPageSizeValidator antes de este DTO.
        size = size == null || size <= 0 ? ApiConstants.DEFAULT_PAGE_SIZE : Math.min(size, ApiConstants.MAX_PAGE_SIZE);
        sortBy = sortBy == null || sortBy.isBlank()
                ? ApiConstants.DEFAULT_SORT_FIELD
                : sortBy;
        direction = direction == null
                ? Sort.Direction.fromString(ApiConstants.DEFAULT_SORT_DIRECTION)
                : direction;
    }

    public PageRequestDto() {
        this(null, null, null, null);
    }

    public Pageable toPageable() {
        return toPageable(ApiConstants.BASE_SORT_FIELDS);
    }

    public Pageable toPageable(Set<String> allowedSortFields) {
        if (allowedSortFields == null || !allowedSortFields.contains(sortBy)) {
            String allowed = allowedSortFields != null ? String.join(", ", allowedSortFields) : "";
            throw new BusinessException(
                    "INVALID_SORT_FIELD",
                    "El campo de ordenación '%s' no es válido. Campos permitidos: [%s]".formatted(sortBy, allowed)
            );
        }

        return PageRequest.of(
                page,
                size,
                Sort.by(direction, sortBy)
        );
    }

    public SearchPageRequestDto withSearch(String search) {
        return new SearchPageRequestDto(this, search);
    }

    public SearchPageRequestDto withSearch(String search, String q) {
        return new SearchPageRequestDto(this, search, q);
    }
}
