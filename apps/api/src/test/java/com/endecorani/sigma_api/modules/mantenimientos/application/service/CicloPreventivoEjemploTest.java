package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoValorEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.request.OrdenTrabajoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.response.ActividadSugeridaResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.CompletarMantenimientoProgramadoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.BatchEvaluacionProgramacionResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.EvaluacionProgramacionResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.OrdenTrabajoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ProgramacionMantenimientoCriterioMapper;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ProgramacionMantenimientoHistorialMapper;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ProgramacionMantenimientoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.*;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.*;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.PrioridadEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.TipoMantenimientoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringPrioridadRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringTipoMantenimientoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.parametros.domain.constant.CorrelativoCodigo;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.shared.infrastructure.report.JasperReportService;
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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CicloPreventivoEjemploTest {

    // Repositorios compartidos
    @Mock private ProgramacionMantenimientoRepository programacionRepository;
    @Mock private ProgramacionMantenimientoCriterioRepository criterioRepository;
    @Mock private ProgramacionMantenimientoHistorialRepository historialRepository;
    @Mock private PlanMantenimientoActivoRepository planMantenimientoActivoRepository;
    @Mock private PlanMantenimientoRepository planMantenimientoRepository;
    @Mock private PlanMantenimientoActividadRepository planMantenimientoActividadRepository;
    @Mock private ActividadMantenimientoAplicacionRepository actividadMantenimientoAplicacionRepository;
    @Mock private ActividadMantenimientoRepository actividadMantenimientoRepository;
    @Mock private SolicitudMantenimientoRepository solicitudRepository;
    @Mock private SolicitudMantenimientoService solicitudMantenimientoService;
    @Mock private ActivoRepository activoRepository;
    @Mock private TipoActivoRepository tipoActivoRepository;
    @Mock private EmpleadoRepository empleadoRepository;
    @Mock private SpringTipoMantenimientoRepository springTipoMantenimientoRepository;
    @Mock private SpringPrioridadRepository springPrioridadRepository;
    @Mock private SpringActivoAtributoValorRepository springActivoAtributoValorRepository;
    @Mock private SpringActivoAtributoRepository springActivoAtributoRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private SecurityUtils securityUtils;
    @Mock private ProgramacionMantenimientoMapper programacionMapper;
    @Mock private ProgramacionMantenimientoCriterioMapper criterioMapper;
    @Mock private ProgramacionMantenimientoHistorialMapper historialMapper;
    @Mock private ProgramacionMantenimientoCriterioService criterioService;

    // Dependencias de OrdenTrabajoService
    @Mock private OrdenTrabajoRepository otRepository;
    @Mock private OrdenTrabajoMapper otMapper;
    @Mock private CorrelativoService correlativoService;
    @Mock private JasperReportService jasperReportService;
    @Mock private SpringVEmpleadoRepository springVEmpleadoRepository;

    @InjectMocks
    private ProgramacionMantenimientoService programacionService;

    @InjectMocks
    private OrdenTrabajoService otService;

    @Test
    @DisplayName("Ejemplo completo E2E: Plan -> Programación por Kilometraje -> Disparo Solicitud -> Sugerencia OT -> Cierre y Actualización de Telemetría")
    void ejemploFlujoCompletoMantenimientoPreventivo() {
        // =========================================================================
        // 1. Datos del escenario (Activo, Plan, Criterio de 5,000 km, Telemetría)
        // =========================================================================
        UUID activoId = UUID.randomUUID();
        UUID tipoActivoId = UUID.randomUUID();
        UUID planId = UUID.randomUUID();
        UUID planActivoId = UUID.randomUUID();
        UUID programacionId = UUID.randomUUID();
        UUID criterioId = UUID.randomUUID();
        UUID attrKilometrajeId = UUID.randomUUID();
        UUID appUuid = UUID.randomUUID();
        UUID actId = UUID.randomUUID();

        // Activo con odómetro actual en 5,100 km (supera el umbral de 5,000 km)
        Activo activo = Activo.builder()
                .id(activoId)
                .codigo("CAM-001")
                .nombre("Camión Volquete Volvo FMX")
                .tipoActivoId(tipoActivoId)
                .activo(true)
                .build();

        ActivoAtributoEntity attrDef = new ActivoAtributoEntity();
        attrDef.setId(attrKilometrajeId);
        attrDef.setCodigo("KILOMETRAJE");
        attrDef.setTipoActivoId(tipoActivoId);

        ActivoAtributoValorEntity attrValor = new ActivoAtributoValorEntity();
        attrValor.setActivoId(activoId);
        attrValor.setActivoAtributoId(attrKilometrajeId);
        attrValor.setValor("5100"); // Odómetro actual en BD

        PlanMantenimiento plan = PlanMantenimiento.builder()
                .id(planId)
                .codigo("PLAN-VOLVO-5K")
                .nombre("Plan Preventivo cada 5,000 Km")
                .build();

        PlanMantenimientoActivo planActivo = PlanMantenimientoActivo.builder()
                .id(planActivoId)
                .planMantenimientoId(planId)
                .activoId(activoId)
                .responsableId(UUID.randomUUID())
                .activo(true)
                .build();

        ProgramacionMantenimientoCriterio criterioKm = ProgramacionMantenimientoCriterio.builder()
                .id(criterioId)
                .programacionMantenimientoId(programacionId)
                .tipoCriterio(TipoCriterioMantenimiento.KILOMETRAJE)
                .intervaloUso(new BigDecimal("5000"))
                .proximoValorUso(new BigDecimal("5000")) // Límite: 5,000 km
                .activo(true)
                .build();

        ProgramacionMantenimiento programacion = ProgramacionMantenimiento.builder()
                .id(programacionId)
                .planMantenimientoActivoId(planActivoId)
                .criterios(new ArrayList<>(List.of(criterioKm)))
                .activo(true)
                .build();

        // =========================================================================
        // 2. PASO 1: Evaluación en lote (evaluarTodas)
        // =========================================================================
        when(programacionRepository.findByActivoTrue()).thenReturn(List.of(programacion));
        when(programacionRepository.findByIdWithLock(programacionId)).thenReturn(Optional.of(programacion));
        when(historialRepository.findFirstPendingByProgramacionMantenimientoId(programacionId)).thenReturn(Optional.empty());
        when(criterioRepository.findByProgramacionMantenimientoIdAndActivoTrue(programacionId)).thenReturn(List.of(criterioKm));
        when(planMantenimientoActivoRepository.findById(planActivoId)).thenReturn(Optional.of(planActivo));
        when(planMantenimientoRepository.findById(planId)).thenReturn(Optional.of(plan));
        when(activoRepository.findById(activoId)).thenReturn(Optional.of(activo));

        // Mock de telemetría leída del activo (5,100 km)
        when(springActivoAtributoValorRepository.findByActivoId(activoId)).thenReturn(List.of(attrValor));
        when(springActivoAtributoRepository.findById(attrKilometrajeId)).thenReturn(Optional.of(attrDef));

        TipoMantenimientoEntity tm = TipoMantenimientoEntity.builder().id(UUID.randomUUID()).codigo("PREVENTIVO").build();
        when(springTipoMantenimientoRepository.findByCodigoIgnoreCase("PREVENTIVO")).thenReturn(Optional.of(tm));

        PrioridadEntity prio = PrioridadEntity.builder().id(UUID.randomUUID()).codigo("NORMAL").build();
        when(springPrioridadRepository.findFirstByPorDefectoTrue()).thenReturn(Optional.of(prio));

        UUID solicitudGeneradaId = UUID.randomUUID();
        SolicitudMantenimientoResponse solResp = mock(SolicitudMantenimientoResponse.class);
        when(solResp.id()).thenReturn(solicitudGeneradaId);
        when(solResp.numero()).thenReturn("SOL-PREV-2026-0001");
        when(solicitudMantenimientoService.create(any())).thenReturn(solResp);

        // EJECUTAR PASO 1:
        BatchEvaluacionProgramacionResponse batchResult = programacionService.evaluarTodas();

        // VERIFICAR PASO 1:
        assertEquals(1, batchResult.totalEvaluadas());
        assertEquals(1, batchResult.solicitudesGeneradas());
        assertEquals(0, batchResult.errores());
        EvaluacionProgramacionResponse evalResp = batchResult.evaluaciones().get(0);
        assertTrue(evalResp.cumpleCriterio());
        assertTrue(evalResp.solicitudGenerada());
        assertEquals("SOL-PREV-2026-0001", evalResp.solicitudNumero());
        verify(historialRepository, times(1)).save(any(ProgramacionMantenimientoHistorial.class));

        // =========================================================================
        // 3. PASO 2: Sugerir actividades del Plan para la Solicitud generada
        // =========================================================================
        ProgramacionMantenimientoHistorial historialRegistrado = ProgramacionMantenimientoHistorial.builder()
                .programacionMantenimientoId(programacionId)
                .solicitudMantenimientoId(solicitudGeneradaId)
                .solicitudNumero("SOL-PREV-2026-0001")
                .completado(false)
                .build();

        when(historialRepository.findBySolicitudMantenimientoId(solicitudGeneradaId)).thenReturn(Optional.of(historialRegistrado));
        when(programacionRepository.findById(programacionId)).thenReturn(Optional.of(programacion));

        ChecklistItem chk1 = ChecklistItem.builder()
                .id(UUID.randomUUID())
                .nombre("Cambio de filtro de aire")
                .orden(1)
                .build();
        ChecklistItem chk2 = ChecklistItem.builder()
                .id(UUID.randomUUID())
                .nombre("Inspección de frenos")
                .orden(2)
                .build();

        ActividadMantenimientoAplicacion app = ActividadMantenimientoAplicacion.builder()
                .id(appUuid)
                .actividadMantenimientoId(actId)
                .checklist(List.of(chk1, chk2))
                .build();

        ActividadMantenimiento act = ActividadMantenimiento.builder()
                .id(actId)
                .codigo("ACT-PREV-01")
                .nombre("Servicio Básico 5,000 Km")
                .descripcion("Revisión técnica de motor y frenos")
                .build();

        PlanMantenimientoActividad planActividad = PlanMantenimientoActividad.builder()
                .id(UUID.randomUUID())
                .planMantenimientoId(planId)
                .actividadMantenimientoAplicacionId(appUuid)
                .build();

        when(planMantenimientoActividadRepository.findByPlanMantenimientoId(planId)).thenReturn(List.of(planActividad));
        when(actividadMantenimientoAplicacionRepository.findById(appUuid)).thenReturn(Optional.of(app));
        when(actividadMantenimientoRepository.findById(actId)).thenReturn(Optional.of(act));

        // EJECUTAR PASO 2:
        List<ActividadSugeridaResponse> actividadesSugeridas = otService.sugerirActividades(solicitudGeneradaId);

        // VERIFICAR PASO 2:
        assertNotNull(actividadesSugeridas);
        assertEquals(1, actividadesSugeridas.size());
        assertEquals("ACT-PREV-01", actividadesSugeridas.get(0).codigo());
        assertEquals("Servicio Básico 5,000 Km", actividadesSugeridas.get(0).nombre());
        assertEquals(2, actividadesSugeridas.get(0).checklist().size());

        // =========================================================================
        // 4. PASO 3: Crear Orden de Trabajo con precarga automática de actividades
        // =========================================================================
        OrdenTrabajoRequest otRequest = new OrdenTrabajoRequest(
                solicitudGeneradaId,
                activoId,
                UUID.randomUUID(),
                null, null,
                "Diagnóstico preventivo regular",
                null, null,
                null, // null para que se precarguen solas
                null
        );

        OrdenTrabajo ordenTrabajo = OrdenTrabajo.builder()
                .id(UUID.randomUUID())
                .solicitudMantenimientoId(solicitudGeneradaId)
                .activoId(activoId)
                .actividades(new ArrayList<>())
                .build();

        when(otRepository.existsBySolicitudMantenimientoId(solicitudGeneradaId)).thenReturn(false);
        when(correlativoService.generar(eq(CorrelativoCodigo.ORDEN_TRABAJO), anyInt())).thenReturn("OT-2026-0005");
        when(otMapper.toDomain(otRequest)).thenReturn(ordenTrabajo);
        when(otRepository.save(any(OrdenTrabajo.class))).thenAnswer(inv -> inv.getArgument(0));

        // EJECUTAR PASO 3:
        otService.create(otRequest);

        // VERIFICAR PASO 3:
        assertFalse(ordenTrabajo.getActividades().isEmpty());
        assertEquals(1, ordenTrabajo.getActividades().size());
        assertTrue(ordenTrabajo.getActividades().get(0).getDescripcion().contains("Servicio Básico 5,000 Km"));
        assertTrue(ordenTrabajo.getActividades().get(0).getDescripcion().contains("Cambio de filtro de aire"));

        // =========================================================================
        // 5. PASO 4: Culminar Mantenimiento, Recalcular Criterio y Actualizar Odómetro
        // =========================================================================
        when(criterioRepository.findByProgramacionMantenimientoId(programacionId)).thenReturn(List.of(criterioKm));

        CompletarMantenimientoProgramadoRequest finalizarReq = new CompletarMantenimientoProgramadoRequest(
                LocalDate.now(),
                new BigDecimal("5250"), // Odómetro final al culminar servicio
                null,
                solicitudGeneradaId,
                "Mantenimiento ejecutado exitosamente según checklist"
        );

        // EJECUTAR PASO 4:
        programacionService.completarMantenimiento(programacionId, finalizarReq);

        // VERIFICAR PASO 4:
        // 1. Odómetro actualizado en activo_atributo_valores
        assertEquals("5250", attrValor.getValor());
        verify(springActivoAtributoValorRepository, times(1)).save(attrValor);

        // 2. Próximo límite de kilometraje recalculado: 5,250 + 5,000 = 10,250 km
        assertEquals(new BigDecimal("10250"), criterioKm.getProximoValorUso());
        verify(criterioRepository, times(1)).save(criterioKm);

        // 3. Historial preventivo marcado como completado
        assertTrue(historialRegistrado.getCompletado());
        assertEquals(new BigDecimal("5250"), historialRegistrado.getValorUsoServicio());
        verify(historialRepository, atLeastOnce()).save(historialRegistrado);
    }
}
