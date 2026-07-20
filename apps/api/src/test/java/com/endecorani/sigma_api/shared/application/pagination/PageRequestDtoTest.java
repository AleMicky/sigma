package com.endecorani.sigma_api.shared.application.pagination;

import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

class PageRequestDtoTest {

    @Test
    void appliesDefaultsWhenValuesAreNull() {
        PageRequestDto dto = new PageRequestDto(null, null, null, null);

        assertEquals(0, dto.page());
        assertEquals(ApiConstants.DEFAULT_PAGE_SIZE, dto.size());
        assertEquals(ApiConstants.DEFAULT_SORT_FIELD, dto.sortBy());
        assertEquals(Sort.Direction.DESC, dto.direction());
    }

    @Test
    void toPageableUsesResolvedDefaults() {
        Pageable pageable = new PageRequestDto(null, null, "  ", null).toPageable();

        assertEquals(0, pageable.getPageNumber());
        assertEquals(ApiConstants.DEFAULT_PAGE_SIZE, pageable.getPageSize());
        assertFalse(pageable.getSort().isUnsorted());
        assertEquals(
                Sort.Order.desc(ApiConstants.DEFAULT_SORT_FIELD),
                pageable.getSort().getOrderFor(ApiConstants.DEFAULT_SORT_FIELD)
        );
    }

    @Test
    void preservesExplicitValues() {
        PageRequestDto dto = new PageRequestDto(
                2,
                50,
                "nombre",
                Sort.Direction.ASC
        );

        assertEquals(2, dto.page());
        assertEquals(50, dto.size());
        assertEquals("nombre", dto.sortBy());
        assertEquals(Sort.Direction.ASC, dto.direction());
    }

    @Test
    void toPageableRejectsUnknownSortField() {
        PageRequestDto dto = new PageRequestDto(0, 20, "foo", Sort.Direction.ASC);

        BusinessException exception = assertThrows(
                BusinessException.class,
                dto::toPageable
        );

        assertEquals("INVALID_SORT_FIELD", exception.getCode());
    }

    @Test
    void toPageableAcceptsCustomAllowedFields() {
        PageRequestDto dto = new PageRequestDto(0, 10, "nombre", Sort.Direction.ASC);

        Pageable pageable = dto.toPageable(Set.of("nombre", "createdAt"));

        assertEquals(
                Sort.Order.asc("nombre"),
                pageable.getSort().getOrderFor("nombre")
        );
    }
}
