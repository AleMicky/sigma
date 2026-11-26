package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.application.service.ActivoService;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.request.SolicitudVehicularUpdate;
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
import com.endecorani.sigma_api.shared.domain.exception.ForbiddenException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

/** REQ-VEH-003: alcance de las operaciones por ID de solicitudes vehiculares. */
@ExtendWith(MockitoExtension.class)
class SolicitudVehicularServiceAlcanceTest {

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

    @InjectMocks
    private SolicitudVehicularService service;

    private final UUID solicitudId = UUID.randomUUID();
    private final UUID usuarioActualId = UUID.randomUUID();
    private final UUID empleadoActualId = UUID.randomUUID();

    @BeforeEach
    void configurarUsuarioActual() {
        lenient().when(securityUtils.getCurrentUserId()).thenReturn(Optional.of(usuarioActualId));
        lenient().when(usuarioRepository.findById(usuarioActualId))
                .thenReturn(Optional.of(Usuario.builder().id(usuarioActualId).personaId(UUID.randomUUID()).build()));
        lenient().when(empleadoRepository.findFirstByPersonaId(org.mockito.ArgumentMatchers.any()))
                .thenReturn(Optional.of(Empleado.builder().id(empleadoActualId).build()));
    }

    @Test
    void findById_solicitudAjena_debeLanzarForbidden() {
        when(repository.findById(solicitudId)).thenReturn(Optional.of(solicitudAjena()));

        assertThrows(ForbiddenException.class, () -> service.findById(solicitudId));
    }

    @Test
    void findById_solicitudDelEmpleadoActual_debePermitir() {
        SolicitudVehicular propia = solicitudAjena();
        propia.setSolicitanteId(empleadoActualId);
        when(repository.findById(solicitudId)).thenReturn(Optional.of(propia));

        assertDoesNotThrow(() -> service.findById(solicitudId));
    }

    @Test
    void update_solicitudAjena_debeLanzarForbidden() {
        when(repository.findById(solicitudId)).thenReturn(Optional.of(solicitudAjena()));

        assertThrows(ForbiddenException.class,
                () -> service.update(solicitudId, (SolicitudVehicularUpdate) null));
    }

    @Test
    void delete_solicitudAjena_debeLanzarForbidden() {
        when(repository.findById(solicitudId)).thenReturn(Optional.of(solicitudAjena()));

        assertThrows(ForbiddenException.class, () -> service.delete(solicitudId));
    }

    @Test
    void findById_sinEmpleadoResuelto_fallaCerrado() {
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.empty());
        when(repository.findById(solicitudId)).thenReturn(Optional.of(solicitudAjena()));

        assertThrows(ForbiddenException.class, () -> service.findById(solicitudId));
    }

    @Test
    void findById_admin_debePermitirAccesoATodasLasSolicitudes() {
        when(securityUtils.isAdmin()).thenReturn(true);
        when(repository.findById(solicitudId)).thenReturn(Optional.of(solicitudAjena()));

        assertDoesNotThrow(() -> service.findById(solicitudId));
    }

    private SolicitudVehicular solicitudAjena() {
        return SolicitudVehicular.builder()
                .id(solicitudId)
                .solicitanteId(UUID.randomUUID())
                .createdById(UUID.randomUUID())
                .estado("BORRADOR")
                .build();
    }
}
