package com.endecorani.sigma_api.shared.infrastructure.datetime;

import com.endecorani.sigma_api.shared.util.FlexibleLocalDateTimeParser;
import tools.jackson.core.JacksonException;
import tools.jackson.core.JsonParser;
import tools.jackson.core.JsonToken;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.ValueDeserializer;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

/**
 * Deserializador Jackson 3 para {@link LocalDate} que acepta fechas locales y
 * timestamps ISO-8601 con {@code Z}/offset, normalizándolos a {@code America/La_Paz}.
 */
public class FlexibleLocalDateDeserializer extends ValueDeserializer<LocalDate> {

    @Override
    public LocalDate deserialize(JsonParser parser, DeserializationContext ctxt) throws JacksonException {
        if (parser.currentToken() == JsonToken.VALUE_NULL) {
            return null;
        }
        String text = parser.getValueAsString();
        if (text == null || text.isBlank()) {
            return null;
        }
        try {
            // Formato fecha pura (REQ-MANT-007): 2026-11-26
            return LocalDate.parse(text.trim());
        } catch (DateTimeParseException ignored) {
            // Continuar con timestamps ISO-8601 con/sin zona
        }
        try {
            return FlexibleLocalDateTimeParser.parse(text).toLocalDate();
        } catch (DateTimeParseException ex) {
            return (LocalDate) ctxt.handleWeirdStringValue(
                    LocalDate.class,
                    text,
                    "Formato de fecha inválido. Use ISO-8601 (ej. 2026-11-26 o 2026-11-26T04:00:00Z)"
            );
        }
    }
}
