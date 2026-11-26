package com.endecorani.sigma_api.shared.util;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

/**
 * Parser reutilizable para fechas/horas ISO-8601 que acepta tanto {@link LocalDateTime}
 * (ej. {@code 2026-11-26T10:00:00}) como timestamps con sufijo {@code Z} u offset
 * (ej. {@code 2026-11-26T14:00:00Z} o {@code 2026-11-26T10:00:00-04:00}),
 * convirtiendo estos últimos a la zona horaria operacional {@code America/La_Paz}.
 */
public final class FlexibleLocalDateTimeParser {

    public static final ZoneId OPERATIONAL_ZONE = ZoneId.of("America/La_Paz");

    private FlexibleLocalDateTimeParser() {
    }

    public static LocalDateTime parse(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String trimmed = raw.trim();

        // 1. Timestamps con offset o sufijo Z (ej. 2026-11-26T14:00:00Z, 2026-11-26T10:00:00-04:00)
        try {
            OffsetDateTime odt = OffsetDateTime.parse(trimmed, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            return odt.atZoneSameInstant(OPERATIONAL_ZONE).toLocalDateTime();
        } catch (DateTimeParseException ignored) {
            // Intentar siguientes formatos ISO
        }

        // 2. Timestamps con zona explícita (ej. 2026-11-26T10:00:00-04:00[America/La_Paz])
        try {
            ZonedDateTime zdt = ZonedDateTime.parse(trimmed, DateTimeFormatter.ISO_ZONED_DATE_TIME);
            return zdt.withZoneSameInstant(OPERATIONAL_ZONE).toLocalDateTime();
        } catch (DateTimeParseException ignored) {
            // Intentar formato local
        }

        // 3. LocalDateTime sin offset (ej. 2026-11-26T10:00:00 o 2026-11-26T10:00)
        return LocalDateTime.parse(trimmed, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }
}
