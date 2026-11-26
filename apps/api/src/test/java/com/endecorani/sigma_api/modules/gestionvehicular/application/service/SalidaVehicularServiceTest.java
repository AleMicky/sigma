package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.request.ActualizarSalidaVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.request.CancelarSalidaVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.request.EjecutarAccionSalidaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.request.RegistrarBitacoraRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.request.RegistrarSalidaVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.response.SalidaVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SalidaVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.BitacoraVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularEventoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.parametros.domain.constant.CorrelativoCodigo;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowApplicationService;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowEntitySupport;
import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.exception.FlowableIntegrationException;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ForbiddenException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;

import java.nio.charset.StandardCharsets;
import java.time.Instant;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SalidaVehicularServiceTest {

    @Mock
    private SalidaVehicularRepository salidaRepository;
    @Mock
    private SalidaVehicularEventoRepository eventoRepository;
    @Mock
    private BitacoraVehicularRepository bitacoraRepository;
    @Mock
    private WorkflowApplicationService workflowApplicationService;
    @Mock
    private WorkflowEntitySupport workflowEntitySupport;
    @Mock
    private CorrelativoService correlativoService;
    @Mock
    private SpringActivoRepository activoRepository;
    @Mock
    private SpringActivoAtributoRepository activoAtributoRepository;
    @Mock
    private SpringActivoAtributoValorRepository activoAtributoValorRepository;
    @Mock
    private SpringVEmpleadoRepository vempleadoRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private EmpleadoRepository empleadoRepository;
    @Mock
    private SecurityUtils securityUtils;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private SalidaVehicularService service;

    @Test
    void listar_cuandoEsAdmin_debeVerTodoSinForzarCreatedById() {
        when(securityUtils.isAdmin()).thenReturn(true);
        Page<SalidaVehicular> emptyPage = new PageImpl<>(Collections.emptyList());
        when(salidaRepository.searchWithFilters(
                isNull(), isNull(), isNull(), isNull(), isNull(), eq(false), isNull(), isNull(), isNull(), any(Pageable.class)
        )).thenReturn(emptyPage);

        PageResponse<SalidaVehicularResponse> response = service.listar(
                null, null, null, null, null, null, null, null, new PageRequestDto()
        );

        assertNotNull(response);
        verify(salidaRepository).searchWithFilters(
                isNull(), isNull(), isNull(), isNull(), isNull(), eq(false), isNull(), isNull(), isNull(), any(Pageable.class)
        );
    }

    @Test
    void listar_cuandoNoEsAdmin_debeFiltrarEstrictamentePorCreatedByIdDelUsuarioActual() {
        UUID currentUserId = UUID.randomUUID();
        UUID otroUserId = UUID.randomUUID();
        when(securityUtils.isAdmin()).thenReturn(false);
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.of(currentUserId));

        Page<SalidaVehicular> emptyPage = new PageImpl<>(Collections.emptyList());
        when(salidaRepository.searchWithFilters(
                isNull(), isNull(), isNull(), isNull(), eq(currentUserId), eq(false), isNull(), isNull(), isNull(), any(Pageable.class)
        )).thenReturn(emptyPage);

        PageResponse<SalidaVehicularResponse> response = service.listar(
                null, null, null, null, otroUserId, null, null, null, new PageRequestDto()
        );

        assertNotNull(response);
        verify(salidaRepository).searchWithFilters(
                isNull(), isNull(), isNull(), isNull(), eq(currentUserId), eq(false), isNull(), isNull(), isNull(), any(Pageable.class)
        );
    }

    @Test
    void listar_cuandoNoEsAdminYSinUsuarioActual_debeRetornarVacioSinConsultarRepositorio() {
        when(securityUtils.isAdmin()).thenReturn(false);
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.empty());

        PageResponse<SalidaVehicularResponse> response = service.listar(
                null, null, null, null, null, null, null, null, new PageRequestDto()
        );

        assertNotNull(response);
        assertTrue(response.content().isEmpty());
        verifyNoInteractions(salidaRepository);
    }

    @Test
    void listarActivas_cuandoNoEsAdmin_debeFiltrarPorCreatedByIdSinArea() {
        UUID currentUserId = UUID.randomUUID();
        when(securityUtils.isAdmin()).thenReturn(false);
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.of(currentUserId));
        when(salidaRepository.findActivas(isNull(), eq(currentUserId))).thenReturn(List.of());

        List<SalidaVehicularResponse> response = service.listarActivas();

        assertTrue(response.isEmpty());
        verify(salidaRepository).findActivas(isNull(), eq(currentUserId));
    }

    @Test
    void operacionesPorId_cuandoSalidaPerteneceAOtroUsuario_debeLanzarForbiddenException() {
        UUID salidaId = UUID.randomUUID();
        UUID currentUserId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        UUID currentPersonaId = UUID.randomUUID();
        UUID currentEmpleadoId = UUID.randomUUID();
        UUID otherEmpleadoId = UUID.randomUUID();

        SalidaVehicular salidaAjena = SalidaVehicular.builder()
                .id(salidaId)
                .activoId(UUID.randomUUID())
                .empleadoId(otherEmpleadoId)
                .createdById(otherUserId)
                .estado("SALIDA")
                .processInstanceId("proc-1")
                .build();

        when(salidaRepository.findById(salidaId)).thenReturn(Optional.of(salidaAjena));
        when(securityUtils.isAdmin()).thenReturn(false);
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.of(currentUserId));
        when(usuarioRepository.findById(currentUserId))
                .thenReturn(Optional.of(Usuario.builder().id(currentUserId).personaId(currentPersonaId).build()));
        when(empleadoRepository.findFirstByPersonaId(currentPersonaId))
                .thenReturn(Optional.of(Empleado.builder().id(currentEmpleadoId).build()));

        assertThrows(ForbiddenException.class, () -> service.obtenerPorId(salidaId));
        assertThrows(ForbiddenException.class, () -> service.actualizar(
                salidaId, new ActualizarSalidaVehicularRequest(null, "Nuevo", null)));
        assertThrows(ForbiddenException.class, () -> service.cancelar(
                salidaId, new CancelarSalidaVehicularRequest("Motivo")));
        assertThrows(ForbiddenException.class, () -> service.ejecutarAccion(
                salidaId, "LLEGADA", new EjecutarAccionSalidaRequest(null, null, null, null, null)));
        assertThrows(ForbiddenException.class, () -> service.listarEventos(salidaId));
        assertThrows(ForbiddenException.class, () -> service.registrarBitacora(
                salidaId, new RegistrarBitacoraRequest("ACTIVIDAD", "Detalle", null, null, null)));
    }

    @Test
    void obtenerPorId_cuandoEsCreadorDeLaSalida_debePermitirAcceso() {
        UUID salidaId = UUID.randomUUID();
        UUID currentUserId = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();
        UUID empleadoId = UUID.randomUUID();

        SalidaVehicular salidaPropia = SalidaVehicular.builder()
                .id(salidaId)
                .numero("SV-2026-0001")
                .activoId(activoId)
                .empleadoId(empleadoId)
                .createdById(currentUserId)
                .descripcionActividad("Inspección")
                .estado("SALIDA")
                .build();

        when(salidaRepository.findById(salidaId)).thenReturn(Optional.of(salidaPropia));
        when(securityUtils.isAdmin()).thenReturn(false);
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.of(currentUserId));
        when(activoRepository.findById(activoId)).thenReturn(Optional.empty());
        when(activoAtributoValorRepository.findByActivoIdIn(any())).thenReturn(List.of());
        when(vempleadoRepository.findById(empleadoId)).thenReturn(Optional.empty());
        when(eventoRepository.findBySalidaVehicularId(salidaId)).thenReturn(List.of());
        when(bitacoraRepository.findBySalidaVehicularId(salidaId)).thenReturn(List.of());

        SalidaVehicularResponse response = service.obtenerPorId(salidaId);

        assertEquals(salidaId, response.id());
        assertEquals("SV-2026-0001", response.numero());
    }

    @Test
    void registrar_cuandoEmpleadoIdNoExiste_debeLanzarResourceNotFoundException() {
        UUID activoId = UUID.randomUUID();
        UUID empleadoInexistenteId = UUID.randomUUID();
        when(activoRepository.existsById(activoId)).thenReturn(true);
        when(empleadoRepository.existsById(empleadoInexistenteId)).thenReturn(false);

        RegistrarSalidaVehicularRequest request = new RegistrarSalidaVehicularRequest(
                activoId,
                empleadoInexistenteId,
                Instant.now(),
                "Inspección técnica",
                null
        );

        assertThrows(ResourceNotFoundException.class, () -> service.registrar(request));
        verifyNoInteractions(correlativoService, salidaRepository, workflowApplicationService);
    }

    @Test
    void registrar_cuandoElVehiculoYaTieneSalidaActiva_debeLanzar409SinPersistirNiIniciarFlowable() {
        UUID activoId = UUID.randomUUID();
        UUID empleadoId = UUID.randomUUID();
        when(activoRepository.existsById(activoId)).thenReturn(true);
        when(empleadoRepository.existsById(empleadoId)).thenReturn(true);
        when(salidaRepository.findActivas()).thenReturn(List.of(SalidaVehicular.builder()
                .id(UUID.randomUUID())
                .activoId(activoId)
                .empleadoId(empleadoId)
                .estado("SALIDA")
                .build()));

        RegistrarSalidaVehicularRequest request = new RegistrarSalidaVehicularRequest(
                activoId,
                empleadoId,
                Instant.now(),
                "Segunda salida del mismo vehículo",
                null
        );

        ConflictException ex = assertThrows(ConflictException.class, () -> service.registrar(request));
        assertEquals("SALIDA_VEHICULAR_ACTIVA_DUPLICADA", ex.getCode());
        verify(salidaRepository, never()).save(any(SalidaVehicular.class));
        verifyNoInteractions(correlativoService, workflowApplicationService);
    }

    @Test
    void registrar_cuandoFallaFlowableAlIniciar_debeLanzarBusinessException() {
        UUID activoId = UUID.randomUUID();
        UUID empleadoId = UUID.randomUUID();
        UUID salidaId = UUID.randomUUID();

        when(activoRepository.existsById(activoId)).thenReturn(true);
        when(empleadoRepository.existsById(empleadoId)).thenReturn(true);
        when(correlativoService.generar(eq(CorrelativoCodigo.SALIDA_VEHICULAR), anyInt()))
                .thenReturn("SV-2026-0002");
        when(salidaRepository.save(any(SalidaVehicular.class))).thenAnswer(inv -> {
            SalidaVehicular s = inv.getArgument(0);
            if (s.getId() == null) {
                s.setId(salidaId);
            }
            return s;
        });
        when(workflowApplicationService.iniciar(eq("SALIDA_VEHICULAR"), eq(salidaId.toString()), anyMap()))
                .thenThrow(new FlowableIntegrationException("Flowable caído", new RuntimeException("503")));

        RegistrarSalidaVehicularRequest request = new RegistrarSalidaVehicularRequest(
                activoId,
                empleadoId,
                Instant.now(),
                "Traslado a planta",
                "Sin observaciones"
        );

        BusinessException ex = assertThrows(BusinessException.class, () -> service.registrar(request));
        assertEquals("WORKFLOW_START_ERROR", ex.getCode());
        verify(salidaRepository, times(1)).save(any(SalidaVehicular.class));
    }

    @Test
    void cancelar_cuandoFallaFlowableConErrorServidor_debeLanzarBusinessExceptionYNoCancelarEnBd() {
        UUID salidaId = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();
        UUID empleadoId = UUID.randomUUID();
        SalidaVehicular salida = SalidaVehicular.builder()
                .id(salidaId)
                .activoId(activoId)
                .empleadoId(empleadoId)
                .estado("SALIDA")
                .processInstanceId("proc-99")
                .build();

        when(salidaRepository.findById(salidaId)).thenReturn(Optional.of(salida));
        when(securityUtils.isAdmin()).thenReturn(true);
        doThrow(new FlowableIntegrationException("Error interno Flowable", new RuntimeException("500")))
                .when(workflowApplicationService).cancelarProceso(eq("proc-99"), anyString());

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.cancelar(salidaId, new CancelarSalidaVehicularRequest("Cancelación operativa")));

        assertEquals("WORKFLOW_CANCEL_ERROR", ex.getCode());
        verify(salidaRepository, never()).save(any());
        verify(eventoRepository, never()).save(any());
    }

    @Test
    void cancelar_cuandoProcesoFlowableRetorna404_debeTolerarYCancelarEnBd() {
        UUID salidaId = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();
        UUID empleadoId = UUID.randomUUID();
        SalidaVehicular salida = SalidaVehicular.builder()
                .id(salidaId)
                .numero("SV-2026-0003")
                .activoId(activoId)
                .empleadoId(empleadoId)
                .estado("SALIDA")
                .processInstanceId("proc-finished")
                .build();

        when(salidaRepository.findById(salidaId)).thenReturn(Optional.of(salida));
        when(securityUtils.isAdmin()).thenReturn(true);
        HttpClientErrorException notFound = HttpClientErrorException.create(
                HttpStatus.NOT_FOUND, "Not Found", HttpHeaders.EMPTY, new byte[0], StandardCharsets.UTF_8);
        doThrow(new FlowableIntegrationException("No existe instancia", notFound))
                .when(workflowApplicationService).cancelarProceso(eq("proc-finished"), anyString());
        when(salidaRepository.save(any(SalidaVehicular.class))).thenAnswer(inv -> inv.getArgument(0));
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.empty());
        when(activoRepository.findById(activoId)).thenReturn(Optional.empty());
        when(activoAtributoValorRepository.findByActivoIdIn(any())).thenReturn(List.of());
        when(vempleadoRepository.findById(empleadoId)).thenReturn(Optional.empty());
        when(eventoRepository.findBySalidaVehicularId(salidaId)).thenReturn(List.of());
        when(bitacoraRepository.findBySalidaVehicularId(salidaId)).thenReturn(List.of());

        SalidaVehicularResponse response = service.cancelar(salidaId, new CancelarSalidaVehicularRequest("Ya finalizó"));

        assertEquals("CANCELADA", response.estado());
        verify(salidaRepository).save(argThat(s -> "CANCELADA".equals(s.getEstado())));
        verify(eventoRepository).save(any());
    }

    @Test
    void cancelar_cuandoProcesoFlowableLanzaResourceNotFound_debeTolerarYCancelarEnBd() {
        UUID salidaId = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();
        UUID empleadoId = UUID.randomUUID();
        SalidaVehicular salida = SalidaVehicular.builder()
                .id(salidaId)
                .numero("SV-2026-0004")
                .activoId(activoId)
                .empleadoId(empleadoId)
                .estado("SALIDA")
                .processInstanceId("proc-missing")
                .build();

        when(salidaRepository.findById(salidaId)).thenReturn(Optional.of(salida));
        when(securityUtils.isAdmin()).thenReturn(true);
        doThrow(new ResourceNotFoundException("ProcessInstance", "proc-missing"))
                .when(workflowApplicationService).cancelarProceso(eq("proc-missing"), anyString());
        when(salidaRepository.save(any(SalidaVehicular.class))).thenAnswer(inv -> inv.getArgument(0));
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.empty());
        when(activoRepository.findById(activoId)).thenReturn(Optional.empty());
        when(activoAtributoValorRepository.findByActivoIdIn(any())).thenReturn(List.of());
        when(vempleadoRepository.findById(empleadoId)).thenReturn(Optional.empty());
        when(eventoRepository.findBySalidaVehicularId(salidaId)).thenReturn(List.of());
        when(bitacoraRepository.findBySalidaVehicularId(salidaId)).thenReturn(List.of());

        SalidaVehicularResponse response = service.cancelar(salidaId, new CancelarSalidaVehicularRequest("Sin proceso"));

        assertEquals("CANCELADA", response.estado());
        verify(salidaRepository).save(argThat(s -> "CANCELADA".equals(s.getEstado())));
        verify(eventoRepository).save(any());
    }
}
