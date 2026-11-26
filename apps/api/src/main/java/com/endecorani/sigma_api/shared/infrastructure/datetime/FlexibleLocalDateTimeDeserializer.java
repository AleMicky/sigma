package com.endecorani.sigma_api.shared.infrastructure.datetime;

import com.endecorani.sigma_api.shared.util.FlexibleLocalDateTimeParser;
import tools.jackson.core.JacksonException;
import tools.jackson.core.JsonParser;
import tools.jackson.core.JsonToken;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.ValueDeserializer;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;

/**
 * Deserializador Jackson 3 que acepta {@link LocalDateTime} local o timestamps ISO-8601 con Z/offset,
 * convirtiendo los timestamps con zona horaria a {@code America/La_Paz}.
 */
public class FlexibleLocalDateTimeDeserializer extends ValueDeserializer<LocalDateTime> {

    @Override
    public LocalDateTime deserialize(JsonParser parser, DeserializationContext ctxt) throws JacksonException {
        if (parser.currentToken() == JsonToken.VALUE_NULL) {
            return null;
        }
        String text = parser.getValueAsString();
        if (text == null || text.isBlank()) {
            return null;
        }
        try {
            return FlexibleLocalDateTimeParser.parse(text);
        } catch (DateTimeParseException ex) {
            return (LocalDateTime) ctxt.handleWeirdStringValue(
                    LocalDateTime.class,
                    text,
                    "Formato de fecha/hora inválido. Use ISO-8601 (ej. 2026-11-26T10:00:00 o 2026-11-26T14:00:00Z)"
            );
        }
    }
}
