package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.response.ActividadSugeridaResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimientoAplicacion;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ChecklistItem;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimientoActivo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimientoActividad;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ActividadMantenimientoAplicacionRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ActividadMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PlanMantenimientoActividadRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PlanMantenimientoActivoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ProgramacionMantenimientoHistorialRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ProgramacionMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** REQ-MANT-019: las sugerencias de actividades no deben crecer en consultas con el plan. */
@ExtendWith(MockitoExtension.class)
class OrdenTrabajoServiceSugerenciasTest {

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
    @Mock
    private SolicitudMantenimientoRepository solicitudRepository;

    @InjectMocks
    private OrdenTrabajoService service;

    @ParameterizedTest(name = "sugerirActividades con {0} actividades del plan")
    @ValueSource(ints = {5, 50})
    @DisplayName("REQ-MANT-019: sugerirActividades resuelve aplicaciones y actividades en un lote para 5 y 50 filas")
    void sugerirActividades_resuelveEnLote_conConsultasConstantes(int cantidad) {
        UUID solicitudId = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();
        UUID planId = UUID.randomUUID();

        Activo activo = new Activo();
        activo.setId(activoId);
        SolicitudMantenimiento solicitud = SolicitudMantenimiento.builder()
                .id(solicitudId)
                .activo(activo)
                .build();

        PlanMantenimientoActivo planActivo = new PlanMantenimientoActivo();
        planActivo.setId(UUID.randomUUID());
        planActivo.setPlanMantenimientoId(planId);
        planActivo.setActivoId(activoId);
        planActivo.setActivo(true);

        List<PlanMantenimientoActividad> actividadesPlan = new ArrayList<>();
        List<ActividadMantenimientoAplicacion> aplicaciones = new ArrayList<>();
        List<ActividadMantenimiento> actividades = new ArrayList<>();
        for (int i = 0; i < cantidad; i++) {
            UUID aplicacionId = UUID.randomUUID();
            UUID actividadId = UUID.randomUUID();

            PlanMantenimientoActividad planActividad = new PlanMantenimientoActividad();
            planActividad.setId(UUID.randomUUID());
            planActividad.setPlanMantenimientoId(planId);
            planActividad.setActividadMantenimientoAplicacionId(aplicacionId);
            planActividad.setOrden(i + 1);
            actividadesPlan.add(planActividad);

            ChecklistItem checklist = new ChecklistItem();
            checklist.setId(UUID.randomUUID());
            checklist.setNombre("Revisar nivel");
            checklist.setDescripcion("Verificar aceite");
            checklist.setOrden(1);

            ActividadMantenimientoAplicacion aplicacion = new ActividadMantenimientoAplicacion();
            aplicacion.setId(aplicacionId);
            aplicacion.setActividadMantenimientoId(actividadId);
            aplicacion.setChecklist(List.of(checklist));
            aplicaciones.add(aplicacion);

            ActividadMantenimiento actividad = new ActividadMantenimiento();
            actividad.setId(actividadId);
            actividad.setCodigo("ACT-" + i);
            actividad.setNombre("Actividad " + i);
            actividad.setDescripcion("Descripción " + i);
            actividades.add(actividad);
        }

        when(historialRepository.findBySolicitudMantenimientoId(solicitudId)).thenReturn(Optional.empty());
        when(solicitudRepository.findById(solicitudId)).thenReturn(Optional.of(solicitud));
        when(planMantenimientoActivoRepository.findByActivoId(activoId)).thenReturn(List.of(planActivo));
        when(planMantenimientoActividadRepository.findByPlanMantenimientoId(planId)).thenReturn(actividadesPlan);
        when(actividadMantenimientoAplicacionRepository.findAllByIdIn(anyCollection())).thenReturn(aplicaciones);
        when(actividadMantenimientoRepository.findAllByIdIn(anyCollection())).thenReturn(actividades);

        List<ActividadSugeridaResponse> sugeridas = service.sugerirActividades(solicitudId);

        assertThat(sugeridas).hasSize(cantidad);
        assertThat(sugeridas.getFirst().codigo()).isEqualTo("ACT-0");
        assertThat(sugeridas.getFirst().checklist()).singleElement()
                .extracting(ActividadSugeridaResponse.ChecklistItemSugerido::nombre)
                .isEqualTo("Revisar nivel");
        assertThat(sugeridas.getLast().orden()).isEqualTo(cantidad);

        verify(actividadMantenimientoAplicacionRepository, times(1)).findAllByIdIn(anyCollection());
        verify(actividadMantenimientoRepository, times(1)).findAllByIdIn(anyCollection());
        verify(actividadMantenimientoAplicacionRepository, never()).findById(any());
        verify(actividadMantenimientoRepository, never()).findById(any());
    }
}
