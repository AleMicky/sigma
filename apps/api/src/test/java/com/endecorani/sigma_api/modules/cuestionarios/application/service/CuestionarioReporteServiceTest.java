package com.endecorani.sigma_api.modules.cuestionarios.application.service;

import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.AsignacionCuestionarioResponse;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.CuestionarioReporteResumenResponse;
import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EstadoAsignacionCuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.TipoPregunta;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.Cuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioAsignacion;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioPregunta;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioRespuestaDetalle;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioAsignacionRepository;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioRepository;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioRespuestaDetalleRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CuestionarioReporteServiceTest {

    @Mock private CuestionarioRepository cuestionarioRepository;
    @Mock private CuestionarioAsignacionRepository asignacionRepository;
    @Mock private CuestionarioRespuestaDetalleRepository respuestaDetalleRepository;
    @Mock private CuestionarioService cuestionarioService;
    @Mock private CuestionarioAsignacionService asignacionService;

    @InjectMocks
    private CuestionarioReporteService service;

    @Test
    void obtenerResumen_convierteFechasConZonaLaPazYCalculaIndicadores() {
        UUID cuestId = UUID.randomUUID();
        UUID conductorId = UUID.randomUUID();
        UUID p1Id = UUID.randomUUID();
        UUID a1Id = UUID.randomUUID();
        UUID a2Id = UUID.randomUUID();

        Cuestionario cuestionario = Cuestionario.builder()
                .id(cuestId)
                .nombre("Evaluación de Conductor")
                .anonimoEnReportes(true)
                .build();

        CuestionarioAsignacion respondida = CuestionarioAsignacion.builder()
                .id(a1Id)
                .cuestionarioId(cuestId)
                .evaluadoTipo("CONDUCTOR")
                .evaluadoId(conductorId)
                .evaluadoNombreSnapshot("Carlos Mamani")
                .estado(EstadoAsignacionCuestionario.RESPONDIDO)
                .puntajeTotal(new BigDecimal("4.00"))
                .puntajeMaximo(new BigDecimal("5.00"))
                .porcentaje(new BigDecimal("80.00"))
                .build();
        CuestionarioAsignacion pendiente = CuestionarioAsignacion.builder()
                .id(a2Id)
                .cuestionarioId(cuestId)
                .estado(EstadoAsignacionCuestionario.PENDIENTE)
                .build();

        CuestionarioPregunta p1 = CuestionarioPregunta.builder()
                .id(p1Id)
                .cuestionarioId(cuestId)
                .orden(1)
                .seccion("Servicio")
                .enunciado("Puntualidad")
                .tipoPregunta(TipoPregunta.ESTRELLAS_1_5)
                .opciones(List.of())
                .build();

        CuestionarioRespuestaDetalle d1 = CuestionarioRespuestaDetalle.builder()
                .asignacionId(a1Id)
                .preguntaId(p1Id)
                .valorNumerico(new BigDecimal("4.00"))
                .puntajeObtenido(new BigDecimal("4.00"))
                .build();

        when(cuestionarioRepository.findById(cuestId)).thenReturn(Optional.of(cuestionario));
        when(asignacionRepository.findForReporteResumen(eq(cuestId), isNull(), any(), any()))
                .thenReturn(List.of(respondida, pendiente));
        when(cuestionarioService.cargarPreguntasConOpciones(cuestId, false)).thenReturn(List.of(p1));
        when(respuestaDetalleRepository.findByAsignacionIdIn(List.of(a1Id))).thenReturn(List.of(d1));

        LocalDate desde = LocalDate.of(2026, 11, 1);
        LocalDate hasta = LocalDate.of(2026, 11, 30);

        CuestionarioReporteResumenResponse resp = service.obtenerResumen(cuestId, null, desde, hasta);

        // Verify La Paz timezone bounds (UTC-4): 2026-11-01T04:00:00Z .. 2026-12-01T04:00:00Z
        ArgumentCaptor<Instant> desdeCap = ArgumentCaptor.forClass(Instant.class);
        ArgumentCaptor<Instant> hastaCap = ArgumentCaptor.forClass(Instant.class);
        verify(asignacionRepository).findForReporteResumen(eq(cuestId), isNull(), desdeCap.capture(), hastaCap.capture());
        assertEquals(Instant.parse("2026-11-01T04:00:00Z"), desdeCap.getValue());
        assertEquals(Instant.parse("2026-12-01T04:00:00Z"), hastaCap.getValue());

        assertEquals(2L, resp.totalAsignadas());
        assertEquals(1L, resp.totalRespondidas());
        assertEquals(1L, resp.totalPendientes());
        assertEquals(new BigDecimal("50.00"), resp.tasaParticipacion());
        assertEquals(new BigDecimal("4.00"), resp.promedioPuntaje());
        assertEquals(new BigDecimal("80.00"), resp.promedioPorcentaje());
        assertEquals(1, resp.porPregunta().size());
        assertEquals(new BigDecimal("4.00"), resp.porPregunta().get(0).promedioValor());
        assertEquals(1, resp.porEvaluado().size());
        assertEquals("Carlos Mamani", resp.porEvaluado().get(0).evaluadoNombre());
    }

    @Test
    void listarRespuestas_anonimoEnReportes_fuerzaRedaccionDeEvaluador() {
        UUID cuestId = UUID.randomUUID();
        Cuestionario cuestionario = Cuestionario.builder()
                .id(cuestId)
                .nombre("Encuesta Anónima")
                .anonimoEnReportes(true)
                .build();
        CuestionarioAsignacion a = CuestionarioAsignacion.builder()
                .id(UUID.randomUUID())
                .cuestionarioId(cuestId)
                .evaluadorEmpleadoId(UUID.randomUUID())
                .anonimoEnReportes(true)
                .estado(EstadoAsignacionCuestionario.RESPONDIDO)
                .build();

        when(cuestionarioRepository.findById(cuestId)).thenReturn(Optional.of(cuestionario));
        when(asignacionRepository.findRespuestasForReporte(eq(cuestId), isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(a)));
        when(asignacionService.mapearAsignaciones(List.of(a), null, true)).thenReturn(List.of(
                new AsignacionCuestionarioResponse(
                        a.getId(), cuestId, "Encuesta Anónima", "C1", 1,
                        "GENERAL", "GENERAL", UUID.randomUUID(), null,
                        null, null, null, null, null,
                        false, true, EstadoAsignacionCuestionario.RESPONDIDO,
                        Instant.now(), Instant.now(), BigDecimal.TEN, BigDecimal.TEN,
                        new BigDecimal("100.00"), null
                )
        ));

        PageResponse<AsignacionCuestionarioResponse> resp = service.listarRespuestas(
                cuestId, null, null, null, new PageRequestDto()
        );

        assertEquals(1, resp.content().size());
        assertNull(resp.content().get(0).evaluadorEmpleadoId());
        assertNull(resp.content().get(0).evaluadorNombre());
        verify(asignacionService).mapearAsignaciones(List.of(a), null, true);
    }
}
