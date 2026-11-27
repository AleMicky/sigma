package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

/** REQ-MANT-030: el rechazo de size>500 es exclusivo de mantenimientos. */
class MantenimientoPageSizeValidatorTest {

    @Test
    void size501_debeFallarConInvalidPageSize() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> MantenimientoPageSizeValidator.validar(501));

        assertEquals("INVALID_PAGE_SIZE", ex.getMessage());
    }

    @Test
    void size500_debeSerAceptado() {
        assertDoesNotThrow(() -> MantenimientoPageSizeValidator.validar(500));
    }

    @Test
    void sizeAusente_debeSerAceptado() {
        assertDoesNotThrow(() -> MantenimientoPageSizeValidator.validar(null));
    }
}
