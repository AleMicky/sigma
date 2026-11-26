package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoResponse;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class ActivoEstadoClasificadorTest {

    @Test
    void deBajaGanaSobreMantenimientoYIgnoraMayusculas() {
        assertEquals(
                ActivoEstadoClasificador.Categoria.DE_BAJA,
                ActivoEstadoClasificador.clasificar(false, "MANTENIMIENTO"));
        assertEquals(
                ActivoEstadoClasificador.Categoria.DE_BAJA,
                ActivoEstadoClasificador.clasificar(false, null));
        assertTrue(ActivoEstadoClasificador.esDeBaja(true, " de_baja "));
        assertFalse(ActivoEstadoClasificador.esDeBaja(true, "MANTENIMIENTO"));
    }

    @Test
    void clasificaCadaEstadoOperativo() {
        assertEquals(
                ActivoEstadoClasificador.Categoria.EN_MANTENIMIENTO,
                ActivoEstadoClasificador.clasificar(true, "mantenimiento"));
        assertEquals(
                ActivoEstadoClasificador.Categoria.FUERA_SERVICIO,
                ActivoEstadoClasificador.clasificar(true, "FUERA_SERVICIO"));
        assertEquals(
                ActivoEstadoClasificador.Categoria.RESERVA,
                ActivoEstadoClasificador.clasificar(true, "Reserva"));
        assertEquals(
                ActivoEstadoClasificador.Categoria.EN_VIAJE,
                ActivoEstadoClasificador.clasificar(true, "en_viaje"));
        assertEquals(
                ActivoEstadoClasificador.Categoria.OPERATIVO,
                ActivoEstadoClasificador.clasificar(true, "OPERATIVO"));
        assertEquals(
                ActivoEstadoClasificador.Categoria.OPERATIVO,
                ActivoEstadoClasificador.clasificar(true, null));
    }

    @Test
    void conteo_esExcluyenteYCalculaDisponibilidad() {
        ActivoEstadoClasificador.Conteo conteo = ActivoEstadoClasificador.Conteo.de(List.of(
                activo(true, "OPERATIVO"),
                activo(true, "operativo"),
                activo(false, "MANTENIMIENTO"), // baja gana
                activo(true, "de_baja"),        // baja gana
                activo(true, "MANTENIMIENTO"),
                activo(true, "RESERVA"),
                activo(true, "EN_VIAJE"),
                activo(true, "FUERA_SERVICIO")));

        assertEquals(8, conteo.total());
        assertEquals(2, conteo.deBaja());
        assertEquals(1, conteo.enMantenimiento());
        assertEquals(1, conteo.fueraServicio());
        assertEquals(1, conteo.reserva());
        assertEquals(1, conteo.enViaje());
        assertEquals(2, conteo.operativo());
        assertEquals(5, conteo.operativos());
        assertEquals(4, conteo.disponibles());
        assertEquals(50.0, conteo.tasaDisponibilidad());

        assertEquals(conteo.total(), conteo.deBaja() + conteo.enMantenimiento() + conteo.operativos());
        assertEquals(conteo.total(), conteo.deBaja()
                + conteo.enMantenimiento()
                + conteo.fueraServicio()
                + conteo.reserva()
                + conteo.enViaje()
                + conteo.operativo());
        assertEquals(conteo.operativo() + conteo.reserva() + conteo.enViaje(), conteo.disponibles());
    }

    @Test
    void conteoSinActivos_tasaCero() {
        ActivoEstadoClasificador.Conteo conteo = ActivoEstadoClasificador.Conteo.de(List.of());

        assertEquals(0, conteo.total());
        assertEquals(0.0, conteo.tasaDisponibilidad());
    }

    private static ActivoResponse activo(Boolean activo, String codigoEstado) {
        return new ActivoResponse(
                UUID.randomUUID(),
                "ACT-" + codigoEstado,
                null,
                "Activo " + codigoEstado,
                null,
                null,
                null,
                new ActivoResponse.EstadoOperativoInfo(
                        UUID.randomUUID(), codigoEstado, codigoEstado, null, null),
                null,
                null,
                activo,
                null);
    }
}
