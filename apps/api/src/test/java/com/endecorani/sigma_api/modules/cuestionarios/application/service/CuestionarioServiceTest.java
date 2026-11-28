package com.endecorani.sigma_api.modules.cuestionarios.application.service;

import com.endecorani.sigma_api.modules.cuestionarios.application.dto.request.CuestionarioRequest;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.request.PreguntaItemRequest;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.request.PreguntaOpcionItemRequest;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.request.ReemplazarPreguntasRequest;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.CuestionarioDetalleResponse;
import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EstadoAsignacionCuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EstadoCuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.TipoPregunta;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.Cuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioPregunta;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioPreguntaOpcion;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioAsignacionRepository;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioPreguntaOpcionRepository;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioPreguntaRepository;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioRepository;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioRespuestaDetalleRepository;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CuestionarioServiceTest {

    @Mock private CuestionarioRepository cuestionarioRepository;
    @Mock private CuestionarioPreguntaRepository preguntaRepository;
    @Mock private CuestionarioPreguntaOpcionRepository opcionRepository;
    @Mock private CuestionarioAsignacionRepository asignacionRepository;
    @Mock private CuestionarioRespuestaDetalleRepository respuestaDetalleRepository;

    @InjectMocks
    private CuestionarioService service;

    @Test
    void crear_codigoNormalizadoUppercaseYDuplicadoLanza409() {
        CuestionarioRequest req = new CuestionarioRequest(
                "  eval_conductor ",
                "Evaluación",
                "Desc",
                "gestion_vehicular",
                "solicitud_vehicular",
                "al_finalizar",
                true,
                false,
                true
        );

        when(cuestionarioRepository.existsByCodigoIgnoreCase("EVAL_CONDUCTOR")).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () -> service.crear(req));
        assertEquals("CUESTIONARIO_CODIGO_DUPLICADO", ex.getCode());
    }

    @Test
    void reemplazarPreguntas_conRespuestasPrevias_lanza409() {
        UUID id = UUID.randomUUID();
        when(cuestionarioRepository.findById(id)).thenReturn(Optional.of(cuestionarioBase(id, EstadoCuestionario.PUBLICADO)));
        when(asignacionRepository.existsByCuestionarioIdAndEstado(id, EstadoAsignacionCuestionario.RESPONDIDO)).thenReturn(true);

        ReemplazarPreguntasRequest req = new ReemplazarPreguntasRequest(List.of());
        ConflictException ex = assertThrows(ConflictException.class, () -> service.reemplazarPreguntas(id, req));
        assertEquals("CUESTIONARIO_CON_RESPUESTAS", ex.getCode());
    }

    @Test
    void reemplazarPreguntas_opcionUnicaConMenosDeDosOpciones_lanza422() {
        UUID id = UUID.randomUUID();
        when(cuestionarioRepository.findById(id)).thenReturn(Optional.of(cuestionarioBase(id, EstadoCuestionario.BORRADOR)));
        when(asignacionRepository.existsByCuestionarioIdAndEstado(id, EstadoAsignacionCuestionario.RESPONDIDO)).thenReturn(false);
        when(respuestaDetalleRepository.existsByCuestionarioId(id)).thenReturn(false);

        ReemplazarPreguntasRequest req = new ReemplazarPreguntasRequest(List.of(
                new PreguntaItemRequest(
                        null, "Sec", 1, "Pregunta cerrada", null,
                        TipoPregunta.OPCION_UNICA, true, BigDecimal.ONE, null, true,
                        List.of(new PreguntaOpcionItemRequest(null, 1, "Unica", "UNICA", BigDecimal.ONE, true))
                )
        ));

        BusinessException ex = assertThrows(BusinessException.class, () -> service.reemplazarPreguntas(id, req));
        assertEquals("PREGUNTA_OPCIONES_INSUFICIENTES", ex.getCode());
    }

    @Test
    void publicar_sinPreguntasActivas_lanza422() {
        UUID id = UUID.randomUUID();
        when(cuestionarioRepository.findById(id)).thenReturn(Optional.of(cuestionarioBase(id, EstadoCuestionario.BORRADOR)));
        when(preguntaRepository.findByCuestionarioIdAndActivoTrueOrderByOrdenAsc(id)).thenReturn(List.of());

        BusinessException ex = assertThrows(BusinessException.class, () -> service.publicar(id, false));
        assertEquals("CUESTIONARIO_SIN_PREGUNTAS", ex.getCode());
    }

    @Test
    void publicar_disparadorOcupadoSinReemplazar_lanza409() {
        UUID id = UUID.randomUUID();
        UUID otroId = UUID.randomUUID();
        Cuestionario target = cuestionarioBase(id, EstadoCuestionario.BORRADOR);
        Cuestionario ocupado = cuestionarioBase(otroId, EstadoCuestionario.PUBLICADO);

        when(cuestionarioRepository.findById(id)).thenReturn(Optional.of(target));
        when(preguntaRepository.findByCuestionarioIdAndActivoTrueOrderByOrdenAsc(id))
                .thenReturn(List.of(preguntaEstrellas(id)));
        when(opcionRepository.findByPreguntaIdInOrderByOrdenAsc(anyList())).thenReturn(List.of());
        when(cuestionarioRepository.findPublishedActiveByDisparadorExcludingId(
                "GESTION_VEHICULAR", "SOLICITUD_VEHICULAR", "AL_FINALIZAR", id
        )).thenReturn(List.of(ocupado));

        ConflictException ex = assertThrows(ConflictException.class, () -> service.publicar(id, false));
        assertEquals("CUESTIONARIO_DISPARADOR_OCUPADO", ex.getCode());
    }

    @Test
    void publicar_conReemplazarActivoTrue_inactivaAnteriorYPublicaNuevo() {
        UUID id = UUID.randomUUID();
        UUID anteriorId = UUID.randomUUID();
        Cuestionario target = cuestionarioBase(id, EstadoCuestionario.BORRADOR);
        Cuestionario anterior = cuestionarioBase(anteriorId, EstadoCuestionario.PUBLICADO);

        when(cuestionarioRepository.findById(id)).thenReturn(Optional.of(target));
        when(preguntaRepository.findByCuestionarioIdAndActivoTrueOrderByOrdenAsc(id))
                .thenReturn(List.of(preguntaEstrellas(id)));
        when(preguntaRepository.findByCuestionarioIdOrderByOrdenAsc(id))
                .thenReturn(List.of(preguntaEstrellas(id)));
        when(opcionRepository.findByPreguntaIdInOrderByOrdenAsc(anyList())).thenReturn(List.of());
        when(cuestionarioRepository.findPublishedActiveByDisparadorExcludingId(
                "GESTION_VEHICULAR", "SOLICITUD_VEHICULAR", "AL_FINALIZAR", id
        )).thenReturn(List.of(anterior));
        when(cuestionarioRepository.saveAndFlush(any())).thenAnswer(inv -> inv.getArgument(0));
        when(cuestionarioRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(asignacionRepository.countByCuestionarioIdAndEstado(id, EstadoAsignacionCuestionario.RESPONDIDO)).thenReturn(0L);

        CuestionarioDetalleResponse resp = service.publicar(id, true);

        assertEquals(EstadoCuestionario.PUBLICADO, resp.estado());
        assertEquals(EstadoCuestionario.INACTIVO, anterior.getEstado());
        assertFalse(anterior.getActivo());
        verify(cuestionarioRepository).saveAndFlush(anterior);
    }

    @Test
    void crearNuevaVersion_clonaPlantillaPreguntasYOpcionesEnBorradorVersionIncrementada() {
        UUID origenId = UUID.randomUUID();
        UUID clonId = UUID.randomUUID();
        UUID preguntaOrigenId = UUID.randomUUID();
        UUID preguntaClonId = UUID.randomUUID();

        Cuestionario origen = cuestionarioBase(origenId, EstadoCuestionario.PUBLICADO);
        origen.setVersion(1);
        origen.setCodigo("EVAL_CONDUCTOR_VIAJE");

        CuestionarioPregunta pOrigen = CuestionarioPregunta.builder()
                .id(preguntaOrigenId)
                .cuestionarioId(origenId)
                .orden(1)
                .enunciado("Trato")
                .tipoPregunta(TipoPregunta.OPCION_UNICA)
                .obligatoria(true)
                .peso(BigDecimal.ONE)
                .activo(true)
                .build();
        CuestionarioPreguntaOpcion opOrigen = CuestionarioPreguntaOpcion.builder()
                .id(UUID.randomUUID())
                .preguntaId(preguntaOrigenId)
                .orden(1)
                .etiqueta("Excelente")
                .valor("EXCELENTE")
                .puntaje(BigDecimal.valueOf(5))
                .activo(true)
                .build();

        when(cuestionarioRepository.findById(origenId)).thenReturn(Optional.of(origen));
        when(preguntaRepository.findByCuestionarioIdOrderByOrdenAsc(origenId)).thenReturn(List.of(pOrigen));
        when(opcionRepository.findByPreguntaIdInOrderByOrdenAsc(List.of(preguntaOrigenId))).thenReturn(List.of(opOrigen));
        when(cuestionarioRepository.existsByCodigoIgnoreCase("EVAL_CONDUCTOR_VIAJE_V2")).thenReturn(false);
        when(cuestionarioRepository.save(any(Cuestionario.class))).thenAnswer(inv -> {
            Cuestionario c = inv.getArgument(0);
            c.setId(clonId);
            return c;
        });
        when(preguntaRepository.save(any(CuestionarioPregunta.class))).thenAnswer(inv -> {
            CuestionarioPregunta p = inv.getArgument(0);
            p.setId(preguntaClonId);
            return p;
        });
        when(preguntaRepository.findByCuestionarioIdOrderByOrdenAsc(clonId)).thenReturn(List.of());
        when(asignacionRepository.countByCuestionarioIdAndEstado(clonId, EstadoAsignacionCuestionario.RESPONDIDO)).thenReturn(0L);

        CuestionarioDetalleResponse resp = service.crearNuevaVersion(origenId);

        assertEquals("EVAL_CONDUCTOR_VIAJE_V2", resp.codigo());
        assertEquals(2, resp.version());
        assertEquals(EstadoCuestionario.BORRADOR, resp.estado());
        assertTrue(resp.activo());

        ArgumentCaptor<List<CuestionarioPreguntaOpcion>> opCaptor = ArgumentCaptor.forClass(List.class);
        verify(opcionRepository).saveAll(opCaptor.capture());
        assertEquals(1, opCaptor.getValue().size());
        assertEquals(preguntaClonId, opCaptor.getValue().get(0).getPreguntaId());
    }

    @Test
    void delete_conAsignaciones_lanza409() {
        UUID id = UUID.randomUUID();
        when(cuestionarioRepository.findById(id)).thenReturn(Optional.of(cuestionarioBase(id, EstadoCuestionario.BORRADOR)));
        when(asignacionRepository.existsByCuestionarioId(id)).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () -> service.delete(id));
        assertEquals("CUESTIONARIO_CON_ASIGNACIONES", ex.getCode());
    }

    private Cuestionario cuestionarioBase(UUID id, EstadoCuestionario estado) {
        return Cuestionario.builder()
                .id(id)
                .codigo("EVAL_CONDUCTOR_VIAJE")
                .nombre("Evaluación de Conductor")
                .moduloOrigen("GESTION_VEHICULAR")
                .entidadTipo("SOLICITUD_VEHICULAR")
                .eventoDisparador("AL_FINALIZAR")
                .version(1)
                .estado(estado)
                .obligatorio(false)
                .anonimoEnReportes(false)
                .activo(true)
                .build();
    }

    private CuestionarioPregunta preguntaEstrellas(UUID cuestionarioId) {
        return CuestionarioPregunta.builder()
                .id(UUID.randomUUID())
                .cuestionarioId(cuestionarioId)
                .orden(1)
                .enunciado("Puntualidad")
                .tipoPregunta(TipoPregunta.ESTRELLAS_1_5)
                .obligatoria(true)
                .peso(BigDecimal.ONE)
                .activo(true)
                .build();
    }
}
