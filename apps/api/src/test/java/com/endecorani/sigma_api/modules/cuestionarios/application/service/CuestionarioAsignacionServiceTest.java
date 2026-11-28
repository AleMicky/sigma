package com.endecorani.sigma_api.modules.cuestionarios.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.request.ResponderCuestionarioRequest;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.request.ResponderPreguntaItemRequest;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.AsignacionCuestionarioResponse;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.AsignacionDetalleResponse;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.CuestionarioDetalleResponse;
import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EstadoAsignacionCuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EstadoCuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.TipoPregunta;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.Cuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioAsignacion;
import com.endecorani.sigma_api.modules.cuestionarios.domain.model.CuestionarioPregunta;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioAsignacionRepository;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioRepository;
import com.endecorani.sigma_api.modules.cuestionarios.domain.repository.CuestionarioRespuestaDetalleRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ForbiddenException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CuestionarioAsignacionServiceTest {

    @Mock private CuestionarioRepository cuestionarioRepository;
    @Mock private CuestionarioAsignacionRepository asignacionRepository;
    @Mock private CuestionarioRespuestaDetalleRepository respuestaDetalleRepository;
    @Mock private CuestionarioService cuestionarioService;
    @Mock private SecurityUtils securityUtils;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private EmpleadoRepository empleadoRepository;
    @Mock private SpringVEmpleadoRepository springVEmpleadoRepository;

    private CuestionarioAsignacionService service;

    private final UUID userId = UUID.randomUUID();
    private final UUID personaId = UUID.randomUUID();
    private final UUID empleadoId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        service = new CuestionarioAsignacionService(
                cuestionarioRepository,
                asignacionRepository,
                respuestaDetalleRepository,
                cuestionarioService,
                new CuestionarioPuntajeCalculator(),
                securityUtils,
                usuarioRepository,
                empleadoRepository,
                springVEmpleadoRepository
        );
        lenient().when(securityUtils.getCurrentUserId()).thenReturn(Optional.of(userId));
        lenient().when(usuarioRepository.findById(userId))
                .thenReturn(Optional.of(Usuario.builder().id(userId).personaId(personaId).build()));
        lenient().when(empleadoRepository.findFirstByPersonaId(personaId))
                .thenReturn(Optional.of(Empleado.builder().id(empleadoId).build()));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void listarMisPendientes_sinEmpleadoVinculado_retornaVacioFailClosed() {
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.empty());

        PageResponse<AsignacionCuestionarioResponse> resp = service.listarMisPendientes(
                new PageRequestDto(), "PENDIENTE", null
        );

        assertTrue(resp.empty());
        assertEquals(0L, resp.totalElements());
        verifyNoInteractions(asignacionRepository);
    }

    @Test
    void crearAsignacionSiExistePublicado_esIdempotente() {
        UUID cuestId = UUID.randomUUID();
        UUID entidadId = UUID.randomUUID();
        Cuestionario publicado = Cuestionario.builder()
                .id(cuestId)
                .version(1)
                .estado(EstadoCuestionario.PUBLICADO)
                .obligatorio(true)
                .anonimoEnReportes(false)
                .build();
        CuestionarioAsignacion existente = CuestionarioAsignacion.builder()
                .id(UUID.randomUUID())
                .cuestionarioId(cuestId)
                .entidadId(entidadId)
                .evaluadorEmpleadoId(empleadoId)
                .build();

        when(cuestionarioRepository.findPublishedActiveByDisparador(
                "GESTION_VEHICULAR", "SOLICITUD_VEHICULAR", "AL_FINALIZAR"
        )).thenReturn(Optional.of(publicado));
        when(asignacionRepository.findByCuestionarioIdAndEntidadTipoAndEntidadIdAndEvaluadorEmpleadoId(
                cuestId, "SOLICITUD_VEHICULAR", entidadId, empleadoId
        )).thenReturn(Optional.of(existente));

        Optional<CuestionarioAsignacion> result = service.crearAsignacionSiExistePublicado(
                "GESTION_VEHICULAR", "SOLICITUD_VEHICULAR", "AL_FINALIZAR",
                entidadId, "SOL-001", "CONDUCTOR", UUID.randomUUID(), "Juan Perez", empleadoId
        );

        assertTrue(result.isPresent());
        assertEquals(existente.getId(), result.get().getId());
        verify(asignacionRepository, never()).save(any());
    }

    @Test
    void obtenerDetalle_otroUsuarioNoAdmin_lanza403() {
        UUID asignacionId = UUID.randomUUID();
        CuestionarioAsignacion ajena = CuestionarioAsignacion.builder()
                .id(asignacionId)
                .cuestionarioId(UUID.randomUUID())
                .evaluadorEmpleadoId(UUID.randomUUID())
                .estado(EstadoAsignacionCuestionario.PENDIENTE)
                .build();

        when(asignacionRepository.findById(asignacionId)).thenReturn(Optional.of(ajena));
        when(securityUtils.isAdmin()).thenReturn(false);

        assertThrows(ForbiddenException.class, () -> service.obtenerDetalle(asignacionId));
    }

    @Test
    void obtenerDetalle_adminEnCuestionarioAnonimoNoDueno_redactaEvaluador() {
        UUID asignacionId = UUID.randomUUID();
        UUID cuestId = UUID.randomUUID();
        CuestionarioAsignacion anonima = CuestionarioAsignacion.builder()
                .id(asignacionId)
                .cuestionarioId(cuestId)
                .cuestionarioVersion(1)
                .evaluadorEmpleadoId(UUID.randomUUID())
                .anonimoEnReportes(true)
                .estado(EstadoAsignacionCuestionario.RESPONDIDO)
                .build();

        when(asignacionRepository.findById(asignacionId)).thenReturn(Optional.of(anonima));
        when(securityUtils.isAdmin()).thenReturn(true);
        when(cuestionarioRepository.findById(cuestId)).thenReturn(Optional.of(
                Cuestionario.builder().id(cuestId).codigo("C1").nombre("Encuesta").anonimoEnReportes(true).build()
        ));
        when(cuestionarioService.obtenerDetallePreguntasActivas(cuestId)).thenReturn(
                new CuestionarioDetalleResponse(cuestId, "C1", "Encuesta", null, "GENERAL", "GENERAL", "MANUAL",
                        1, EstadoCuestionario.PUBLICADO, false, true, true, 1L, List.of(), Instant.now(), null)
        );
        when(respuestaDetalleRepository.findByAsignacionId(asignacionId)).thenReturn(List.of());

        AsignacionDetalleResponse resp = service.obtenerDetalle(asignacionId);

        assertNull(resp.asignacion().evaluadorEmpleadoId());
        assertNull(resp.asignacion().evaluadorNombre());
    }

    @Test
    void responder_porOtroUsuario_lanza403InclusoSiEsAdmin() {
        UUID asignacionId = UUID.randomUUID();
        CuestionarioAsignacion ajena = CuestionarioAsignacion.builder()
                .id(asignacionId)
                .evaluadorEmpleadoId(UUID.randomUUID())
                .estado(EstadoAsignacionCuestionario.PENDIENTE)
                .build();

        when(asignacionRepository.findById(asignacionId)).thenReturn(Optional.of(ajena));

        assertThrows(ForbiddenException.class, () -> service.responder(
                asignacionId, new ResponderCuestionarioRequest(null, List.of())
        ));
    }

    @Test
    void responder_dobleRespuesta_lanza409() {
        UUID asignacionId = UUID.randomUUID();
        CuestionarioAsignacion yaRespondida = CuestionarioAsignacion.builder()
                .id(asignacionId)
                .evaluadorEmpleadoId(empleadoId)
                .estado(EstadoAsignacionCuestionario.RESPONDIDO)
                .build();

        when(asignacionRepository.findById(asignacionId)).thenReturn(Optional.of(yaRespondida));

        ConflictException ex = assertThrows(ConflictException.class, () -> service.responder(
                asignacionId, new ResponderCuestionarioRequest(null, List.of())
        ));
        assertEquals("ASIGNACION_YA_RESPONDIDA", ex.getCode());
    }

    @Test
    void responder_duenoValido_guardaSnapshotsYPuntajes() {
        UUID asignacionId = UUID.randomUUID();
        UUID cuestId = UUID.randomUUID();
        UUID preguntaId = UUID.randomUUID();

        CuestionarioAsignacion pendiente = CuestionarioAsignacion.builder()
                .id(asignacionId)
                .cuestionarioId(cuestId)
                .cuestionarioVersion(1)
                .evaluadorEmpleadoId(empleadoId)
                .estado(EstadoAsignacionCuestionario.PENDIENTE)
                .anonimoEnReportes(false)
                .build();

        CuestionarioPregunta p1 = CuestionarioPregunta.builder()
                .id(preguntaId)
                .cuestionarioId(cuestId)
                .enunciado("Puntualidad")
                .tipoPregunta(TipoPregunta.ESTRELLAS_1_5)
                .obligatoria(true)
                .peso(BigDecimal.ONE)
                .activo(true)
                .build();

        when(asignacionRepository.findById(asignacionId)).thenReturn(Optional.of(pendiente));
        when(cuestionarioService.cargarPreguntasConOpciones(cuestId, true)).thenReturn(List.of(p1));
        when(respuestaDetalleRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
        when(asignacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(cuestionarioRepository.findById(cuestId)).thenReturn(Optional.of(
                Cuestionario.builder().id(cuestId).codigo("C1").nombre("Encuesta").build()
        ));
        when(springVEmpleadoRepository.findById(empleadoId)).thenReturn(Optional.empty());
        when(cuestionarioService.obtenerDetallePreguntasActivas(cuestId)).thenReturn(
                new CuestionarioDetalleResponse(cuestId, "C1", "Encuesta", null, "GENERAL", "GENERAL", "MANUAL",
                        1, EstadoCuestionario.PUBLICADO, false, false, true, 1L, List.of(), Instant.now(), null)
        );

        AsignacionDetalleResponse resp = service.responder(
                asignacionId,
                new ResponderCuestionarioRequest(
                        "Excelente viaje",
                        List.of(new ResponderPreguntaItemRequest(preguntaId, null, BigDecimal.valueOf(5), null, null, null))
                )
        );

        assertEquals(EstadoAsignacionCuestionario.RESPONDIDO, resp.asignacion().estado());
        assertEquals(new BigDecimal("5.00"), resp.asignacion().puntajeTotal());
        assertEquals(new BigDecimal("100.00"), resp.asignacion().porcentaje());
        assertEquals(1, resp.respuestas().size());
        assertEquals("Puntualidad", resp.respuestas().get(0).preguntaEnunciadoSnapshot());
    }
}
