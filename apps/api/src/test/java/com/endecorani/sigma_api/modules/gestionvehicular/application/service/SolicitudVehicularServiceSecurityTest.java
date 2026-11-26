package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.application.service.ActivoService;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response.SolicitudVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.SolicitudVehicularMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SolicitudVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.AsignacionVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ConductorRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SolicitudVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.TipoSolicitudVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ViajeVehicularRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowApplicationService;
import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.FlowableClient;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SolicitudVehicularServiceSecurityTest {

    @Mock
    private SolicitudVehicularRepository repository;
    @Mock
    private TipoSolicitudVehicularRepository tipoSolicitudVehicularRepository;
    @Mock
    private EmpleadoRepository empleadoRepository;
    @Mock
    private SpringVEmpleadoRepository springVEmpleadoRepository;
    @Mock
    private ConductorRepository conductorRepository;
    @Mock
    private AsignacionVehicularRepository asignacionVehicularRepository;
    @Mock
    private ViajeVehicularRepository viajeVehicularRepository;
    @Mock
    private SolicitudVehicularAdjuntoService adjuntoService;
    @Mock
    private SolicitudVehicularMapper mapper;
    @Mock
    private CorrelativoService correlativoService;
    @Mock
    private WorkflowApplicationService workflowApplicationService;
    @Mock
    private FlowableClient flowableClient;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private SecurityUtils securityUtils;
    @Mock
    private ActivoService activoService;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private SolicitudVehicularService service;

    @Test
    void listar_nonAdminSinInterfazConEmpleadoVinculado_debeRestringirASusPropiasSolicitudes() {
        UUID userId = UUID.randomUUID();
        UUID personaId = UUID.randomUUID();
        UUID empleadoId = UUID.randomUUID();
        UUID solicitanteAjeno = UUID.randomUUID();

        when(securityUtils.isAdmin()).thenReturn(false);
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.of(userId));
        when(usuarioRepository.findById(userId))
                .thenReturn(Optional.of(Usuario.builder().id(userId).personaId(personaId).build()));
        when(empleadoRepository.findFirstByPersonaId(personaId))
                .thenReturn(Optional.of(Empleado.builder().id(empleadoId).build()));

        Page<SolicitudVehicular> emptyPage = new PageImpl<>(Collections.emptyList());
        when(repository.searchWithFilters(
                isNull(), isNull(), isNull(), eq(empleadoId), isNull(), isNull(), any(Pageable.class)
        )).thenReturn(emptyPage);

        PageResponse<SolicitudVehicularResponse> response = service.listar(
                null, null, null, solicitanteAjeno, null, null, null, new PageRequestDto()
        );

        assertTrue(response.content().isEmpty());
        verify(repository).searchWithFilters(
                isNull(), isNull(), isNull(), eq(empleadoId), isNull(), isNull(), any(Pageable.class)
        );
        verify(repository, never()).findAll(any(Pageable.class));
    }

    @Test
    void listar_nonAdminSinInterfazYSinEmpleadoVinculado_debeRetornarVacioFailClosed() {
        when(securityUtils.isAdmin()).thenReturn(false);
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.empty());

        PageResponse<SolicitudVehicularResponse> response = service.listar(
                null, null, null, null, null, null, null, new PageRequestDto()
        );

        assertTrue(response.content().isEmpty());
        assertEquals(0L, response.totalElements());
        verifyNoInteractions(repository);
    }

    @Test
    void listar_nonAdminConInterfazDesconocida_debeRetornarVacioFailClosed() {
        when(securityUtils.isAdmin()).thenReturn(false);

        PageResponse<SolicitudVehicularResponse> response = service.listar(
                null, null, null, null, null, null, "InterfazDesconocida", new PageRequestDto()
        );

        assertTrue(response.content().isEmpty());
        assertEquals(0L, response.totalElements());
        verifyNoInteractions(repository);
    }

    @Test
    void listar_adminSinInterfaz_debePoderConsultarTodoSinRestriccionForzada() {
        when(securityUtils.isAdmin()).thenReturn(true);
        Page<SolicitudVehicular> emptyPage = new PageImpl<>(Collections.emptyList());
        when(repository.findAll(any(Pageable.class))).thenReturn(emptyPage);

        PageResponse<SolicitudVehicularResponse> response = service.listar(
                null, null, null, null, null, null, null, new PageRequestDto()
        );

        assertNotNull(response);
        verify(repository).findAll(any(Pageable.class));
    }
}
