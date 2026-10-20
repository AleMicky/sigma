package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.CompletarMantenimientoProgramadoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.EvaluarProgramacionRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ProgramacionMantenimientoCriterioRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ProgramacionMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.EvaluacionProgramacionResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ProgramacionMantenimientoCriterioMapper;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ProgramacionMantenimientoHistorialMapper;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ProgramacionMantenimientoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimientoActivo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimientoCriterio;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimientoHistorial;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PlanMantenimientoActivoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PlanMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ProgramacionMantenimientoCriterioRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ProgramacionMantenimientoHistorialRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ProgramacionMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.PrioridadEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.TipoMantenimientoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringPrioridadRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringTipoMantenimientoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
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

    @InjectMocks
    private ProgramacionMantenimientoService service;

    private UUID programacionId;
    private UUID planMantenimientoActivoId;
    private UUID planId;
    private UUID activoId;
    private UUID tipoActivoId;
    private PlanMantenimientoActivo planActivo;
    private Activo activo;
    private PlanMantenimiento plan;

    @BeforeEach
    void setUp() {
        programacionId = UUID.randomUUID();
        planMantenimientoActivoId = UUID.randomUUID();
        planId = UUID.randomUUID();
        activoId = UUID.randomUUID();
        tipoActivoId = UUID.randomUUID();

        UUID responsableId = UUID.randomUUID();
        planActivo = PlanMantenimientoActivo.builder()
                .id(planMantenimientoActivoId)
                .planMantenimientoId(planId)
                .activoId(activoId)
                .responsableId(responsableId)
                .fechaInicio(LocalDate.now().minusMonths(1))
                .activo(true)
                .build();

        activo = Activo.builder()
                .id(activoId)
                .codigo("ACT-001")
                .nombre("Camioneta Hilux")
                .tipoActivoId(tipoActivoId)
                .build();

        plan = PlanMantenimiento.builder()
                .id(planId)
                .codigo("PLAN-PREV-01")
                .nombre("Plan Preventivo Vehicular")
                .build();
    }

    @Test
    @DisplayName("Regla 1: Debe lanzar BusinessException si no hay criterios activos")
    void testRegla1_FallaSiNoHayCriteriosActivos() {
        ProgramacionMantenimientoCriterioRequest criterioInactivo = new ProgramacionMantenimientoCriterioRequest(
                null, TipoCriterioMantenimiento.TIEMPO, 30, null, LocalDate.now().plusDays(30), null, false
        );
        ProgramacionMantenimientoRequest request = new ProgramacionMantenimientoRequest(
                planMantenimientoActivoId, true, List.of(criterioInactivo)
        );

        when(planMantenimientoActivoRepository.findById(planMantenimientoActivoId)).thenReturn(Optional.of(planActivo));
        when(activoRepository.findById(activoId)).thenReturn(Optional.of(activo));

        BusinessException ex = assertThrows(BusinessException.class, () -> service.create(request));
        assertTrue(ex.getMessage().contains("al menos un criterio activo"));
    }

    @Test
    @DisplayName("Regla 2: No permitir dos criterios del mismo tipo dentro de una misma programación")
    void testRegla2_FallaSiHayCriteriosDelMismoTipo() {
        ProgramacionMantenimientoCriterioRequest criterio1 = new ProgramacionMantenimientoCriterioRequest(
                null, TipoCriterioMantenimiento.TIEMPO, 30, null, LocalDate.now().plusDays(30), null, true
        );
        ProgramacionMantenimientoCriterioRequest criterio2 = new ProgramacionMantenimientoCriterioRequest(
                null, TipoCriterioMantenimiento.TIEMPO, 60, null, LocalDate.now().plusDays(60), null, true
        );
        ProgramacionMantenimientoRequest request = new ProgramacionMantenimientoRequest(
                planMantenimientoActivoId, true, List.of(criterio1, criterio2)
        );

        when(planMantenimientoActivoRepository.findById(planMantenimientoActivoId)).thenReturn(Optional.of(planActivo));
        when(activoRepository.findById(activoId)).thenReturn(Optional.of(activo));

        ConflictException ex = assertThrows(ConflictException.class, () -> service.create(request));
        assertTrue(ex.getMessage().contains("No se permite más de un criterio del tipo TIEMPO"));
    }

    @Test
    @DisplayName("Regla 3: Validar que el activo pueda proporcionar kilometraje u horas de uso")
    void testRegla3_InvocaValidacionCapacidadActivo() {
        ProgramacionMantenimientoCriterioRequest criterioKm = new ProgramacionMantenimientoCriterioRequest(
                null, TipoCriterioMantenimiento.KILOMETRAJE, null, new BigDecimal("5000"), null, new BigDecimal("10000"), true
        );
        ProgramacionMantenimientoRequest request = new ProgramacionMantenimientoRequest(
                planMantenimientoActivoId, true, List.of(criterioKm)
        );

        when(planMantenimientoActivoRepository.findById(planMantenimientoActivoId)).thenReturn(Optional.of(planActivo));
        when(activoRepository.findById(activoId)).thenReturn(Optional.of(activo));
        doThrow(new BusinessException("El activo no puede proporcionar kilometraje")).when(criterioService)
                .validarCapacidadActivo(activo, TipoCriterioMantenimiento.KILOMETRAJE);

        BusinessException ex = assertThrows(BusinessException.class, () -> service.create(request));
        assertTrue(ex.getMessage().contains("no puede proporcionar kilometraje"));
        verify(criterioService, times(1)).validarCapacidadActivo(activo, TipoCriterioMantenimiento.KILOMETRAJE);
    }

    @Test
    @DisplayName("Regla 4 y 6: Al cumplirse un criterio se genera una sola solicitud y se guarda en el historial")
    void testRegla4y6_GenerarUnaSolaSolicitudYGuardarHistorial() {
        ProgramacionMantenimiento programacion = ProgramacionMantenimiento.builder()
                .id(programacionId)
                .planMantenimientoActivoId(planMantenimientoActivoId)
                .activo(true)
                .build();

        ProgramacionMantenimientoCriterio criterioTiempo = ProgramacionMantenimientoCriterio.builder()
                .id(UUID.randomUUID())
                .programacionMantenimientoId(programacionId)
                .tipoCriterio(TipoCriterioMantenimiento.TIEMPO)
                .intervaloDias(30)
                .proximaFecha(LocalDate.now().minusDays(1)) // Fecha vencida
                .activo(true)
                .build();

        when(repository.findById(programacionId)).thenReturn(Optional.of(programacion));
        when(planMantenimientoActivoRepository.findById(planMantenimientoActivoId)).thenReturn(Optional.of(planActivo));
        when(activoRepository.findById(activoId)).thenReturn(Optional.of(activo));
        when(planMantenimientoRepository.findById(planId)).thenReturn(Optional.of(plan));
        when(criterioRepository.findByProgramacionMantenimientoIdAndActivoTrue(programacionId)).thenReturn(List.of(criterioTiempo));
        when(historialRepository.findFirstPendingByProgramacionMantenimientoId(programacionId)).thenReturn(Optional.empty());

        TipoMantenimientoEntity tm = TipoMantenimientoEntity.builder().id(UUID.randomUUID()).codigo("PREVENTIVO").build();
        when(springTipoMantenimientoRepository.findByCodigoIgnoreCase("PREVENTIVO")).thenReturn(Optional.of(tm));

        PrioridadEntity prio = PrioridadEntity.builder().id(UUID.randomUUID()).codigo("NORMAL").build();
        when(springPrioridadRepository.findFirstByPorDefectoTrue()).thenReturn(Optional.of(prio));

        SolicitudMantenimientoResponse solResp = mock(SolicitudMantenimientoResponse.class);
        UUID generatedSolId = UUID.randomUUID();
        when(solResp.id()).thenReturn(generatedSolId);
        when(solResp.numero()).thenReturn("SOL-2026-0001");
        when(solicitudMantenimientoService.create(any())).thenReturn(solResp);

        EvaluarProgramacionRequest evalReq = new EvaluarProgramacionRequest(LocalDate.now(), null, null, false);
        EvaluacionProgramacionResponse resp = service.evaluarProgramacion(programacionId, evalReq);

        assertTrue(resp.cumpleCriterio());
        assertTrue(resp.solicitudGenerada());
        assertFalse(resp.yaExistiaSolicitudAbierta());
        assertEquals("SOL-2026-0001", resp.solicitudNumero());

        // Regla 4: Una sola solicitud generada
        verify(solicitudMantenimientoService, times(1)).create(any());

        // Regla 6: Conservar historial de valores
        verify(historialRepository, times(1)).save(any(ProgramacionMantenimientoHistorial.class));
    }

    @Test
    @DisplayName("Regla 5: Al completar mantenimiento se recalculan todos los criterios")
    void testRegla5_RecalcularCriteriosAlCompletar() {
        ProgramacionMantenimiento programacion = ProgramacionMantenimiento.builder()
                .id(programacionId)
                .planMantenimientoActivoId(planMantenimientoActivoId)
                .activo(true)
                .build();

        ProgramacionMantenimientoCriterio criterioTiempo = ProgramacionMantenimientoCriterio.builder()
                .id(UUID.randomUUID())
                .programacionMantenimientoId(programacionId)
                .tipoCriterio(TipoCriterioMantenimiento.TIEMPO)
                .intervaloDias(30)
                .proximaFecha(LocalDate.now().minusDays(5))
                .activo(true)
                .build();

        ProgramacionMantenimientoCriterio criterioKm = ProgramacionMantenimientoCriterio.builder()
                .id(UUID.randomUUID())
                .programacionMantenimientoId(programacionId)
                .tipoCriterio(TipoCriterioMantenimiento.KILOMETRAJE)
                .intervaloUso(new BigDecimal("5000"))
                .proximoValorUso(new BigDecimal("10000"))
                .activo(true)
                .build();

        List<ProgramacionMantenimientoCriterio> criterios = new ArrayList<>(List.of(criterioTiempo, criterioKm));
        when(repository.findById(programacionId)).thenReturn(Optional.of(programacion));
        when(criterioRepository.findByProgramacionMantenimientoId(programacionId)).thenReturn(criterios);
        when(historialRepository.findFirstPendingByProgramacionMantenimientoId(programacionId)).thenReturn(Optional.empty());

        LocalDate fechaServicio = LocalDate.now();
        BigDecimal kmServicio = new BigDecimal("10200");
        CompletarMantenimientoProgramadoRequest compReq = new CompletarMantenimientoProgramadoRequest(
                fechaServicio, kmServicio, null, null, "Mantenimiento preventivo de los 10,000 km ejecutado"
        );

        service.completarMantenimiento(programacionId, compReq);

        // Recalcular tiempo: fechaServicio + 30 días
        assertEquals(fechaServicio.plusDays(30), criterioTiempo.getProximaFecha());

        // Recalcular km: 10200 + 5000 = 15200
        assertEquals(new BigDecimal("15200"), criterioKm.getProximoValorUso());

        verify(criterioRepository, times(2)).save(any(ProgramacionMantenimientoCriterio.class));
    }
}
