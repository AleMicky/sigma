package com.endecorani.sigma_api.modules.cuestionarios.application.service;

import com.endecorani.sigma_api.modules.cuestionarios.application.dto.request.ResponderPreguntaItemRequest;
import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.TipoPregunta;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioPregunta;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioPreguntaOpcion;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioRespuestaDetalle;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class CuestionarioPuntajeCalculator {

    private static final BigDecimal CIEN = BigDecimal.valueOf(100);
    private static final BigDecimal DEFAULT_MIN_ESCALA = BigDecimal.ONE;
    private static final BigDecimal DEFAULT_MAX_ESCALA = BigDecimal.valueOf(5);

    public record ResultadoEvaluacion(
            List<CuestionarioRespuestaDetalle> respuestas,
            BigDecimal puntajeTotal,
            BigDecimal puntajeMaximo,
            BigDecimal porcentaje
    ) {}

    public ResultadoEvaluacion evaluar(
            UUID asignacionId,
            List<CuestionarioPregunta> preguntasActivas,
            List<ResponderPreguntaItemRequest> itemsEnviados
    ) {
        Map<UUID, CuestionarioPregunta> preguntasPorId = preguntasActivas.stream()
                .collect(Collectors.toMap(
                        CuestionarioPregunta::getId,
                        Function.identity(),
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        Map<UUID, ResponderPreguntaItemRequest> respuestasPorPregunta = new LinkedHashMap<>();
        if (itemsEnviados != null) {
            for (ResponderPreguntaItemRequest item : itemsEnviados) {
                if (item == null || item.preguntaId() == null) {
                    throw new BusinessException("RESPUESTA_PREGUNTA_INVALIDA", "Cada respuesta debe especificar una pregunta válida");
                }
                if (!preguntasPorId.containsKey(item.preguntaId())) {
                    throw new BusinessException(
                            "RESPUESTA_PREGUNTA_INVALIDA",
                            "La pregunta '%s' no pertenece al cuestionario activo".formatted(item.preguntaId())
                    );
                }
                if (respuestasPorPregunta.put(item.preguntaId(), item) != null) {
                    throw new BusinessException(
                            "RESPUESTA_PREGUNTA_DUPLICADA",
                            "Se enviaron múltiples respuestas para la misma pregunta '%s'".formatted(item.preguntaId())
                    );
                }
            }
        }

        List<CuestionarioRespuestaDetalle> detalles = new ArrayList<>();
        BigDecimal puntajeTotal = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal puntajeMaximo = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        for (CuestionarioPregunta pregunta : preguntasActivas) {
            ResponderPreguntaItemRequest item = respuestasPorPregunta.get(pregunta.getId());
            boolean respondida = estaRespondida(pregunta.getTipoPregunta(), item);

            if (!respondida) {
                if (Boolean.TRUE.equals(pregunta.getObligatoria())) {
                    throw new BusinessException(
                            "RESPUESTA_OBLIGATORIA_FALTANTE",
                            "La pregunta obligatoria '%s' requiere una respuesta".formatted(pregunta.getEnunciado())
                    );
                }
                continue;
            }

            BigDecimal peso = pregunta.getPeso() != null ? pregunta.getPeso() : BigDecimal.ZERO;
            CuestionarioRespuestaDetalle detalle = CuestionarioRespuestaDetalle.builder()
                    .asignacionId(asignacionId)
                    .preguntaId(pregunta.getId())
                    .preguntaEnunciadoSnapshot(pregunta.getEnunciado())
                    .tipoPreguntaSnapshot(pregunta.getTipoPregunta())
                    .build();

            BigDecimal puntajePregunta = null;
            BigDecimal maximoPregunta = BigDecimal.ZERO;

            switch (pregunta.getTipoPregunta()) {
                case ESTRELLAS_1_5, ESCALA_1_5 -> {
                    BigDecimal min = leerDecimalConfig(pregunta.getConfigJson(), "min", DEFAULT_MIN_ESCALA);
                    BigDecimal max = leerDecimalConfig(pregunta.getConfigJson(), "max", DEFAULT_MAX_ESCALA);
                    BigDecimal valor = item.valorNumerico();
                    validarRangoNumerico(pregunta, valor, min, max);
                    detalle.setValorNumerico(valor.setScale(2, RoundingMode.HALF_UP));
                    if (peso.compareTo(BigDecimal.ZERO) > 0) {
                        puntajePregunta = valor.multiply(peso).setScale(2, RoundingMode.HALF_UP);
                        maximoPregunta = max.multiply(peso).setScale(2, RoundingMode.HALF_UP);
                    } else {
                        puntajePregunta = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
                    }
                }
                case SI_NO -> {
                    Boolean valor = item.valorBooleano();
                    detalle.setValorBooleano(valor);
                    if (peso.compareTo(BigDecimal.ZERO) > 0) {
                        puntajePregunta = Boolean.TRUE.equals(valor)
                                ? peso.setScale(2, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
                        maximoPregunta = peso.setScale(2, RoundingMode.HALF_UP);
                    } else {
                        puntajePregunta = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
                    }
                }
                case OPCION_UNICA -> {
                    Map<UUID, CuestionarioPreguntaOpcion> opcionesActivas = mapaOpcionesActivas(pregunta);
                    CuestionarioPreguntaOpcion seleccionada = opcionesActivas.get(item.opcionId());
                    if (seleccionada == null) {
                        throw new BusinessException(
                                "RESPUESTA_OPCION_INVALIDA",
                                "La opción seleccionada no es válida para la pregunta '%s'".formatted(pregunta.getEnunciado())
                        );
                    }
                    detalle.setOpcionId(seleccionada.getId());
                    BigDecimal puntajeOpcion = seleccionada.getPuntaje() != null ? seleccionada.getPuntaje() : BigDecimal.ZERO;
                    BigDecimal maxOpcion = opcionesActivas.values().stream()
                            .map(o -> o.getPuntaje() != null ? o.getPuntaje() : BigDecimal.ZERO)
                            .max(BigDecimal::compareTo)
                            .orElse(BigDecimal.ZERO);
                    if (maxOpcion.compareTo(BigDecimal.ZERO) < 0) {
                        maxOpcion = BigDecimal.ZERO;
                    }
                    if (peso.compareTo(BigDecimal.ZERO) > 0) {
                        puntajePregunta = puntajeOpcion.multiply(peso).setScale(2, RoundingMode.HALF_UP);
                        maximoPregunta = maxOpcion.multiply(peso).setScale(2, RoundingMode.HALF_UP);
                    } else {
                        puntajePregunta = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
                    }
                }
                case OPCION_MULTIPLE -> {
                    Map<UUID, CuestionarioPreguntaOpcion> opcionesActivas = mapaOpcionesActivas(pregunta);
                    Set<UUID> unicas = new LinkedHashSet<>(item.opcionesIds());
                    BigDecimal sumaSeleccionadas = BigDecimal.ZERO;
                    for (UUID opcionId : unicas) {
                        CuestionarioPreguntaOpcion opcion = opcionesActivas.get(opcionId);
                        if (opcion == null) {
                            throw new BusinessException(
                                    "RESPUESTA_OPCION_INVALIDA",
                                    "Una o más opciones seleccionadas no son válidas para la pregunta '%s'"
                                            .formatted(pregunta.getEnunciado())
                            );
                        }
                        if (opcion.getPuntaje() != null) {
                            sumaSeleccionadas = sumaSeleccionadas.add(opcion.getPuntaje());
                        }
                    }
                    validarCantidadSelecciones(pregunta, unicas.size());
                    detalle.setOpcionesIds(new ArrayList<>(unicas));
                    BigDecimal sumaMaxPositivas = opcionesActivas.values().stream()
                            .map(o -> o.getPuntaje() != null ? o.getPuntaje() : BigDecimal.ZERO)
                            .filter(p -> p.compareTo(BigDecimal.ZERO) > 0)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    if (peso.compareTo(BigDecimal.ZERO) > 0) {
                        puntajePregunta = sumaSeleccionadas.multiply(peso).setScale(2, RoundingMode.HALF_UP);
                        maximoPregunta = sumaMaxPositivas.multiply(peso).setScale(2, RoundingMode.HALF_UP);
                    } else {
                        puntajePregunta = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
                    }
                }
                case TEXTO_CORTO, TEXTO_LARGO -> {
                    String texto = item.valorTexto().trim();
                    validarLongitudTexto(pregunta, texto);
                    detalle.setValorTexto(texto);
                }
                case NUMERICO -> {
                    BigDecimal valor = item.valorNumerico();
                    BigDecimal min = leerDecimalConfig(pregunta.getConfigJson(), "min", null);
                    BigDecimal max = leerDecimalConfig(pregunta.getConfigJson(), "max", null);
                    validarRangoNumerico(pregunta, valor, min, max);
                    detalle.setValorNumerico(valor.setScale(2, RoundingMode.HALF_UP));
                }
            }

            detalle.setPuntajeObtenido(puntajePregunta);
            if (puntajePregunta != null && maximoPregunta.compareTo(BigDecimal.ZERO) > 0) {
                puntajeTotal = puntajeTotal.add(puntajePregunta);
                puntajeMaximo = puntajeMaximo.add(maximoPregunta);
            }
            detalles.add(detalle);
        }

        BigDecimal porcentaje = puntajeMaximo.compareTo(BigDecimal.ZERO) > 0
                ? puntajeTotal.multiply(CIEN).divide(puntajeMaximo, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        return new ResultadoEvaluacion(
                detalles,
                puntajeTotal.setScale(2, RoundingMode.HALF_UP),
                puntajeMaximo.setScale(2, RoundingMode.HALF_UP),
                porcentaje
        );
    }

    private boolean estaRespondida(TipoPregunta tipo, ResponderPreguntaItemRequest item) {
        if (item == null) {
            return false;
        }
        return switch (tipo) {
            case ESTRELLAS_1_5, ESCALA_1_5, NUMERICO -> item.valorNumerico() != null;
            case SI_NO -> item.valorBooleano() != null;
            case OPCION_UNICA -> item.opcionId() != null;
            case OPCION_MULTIPLE -> item.opcionesIds() != null && !item.opcionesIds().isEmpty();
            case TEXTO_CORTO, TEXTO_LARGO -> item.valorTexto() != null && !item.valorTexto().isBlank();
        };
    }

    private Map<UUID, CuestionarioPreguntaOpcion> mapaOpcionesActivas(CuestionarioPregunta pregunta) {
        if (pregunta.getOpciones() == null) {
            return Map.of();
        }
        return pregunta.getOpciones().stream()
                .filter(o -> Boolean.TRUE.equals(o.getActivo()))
                .collect(Collectors.toMap(
                        CuestionarioPreguntaOpcion::getId,
                        Function.identity(),
                        (a, b) -> a,
                        LinkedHashMap::new
                ));
    }

    private void validarRangoNumerico(
            CuestionarioPregunta pregunta,
            BigDecimal valor,
            BigDecimal min,
            BigDecimal max
    ) {
        if (min != null && valor.compareTo(min) < 0) {
            throw new BusinessException(
                    "RESPUESTA_VALOR_FUERA_DE_RANGO",
                    "El valor para '%s' no puede ser menor que %s".formatted(pregunta.getEnunciado(), min.stripTrailingZeros().toPlainString())
            );
        }
        if (max != null && valor.compareTo(max) > 0) {
            throw new BusinessException(
                    "RESPUESTA_VALOR_FUERA_DE_RANGO",
                    "El valor para '%s' no puede ser mayor que %s".formatted(pregunta.getEnunciado(), max.stripTrailingZeros().toPlainString())
            );
        }
    }

    private void validarLongitudTexto(CuestionarioPregunta pregunta, String texto) {
        Integer minLength = leerEnteroConfig(pregunta.getConfigJson(), "minLength");
        Integer maxLength = leerEnteroConfig(pregunta.getConfigJson(), "maxLength");
        if (minLength != null && texto.length() < minLength) {
            throw new BusinessException(
                    "RESPUESTA_LONGITUD_INVALIDA",
                    "La respuesta para '%s' debe tener al menos %d caracteres".formatted(pregunta.getEnunciado(), minLength)
            );
        }
        if (maxLength != null && texto.length() > maxLength) {
            throw new BusinessException(
                    "RESPUESTA_LONGITUD_INVALIDA",
                    "La respuesta para '%s' no puede exceder %d caracteres".formatted(pregunta.getEnunciado(), maxLength)
            );
        }
    }

    private void validarCantidadSelecciones(CuestionarioPregunta pregunta, int cantidad) {
        Integer minSel = leerEnteroConfig(pregunta.getConfigJson(), "minSelections");
        Integer maxSel = leerEnteroConfig(pregunta.getConfigJson(), "maxSelections");
        if (minSel != null && cantidad < minSel) {
            throw new BusinessException(
                    "RESPUESTA_OPCION_INVALIDA",
                    "La pregunta '%s' requiere seleccionar al menos %d opción(es)".formatted(pregunta.getEnunciado(), minSel)
            );
        }
        if (maxSel != null && cantidad > maxSel) {
            throw new BusinessException(
                    "RESPUESTA_OPCION_INVALIDA",
                    "La pregunta '%s' permite seleccionar como máximo %d opción(es)".formatted(pregunta.getEnunciado(), maxSel)
            );
        }
    }

    private BigDecimal leerDecimalConfig(Map<String, Object> config, String key, BigDecimal defaultValue) {
        if (config == null || !config.containsKey(key) || config.get(key) == null) {
            return defaultValue;
        }
        Object raw = config.get(key);
        if (raw instanceof BigDecimal bd) {
            return bd;
        }
        if (raw instanceof Number n) {
            return BigDecimal.valueOf(n.doubleValue());
        }
        try {
            return new BigDecimal(raw.toString().trim());
        } catch (NumberFormatException ex) {
            return defaultValue;
        }
    }

    private Integer leerEnteroConfig(Map<String, Object> config, String key) {
        if (config == null || !config.containsKey(key) || config.get(key) == null) {
            return null;
        }
        Object raw = config.get(key);
        if (raw instanceof Number n) {
            return n.intValue();
        }
        try {
            return Integer.parseInt(raw.toString().trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
