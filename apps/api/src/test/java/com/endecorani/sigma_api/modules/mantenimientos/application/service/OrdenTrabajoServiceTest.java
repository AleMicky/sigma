package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.request.OrdenTrabajoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.response.ActividadSugeridaResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.response.OrdenTrabajoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.OrdenTrabajoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.*;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.*;
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

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrdenTrabajoServiceTest {

    @Mock
    private OrdenTrabajoRepository repository;
    @Mock
    private OrdenTrabajoMapper mapper;
    @Mock
    private CorrelativoService correlativoService;
    @Mock
    private JasperReportService jasperReportService;
    @Mock
    private SecurityUtils securityUtils;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private EmpleadoRepository empleadoRepository;
    @Mock
    private SpringVEmpleadoRepository springVEmpleadoRepository;
    @Mock
    private SolicitudMantenimientoRepository solicitudRepository;
    @Mock
    private ActivoRepository activoRepository;
    @Mock
    private ProgramacionMantenimientoHistorialRepository historialRepository;
    @Mock
    private ProgramacionMantenimientoRepository programacionRepository;
    @Mock
    private PlanMantenimientoActivoRepository planMantenimientoActivoRepository;
    @Mock
    private PlanMantenimientoActividadRepository planMantenimientoActividadRepository;
    @Mock
    private ActividadMantenimientoAplicacionRepository actividadMantenimientoAplicacionRepository;
    @Mock
    private ActividadMantenimientoRepository actividadMantenimientoRepository;

    @InjectMocks
    private OrdenTrabajoService service;

    @Test
    @DisplayName("sugerirActividades debe retornar las actividades y checklists asociados al plan preventivo")
    void sugerirActividades_debeRetornarActividadesDelPlan() {
        UUID solId = UUID.randomUUID();
        UUID progId = UUID.randomUUID();
        UUID planActivoId = UUID.randomUUID();
        UUID planId = UUID.randomUUID();
        UUID appUuid = UUID.randomUUID();
        UUID actId = UUID.randomUUID();

        ProgramacionMantenimientoHistorial hist = ProgramacionMantenimientoHistorial.builder()
                .programacionMantenimientoId(progId)
                .solicitudMantenimientoId(solId)
                .build();
        ProgramacionMantenimiento prog = ProgramacionMantenimiento.builder()
                .id(progId)
                .planMantenimientoActivoId(planActivoId)
                .build();
        PlanMantenimientoActivo planActivo = PlanMantenimientoActivo.builder()
                .id(planActivoId)
                .planMantenimientoId(planId)
                .build();
        PlanMantenimientoActividad planAct = PlanMantenimientoActividad.builder()
                .id(UUID.randomUUID())
                .planMantenimientoId(planId)
                .actividadMantenimientoAplicacionId(appUuid)
                .build();
        ChecklistItem chk = ChecklistItem.builder()
                .id(UUID.randomUUID())
                .nombre("Revisión de nivel de aceite")
                .orden(1)
                .build();
        ActividadMantenimientoAplicacion app = ActividadMantenimientoAplicacion.builder()
                .id(appUuid)
                .actividadMantenimientoId(actId)
                .checklist(List.of(chk))
                .build();
        ActividadMantenimiento act = ActividadMantenimiento.builder()
                .id(actId)
                .codigo("ACT-01")
                .nombre("Cambio de aceite y filtros")
                .build();

        when(historialRepository.findBySolicitudMantenimientoId(solId)).thenReturn(Optional.of(hist));
        when(programacionRepository.findById(progId)).thenReturn(Optional.of(prog));
        when(planMantenimientoActivoRepository.findById(planActivoId)).thenReturn(Optional.of(planActivo));
        when(planMantenimientoActividadRepository.findByPlanMantenimientoId(planId)).thenReturn(List.of(planAct));
        when(actividadMantenimientoAplicacionRepository.findById(appUuid)).thenReturn(Optional.of(app));
        when(actividadMantenimientoRepository.findById(actId)).thenReturn(Optional.of(act));

        List<ActividadSugeridaResponse> result = service.sugerirActividades(solId);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("ACT-01", result.get(0).codigo());
        assertEquals("Cambio de aceite y filtros", result.get(0).nombre());
        assertEquals(1, result.get(0).checklist().size());
        assertEquals("Revisión de nivel de aceite", result.get(0).checklist().get(0).nombre());
    }

    @Test
    @DisplayName("create debe precargar automáticamente actividades sugeridas si no se especificaron en el request")
    void create_debePrecargarActividadesSugeridasCuandoVienenVacias() {
        UUID solId = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();
        UUID respId = UUID.randomUUID();
        UUID progId = UUID.randomUUID();
        UUID planActivoId = UUID.randomUUID();
        UUID planId = UUID.randomUUID();
        UUID appUuid = UUID.randomUUID();
        UUID actId = UUID.randomUUID();

        OrdenTrabajoRequest req = new OrdenTrabajoRequest(
                solId,
                activoId,
                respId,
                null,
                null,
                "Diagnóstico inicial",
                null,
                null,
                null, // actividades vacías
                null
        );

        OrdenTrabajo ordenTrabajo = OrdenTrabajo.builder()
                .id(UUID.randomUUID())
                .solicitudMantenimientoId(solId)
                .activoId(activoId)
                .responsableId(respId)
                .actividades(new ArrayList<>())
                .build();

        when(repository.existsBySolicitudMantenimientoId(solId)).thenReturn(false);
        when(correlativoService.generar(eq(CorrelativoCodigo.ORDEN_TRABAJO), anyInt())).thenReturn("OT-2026-0001");
        when(mapper.toDomain(req)).thenReturn(ordenTrabajo);

        ProgramacionMantenimientoHistorial hist = ProgramacionMantenimientoHistorial.builder()
                .programacionMantenimientoId(progId)
                .solicitudMantenimientoId(solId)
                .build();
        ProgramacionMantenimiento prog = ProgramacionMantenimiento.builder()
                .id(progId)
                .planMantenimientoActivoId(planActivoId)
                .build();
        PlanMantenimientoActivo planActivo = PlanMantenimientoActivo.builder()
                .id(planActivoId)
                .planMantenimientoId(planId)
                .build();
        PlanMantenimientoActividad planAct = PlanMantenimientoActividad.builder()
                .id(UUID.randomUUID())
                .planMantenimientoId(planId)
                .actividadMantenimientoAplicacionId(appUuid)
                .build();
        ActividadMantenimientoAplicacion app = ActividadMantenimientoAplicacion.builder()
                .id(appUuid)
                .actividadMantenimientoId(actId)
                .checklist(Collections.emptyList())
                .build();
        ActividadMantenimiento act = ActividadMantenimiento.builder()
                .id(actId)
                .codigo("ACT-M1")
                .nombre("Mantenimiento de Frenos")
                .build();

        when(historialRepository.findBySolicitudMantenimientoId(solId)).thenReturn(Optional.of(hist));
        when(programacionRepository.findById(progId)).thenReturn(Optional.of(prog));
        when(planMantenimientoActivoRepository.findById(planActivoId)).thenReturn(Optional.of(planActivo));
        when(planMantenimientoActividadRepository.findByPlanMantenimientoId(planId)).thenReturn(List.of(planAct));
        when(actividadMantenimientoAplicacionRepository.findById(appUuid)).thenReturn(Optional.of(app));
        when(actividadMantenimientoRepository.findById(actId)).thenReturn(Optional.of(act));
        when(repository.save(any(OrdenTrabajo.class))).thenAnswer(inv -> inv.getArgument(0));

        service.create(req);

        assertNotNull(ordenTrabajo.getActividades());
        assertEquals(1, ordenTrabajo.getActividades().size());
        assertEquals("Mantenimiento de Frenos", ordenTrabajo.getActividades().get(0).getDescripcion());
        assertFalse(ordenTrabajo.getActividades().get(0).isRealizado());
    }
}
