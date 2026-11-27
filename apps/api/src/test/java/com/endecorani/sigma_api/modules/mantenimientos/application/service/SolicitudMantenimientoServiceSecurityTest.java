package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.application.service.ActivoService;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.SolicitudMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoResumenResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.SolicitudMantenimientoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.criteria.SolicitudMantenimientoSearchCriteria;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimientoAdjunto;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ProgramacionMantenimientoHistorialRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoTrazabilidadRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowApplicationService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.storage.DocumentStorageService;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ForbiddenException;
import com.endecorani.sigma_api.shared.infrastructure.report.JasperReportService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SolicitudMantenimientoServiceSecurityTest {

    @Mock
    private SolicitudMantenimientoRepository repository;
    @Mock
    private SolicitudMantenimientoTrazabilidadRepository trazabilidadRepository;
    @Mock
    private OrdenTrabajoRepository ordenTrabajoRepository;
    @Mock
    private ProgramacionMantenimientoHistorialRepository programacionHistorialRepository;
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
    @Mock
    private JdbcClient jdbcClient;

    @InjectMocks
    private SolicitudMantenimientoService service;

    @Test
    void findAll_nonAdminSinEmpleadoVinculado_debeRetornarVacioFailClosedSinConsultarRepositorio() {
        when(securityUtils.isAdmin()).thenReturn(false);
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.empty());

        PageResponse<SolicitudMantenimientoResponse> response = service.findAll(
                null, null, "SolicitudesPage", new PageRequestDto()
        );

        assertTrue(response.content().isEmpty());
        assertEquals(0L, response.totalElements());
        verifyNoInteractions(repository);
    }

    @Test
    void obtenerResumen_nonAdminSinEmpleadoVinculado_debeRetornarCerosSinConsultarRepositorio() {
        when(securityUtils.isAdmin()).thenReturn(false);
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.empty());

        SolicitudMantenimientoResumenResponse resumen = service.obtenerResumen("AprobacionesPage");

        assertEquals(0L, resumen.total());
        assertEquals(0L, resumen.porAprobar());
        verifyNoInteractions(repository);
    }

    @Test
    void findAll_nonAdminConEmpleadoVinculado_debeFiltrarPorEmpleadoActual() {
        UUID userId = UUID.randomUUID();
        UUID personaId = UUID.randomUUID();
        UUID empleadoId = UUID.randomUUID();

        when(securityUtils.isAdmin()).thenReturn(false);
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.of(userId));
        when(usuarioRepository.findById(userId))
                .thenReturn(Optional.of(Usuario.builder().id(userId).personaId(personaId).build()));
        when(empleadoRepository.findFirstByPersonaId(personaId))
                .thenReturn(Optional.of(Empleado.builder().id(empleadoId).build()));
        when(repository.findAll(any(SolicitudMantenimientoSearchCriteria.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        service.findAll(null, null, "AprobacionesPage", new PageRequestDto());

        ArgumentCaptor<SolicitudMantenimientoSearchCriteria> captor =
                ArgumentCaptor.forClass(SolicitudMantenimientoSearchCriteria.class);
        verify(repository).findAll(captor.capture(), any(Pageable.class));
        assertEquals(empleadoId, captor.getValue().aprobadorId());
        assertNull(captor.getValue().solicitanteId());
    }

    @AfterEach
    void limpiarSeguridad() {
        SecurityContextHolder.clearContext();
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.clearSynchronization();
        }
        TransactionSynchronizationManager.setActualTransactionActive(false);
    }

    private void autenticar(String... roles) {
        var authorities = Arrays.stream(roles)
                .map(rol -> new SimpleGrantedAuthority("ROLE_" + rol))
                .toList();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("usuario-tests", "n/a", authorities));
    }

    private void vincularEmpleadoActual(UUID empleadoId) {
        UUID userId = UUID.randomUUID();
        UUID personaId = UUID.randomUUID();
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.of(userId));
        when(usuarioRepository.findById(userId))
                .thenReturn(Optional.of(Usuario.builder().id(userId).personaId(personaId).build()));
        when(empleadoRepository.findFirstByPersonaId(personaId))
                .thenReturn(Optional.of(Empleado.builder().id(empleadoId).areaId(UUID.randomUUID()).build()));
    }

    private SolicitudMantenimiento solicitudDe(UUID solicitanteId) {
        return SolicitudMantenimiento.builder()
                .id(UUID.randomUUID())
                .estado("BORRADOR")
                .solicitante(Empleado.builder().id(solicitanteId).build())
                .build();
    }

    @Test
    void findById_solicitanteAccedeSolicitudAjena_debeNegar403() {
        autenticar("SOLICITANTE");
        UUID empleadoActual = UUID.randomUUID();
        UUID otroSolicitante = UUID.randomUUID();
        UUID solicitudId = UUID.randomUUID();
        when(securityUtils.isAdmin()).thenReturn(false);
        vincularEmpleadoActual(empleadoActual);
        when(repository.findById(solicitudId)).thenReturn(Optional.of(solicitudDe(otroSolicitante)));
        when(empleadoRepository.findById(empleadoActual))
                .thenReturn(Optional.of(Empleado.builder().id(empleadoActual).areaId(UUID.randomUUID()).build()));
        when(empleadoRepository.findById(otroSolicitante))
                .thenReturn(Optional.of(Empleado.builder().id(otroSolicitante).areaId(UUID.randomUUID()).build()));

        assertThrows(ForbiddenException.class, () -> service.findById(solicitudId));

        verifyNoInteractions(mapper);
    }

    @Test
    void findById_solicitanteAccedeSolicitudPropia_debePermitir() {
        autenticar("SOLICITANTE");
        UUID empleadoActual = UUID.randomUUID();
        UUID solicitudId = UUID.randomUUID();
        SolicitudMantenimiento solicitud = solicitudDe(empleadoActual);
        when(securityUtils.isAdmin()).thenReturn(false);
        vincularEmpleadoActual(empleadoActual);
        when(repository.findById(solicitudId)).thenReturn(Optional.of(solicitud));
        when(mapper.toResponse(solicitud)).thenReturn(null);

        assertDoesNotThrow(() -> service.findById(solicitudId));

        verify(mapper).toResponse(solicitud);
    }

    @Test
    void findById_supervisorPuedeLeerSolicitudAjena() {
        autenticar("SUPERVISOR");
        UUID solicitudId = UUID.randomUUID();
        SolicitudMantenimiento solicitud = solicitudDe(UUID.randomUUID());
        when(securityUtils.isAdmin()).thenReturn(false);
        when(repository.findById(solicitudId)).thenReturn(Optional.of(solicitud));
        when(mapper.toResponse(solicitud)).thenReturn(null);

        assertDoesNotThrow(() -> service.findById(solicitudId));

        verify(mapper).toResponse(solicitud);
    }

    @Test
    void delete_solicitanteIntentaBorrarSolicitudAjena_debeNegar403SinBorrar() {
        autenticar("SOLICITANTE");
        UUID empleadoActual = UUID.randomUUID();
        UUID otroSolicitante = UUID.randomUUID();
        UUID solicitudId = UUID.randomUUID();
        when(securityUtils.isAdmin()).thenReturn(false);
        vincularEmpleadoActual(empleadoActual);
        when(repository.findById(solicitudId)).thenReturn(Optional.of(solicitudDe(otroSolicitante)));
        when(empleadoRepository.findById(empleadoActual))
                .thenReturn(Optional.of(Empleado.builder().id(empleadoActual).areaId(UUID.randomUUID()).build()));
        when(empleadoRepository.findById(otroSolicitante))
                .thenReturn(Optional.of(Empleado.builder().id(otroSolicitante).areaId(UUID.randomUUID()).build()));

        assertThrows(ForbiddenException.class, () -> service.delete(solicitudId));

        verify(repository, never()).deleteById(solicitudId);
    }

    @Test
    void create_solicitanteDeclaraOtroSolicitante_debeNegar403SinGuardar() {
        autenticar("SOLICITANTE");
        UUID empleadoActual = UUID.randomUUID();
        when(securityUtils.isAdmin()).thenReturn(false);
        vincularEmpleadoActual(empleadoActual);
        SolicitudMantenimientoRequest request = new SolicitudMantenimientoRequest(
                UUID.randomUUID(), UUID.randomUUID(), null, UUID.randomUUID(), UUID.randomUUID(),
                "Título", "Descripción", null);

        assertThrows(ForbiddenException.class, () -> service.create(request));

        verifyNoInteractions(repository);
    }

    @Test
    void update_solicitanteIntentaReasignarSolicitudAjena_debeNegar403() {
        autenticar("SOLICITANTE");
        UUID empleadoActual = UUID.randomUUID();
        UUID solicitudId = UUID.randomUUID();
        when(securityUtils.isAdmin()).thenReturn(false);
        vincularEmpleadoActual(empleadoActual);
        when(repository.findById(solicitudId)).thenReturn(Optional.of(solicitudDe(empleadoActual)));
        SolicitudMantenimientoRequest request = new SolicitudMantenimientoRequest(
                UUID.randomUUID(), UUID.randomUUID(), null, UUID.randomUUID(), UUID.randomUUID(),
                "Título", "Descripción", null);

        assertThrows(ForbiddenException.class, () -> service.update(solicitudId, request));

        verify(repository, never()).save(any(SolicitudMantenimiento.class));
    }

    private SolicitudMantenimiento solicitudConArchivo(String url) {
        return SolicitudMantenimiento.builder()
                .id(UUID.randomUUID())
                .numero("SM-0002")
                .estado("BORRADOR")
                .adjuntos(new java.util.ArrayList<>(List.of(
                        SolicitudMantenimientoAdjunto.builder().url(url).build())))
                .build();
    }

    @Test
    void delete_conWorkflowActivo_debeFallar409SinBorrarNiLimpiarArchivos() {
        autenticar("ENCARGADO");
        SolicitudMantenimiento solicitud = solicitudConArchivo("solicitudes/sm-0002/archivo.pdf");
        solicitud.setProcessInstanceId("proc-123");
        when(repository.findById(solicitud.getId())).thenReturn(Optional.of(solicitud));

        ConflictException ex = assertThrows(ConflictException.class, () -> service.delete(solicitud.getId()));

        assertEquals("SOLICITUD_EN_USO", ex.getCode());
        verify(documentStorageService, never()).delete(anyString());
        verify(repository, never()).deleteById(solicitud.getId());
    }

    @Test
    void delete_conOrdenTrabajo_debeFallar409SinBorrar() {
        autenticar("ENCARGADO");
        SolicitudMantenimiento solicitud = solicitudConArchivo("solicitudes/sm-0002/archivo.pdf");
        when(repository.findById(solicitud.getId())).thenReturn(Optional.of(solicitud));
        when(ordenTrabajoRepository.existsBySolicitudMantenimientoId(solicitud.getId())).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () -> service.delete(solicitud.getId()));

        assertEquals("SOLICITUD_EN_USO", ex.getCode());
        verify(documentStorageService, never()).delete(anyString());
        verify(repository, never()).deleteById(solicitud.getId());
    }

    @Test
    void delete_esDisparadorDeProgramacion_debeFallar409SinBorrar() {
        autenticar("ENCARGADO");
        SolicitudMantenimiento solicitud = solicitudConArchivo("solicitudes/sm-0002/archivo.pdf");
        when(repository.findById(solicitud.getId())).thenReturn(Optional.of(solicitud));
        when(programacionHistorialRepository.existsBySolicitudMantenimientoId(solicitud.getId()))
                .thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () -> service.delete(solicitud.getId()));

        assertEquals("SOLICITUD_EN_USO", ex.getCode());
        verify(documentStorageService, never()).delete(anyString());
        verify(repository, never()).deleteById(solicitud.getId());
    }

    @Test
    void delete_sinUsosSinTransccionActiva_debeBorrarEnBDYDespuesLimpiarArchivos() {
        autenticar("ENCARGADO");
        String url = "solicitudes/sm-0002/archivo.pdf";
        SolicitudMantenimiento solicitud = solicitudConArchivo(url);
        when(repository.findById(solicitud.getId())).thenReturn(Optional.of(solicitud));
        when(trazabilidadRepository.findBySolicitudMantenimientoId(solicitud.getId()))
                .thenReturn(Collections.emptyList());

        service.delete(solicitud.getId());

        org.mockito.InOrder inOrden = inOrder(repository, documentStorageService);
        inOrden.verify(repository).deleteById(solicitud.getId());
        inOrden.verify(documentStorageService).delete(url);
    }

    @Test
    void delete_conTransaccionActiva_noDebeLimpiarArchivosHastaAfterCommit() {
        autenticar("ENCARGADO");
        String url = "solicitudes/sm-0002/archivo.pdf";
        SolicitudMantenimiento solicitud = solicitudConArchivo(url);
        when(repository.findById(solicitud.getId())).thenReturn(Optional.of(solicitud));
        when(trazabilidadRepository.findBySolicitudMantenimientoId(solicitud.getId()))
                .thenReturn(Collections.emptyList());
        TransactionSynchronizationManager.initSynchronization();
        TransactionSynchronizationManager.setActualTransactionActive(true);

        service.delete(solicitud.getId());

        verify(repository).deleteById(solicitud.getId());
        verify(documentStorageService, never()).delete(anyString());

        for (TransactionSynchronization sincronizacion :
                TransactionSynchronizationManager.getSynchronizations()) {
            sincronizacion.afterCommit();
        }

        verify(documentStorageService).delete(url);
    }

    @Test
    void delete_conTransaccionQueHaceRollback_noDebeTocarArchivos() {
        autenticar("ENCARGADO");
        String url = "solicitudes/sm-0002/archivo.pdf";
        SolicitudMantenimiento solicitud = solicitudConArchivo(url);
        when(repository.findById(solicitud.getId())).thenReturn(Optional.of(solicitud));
        when(trazabilidadRepository.findBySolicitudMantenimientoId(solicitud.getId()))
                .thenReturn(Collections.emptyList());
        doThrow(new DataIntegrityViolationException("violación de FK"))
                .when(repository).deleteById(solicitud.getId());
        TransactionSynchronizationManager.initSynchronization();
        TransactionSynchronizationManager.setActualTransactionActive(true);

        ConflictException ex = assertThrows(ConflictException.class, () -> service.delete(solicitud.getId()));

        assertEquals("SOLICITUD_EN_USO", ex.getCode());
        verify(documentStorageService, never()).delete(anyString());
    }

    @Test
    void delete_conViolacionDeIntegridad_debeTraducirA409SolitudEnUso() {
        autenticar("ENCARGADO");
        SolicitudMantenimiento solicitud = solicitudConArchivo("solicitudes/sm-0002/archivo.pdf");
        when(repository.findById(solicitud.getId())).thenReturn(Optional.of(solicitud));
        when(trazabilidadRepository.findBySolicitudMantenimientoId(solicitud.getId()))
                .thenReturn(Collections.emptyList());
        doThrow(new DataIntegrityViolationException("violación de FK"))
                .when(repository).deleteById(solicitud.getId());

        ConflictException ex = assertThrows(ConflictException.class, () -> service.delete(solicitud.getId()));

        assertEquals("SOLICITUD_EN_USO", ex.getCode());
        assertFalse(ex.getMessage().contains("DATA_INTEGRITY_VIOLATION"));
        verify(documentStorageService, never()).delete(anyString());
    }
}
