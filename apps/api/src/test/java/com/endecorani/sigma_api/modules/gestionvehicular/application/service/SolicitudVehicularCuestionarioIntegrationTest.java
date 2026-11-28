package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.application.service.ActivoService;
import com.endecorani.sigma_api.modules.cuestionarios.application.service.CuestionarioAsignacionService;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.request.SolicitudVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.SolicitudVehicularMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.event.SolicitudVehicularFinalizadaEvent;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.Conductor;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SolicitudVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.AsignacionVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ConductorRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SolicitudVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.TipoSolicitudVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ViajeVehicularRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.modules.workflow.application.dto.request.CompleteWorkflowTaskRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskActionsResponse;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowApplicationService;
import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.FlowableClient;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SolicitudVehicularCuestionarioIntegrationTest {

    @Mock private SolicitudVehicularRepository repository;
    @Mock private TipoSolicitudVehicularRepository tipoSolicitudVehicularRepository;
    @Mock private EmpleadoRepository empleadoRepository;
    @Mock private SpringVEmpleadoRepository springVEmpleadoRepository;
    @Mock private ConductorRepository conductorRepository;
    @Mock private AsignacionVehicularRepository asignacionVehicularRepository;
    @Mock private ViajeVehicularRepository viajeVehicularRepository;
    @Mock private SolicitudVehicularAdjuntoService adjuntoService;
    @Mock private SolicitudVehicularMapper mapper;
    @Mock private CorrelativoService correlativoService;
    @Mock private WorkflowApplicationService workflowApplicationService;
    @Mock private FlowableClient flowableClient;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private SecurityUtils securityUtils;
    @Mock private ActivoService activoService;
    @Mock private ApplicationEventPublisher eventPublisher;
    @Mock private CuestionarioAsignacionService cuestionarioAsignacionService;

    @InjectMocks
    private SolicitudVehicularService service;

    @BeforeEach
    void injectOptionalCuestionarioService() {
        service.setCuestionarioAsignacionService(cuestionarioAsignacionService);
    }

    @Test
    void create_conCuestionarioObligatorioPendiente_lanzaBusinessException() {
        UUID solicitanteId = UUID.randomUUID();
        when(cuestionarioAsignacionService.tienePendientesObligatorias(solicitanteId, "SOLICITUD_VEHICULAR"))
                .thenReturn(true);

        SolicitudVehicularRequest req = new SolicitudVehicularRequest(
                null, UUID.randomUUID(), solicitanteId,
                "Motivo", null, "Destino",
                LocalDateTime.now().plusDays(1), LocalDateTime.now().plusDays(2),
                2, null, null, null, null, null
        );

        BusinessException ex = assertThrows(BusinessException.class, () -> service.create(req));
        assertEquals("CUESTIONARIO_OBLIGATORIO_PENDIENTE", ex.getCode());
        verify(repository, never()).save(any());
    }

    @Test
    void completarWorkflow_transicionAFinalizada_publicaSolicitudVehicularFinalizadaEvent() {
        UUID solicitudId = UUID.randomUUID();
        UUID solicitanteId = UUID.randomUUID();
        UUID conductorId = UUID.randomUUID();
        UUID conductorEmpleadoId = UUID.randomUUID();

        SolicitudVehicular solicitud = SolicitudVehicular.builder()
                .id(solicitudId)
                .numero("SOL-2026-0099")
                .solicitanteId(solicitanteId)
                .conductorAsignadoId(conductorId)
                .estado("EN_CURSO")
                .processInstanceId("proc-1")
                .build();

        VEmpleadoEntity veConductor = new VEmpleadoEntity();
        veConductor.setEmpleadoId(conductorEmpleadoId);
        veConductor.setNombreCompleto("Luis Condori");

        when(securityUtils.isAdmin()).thenReturn(true);
        when(repository.findById(solicitudId)).thenReturn(Optional.of(solicitud));
        when(workflowApplicationService.completarTarea(eq("proc-1"), any(), eq(true)))
                .thenReturn(new WorkflowTaskActionsResponse("proc-1", "FINALIZADA", null, null, null, List.of(), List.of()));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(asignacionVehicularRepository.findBySolicitudVehicularId(solicitudId)).thenReturn(List.of());
        when(conductorRepository.findById(conductorId))
                .thenReturn(Optional.of(Conductor.builder().id(conductorId).empleadoId(conductorEmpleadoId).build()));
        when(springVEmpleadoRepository.findById(conductorEmpleadoId)).thenReturn(Optional.of(veConductor));
        when(adjuntoService.findBySolicitudVehicularId(solicitudId)).thenReturn(List.of());

        service.completarWorkflow(solicitudId, new CompleteWorkflowTaskRequest(Map.of()));

        ArgumentCaptor<Object> eventCaptor = ArgumentCaptor.forClass(Object.class);
        verify(eventPublisher).publishEvent(eventCaptor.capture());
        SolicitudVehicularFinalizadaEvent ev = (SolicitudVehicularFinalizadaEvent) eventCaptor.getValue();
        assertEquals(solicitudId, ev.solicitudId());
        assertEquals("SOL-2026-0099", ev.numeroSolicitud());
        assertEquals(solicitanteId, ev.solicitanteId());
        assertEquals(conductorId, ev.conductorId());
        assertEquals("Luis Condori", ev.conductorNombre());
    }

    @Test
    void completarWorkflow_yaFinalizadaPreviamente_noVuelveAPublicarEvento() {
        UUID solicitudId = UUID.randomUUID();
        SolicitudVehicular solicitud = SolicitudVehicular.builder()
                .id(solicitudId)
                .numero("SOL-2026-0100")
                .solicitanteId(UUID.randomUUID())
                .estado("FINALIZADA")
                .processInstanceId("proc-2")
                .build();

        when(securityUtils.isAdmin()).thenReturn(true);
        when(repository.findById(solicitudId)).thenReturn(Optional.of(solicitud));
        when(workflowApplicationService.completarTarea(eq("proc-2"), any(), eq(true)))
                .thenReturn(new WorkflowTaskActionsResponse("proc-2", "FINALIZADA", null, null, null, List.of(), List.of()));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(asignacionVehicularRepository.findBySolicitudVehicularId(solicitudId)).thenReturn(List.of());
        when(adjuntoService.findBySolicitudVehicularId(solicitudId)).thenReturn(List.of());

        service.completarWorkflow(solicitudId, new CompleteWorkflowTaskRequest(Map.of()));

        verify(eventPublisher, never()).publishEvent(any(SolicitudVehicularFinalizadaEvent.class));
    }
}
