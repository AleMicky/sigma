package com.endecorani.sigma_api.shared.application.pagination;

import com.endecorani.sigma_api.shared.util.ApiConstants;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

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
                message = "El tamaño máximo permitido es 100"
        )
        Integer size,
        String sortBy,
        Sort.Direction direction
) {

    public PageRequestDto {
        page = page == null ? 0 : page;
        size = size == null ? ApiConstants.DEFAULT_PAGE_SIZE : size;
        sortBy = sortBy == null || sortBy.isBlank()
                ? ApiConstants.DEFAULT_SORT_FIELD
                : sortBy;
        direction = direction == null
                ? Sort.Direction.fromString(ApiConstants.DEFAULT_SORT_DIRECTION)
                : direction;
    }

    public Pageable toPageable() {
        return PageRequest.of(
                page,
                size,
                Sort.by(direction, sortBy)
        );
    }
}
