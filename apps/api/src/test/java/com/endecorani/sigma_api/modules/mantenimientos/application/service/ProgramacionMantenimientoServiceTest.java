package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.CompletarMantenimientoProgramadoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.EvaluarProgramacionRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ProgramacionMantenimientoCriterioRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ProgramacionMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ProgramacionMantenimientoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ProgramacionTipoActivoBatchRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ReporteSeguimientoFiltros;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.EvaluacionProgramacionResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ProgramacionMantenimientoCriterioMapper;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ProgramacionMantenimientoHistorialMapper;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ProgramacionMantenimientoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimientoAplicacion;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimientoActividad;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimientoActivo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimientoCriterio;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimientoHistorial;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.*;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.TipoMantenimientoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringPrioridadRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringTipoMantenimientoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ForbiddenException;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import jakarta.validation.Validation;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProgramacionMantenimientoServiceTest {

    @Mock
    private ProgramacionMantenimientoRepository repository;
    @Mock
    private ProgramacionMantenimientoCriterioRepository criterioRepository;
    @Mock
    private ProgramacionMantenimientoHistorialRepository historialRepository;
    @Mock
    private PlanMantenimientoActivoRepository planMantenimientoActivoRepository;
    @Mock
    private PlanMantenimientoRepository planMantenimientoRepository;
    @Mock
    private ActivoRepository activoRepository;
    @Mock
    private TipoActivoRepository tipoActivoRepository;
    @Mock
    private ProgramacionMantenimientoCriterioService criterioService;
    @Mock
    private SolicitudMantenimientoService solicitudMantenimientoService;
    @Mock
    private SolicitudMantenimientoRepository solicitudRepository;
    @Mock
    private SpringTipoMantenimientoRepository springTipoMantenimientoRepository;
    @Mock
    private SpringPrioridadRepository springPrioridadRepository;
    @Mock
    private SpringActivoAtributoRepository springActivoAtributoRepository;
    @Mock
    private SpringActivoAtributoValorRepository springActivoAtributoValorRepository;
    @Mock
    private EmpleadoRepository empleadoRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private SecurityUtils securityUtils;
    @Mock
    private ProgramacionMantenimientoMapper mapper;
    @Mock
    private ProgramacionMantenimientoCriterioMapper criterioMapper;
    @Mock
    private ProgramacionMantenimientoHistorialMapper historialMapper;
    @Mock
    private ProgramacionSeguimientoExcelService excelService;
    @Mock
    private PlanMantenimientoActividadRepository planMantenimientoActividadRepository;
    @Mock
    private ActividadMantenimientoAplicacionRepository actividadMantenimientoAplicacionRepository;
    @Mock
    private ActividadMantenimientoRepository actividadMantenimientoRepository;

    @InjectMocks
    private ProgramacionMantenimientoService service;

    @BeforeEach
    void autenticarEncargado() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("encargado-tests", "n/a",
                        List.of(new SimpleGrantedAuthority("ROLE_ENCARGADO"))));
    }

    @AfterEach
    void limpiarSeguridad() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("evaluarPorActivo debe retornar vacío si activoId es null o no tiene planes")
    void evaluarPorActivoNull() {
        List<EvaluacionProgramacionResponse> res = service.evaluarPorActivo(null);
        assertThat(res).isEmpty();

        UUID randomId = UUID.randomUUID();
        when(planMantenimientoActivoRepository.findByActivoId(randomId)).thenReturn(Collections.emptyList());
        List<EvaluacionProgramacionResponse> res2 = service.evaluarPorActivo(randomId);
        assertThat(res2).isEmpty();
    }

    @Test
    @DisplayName("findByActivoId debe buscar las asignaciones y mapear programaciones")
    void findByActivoId() {
        UUID activoId = UUID.randomUUID();
        UUID pmaId = UUID.randomUUID();

        PlanMantenimientoActivo pma = new PlanMantenimientoActivo();
        pma.setId(pmaId);
        pma.setActivoId(activoId);
        pma.setActivo(true);

        when(planMantenimientoActivoRepository.findByActivoId(activoId)).thenReturn(List.of(pma));
        when(repository.findByPlanMantenimientoActivoId(pmaId)).thenReturn(Collections.emptyList());

        var res = service.findByActivoId(activoId);
        assertThat(res).isEmpty();
        verify(repository, times(1)).findByPlanMantenimientoActivoId(pmaId);
    }

    @Test
    @DisplayName("evaluarProgramacion no debe disparar si odómetro no ha llegado al umbral")
    void evaluarProgramacionNoDisparaSiNoLlegaAlUmbral() {
        UUID progId = UUID.randomUUID();
        UUID pmaId = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();
        UUID planId = UUID.randomUUID();

        ProgramacionMantenimiento prog = new ProgramacionMantenimiento();
        prog.setId(progId);
        prog.setPlanMantenimientoActivoId(pmaId);
        prog.setActivo(true);

        PlanMantenimientoActivo pma = new PlanMantenimientoActivo();
        pma.setId(pmaId);
        pma.setActivoId(activoId);
        pma.setPlanMantenimientoId(planId);
        pma.setActivo(true);

        Activo activo = new Activo();
        activo.setId(activoId);

        PlanMantenimiento plan = new PlanMantenimiento();
        plan.setId(planId);

        ProgramacionMantenimientoCriterio criterio = new ProgramacionMantenimientoCriterio();
        criterio.setTipoCriterio(TipoCriterioMantenimiento.KILOMETRAJE);
        criterio.setProximoValorUso(new BigDecimal("50000"));
        criterio.setActivo(true);

        when(repository.findByIdWithLock(progId)).thenReturn(Optional.of(prog));
        when(planMantenimientoActivoRepository.findById(pmaId)).thenReturn(Optional.of(pma));
        when(activoRepository.findById(activoId)).thenReturn(Optional.of(activo));
        when(planMantenimientoRepository.findById(planId)).thenReturn(Optional.of(plan));
        when(criterioRepository.findByProgramacionMantenimientoIdAndActivoTrue(progId)).thenReturn(List.of(criterio));

        EvaluarProgramacionRequest request = new EvaluarProgramacionRequest(
                LocalDate.now(),
                new BigDecimal("45000"), // 45,000 km < 50,000 km
                null,
                false
        );

        EvaluacionProgramacionResponse resp = service.evaluarProgramacion(progId, request);
        assertThat(resp.cumpleCriterio()).isFalse();
        assertThat(resp.solicitudGenerada()).isFalse();
    }

    private EvaluacionProgramacionResponse evaluarConUmbralAlcanzado(
            UUID progId, UUID pmaId, UUID activoId, UUID planId, UUID responsableId,
            EvaluarProgramacionRequest request) {
        ProgramacionMantenimiento prog = new ProgramacionMantenimiento();
        prog.setId(progId);
        prog.setPlanMantenimientoActivoId(pmaId);
        prog.setActivo(true);

        PlanMantenimientoActivo pma = new PlanMantenimientoActivo();
        pma.setId(pmaId);
        pma.setActivoId(activoId);
        pma.setPlanMantenimientoId(planId);
        pma.setActivo(true);
        pma.setResponsableId(responsableId);

        Activo activo = new Activo();
        activo.setId(activoId);
        activo.setCodigo("ACT-01");
        activo.setNombre("Camioneta Hilux");

        PlanMantenimiento plan = new PlanMantenimiento();
        plan.setId(planId);
        plan.setCodigo("PLAN-01");
        plan.setNombre("Plan 50k");

        ProgramacionMantenimientoCriterio criterio = new ProgramacionMantenimientoCriterio();
        criterio.setTipoCriterio(TipoCriterioMantenimiento.KILOMETRAJE);
        criterio.setProximoValorUso(new BigDecimal("50000"));
        criterio.setIntervaloUso(new BigDecimal("5000"));
        criterio.setActivo(true);

        when(repository.findByIdWithLock(progId)).thenReturn(Optional.of(prog));
        when(planMantenimientoActivoRepository.findById(pmaId)).thenReturn(Optional.of(pma));
        when(activoRepository.findById(activoId)).thenReturn(Optional.of(activo));
        when(planMantenimientoRepository.findById(planId)).thenReturn(Optional.of(plan));
        when(criterioRepository.findByProgramacionMantenimientoIdAndActivoTrue(progId)).thenReturn(List.of(criterio));
        when(historialRepository.findFirstPendingByProgramacionMantenimientoId(progId)).thenReturn(Optional.empty());

        TipoMantenimientoEntity tipoMant = new TipoMantenimientoEntity();
        tipoMant.setId(UUID.randomUUID());
        when(springTipoMantenimientoRepository.findByCodigoIgnoreCase("PREVENTIVO")).thenReturn(Optional.of(tipoMant));

        var prioridadEntity = new com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.PrioridadEntity();
        prioridadEntity.setId(UUID.randomUUID());
        when(springPrioridadRepository.findFirstByPorDefectoTrue()).thenReturn(Optional.of(prioridadEntity));

        return service.evaluarProgramacion(progId, request);
    }

    @Test
    @DisplayName("REQ-MANT-009: sin solicitante resoluble falla con 422, sin elegir un empleado al azar")
    void evaluarProgramacionSinSolicitante_debeFallarSinFallbackAleatorio() {
        UUID progId = UUID.randomUUID();
        EvaluarProgramacionRequest request = new EvaluarProgramacionRequest(
                LocalDate.now(), new BigDecimal("50000"), null, false);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> evaluarConUmbralAlcanzado(progId, UUID.randomUUID(), UUID.randomUUID(),
                        UUID.randomUUID(), null, request));

        assertEquals("SOLICITANTE_NO_ASIGNADO", ex.getCode());
        verify(solicitudMantenimientoService, never()).create(any());
        verify(empleadoRepository, never()).findAll(any(org.springframework.data.domain.Pageable.class));
        verify(solicitudMantenimientoService, never()).enviar(any(), any());
    }

    @Test
    @DisplayName("REQ-MANT-032: el aprobador preventivo es un supervisor distinto del responsable")
    void evaluarProgramacionDebeUsarAprobadorSupervisorSegregado() {
        UUID progId = UUID.randomUUID();
        UUID responsableId = UUID.randomUUID();
        UUID aprobadorId = UUID.randomUUID();
        UUID solicitudId = UUID.randomUUID();

        SolicitudMantenimientoResponse solResp = new SolicitudMantenimientoResponse(
                solicitudId, "SOL-2026-001", null, null, List.of(), null, null,
                "Titulo", "Desc", null, null, null, null, null, null, null, null,
                "BORRADOR", List.of(), null);
        when(solicitudMantenimientoService.create(any())).thenReturn(solResp);

        when(solicitudMantenimientoService.findAprobadoresSupervisores())
                .thenReturn(List.of(Empleado.builder().id(responsableId).build(),
                        Empleado.builder().id(aprobadorId).build()));
        when(solicitudMantenimientoService.validarAprobador(aprobadorId))
                .thenReturn(Empleado.builder().id(aprobadorId).build());

        EvaluarProgramacionRequest request = new EvaluarProgramacionRequest(
                LocalDate.now(), new BigDecimal("50000"), null, false);
        EvaluacionProgramacionResponse resp = evaluarConUmbralAlcanzado(
                progId, UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), responsableId, request);

        assertThat(resp.solicitudGenerada()).isTrue();
        org.mockito.ArgumentCaptor<com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.EnviarSolicitudMantenimientoRequest> captor =
                org.mockito.ArgumentCaptor.forClass(
                        com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.EnviarSolicitudMantenimientoRequest.class);
        verify(solicitudMantenimientoService).enviar(eq(solicitudId), captor.capture());
        assertEquals(aprobadorId, captor.getValue().aprobadorId());
        assertEquals(responsableId, captor.getValue().responsableId());
        verify(solicitudMantenimientoService).validarAprobador(aprobadorId);
        verify(solicitudMantenimientoService, never()).validarAprobador(responsableId);
        verify(historialRepository).save(any());
    }

    @Test
    @DisplayName("REQ-MANT-032: sin supervisor elegible falla con 422 APROBADOR_REQUERIDO")
    void evaluarProgramacionSinSupervisorElegible_debeFallar() {
        UUID responsableId = UUID.randomUUID();
        SolicitudMantenimientoResponse solResp = new SolicitudMantenimientoResponse(
                UUID.randomUUID(), "SOL-2026-002", null, null, List.of(), null, null,
                "Titulo", "Desc", null, null, null, null, null, null, null, null,
                "BORRADOR", List.of(), null);
        when(solicitudMantenimientoService.create(any())).thenReturn(solResp);

        // El único supervisor es el propio responsable del plan: no hay segregación posible.
        when(solicitudMantenimientoService.findAprobadoresSupervisores())
                .thenReturn(List.of(Empleado.builder().id(responsableId).build()));

        EvaluarProgramacionRequest request = new EvaluarProgramacionRequest(
                LocalDate.now(), new BigDecimal("50000"), null, false);
        BusinessException ex = assertThrows(BusinessException.class,
                () -> evaluarConUmbralAlcanzado(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                        UUID.randomUUID(), responsableId, request));

        assertEquals("APROBADOR_REQUERIDO", ex.getCode());
        assertTrue(ex.getMessage().contains("SUPERVISOR"));
        assertTrue(ex.getMessage().contains("responsable"));
        verify(solicitudMantenimientoService, never()).enviar(any(), any());
    }

    @Test
    @DisplayName("REQ-MANT-032: un supervisor rechazado por validarAprobador se descarta y se usa el siguiente")
    void evaluarProgramacionConSupervisorInvalido_debeUsarSiguiente() {
        UUID responsableId = UUID.randomUUID();
        UUID supervisorInvalido = UUID.randomUUID();
        UUID aprobadorId = UUID.randomUUID();
        UUID solicitudId = UUID.randomUUID();
        SolicitudMantenimientoResponse solResp = new SolicitudMantenimientoResponse(
                solicitudId, "SOL-2026-003", null, null, List.of(), null, null,
                "Titulo", "Desc", null, null, null, null, null, null, null, null,
                "BORRADOR", List.of(), null);
        when(solicitudMantenimientoService.create(any())).thenReturn(solResp);

        when(solicitudMantenimientoService.findAprobadoresSupervisores())
                .thenReturn(List.of(Empleado.builder().id(supervisorInvalido).build(),
                        Empleado.builder().id(aprobadorId).build()));
        when(solicitudMantenimientoService.validarAprobador(supervisorInvalido))
                .thenThrow(new BusinessException("APROBADOR_ROL_INVALIDO", "Rol no vigente"));
        when(solicitudMantenimientoService.validarAprobador(aprobadorId))
                .thenReturn(Empleado.builder().id(aprobadorId).build());

        EvaluarProgramacionRequest request = new EvaluarProgramacionRequest(
                LocalDate.now(), new BigDecimal("50000"), null, false);
        EvaluacionProgramacionResponse resp = evaluarConUmbralAlcanzado(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), responsableId, request);

        assertThat(resp.solicitudGenerada()).isTrue();
        verify(solicitudMantenimientoService).validarAprobador(supervisorInvalido);
        verify(solicitudMantenimientoService).validarAprobador(aprobadorId);
        org.mockito.ArgumentCaptor<com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.EnviarSolicitudMantenimientoRequest> captor =
                org.mockito.ArgumentCaptor.forClass(
                        com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.EnviarSolicitudMantenimientoRequest.class);
        verify(solicitudMantenimientoService).enviar(eq(solicitudId), captor.capture());
        assertEquals(aprobadorId, captor.getValue().aprobadorId());
    }

    @Test
    @DisplayName("REQ-MANT-032: sin empleados con rol SUPERVISOR falla con mensaje claro")
    void evaluarProgramacionSinSupervisoresConfigurados_debeFallarConMensajeClaro() {
        UUID responsableId = UUID.randomUUID();
        SolicitudMantenimientoResponse solResp = new SolicitudMantenimientoResponse(
                UUID.randomUUID(), "SOL-2026-004", null, null, List.of(), null, null,
                "Titulo", "Desc", null, null, null, null, null, null, null, null,
                "BORRADOR", List.of(), null);
        when(solicitudMantenimientoService.create(any())).thenReturn(solResp);
        when(solicitudMantenimientoService.findAprobadoresSupervisores()).thenReturn(List.of());

        EvaluarProgramacionRequest request = new EvaluarProgramacionRequest(
                LocalDate.now(), new BigDecimal("50000"), null, false);
        BusinessException ex = assertThrows(BusinessException.class,
                () -> evaluarConUmbralAlcanzado(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                        UUID.randomUUID(), responsableId, request));

        assertEquals("APROBADOR_REQUERIDO", ex.getCode());
        assertTrue(ex.getMessage().contains("SUPERVISOR"));
        assertTrue(ex.getMessage().contains("responsable"));
        assertTrue(ex.getMessage().contains("solicitante"));
        verify(solicitudMantenimientoService, never()).enviar(any(), any());
    }

    private ProgramacionMantenimiento programacionConId(UUID id) {
        ProgramacionMantenimiento prog = new ProgramacionMantenimiento();
        prog.setId(id);
        return prog;
    }

    @Test
    @DisplayName("REQ-MANT-005: solicitud ajena a la programación se rechaza con 409 antes de recalcular")
    void completarConSolicitudAjena_debeRechazar() {
        UUID progId = UUID.randomUUID();
        UUID solicitudId = UUID.randomUUID();
        when(repository.findById(progId)).thenReturn(Optional.of(programacionConId(progId)));
        when(historialRepository.findBySolicitudMantenimientoId(solicitudId))
                .thenReturn(Optional.of(ProgramacionMantenimientoHistorial.builder()
                        .programacionMantenimientoId(UUID.randomUUID())
                        .solicitudMantenimientoId(solicitudId)
                        .completado(false)
                        .build()));

        ConflictException ex = assertThrows(ConflictException.class, () -> service.completarMantenimiento(
                progId, new CompletarMantenimientoProgramadoRequest(LocalDate.now(), null, null, solicitudId, null)));

        assertEquals("SOLICITUD_NO_PERTENECE_A_PROGRAMACION", ex.getCode());
        verifyNoInteractions(criterioRepository);
    }

    @Test
    @DisplayName("REQ-MANT-005: repetir una ejecución ya cerrada responde 409 PROGRAMACION_YA_COMPLETADA")
    void completarEjecucionYaCompletada_debeRechazar() {
        UUID progId = UUID.randomUUID();
        UUID solicitudId = UUID.randomUUID();
        when(repository.findById(progId)).thenReturn(Optional.of(programacionConId(progId)));
        when(historialRepository.findBySolicitudMantenimientoId(solicitudId))
                .thenReturn(Optional.of(ProgramacionMantenimientoHistorial.builder()
                        .programacionMantenimientoId(progId)
                        .solicitudMantenimientoId(solicitudId)
                        .completado(true)
                        .fechaServicio(LocalDate.now().minusDays(1))
                        .build()));

        ConflictException ex = assertThrows(ConflictException.class, () -> service.completarMantenimiento(
                progId, new CompletarMantenimientoProgramadoRequest(LocalDate.now(), null, null, solicitudId, null)));

        assertEquals("PROGRAMACION_YA_COMPLETADA", ex.getCode());
        verify(historialRepository, never()).save(any());
        verifyNoInteractions(criterioRepository);
    }

    @Test
    @DisplayName("REQ-MANT-005: la solicitud debe estar en estado final para cerrar la programación")
    void completarSolicitudNoFinalizada_debeRechazar() {
        UUID progId = UUID.randomUUID();
        UUID solicitudId = UUID.randomUUID();
        when(repository.findById(progId)).thenReturn(Optional.of(programacionConId(progId)));
        when(historialRepository.findBySolicitudMantenimientoId(solicitudId))
                .thenReturn(Optional.of(ProgramacionMantenimientoHistorial.builder()
                        .programacionMantenimientoId(progId)
                        .solicitudMantenimientoId(solicitudId)
                        .completado(false)
                        .build()));
        when(solicitudRepository.findById(solicitudId))
                .thenReturn(Optional.of(SolicitudMantenimiento.builder()
                        .id(solicitudId).estado("EN_MANTENIMIENTO").build()));

        BusinessException ex = assertThrows(BusinessException.class, () -> service.completarMantenimiento(
                progId, new CompletarMantenimientoProgramadoRequest(LocalDate.now(), null, null, solicitudId, null)));

        assertEquals("SOLICITUD_NO_FINALIZADA", ex.getCode());
        verifyNoInteractions(criterioRepository);
    }

    @Test
    @DisplayName("REQ-MANT-005: una ejecución válida cierra el historial y recalcula criterios una sola vez")
    void completarEjecucionValida_debeCerrarHistorialYRecalcular() {
        UUID progId = UUID.randomUUID();
        UUID solicitudId = UUID.randomUUID();
        LocalDate fecha = LocalDate.now().minusDays(1);
        ProgramacionMantenimiento prog = programacionConId(progId);
        ProgramacionMantenimientoHistorial historial = ProgramacionMantenimientoHistorial.builder()
                .programacionMantenimientoId(progId).solicitudMantenimientoId(solicitudId)
                .completado(false).build();
        ProgramacionMantenimientoCriterio criterio = new ProgramacionMantenimientoCriterio();
        criterio.setTipoCriterio(TipoCriterioMantenimiento.TIEMPO);
        criterio.setIntervaloDias(30);
        criterio.setProgramacionMantenimientoId(progId);

        when(repository.findById(progId)).thenReturn(Optional.of(prog));
        when(historialRepository.findBySolicitudMantenimientoId(solicitudId)).thenReturn(Optional.of(historial));
        when(solicitudRepository.findById(solicitudId))
                .thenReturn(Optional.of(SolicitudMantenimiento.builder()
                        .id(solicitudId).estado("TRABAJO_REALIZADO").build()));
        when(criterioRepository.findByProgramacionMantenimientoId(progId)).thenReturn(List.of(criterio));
        when(criterioRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        assertDoesNotThrow(() -> service.completarMantenimiento(
                progId, new CompletarMantenimientoProgramadoRequest(fecha, null, null, solicitudId, "OK")));

        assertThat(historial.getCompletado()).isTrue();
        assertThat(historial.getFechaServicio()).isEqualTo(fecha);
        assertThat(criterio.getProximaFecha()).isEqualTo(fecha.plusDays(30));
        verify(historialRepository, times(1)).save(historial);
    }

    @Test
    @DisplayName("REQ-MANT-006: enviar telemetría sin rol ENCARGADO/ADMIN se rechaza con 403")
    void overrideTelemetriaSinPermiso_debeRechazar() {
        SecurityContextHolder.clearContext();
        UUID progId = UUID.randomUUID();
        EvaluarProgramacionRequest request = new EvaluarProgramacionRequest(
                LocalDate.now(), new BigDecimal("123"), null, false);

        ForbiddenException ex = assertThrows(ForbiddenException.class,
                () -> service.evaluarProgramacion(progId, request));

        assertEquals("TELEMETRIA_OVERRIDE_NO_PERMITIDO", ex.getCode());
        verifyNoInteractions(repository);
    }

    @Test
    @DisplayName("REQ-MANT-006: fecha de servicio futura se rechaza con 400 FECHA_SERVICIO_FUTURA")
    void completarConFechaFutura_debeRechazar() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.completarMantenimiento(UUID.randomUUID(),
                        new CompletarMantenimientoProgramadoRequest(
                                LocalDate.now().plusDays(1), null, null, UUID.randomUUID(), null)));

        assertEquals("FECHA_SERVICIO_FUTURA", ex.getMessage());
        verifyNoInteractions(repository);
    }

    @Test
    @DisplayName("REQ-MANT-006: kilometraje negativo es inválido en el DTO")
    void completarConKilometrajeNegativo_debeTenerViolacion() {
        CompletarMantenimientoProgramadoRequest request = new CompletarMantenimientoProgramadoRequest(
                LocalDate.now(), new BigDecimal("-1"), null, UUID.randomUUID(), null);

        var violations = Validation.buildDefaultValidatorFactory().getValidator().validate(request);

        assertThat(violations).anyMatch(v -> "kilometrajeServicio".equals(v.getPropertyPath().toString()));
    }

    @Test
    @DisplayName("REQ-MANT-010: violación del índice parcial se traduce a 409 PROGRAMACION_ACTIVA_DUPLICADA")
    void activarConIndiceDuplicado_debe_conflicto() {
        UUID progId = UUID.randomUUID();
        ProgramacionMantenimiento prog = programacionConId(progId);
        prog.setPlanMantenimientoActivoId(UUID.randomUUID());
        when(repository.findById(progId)).thenReturn(Optional.of(prog));
        when(criterioRepository.countByProgramacionMantenimientoIdAndActivoTrue(progId)).thenReturn(1L);
        when(repository.saveAndFlush(prog)).thenThrow(new DataIntegrityViolationException(
                "duplicate key value violates unique constraint \"uq_programacion_activa_por_plan_activo\""));

        ConflictException ex = assertThrows(ConflictException.class, () -> service.activar(progId));

        assertEquals("PROGRAMACION_ACTIVA_DUPLICADA", ex.getCode());
    }

    @Test
    @DisplayName("REQ-MANT-011: borrar programación con historial responde 409 y conserva los datos")
    void deleteConHistorial_debeRechazar() {
        UUID progId = UUID.randomUUID();
        when(repository.findById(progId)).thenReturn(Optional.of(programacionConId(progId)));
        when(historialRepository.existsByProgramacionMantenimientoId(progId)).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () -> service.delete(progId));

        assertEquals("PROGRAMACION_CON_HISTORIAL", ex.getCode());
        verify(repository, never()).deleteById(progId);
        verifyNoInteractions(criterioRepository);
    }

    @Test
    @DisplayName("REQ-MANT-018: el reporte Excel se genera en lotes de 500, sin Pageable.unpaged()")
    void generarReporteExcel_debeConsultarEnLotesDe500() {
        ProgramacionMantenimiento prog = programacionConId(UUID.randomUUID());
        when(repository.search(isNull(), isNull(), eq(true), isNull(), any(Pageable.class)))
                .thenAnswer(inv -> new PageImpl<>(List.of(prog), (Pageable) inv.getArgument(4), 600));
        when(excelService.generarExcel(anyList(), any(), any(), any())).thenReturn(new byte[]{1, 2, 3});

        byte[] excel = service.generarReporteExcel(null, null, true, null);

        assertThat(excel).hasSize(3);
        org.mockito.ArgumentCaptor<Pageable> captor = org.mockito.ArgumentCaptor.forClass(Pageable.class);
        verify(repository, times(2)).search(isNull(), isNull(), eq(true), isNull(), captor.capture());
        assertThat(captor.getAllValues()).allSatisfy(pageable -> assertEquals(500, pageable.getPageSize()));
        assertThat(captor.getAllValues().get(0).getPageNumber()).isZero();
        assertThat(captor.getAllValues().get(1).getPageNumber()).isEqualTo(1);
    }

    @Test
    @DisplayName("REQ-MANT-015: los filtros de alerta/criterio se validan y propagan al Excel, con activoId y q")
    void generarReporteExcel_conFiltros_debePropagarlosAlExcel() {
        UUID activoId = UUID.randomUUID();
        ProgramacionMantenimiento prog = programacionConId(UUID.randomUUID());
        when(repository.search(isNull(), eq(activoId), eq(true), eq("activo-01"), any(Pageable.class)))
                .thenAnswer(inv -> new PageImpl<>(List.of(prog), (Pageable) inv.getArgument(4), 1));
        when(excelService.generarExcel(anyList(), any(), any(), any())).thenReturn(new byte[]{4, 5, 6});

        byte[] excel = service.generarReporteExcel(
                null, activoId, true, " activo-01 ", " critico ", "kilometraje");

        assertThat(excel).hasSize(3);
        org.mockito.ArgumentCaptor<String> q = org.mockito.ArgumentCaptor.forClass(String.class);
        org.mockito.ArgumentCaptor<ReporteSeguimientoFiltros.NivelAlertaReporte> alerta =
                org.mockito.ArgumentCaptor.forClass(ReporteSeguimientoFiltros.NivelAlertaReporte.class);
        org.mockito.ArgumentCaptor<ReporteSeguimientoFiltros.TipoCriterioReporte> criterio =
                org.mockito.ArgumentCaptor.forClass(ReporteSeguimientoFiltros.TipoCriterioReporte.class);
        verify(excelService).generarExcel(anyList(), q.capture(), alerta.capture(), criterio.capture());
        assertEquals("activo-01", q.getValue());
        assertEquals(ReporteSeguimientoFiltros.NivelAlertaReporte.CRITICO, alerta.getValue());
        assertEquals(ReporteSeguimientoFiltros.TipoCriterioReporte.KILOMETRAJE, criterio.getValue());
    }

    @Test
    @DisplayName("REQ-MANT-015: TODOS y ausencia significan sin filtro")
    void generarReporteExcel_conTodosOAusencia_debeEnviarFiltrosNulos() {
        when(repository.search(isNull(), isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(), Pageable.ofSize(500), 0));
        when(excelService.generarExcel(anyList(), any(), any(), any())).thenReturn(new byte[]{7});

        service.generarReporteExcel(null, null, null, null, "todos", " TODOS ");

        verify(excelService).generarExcel(
                anyList(), isNull(),
                org.mockito.ArgumentMatchers.isNull(), org.mockito.ArgumentMatchers.isNull());
    }

    @Test
    @DisplayName("REQ-MANT-015: un filtro inválido responde INVALID_FILTER_VALUE sin consultar BD")
    void generarReporteExcel_conFiltroInvalido_debeFallarAntesDeConsultar() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.generarReporteExcel(null, null, true, null, "DESCONOCIDO", null));

        assertEquals("INVALID_FILTER_VALUE", ex.getMessage());
        verifyNoInteractions(repository, excelService);
    }

    private ProgramacionMantenimientoCriterioRequest criterioTiempoValido() {
        return new ProgramacionMantenimientoCriterioRequest(
                null, TipoCriterioMantenimiento.TIEMPO, 30, null, null, null, true);
    }

    @Test
    @DisplayName("REQ-MANT-010: crear sobre una asignación con programación activa responde 409 sin insertar")
    void createConProgramacionActiva_debeRechazar() {
        UUID pmaId = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();
        UUID planId = UUID.randomUUID();
        ProgramacionMantenimientoRequest request = new ProgramacionMantenimientoRequest(
                pmaId, activoId, planId, true, null, null, List.of(criterioTiempoValido()));

        PlanMantenimientoActivo pma = new PlanMantenimientoActivo();
        pma.setId(pmaId);
        pma.setActivoId(activoId);
        pma.setPlanMantenimientoId(planId);
        Activo activo = new Activo();
        activo.setId(activoId);
        when(planMantenimientoActivoRepository.findById(pmaId)).thenReturn(Optional.of(pma));
        when(activoRepository.findById(activoId)).thenReturn(Optional.of(activo));
        when(repository.existsByPlanMantenimientoActivoIdAndActivoTrue(pmaId)).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () -> service.create(request));

        assertEquals("PROGRAMACION_ACTIVA_DUPLICADA", ex.getCode());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("REQ-MANT-010: activar una segunda programación de la misma asignación responde 409")
    void activarConOtraProgramacionActiva_debeRechazarAntesDeRecalcular() {
        UUID progId = UUID.randomUUID();
        UUID pmaId = UUID.randomUUID();
        ProgramacionMantenimiento prog = programacionConId(progId);
        prog.setPlanMantenimientoActivoId(pmaId);
        when(repository.findById(progId)).thenReturn(Optional.of(prog));
        when(repository.existsByPlanMantenimientoActivoIdAndActivoTrueAndIdNot(pmaId, progId)).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () -> service.activar(progId));

        assertEquals("PROGRAMACION_ACTIVA_DUPLICADA", ex.getCode());
        verify(criterioRepository, never()).countByProgramacionMantenimientoIdAndActivoTrue(progId);
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("REQ-MANT-010: actualizar a activa con otra programación activa responde 409")
    void updateActivandoDuplicado_debeRechazar() {
        UUID progId = UUID.randomUUID();
        UUID pmaId = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();
        ProgramacionMantenimiento prog = programacionConId(progId);
        prog.setPlanMantenimientoActivoId(pmaId);
        PlanMantenimientoActivo pma = new PlanMantenimientoActivo();
        pma.setId(pmaId);
        pma.setActivoId(activoId);
        Activo activo = new Activo();
        activo.setId(activoId);
        when(repository.findById(progId)).thenReturn(Optional.of(prog));
        when(planMantenimientoActivoRepository.findById(pmaId)).thenReturn(Optional.of(pma));
        when(activoRepository.findById(activoId)).thenReturn(Optional.of(activo));
        when(repository.existsByPlanMantenimientoActivoIdAndActivoTrueAndIdNot(pmaId, progId)).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () -> service.update(
                progId, new ProgramacionMantenimientoUpdate(true, null, null, null)));

        assertEquals("PROGRAMACION_ACTIVA_DUPLICADA", ex.getCode());
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("REQ-MANT-018: la creación por tipo de activo recorre lotes de 500, sin Pageable.unpaged()")
    void crearPorTipoActivo_debeProcesarEnLotesDe500() {
        UUID tipoId = UUID.randomUUID();
        UUID planId = UUID.randomUUID();
        ProgramacionTipoActivoBatchRequest request = new ProgramacionTipoActivoBatchRequest(
                tipoId, planId, true, List.of(criterioTiempoValido()));
        when(planMantenimientoRepository.findById(planId)).thenReturn(Optional.of(new PlanMantenimiento()));
        when(activoRepository.findByTipoActivoId(eq(tipoId), any(Pageable.class)))
                .thenAnswer(inv -> new PageImpl<>(List.of(), (Pageable) inv.getArgument(1), 1001));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.crearPorTipoActivo(request));

        assertTrue(ex.getMessage().contains("No se encontraron activos"));
        org.mockito.ArgumentCaptor<Pageable> captor = org.mockito.ArgumentCaptor.forClass(Pageable.class);
        verify(activoRepository, times(3)).findByTipoActivoId(eq(tipoId), captor.capture());
        assertThat(captor.getAllValues()).allSatisfy(pageable -> assertEquals(500, pageable.getPageSize()));
        assertThat(captor.getAllValues().stream().map(Pageable::getPageNumber).toList())
                .containsExactly(0, 1, 2);
    }

    @ParameterizedTest(name = "findAll con {0} filas")
    @ValueSource(ints = {5, 50})
    @DisplayName("REQ-MANT-019: el enriquecimiento de findAll hace consultas constantes para 5 y 50 filas")
    void findAllEnriqueceEnLote_conConsultasConstantes(int size) {
        UUID pmaId = UUID.randomUUID();
        UUID planId = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();
        UUID tipoId = UUID.randomUUID();

        PlanMantenimientoActivo pma = new PlanMantenimientoActivo();
        pma.setId(pmaId);
        pma.setPlanMantenimientoId(planId);
        pma.setActivoId(activoId);
        pma.setActivo(true);

        PlanMantenimiento plan = new PlanMantenimiento();
        plan.setId(planId);
        plan.setCodigo("PLAN-01");
        plan.setNombre("Plan 50k");

        Activo activo = new Activo();
        activo.setId(activoId);
        activo.setTipoActivoId(tipoId);
        activo.setCodigo("ACT-01");
        activo.setNombre("Camioneta");

        TipoActivo tipo = new TipoActivo();
        tipo.setId(tipoId);
        tipo.setNombre("Vehículo");

        List<ProgramacionMantenimiento> programaciones = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            ProgramacionMantenimiento prog = programacionConId(UUID.randomUUID());
            prog.setPlanMantenimientoActivoId(pmaId);
            programaciones.add(prog);
        }

        when(repository.search(isNull(), isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(programaciones, Pageable.ofSize(size), size));
        when(planMantenimientoActivoRepository.findAllByIdIn(anyCollection())).thenReturn(List.of(pma));
        when(planMantenimientoRepository.findAllByIdIn(anyCollection())).thenReturn(List.of(plan));
        when(activoRepository.findAllById(anyCollection())).thenReturn(List.of(activo));
        when(tipoActivoRepository.findAllById(anyCollection())).thenReturn(List.of(tipo));
        when(criterioRepository.findByProgramacionMantenimientoIdIn(anyCollection())).thenReturn(List.of());

        var respuesta = service.findAll(null, null, null, null, new PageRequestDto(0, size, null, null));

        assertThat(respuesta.content()).hasSize(size);
        verify(planMantenimientoActivoRepository, times(1)).findAllByIdIn(anyCollection());
        verify(planMantenimientoRepository, times(1)).findAllByIdIn(anyCollection());
        verify(activoRepository, times(1)).findAllById(anyCollection());
        verify(tipoActivoRepository, times(1)).findAllById(anyCollection());
        verify(criterioRepository, times(1)).findByProgramacionMantenimientoIdIn(anyCollection());
        verify(springActivoAtributoValorRepository, times(1)).findByActivoIdIn(anyCollection());

        verify(planMantenimientoActivoRepository, never()).findById(any());
        verify(planMantenimientoRepository, never()).findById(any());
        verify(activoRepository, never()).findById(any());
        verify(tipoActivoRepository, never()).findById(any());
        verify(criterioRepository, never()).findByProgramacionMantenimientoId(any());
        verify(springActivoAtributoValorRepository, never()).findByActivoId(any());
        verify(springActivoAtributoRepository, never()).findById(any());
    }

    @Test
    @DisplayName("REQ-MANT-019: evaluarProgramacion resuelve las tareas del plan en dos lotes")
    void evaluarProgramacion_resuelveTareasDelPlanEnLote() {
        UUID responsableId = UUID.randomUUID();
        SolicitudMantenimientoResponse solResp = new SolicitudMantenimientoResponse(
                UUID.randomUUID(), "SOL-2026-019", null, null, List.of(), null, null,
                "Titulo", "Desc", null, null, null, null, null, null, null, null,
                "BORRADOR", List.of(), null);
        when(solicitudMantenimientoService.create(any())).thenReturn(solResp);
        when(solicitudMantenimientoService.findAprobadoresSupervisores()).thenReturn(List.of());

        List<PlanMantenimientoActividad> actividadesPlan = new ArrayList<>();
        List<ActividadMantenimientoAplicacion> aplicaciones = new ArrayList<>();
        List<ActividadMantenimiento> actividades = new ArrayList<>();
        for (int i = 0; i < 50; i++) {
            UUID aplicacionId = UUID.randomUUID();
            UUID actividadId = UUID.randomUUID();

            PlanMantenimientoActividad planActividad = new PlanMantenimientoActividad();
            planActividad.setId(UUID.randomUUID());
            planActividad.setActividadMantenimientoAplicacionId(aplicacionId);
            planActividad.setOrden(i + 1);
            actividadesPlan.add(planActividad);

            ActividadMantenimientoAplicacion aplicacion = new ActividadMantenimientoAplicacion();
            aplicacion.setId(aplicacionId);
            aplicacion.setActividadMantenimientoId(actividadId);
            aplicacion.setChecklist(List.of());
            aplicaciones.add(aplicacion);

            ActividadMantenimiento actividad = new ActividadMantenimiento();
            actividad.setId(actividadId);
            actividad.setCodigo("ACT-" + i);
            actividad.setNombre("Actividad " + i);
            actividades.add(actividad);
        }

        when(planMantenimientoActividadRepository.findByPlanMantenimientoId(any()))
                .thenReturn(actividadesPlan);
        when(actividadMantenimientoAplicacionRepository.findAllByIdIn(anyCollection())).thenReturn(aplicaciones);
        when(actividadMantenimientoRepository.findAllByIdIn(anyCollection())).thenReturn(actividades);

        BusinessException ex = assertThrows(BusinessException.class, () -> evaluarConUmbralAlcanzado(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), responsableId,
                new EvaluarProgramacionRequest(LocalDate.now(), new BigDecimal("50000"), null, false)));

        assertEquals("APROBADOR_REQUERIDO", ex.getCode());
        verify(actividadMantenimientoAplicacionRepository, times(1)).findAllByIdIn(anyCollection());
        verify(actividadMantenimientoRepository, times(1)).findAllByIdIn(anyCollection());
        verify(actividadMantenimientoAplicacionRepository, never()).findById(any());
        verify(actividadMantenimientoRepository, never()).findById(any());
    }
}
