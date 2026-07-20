package com.endecorani.sigma_api.shared.application.pagination;

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
                value = 100,
                message = "El tamaño máximo permitido es 100"
        )
        Integer size,
        String sortBy,
        Sort.Direction direction
) {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 20;
    private static final String DEFAULT_SORT = "createdAt";

    public PageRequestDto {
        page = page == null ? DEFAULT_PAGE : page;
        size = size == null ? DEFAULT_SIZE : size;

        sortBy = sortBy == null || sortBy.isBlank()
                ? DEFAULT_SORT
                : sortBy;
    }

    public Pageable toPageable() {

        Sort sort = Sort.by(direction, sortBy);

        return PageRequest.of(
                page,
                size,
                sort
        );
    }
}
