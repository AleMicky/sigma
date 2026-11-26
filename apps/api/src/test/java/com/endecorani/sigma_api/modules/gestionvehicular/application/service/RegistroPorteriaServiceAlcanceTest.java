package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.RegistrarSalidaPorteriaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.response.RegistroPorteriaResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.RegistroPorteria;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.RegistroPorteriaRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.parametros.domain.constant.CorrelativoCodigo;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository.SpringUbicacionRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.shared.domain.exception.ForbiddenException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.infrastructure.report.JasperReportService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/** REQ-VEH-003: validación de guardia y de alcance al registrar movimientos de portería. */
@ExtendWith(MockitoExtension.class)
class RegistroPorteriaServiceAlcanceTest {

    @Mock private RegistroPorteriaRepository repository;
    @Mock private SalidaVehicularRepository salidaVehicularRepository;
    @Mock private SpringActivoRepository activoRepository;
    @Mock private SpringActivoAtributoRepository activoAtributoRepository;
    @Mock private SpringActivoAtributoValorRepository activoAtributoValorRepository;
    @Mock private SpringVEmpleadoRepository vempleadoRepository;
    @Mock private EmpleadoRepository empleadoRepository;
    @Mock private SpringUbicacionRepository ubicacionRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private CorrelativoService correlativoService;
    @Mock private SecurityUtils securityUtils;
    @Mock private JasperReportService jasperReportService;

    @InjectMocks
    private RegistroPorteriaService service;

    @Test
    void registrarSalida_sinGuardiaResuelto_debeLanzarForbidden() {
        RegistrarSalidaPorteriaRequest request = externo();

        assertThrows(ForbiddenException.class, () -> service.registrarSalida(request));
    }

    @Test
    void registrarSalida_salidaVehicularInexistente_debeLanzar404() {
        UUID salidaId = UUID.randomUUID();
        UUID empleadoId = UUID.randomUUID();
        when(vempleadoRepository.existsById(empleadoId)).thenReturn(true);
        when(salidaVehicularRepository.findById(salidaId)).thenReturn(Optional.empty());

        RegistrarSalidaPorteriaRequest request = new RegistrarSalidaPorteriaRequest(
                null, empleadoId, false, null, null, null, null, null,
                Instant.now(), salidaId, null, List.of());

        assertThrows(ResourceNotFoundException.class, () -> service.registrarSalida(request));
    }

    @Test
    void registrarSalida_conGuardiaResuelto_debePersistirElGuardiaActual() {
        UUID userId = UUID.randomUUID();
        UUID personaId = UUID.randomUUID();
        UUID guardiaEmpleadoId = UUID.randomUUID();
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.of(userId));
        when(usuarioRepository.findById(userId))
                .thenReturn(Optional.of(Usuario.builder().id(userId).personaId(personaId).build()));
        when(empleadoRepository.findFirstByPersonaId(personaId))
                .thenReturn(Optional.of(Empleado.builder().id(guardiaEmpleadoId).build()));
        when(correlativoService.generar(eq(CorrelativoCodigo.REGISTRO_PORTERIA), any(Integer.class)))
                .thenReturn("PRT-2026-0100");
        when(repository.save(any(RegistroPorteria.class))).thenAnswer(inv -> inv.getArgument(0));

        RegistroPorteriaResponse response = service.registrarSalida(externo());

        ArgumentCaptor<RegistroPorteria> captor = ArgumentCaptor.forClass(RegistroPorteria.class);
        org.mockito.Mockito.verify(repository).save(captor.capture());
        assertEquals(guardiaEmpleadoId, captor.getValue().getGuardiaSalidaId());
        assertEquals("PRT-2026-0100", response.numero());
    }

    private RegistrarSalidaPorteriaRequest externo() {
        return new RegistrarSalidaPorteriaRequest(
                null, null, true, "Persona Externa", "ABC-123", null, null, null,
                Instant.now(), null, "Observación", List.of());
    }
}
