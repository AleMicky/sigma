package com.endecorani.sigma_api.shared.application.pagination;

import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PageRequestDtoValidationTest {

    @Test
    void size500_debeSerAceptadoSinRecorte() {
        Pageable pageable = new PageRequestDto(0, 500, "createdAt", Sort.Direction.DESC)
                .toPageable();

        assertEquals(500, pageable.getPageSize());
        assertEquals(0, pageable.getPageNumber());
    }

    @Test
    void size501_debeSerRecortadoA500Globalmente() {
        Pageable pageable = new PageRequestDto(0, 501, "createdAt", Sort.Direction.DESC)
                .toPageable();

        assertEquals(500, pageable.getPageSize());
    }

    @Test
    void size501Recortado_debeNoTenerViolacionDeBeanValidation() {
        PageRequestDto request = new PageRequestDto(0, 501, "createdAt", Sort.Direction.DESC);

        var violations = Validation.buildDefaultValidatorFactory().getValidator().validate(request);

        assertTrue(violations.isEmpty());
    }

    @Test
    void sizeValidoConCampoOrdenNoPermitido_debeFallarConBusinessException() {
        PageRequestDto request = new PageRequestDto(0, 20, "campoInvalido", Sort.Direction.DESC);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> request.toPageable(Set.of("createdAt")));

        assertEquals("INVALID_SORT_FIELD", ex.getCode());
    }
}
