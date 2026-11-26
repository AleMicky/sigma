package com.endecorani.sigma_api.modules.activos.application.service;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Objects;

import static org.junit.jupiter.api.Assertions.*;

/** Guardia de migración para REQ-BIZ-002: restricciones activas, sin NOTICE silencioso. */
class ActivoAsignacionMigrationTest {

    private static final String MIGRATION =
            "/db/migration/V180__normalize_activo_asignaciones_integrity.sql";

    @Test
    void migracionV180_noDejaChecksNotValidNiNoticesSilenciosos() throws IOException {
        String sql = leerMigracion().toUpperCase(Locale.ROOT);

        assertFalse(sql.contains("NOT VALID"), "La migración no debe dejar CHECK sin validar");
        assertFalse(sql.contains("RAISE NOTICE"), "La migración no debe silenciar fallos con NOTICE");
    }

    @Test
    void migracionV180_activaChecksYIndiceParcial() throws IOException {
        String sql = leerMigracion();

        assertTrue(sql.contains("chk_activo_asignaciones_fechas"));
        assertTrue(sql.contains("chk_activo_asignaciones_destinatario"));
        assertTrue(sql.contains("CREATE UNIQUE INDEX uq_activo_asignaciones_activa"));
        assertTrue(sql.contains("WHERE fecha_devolucion IS NULL"));
        assertTrue(sql.contains("DISTINCT ON (activo_id)"), "Debe conservar una sola asignación abierta por activo");
    }

    private static String leerMigracion() throws IOException {
        try (InputStream stream = Objects.requireNonNull(
                ActivoAsignacionMigrationTest.class.getResourceAsStream(MIGRATION))) {
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
