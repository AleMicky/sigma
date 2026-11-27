package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.application.service.ActivoService;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.EnviarSolicitudMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.SolicitudMantenimientoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoTrazabilidadRepository;
import com.endecorani.sigma_api.modules.organizacion.application.service.EmpleadoInfoResolver;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.modules.workflow.application.dto.request.CompleteWorkflowTaskRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskActionsResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskResponse;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowApplicationService;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowCompletionGuard;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowConfigService;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowEngineService;
import com.endecorani.sigma_api.shared.application.storage.DocumentStorageService;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ForbiddenException;
import com.endecorani.sigma_api.shared.infrastructure.report.JasperReportService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SolicitudMantenimientoWorkflowSecurityTest {

    @Mock
    private SolicitudMantenimientoRepository repository;
    @Mock
    private SolicitudMantenimientoTrazabilidadRepository trazabilidadRepository;
    @Mock
    private EmpleadoRepository empleadoRepository;
    @Mock
    private SpringVEmpleadoRepository vEmpleadoRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private SecurityUtils securityUtils;
    @Mock
    private SolicitudMantenimientoMapper mapper;
    @Mock
    private CorrelativoService correlativoService;
    @Mock
    private WorkflowApplicationService workflowApplicationService;
    @Mock
    private DocumentStorageService documentStorageService;
    @Mock
    private JasperReportService jasperReportService;
    @Mock
    private ActivoService activoService;
    @Mock
    private ApplicationEventPublisher eventPublisher;
    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private JdbcClient jdbcClient;
    @Mock
    private WorkflowConfigService workflowConfigService;
    @Mock
    private WorkflowEngineService workflowEngineService;
    @Mock
    private EmpleadoInfoResolver empleadoInfoResolver;

    @InjectMocks
    private SolicitudMantenimientoService service;

    @AfterEach
    void limpiarSeguridad() {
        SecurityContextHolder.clearContext();
    }

    private void autenticar(String rol, UUID empleadoId) {
        autenticar(rol, empleadoId, true);
    }

    /** Para casos que salen antes de resolver el empleado (p. ej. tarea sin assignee). */
    private void autenticar(String rol) {
        autenticar(rol, null, false);
    }

    private void autenticar(String rol, UUID empleadoId, boolean vincularEmpleado) {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                "usuario-tests",
                "n/a",
                List.of(new SimpleGrantedAuthority("ROLE_" + rol))));
        when(securityUtils.isAdmin()).thenReturn(tieneRolAdminEnContexto());
        if (!vincularEmpleado) {
            return;
        }
        UUID userId = UUID.randomUUID();
        UUID personaId = UUID.randomUUID();
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.of(userId));
        if (tieneRolAdminEnContexto()) {
            when(securityUtils.getCurrentUsername()).thenReturn("usuario-tests");
        }
        when(usuarioRepository.findById(userId))
                .thenReturn(Optional.of(Usuario.builder().id(userId).personaId(personaId).build()));
        when(empleadoRepository.findFirstByPersonaId(personaId))
                .thenReturn(Optional.of(Empleado.builder().id(empleadoId).personaId(personaId).build()));
    }

    private void autenticarParaGuardia(String rol, UUID empleadoId) {
        contextoDeSeguridad(rol);
        when(empleadoInfoResolver.resolveCurrentEmpleadoId()).thenReturn(Optional.of(empleadoId));
    }

    /** Caso que falla antes de consultar roles: solo se necesita el contexto autenticado. */
    private void autenticarParaGuardia(String rol) {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                "usuario-tests",
                "n/a",
                List.of(new SimpleGrantedAuthority("ROLE_" + rol))));
    }

    private void contextoDeSeguridad(String rol) {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                "usuario-tests",
                "n/a",
                List.of(new SimpleGrantedAuthority("ROLE_" + rol))));
        when(securityUtils.isAdmin()).thenReturn(tieneRolAdminEnContexto());
        if (tieneRolAdminEnContexto()) {
            when(securityUtils.getCurrentUsername()).thenReturn("usuario-tests");
        }
    }

    /** REQ-SEG-001: el rol se resuelve desde authorities reales, nunca desde el nombre del usuario. */
    private boolean tieneRolAdminEnContexto() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    private WorkflowApplicationService workflowServiceConGuardia() {
        WorkflowCompletionGuard guardia = new WorkflowCompletionGuard(
                securityUtils, empleadoInfoResolver, workflowEngineService);
        return new WorkflowApplicationService(workflowConfigService, workflowEngineService, guardia);
    }

    private SolicitudMantenimiento solicitudBorrador(UUID solicitanteId) {
        return SolicitudMantenimiento.builder()
                .id(UUID.randomUUID())
                .numero("SM-0001")
                .estado("BORRADOR")
                .processInstanceId(UUID.randomUUID().toString())
                .solicitante(Empleado.builder().id(solicitanteId).build())
                .build();
    }

    private void rolesDelAprobador(String... codigos) {
        when(jdbcClient.sql(anyString()).param(anyString(), any()).query(String.class).list())
                .thenReturn(Arrays.asList(codigos));
    }

    @Test
    void enviar_sinAprobador_debeFallar422SinUsarPrimerEmpleado() {
        UUID solicitanteId = UUID.randomUUID();
        UUID solicitudId = UUID.randomUUID();
        autenticar("SOLICITANTE", solicitanteId);
        when(repository.findById(solicitudId)).thenReturn(Optional.of(solicitudBorrador(solicitanteId)));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.enviar(solicitudId, new EnviarSolicitudMantenimientoRequest(null, null, null)));

        assertEquals("APROBADOR_REQUERIDO", ex.getCode());
        verify(empleadoRepository, never()).findAll(any(org.springframework.data.domain.Pageable.class));
        verify(workflowApplicationService, never()).iniciar(anyString(), anyString(), any());
    }

    @Test
    void enviar_aprobadorSinRolSupervisorOAdmin_debeFallar422() {
        UUID solicitanteId = UUID.randomUUID();
        UUID solicitudId = UUID.randomUUID();
        UUID aprobadorId = UUID.randomUUID();
        autenticar("SOLICITANTE", solicitanteId);
        when(repository.findById(solicitudId)).thenReturn(Optional.of(solicitudBorrador(solicitanteId)));
        when(empleadoRepository.findById(aprobadorId))
                .thenReturn(Optional.of(Empleado.builder().id(aprobadorId).personaId(UUID.randomUUID()).build()));
        rolesDelAprobador("CONDUCTOR");

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.enviar(solicitudId, new EnviarSolicitudMantenimientoRequest(aprobadorId, null, null)));

        assertEquals("APROBADOR_ROL_INVALIDO", ex.getCode());
        verify(workflowApplicationService, never()).iniciar(anyString(), anyString(), any());
    }

    @Test
    void enviar_actorDistintoAlSolicitante_debeNegar403() {
        UUID solicitanteId = UUID.randomUUID();
        UUID solicitudId = UUID.randomUUID();
        autenticar("SOLICITANTE", UUID.randomUUID());
        when(repository.findById(solicitudId)).thenReturn(Optional.of(solicitudBorrador(solicitanteId)));

        assertThrows(ForbiddenException.class,
                () -> service.enviar(solicitudId, new EnviarSolicitudMantenimientoRequest(UUID.randomUUID(), null, null)));

        verify(workflowApplicationService, never()).iniciar(anyString(), anyString(), any());
    }

    @Test
    void completarWorkflow_tareaSinResponsable_debeFallar409() {
        autenticar("SUPERVISOR");
        SolicitudMantenimiento solicitud = solicitudBorrador(UUID.randomUUID());
        when(repository.findById(solicitud.getId())).thenReturn(Optional.of(solicitud));
        when(workflowApplicationService.obtenerTareaActual(solicitud.getProcessInstanceId()))
                .thenReturn(new WorkflowTaskResponse("task-1", "Revisar", "revisarSolicitud", null, null, null));

        ConflictException ex = assertThrows(ConflictException.class,
                () -> service.completarWorkflow(solicitud.getId(), new CompleteWorkflowTaskRequest(Map.of())));

        assertEquals("TAREA_NO_ASIGNADA", ex.getCode());
        verify(workflowApplicationService, never()).completarTarea(
                eq(solicitud.getProcessInstanceId()), any(CompleteWorkflowTaskRequest.class), anyBoolean());
    }

    @Test
    void completarWorkflow_cuerpoDeclaraOtroSolicitante_debeNegar403() {
        UUID empleadoId = UUID.randomUUID();
        autenticar("SUPERVISOR", empleadoId);
        SolicitudMantenimiento solicitud = solicitudBorrador(UUID.randomUUID());
        when(repository.findById(solicitud.getId())).thenReturn(Optional.of(solicitud));
        when(workflowApplicationService.obtenerTareaActual(solicitud.getProcessInstanceId()))
                .thenReturn(new WorkflowTaskResponse("task-1", "Revisar", "revisarSolicitud",
                        empleadoId.toString(), null, null));

        assertThrows(ForbiddenException.class, () -> service.completarWorkflow(
                solicitud.getId(),
                new CompleteWorkflowTaskRequest(Map.of("solicitanteId", UUID.randomUUID().toString()))));

        verify(workflowApplicationService, never()).completarTarea(
                eq(solicitud.getProcessInstanceId()), any(CompleteWorkflowTaskRequest.class), anyBoolean());
    }

    @Test
    void completarWorkflow_adminBypassConTareaAsignada_debeCompletarYAuditar() {
        UUID aprobadorId = UUID.randomUUID();
        autenticar("ADMIN", UUID.randomUUID());
        SolicitudMantenimiento solicitud = solicitudBorrador(UUID.randomUUID());
        solicitud.setAprobador(Empleado.builder().id(aprobadorId).personaId(UUID.randomUUID()).build());
        when(repository.findById(solicitud.getId())).thenReturn(Optional.of(solicitud));
        when(workflowApplicationService.obtenerTareaActual(solicitud.getProcessInstanceId()))
                .thenReturn(new WorkflowTaskResponse("task-1", "Revisar", "revisarSolicitud",
                        UUID.randomUUID().toString(), null, null));
        when(empleadoRepository.findById(aprobadorId))
                .thenReturn(Optional.of(solicitud.getAprobador()));
        rolesDelAprobador("SUPERVISOR");
        when(workflowApplicationService.completarTarea(
                eq(solicitud.getProcessInstanceId()), any(CompleteWorkflowTaskRequest.class), eq(true)))
                .thenReturn(new WorkflowTaskActionsResponse("task-1", "Revisar", "revisarSolicitud",
                        solicitud.getProcessInstanceId(), "ASIGNADO", List.of(), List.of()));
        when(repository.save(solicitud)).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toResponse(solicitud)).thenReturn(null);

        service.completarWorkflow(solicitud.getId(), new CompleteWorkflowTaskRequest(Map.of("comentario", "OK")));

        verify(securityUtils, org.mockito.Mockito.times(2)).getCurrentUsername();
        verify(workflowApplicationService).completarTarea(
                eq(solicitud.getProcessInstanceId()), any(CompleteWorkflowTaskRequest.class), eq(true));
    }

    @Test
    void completarWorkflow_responsableIntentaAprobar_debeNegar403AntesDeMutarFlowable() {
        UUID responsableId = UUID.randomUUID();
        autenticar("SUPERVISOR", responsableId);
        SolicitudMantenimiento solicitud = solicitudBorrador(UUID.randomUUID());
        Empleado responsable = Empleado.builder()
                .id(responsableId).personaId(UUID.randomUUID()).build();
        solicitud.setResponsable(responsable);
        solicitud.setAprobador(responsable);
        when(repository.findById(solicitud.getId())).thenReturn(Optional.of(solicitud));
        when(workflowApplicationService.obtenerTareaActual(solicitud.getProcessInstanceId()))
                .thenReturn(new WorkflowTaskResponse("task-1", "Revisar", "revisarSolicitud",
                        responsableId.toString(), null, null));
        when(empleadoRepository.findById(responsableId)).thenReturn(Optional.of(responsable));
        rolesDelAprobador("SUPERVISOR");

        ForbiddenException ex = assertThrows(ForbiddenException.class,
                () -> service.completarWorkflow(
                        solicitud.getId(), new CompleteWorkflowTaskRequest(Map.of())));

        assertEquals("APROBADOR_ES_RESPONSABLE", ex.getCode());
        verify(workflowApplicationService, never()).completarTarea(
                eq(solicitud.getProcessInstanceId()), any(CompleteWorkflowTaskRequest.class), anyBoolean());
    }

    @Test
    void completarWorkflowGenerico_actionEnviarConAprobadorPropio_debeNegar403() {
        String processInstanceId = UUID.randomUUID().toString();
        UUID solicitanteId = UUID.randomUUID();
        when(workflowEngineService.obtenerDefinitionKey(processInstanceId))
                .thenReturn(WorkflowCompletionGuard.MANTENIMIENTOS_DEFINITION_KEY);

        ForbiddenException ex = assertThrows(ForbiddenException.class,
                () -> workflowServiceConGuardia().completarTarea(
                        processInstanceId,
                        new CompleteWorkflowTaskRequest(Map.of(
                                "action", "ENVIAR",
                                "aprobadorId", solicitanteId.toString())),
                        false));

        assertEquals(WorkflowApplicationService.WORKFLOW_MODULO_NO_GENERICO, ex.getCode());
        verify(workflowEngineService, never()).completarTarea(anyString(), anyMap());
    }

    @Test
    void completarWorkflowGenerico_decisionCoordinadorAprobar_debeNegar403() {
        String processInstanceId = UUID.randomUUID().toString();
        when(workflowEngineService.obtenerDefinitionKey(processInstanceId))
                .thenReturn(WorkflowCompletionGuard.MANTENIMIENTOS_DEFINITION_KEY);

        ForbiddenException ex = assertThrows(ForbiddenException.class,
                () -> workflowServiceConGuardia().completarTarea(
                        processInstanceId,
                        new CompleteWorkflowTaskRequest(Map.of(
                                "decisionCoordinador", "APROBAR",
                                "responsableId", UUID.randomUUID().toString())),
                        false));

        assertEquals(WorkflowApplicationService.WORKFLOW_MODULO_NO_GENERICO, ex.getCode());
        verify(workflowEngineService, never()).completarTarea(anyString(), anyMap());
    }

    @Test
    void completarWorkflowDelModulo_solicitanteConAssigneeAjeno_debeNegar403() {
        UUID actorId = UUID.randomUUID();
        String processInstanceId = UUID.randomUUID().toString();
        autenticarParaGuardia("SOLICITANTE", actorId);
        when(workflowEngineService.obtenerDefinitionKey(processInstanceId))
                .thenReturn(WorkflowCompletionGuard.MANTENIMIENTOS_DEFINITION_KEY);
        when(workflowEngineService.obtenerAccionesDisponibles(processInstanceId))
                .thenReturn(new WorkflowTaskActionsResponse("task-1", "Revisar", "revisarSolicitud",
                        processInstanceId, "ACTIVO", List.of(), List.of()));
        when(workflowEngineService.obtenerTareaActual(processInstanceId))
                .thenReturn(new WorkflowTaskResponse("task-1", "Revisar", "revisarSolicitud",
                        UUID.randomUUID().toString(), processInstanceId, null));

        assertThrows(ForbiddenException.class,
                () -> workflowServiceConGuardia().completarTarea(
                        processInstanceId, new CompleteWorkflowTaskRequest(Map.of()), true));

        verify(workflowEngineService, never()).completarTarea(anyString(), anyMap());
    }

    @Test
    void completarWorkflowDelModulo_tareaSinAssignee_debeFallar409() {
        String processInstanceId = UUID.randomUUID().toString();
        autenticarParaGuardia("SOLICITANTE");
        when(workflowEngineService.obtenerDefinitionKey(processInstanceId))
                .thenReturn(WorkflowCompletionGuard.MANTENIMIENTOS_DEFINITION_KEY);
        when(workflowEngineService.obtenerAccionesDisponibles(processInstanceId))
                .thenReturn(new WorkflowTaskActionsResponse("task-1", "Revisar", "revisarSolicitud",
                        processInstanceId, "ACTIVO", List.of(), List.of()));
        when(workflowEngineService.obtenerTareaActual(processInstanceId))
                .thenReturn(new WorkflowTaskResponse("task-1", "Revisar", "revisarSolicitud",
                        null, processInstanceId, null));

        ConflictException ex = assertThrows(ConflictException.class,
                () -> workflowServiceConGuardia().completarTarea(
                        processInstanceId, new CompleteWorkflowTaskRequest(Map.of()), true));

        assertEquals("TAREA_NO_ASIGNADA", ex.getCode());
        verify(workflowEngineService, never()).completarTarea(anyString(), anyMap());
    }

    @Test
    void completarWorkflow_aprobadorIgualActorEnBorrador_debeNegar403() {
        UUID solicitanteId = UUID.randomUUID();
        autenticar("SOLICITANTE", solicitanteId);
        SolicitudMantenimiento solicitud = solicitudBorrador(solicitanteId);
        when(repository.findById(solicitud.getId())).thenReturn(Optional.of(solicitud));
        when(workflowApplicationService.obtenerTareaActual(solicitud.getProcessInstanceId()))
                .thenReturn(new WorkflowTaskResponse("task-1", "Asignar aprobador", "borradorSolicitud",
                        solicitanteId.toString(), null, null));
        when(empleadoRepository.findById(solicitanteId))
                .thenReturn(Optional.of(Empleado.builder().id(solicitanteId).personaId(UUID.randomUUID()).build()));
        rolesDelAprobador("SUPERVISOR");

        assertThrows(ForbiddenException.class, () -> service.completarWorkflow(solicitud.getId(),
                new CompleteWorkflowTaskRequest(Map.of("aprobadorId", solicitanteId.toString()))));

        verify(workflowApplicationService, never()).completarTarea(
                eq(solicitud.getProcessInstanceId()), any(CompleteWorkflowTaskRequest.class), anyBoolean());
    }

    @Test
    void completarWorkflow_aprobadorConRolNoSupervisor_debeFallar422() {
        UUID solicitanteId = UUID.randomUUID();
        UUID aprobadorId = UUID.randomUUID();
        autenticar("SOLICITANTE", solicitanteId);
        SolicitudMantenimiento solicitud = solicitudBorrador(solicitanteId);
        when(repository.findById(solicitud.getId())).thenReturn(Optional.of(solicitud));
        when(workflowApplicationService.obtenerTareaActual(solicitud.getProcessInstanceId()))
                .thenReturn(new WorkflowTaskResponse("task-1", "Asignar aprobador", "borradorSolicitud",
                        solicitanteId.toString(), null, null));
        when(empleadoRepository.findById(aprobadorId))
                .thenReturn(Optional.of(Empleado.builder().id(aprobadorId).personaId(UUID.randomUUID()).build()));
        rolesDelAprobador("CONDUCTOR");

        BusinessException ex = assertThrows(BusinessException.class, () -> service.completarWorkflow(
                solicitud.getId(), new CompleteWorkflowTaskRequest(Map.of("aprobadorId", aprobadorId.toString()))));

        assertEquals("APROBADOR_ROL_INVALIDO", ex.getCode());
        verify(workflowApplicationService, never()).completarTarea(
                eq(solicitud.getProcessInstanceId()), any(CompleteWorkflowTaskRequest.class), anyBoolean());
    }

    @Test
    void completarWorkflow_aprobacionValidaPorSupervisor_debeCompletar() {
        UUID supervisorId = UUID.randomUUID();
        UUID solicitanteId = UUID.randomUUID();
        autenticar("SUPERVISOR", supervisorId);
        SolicitudMantenimiento solicitud = solicitudBorrador(solicitanteId);
        solicitud.setAprobador(Empleado.builder().id(supervisorId).personaId(UUID.randomUUID()).build());
        when(repository.findById(solicitud.getId())).thenReturn(Optional.of(solicitud));
        when(workflowApplicationService.obtenerTareaActual(solicitud.getProcessInstanceId()))
                .thenReturn(new WorkflowTaskResponse("task-1", "Revisar", "revisarSolicitud",
                        supervisorId.toString(), null, null));
        when(empleadoRepository.findById(supervisorId))
                .thenReturn(Optional.of(solicitud.getAprobador()));
        rolesDelAprobador("SUPERVISOR");
        when(workflowApplicationService.completarTarea(
                eq(solicitud.getProcessInstanceId()), any(CompleteWorkflowTaskRequest.class), eq(true)))
                .thenReturn(new WorkflowTaskActionsResponse("task-1", "Revisar", "revisarSolicitud",
                        solicitud.getProcessInstanceId(), "ASIGNADO", List.of(), List.of()));
        when(repository.save(solicitud)).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toResponse(solicitud)).thenReturn(null);

        service.completarWorkflow(solicitud.getId(), new CompleteWorkflowTaskRequest(
                Map.of("decisionCoordinador", "APROBAR")));

        org.mockito.ArgumentCaptor<CompleteWorkflowTaskRequest> captor =
                org.mockito.ArgumentCaptor.forClass(CompleteWorkflowTaskRequest.class);
        verify(workflowApplicationService).completarTarea(
                eq(solicitud.getProcessInstanceId()), captor.capture(), eq(true));
        assertEquals(supervisorId.toString(), captor.getValue().variables().get("aprobadorId"));
        assertEquals("APROBAR", captor.getValue().variables().get("decisionCoordinador"));
    }

    @Test
    void completarWorkflowGenerico_procesoGestionVehicular_noAplicaGuardiaDeMantenimientos() {
        String processInstanceId = UUID.randomUUID().toString();
        when(workflowEngineService.obtenerDefinitionKey(processInstanceId))
                .thenReturn("procesoSalidaVehicular");
        when(workflowEngineService.obtenerAccionesDisponibles(processInstanceId))
                .thenReturn(new WorkflowTaskActionsResponse("task-1", "Validar salida", "validarSalida",
                        processInstanceId, "ACTIVO", List.of(), List.of()));

        workflowServiceConGuardia().completarTarea(
                processInstanceId, new CompleteWorkflowTaskRequest(Map.of("action", "APROBAR")), false);

        verify(workflowEngineService).completarTarea("task-1", Map.of("action", "APROBAR"));
    }
}
