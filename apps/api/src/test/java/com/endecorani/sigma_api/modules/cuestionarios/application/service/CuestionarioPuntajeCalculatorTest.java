package com.endecorani.sigma_api.modules.cuestionarios.application.service;

import com.endecorani.sigma_api.modules.cuestionarios.application.dto.request.ResponderPreguntaItemRequest;
import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.TipoPregunta;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioPregunta;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioPreguntaOpcion;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CuestionarioPuntajeCalculatorTest {

    private final CuestionarioPuntajeCalculator calculator = new CuestionarioPuntajeCalculator();

    @Test
    void evaluar_todosLosTiposDePregunta_calculaPuntajesYPorcentajeCorrectamente() {
        UUID asignacionId = UUID.randomUUID();

        UUID p1Id = UUID.randomUUID(); // ESTRELLAS_1_5, peso 1.0 -> val 4 -> 4/5
        UUID p2Id = UUID.randomUUID(); // ESCALA_1_5, peso 2.0 -> val 5 -> 10/10
        UUID p3Id = UUID.randomUUID(); // SI_NO, peso 1.5 -> true -> 1.5/1.5
        UUID p4Id = UUID.randomUUID(); // OPCION_UNICA, peso 1.0 -> opcion 4/5 -> 4/5
        UUID p5Id = UUID.randomUUID(); // OPCION_MULTIPLE, peso 1.0 -> op1(2)+op2(3)=5 / max(2+3+0)=5 -> 5/5
        UUID p6Id = UUID.randomUUID(); // TEXTO_CORTO -> sin puntaje
        UUID p7Id = UUID.randomUUID(); // TEXTO_LARGO -> sin puntaje
        UUID p8Id = UUID.randomUUID(); // NUMERICO -> sin puntaje, rango 0..100

        UUID op4A = UUID.randomUUID();
        UUID op4B = UUID.randomUUID();
        UUID op5A = UUID.randomUUID();
        UUID op5B = UUID.randomUUID();
        UUID op5C = UUID.randomUUID();

        List<CuestionarioPregunta> preguntas = List.of(
                pregunta(p1Id, TipoPregunta.ESTRELLAS_1_5, true, "1.00", null, List.of()),
                pregunta(p2Id, TipoPregunta.ESCALA_1_5, true, "2.00", Map.of("min", 1, "max", 5), List.of()),
                pregunta(p3Id, TipoPregunta.SI_NO, true, "1.50", null, List.of()),
                pregunta(p4Id, TipoPregunta.OPCION_UNICA, true, "1.00", null, List.of(
                        opcion(op4A, p4Id, "Excelente", "5.00"),
                        opcion(op4B, p4Id, "Bueno", "4.00")
                )),
                pregunta(p5Id, TipoPregunta.OPCION_MULTIPLE, true, "1.00", null, List.of(
                        opcion(op5A, p5Id, "A", "2.00"),
                        opcion(op5B, p5Id, "B", "3.00"),
                        opcion(op5C, p5Id, "C", "0.00")
                )),
                pregunta(p6Id, TipoPregunta.TEXTO_CORTO, true, "0.00", Map.of("minLength", 3, "maxLength", 50), List.of()),
                pregunta(p7Id, TipoPregunta.TEXTO_LARGO, false, "0.00", Map.of("maxLength", 200), List.of()),
                pregunta(p8Id, TipoPregunta.NUMERICO, true, "0.00", Map.of("min", 0, "max", 100), List.of())
        );

        List<ResponderPreguntaItemRequest> respuestas = List.of(
                new ResponderPreguntaItemRequest(p1Id, null, BigDecimal.valueOf(4), null, null, null),
                new ResponderPreguntaItemRequest(p2Id, null, BigDecimal.valueOf(5), null, null, null),
                new ResponderPreguntaItemRequest(p3Id, null, null, true, null, null),
                new ResponderPreguntaItemRequest(p4Id, null, null, null, op4B, null),
                new ResponderPreguntaItemRequest(p5Id, null, null, null, null, List.of(op5A, op5B)),
                new ResponderPreguntaItemRequest(p6Id, "Muy bueno", null, null, null, null),
                new ResponderPreguntaItemRequest(p7Id, "Sin observaciones adicionales", null, null, null, null),
                new ResponderPreguntaItemRequest(p8Id, null, BigDecimal.valueOf(42), null, null, null)
        );

        CuestionarioPuntajeCalculator.ResultadoEvaluacion res = calculator.evaluar(asignacionId, preguntas, respuestas);

        // Total = 4 + 10 + 1.5 + 4 + 5 = 24.50
        // Max = 5 + 10 + 1.5 + 5 + 5 = 26.50
        // Porcentaje = 24.50 * 100 / 26.50 = 92.45
        assertEquals(8, res.respuestas().size());
        assertEquals(new BigDecimal("24.50"), res.puntajeTotal());
        assertEquals(new BigDecimal("26.50"), res.puntajeMaximo());
        assertEquals(new BigDecimal("92.45"), res.porcentaje());
        assertNull(res.respuestas().get(5).getPuntajeObtenido());
        assertNull(res.respuestas().get(7).getPuntajeObtenido());
    }

    @Test
    void evaluar_preguntaObligatoriaFaltante_lanzaBusinessException() {
        UUID p1Id = UUID.randomUUID();
        List<CuestionarioPregunta> preguntas = List.of(
                pregunta(p1Id, TipoPregunta.ESTRELLAS_1_5, true, "1.00", null, List.of())
        );

        BusinessException ex = assertThrows(
                BusinessException.class,
                () -> calculator.evaluar(UUID.randomUUID(), preguntas, List.of())
        );
        assertEquals("RESPUESTA_OBLIGATORIA_FALTANTE", ex.getCode());
    }

    @Test
    void evaluar_estrellasFueraDeRango_lanzaBusinessException() {
        UUID p1Id = UUID.randomUUID();
        List<CuestionarioPregunta> preguntas = List.of(
                pregunta(p1Id, TipoPregunta.ESTRELLAS_1_5, true, "1.00", null, List.of())
        );

        BusinessException ex = assertThrows(
                BusinessException.class,
                () -> calculator.evaluar(
                        UUID.randomUUID(),
                        preguntas,
                        List.of(new ResponderPreguntaItemRequest(p1Id, null, BigDecimal.valueOf(6), null, null, null))
                )
        );
        assertEquals("RESPUESTA_VALOR_FUERA_DE_RANGO", ex.getCode());
    }

    @Test
    void evaluar_textoSuperaMaxLength_lanzaBusinessException() {
        UUID p1Id = UUID.randomUUID();
        List<CuestionarioPregunta> preguntas = List.of(
                pregunta(p1Id, TipoPregunta.TEXTO_CORTO, true, "0.00", Map.of("maxLength", 5), List.of())
        );

        BusinessException ex = assertThrows(
                BusinessException.class,
                () -> calculator.evaluar(
                        UUID.randomUUID(),
                        preguntas,
                        List.of(new ResponderPreguntaItemRequest(p1Id, "Texto demasiado largo", null, null, null, null))
                )
        );
        assertEquals("RESPUESTA_LONGITUD_INVALIDA", ex.getCode());
    }

    @Test
    void evaluar_opcionInvalidaEnOpcionMultiple_lanzaBusinessException() {
        UUID p1Id = UUID.randomUUID();
        UUID opValida = UUID.randomUUID();
        List<CuestionarioPregunta> preguntas = List.of(
                pregunta(p1Id, TipoPregunta.OPCION_MULTIPLE, true, "1.00", null, List.of(
                        opcion(opValida, p1Id, "Valida", "2.00")
                ))
        );

        BusinessException ex = assertThrows(
                BusinessException.class,
                () -> calculator.evaluar(
                        UUID.randomUUID(),
                        preguntas,
                        List.of(new ResponderPreguntaItemRequest(p1Id, null, null, null, null, List.of(UUID.randomUUID())))
                )
        );
        assertEquals("RESPUESTA_OPCION_INVALIDA", ex.getCode());
    }

    private CuestionarioPregunta pregunta(
            UUID id,
            TipoPregunta tipo,
            boolean obligatoria,
            String peso,
            Map<String, Object> config,
            List<CuestionarioPreguntaOpcion> opciones
    ) {
        return CuestionarioPregunta.builder()
                .id(id)
                .enunciado("Pregunta " + tipo)
                .tipoPregunta(tipo)
                .obligatoria(obligatoria)
                .peso(new BigDecimal(peso))
                .configJson(config)
                .activo(true)
                .opciones(opciones)
                .build();
    }

    private CuestionarioPreguntaOpcion opcion(UUID id, UUID preguntaId, String etiqueta, String puntaje) {
        return CuestionarioPreguntaOpcion.builder()
                .id(id)
                .preguntaId(preguntaId)
                .etiqueta(etiqueta)
                .valor(etiqueta.toUpperCase())
                .puntaje(new BigDecimal(puntaje))
                .activo(true)
                .build();
    }
}
