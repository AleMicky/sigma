package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.application.service.ActivoService;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoResumenResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.SolicitudMantenimientoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.criteria.SolicitudMantenimientoSearchCriteria;
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
import com.endecorani.sigma_api.shared.infrastructure.report.JasperReportService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.simple.JdbcClient;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SolicitudMantenimientoServiceSecurityTest {

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
}
