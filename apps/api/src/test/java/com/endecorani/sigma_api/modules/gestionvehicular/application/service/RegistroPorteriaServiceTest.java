package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.RegistrarLlegadaPorteriaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.RegistrarSalidaPorteriaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.RegistroPorteriaActivoLlegadaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.RegistroPorteriaActivoSalidaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.response.RegistroPorteriaResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoRegistroPorteria;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.RegistroPorteria;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.RegistroPorteriaActivo;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.RegistroPorteriaRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.parametros.domain.constant.CorrelativoCodigo;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository.SpringUbicacionRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RegistroPorteriaServiceTest {

    @Mock
    private RegistroPorteriaRepository repository;
    @Mock
    private SalidaVehicularRepository salidaVehicularRepository;
    @Mock
    private SpringActivoRepository activoRepository;
    @Mock
    private SpringVEmpleadoRepository vempleadoRepository;
    @Mock
    private EmpleadoRepository empleadoRepository;
    @Mock
    private SpringUbicacionRepository ubicacionRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private CorrelativoService correlativoService;
    @Mock
    private SecurityUtils securityUtils;

    @InjectMocks
    private RegistroPorteriaService service;

    @Test
    void registrarSalida_conActivoYLibre_debeGuardarEstadoAfuera() {
        UUID empleadoId = UUID.randomUUID();
        UUID guardiaUserId = UUID.randomUUID();
        UUID guardiaPersonaId = UUID.randomUUID();
        UUID guardiaEmpleadoId = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();

        when(vempleadoRepository.existsById(empleadoId)).thenReturn(true);

        ActivoEntity activo = new ActivoEntity();
        activo.setId(activoId);
        activo.setCodigo("LAP-001");
        activo.setNombre("Laptop Dell");
        when(activoRepository.findAllById(any())).thenReturn(List.of(activo));

        when(securityUtils.getCurrentUserId()).thenReturn(Optional.of(guardiaUserId));
        when(usuarioRepository.findById(guardiaUserId))
                .thenReturn(Optional.of(Usuario.builder().id(guardiaUserId).personaId(guardiaPersonaId).build()));
        when(empleadoRepository.findFirstByPersonaId(guardiaPersonaId))
                .thenReturn(Optional.of(Empleado.builder().id(guardiaEmpleadoId).build()));

        when(correlativoService.generar(eq(CorrelativoCodigo.REGISTRO_PORTERIA), any(Integer.class)))
                .thenReturn("PRT-2026-0001");

        when(repository.save(any(RegistroPorteria.class))).thenAnswer(inv -> {
            RegistroPorteria r = inv.getArgument(0);
            r.setId(UUID.randomUUID());
            r.getActivos().forEach(a -> a.setId(UUID.randomUUID()));
            return r;
        });

        VEmpleadoEntity emp = new VEmpleadoEntity();
        emp.setEmpleadoId(empleadoId);
        emp.setNombreCompleto("Juan Perez");
        VEmpleadoEntity guardia = new VEmpleadoEntity();
        guardia.setEmpleadoId(guardiaEmpleadoId);
        guardia.setNombreCompleto("Carlos Guardia");
        when(vempleadoRepository.findAllById(any())).thenReturn(List.of(emp, guardia));

        RegistrarSalidaPorteriaRequest request = new RegistrarSalidaPorteriaRequest(
                empleadoId,
                false,
                null,
                null,
                null,
                null,
                null,
                Instant.now(),
                null,
                "Salida a campo",
                List.of(
                        new RegistroPorteriaActivoSalidaRequest(activoId, null, 1, "Con cargador"),
                        new RegistroPorteriaActivoSalidaRequest(null, "Maletín de herramientas", 1, null)
                )
        );

        RegistroPorteriaResponse response = service.registrarSalida(request);

        assertNotNull(response.id());
        assertEquals("PRT-2026-0001", response.numero());
        assertEquals(EstadoRegistroPorteria.AFUERA, response.estado());
        assertEquals("Juan Perez", response.empleadoNombre());
        assertEquals("Carlos Guardia", response.guardiaSalidaNombre());
        assertEquals(2, response.activos().size());
        assertEquals("LAP-001", response.activos().get(0).activoCodigo());
        assertEquals("Maletín de herramientas", response.activos().get(1).descripcionItem());
    }

    @Test
    void registrarSalida_itemSinActivoNiDescripcion_debeLanzarBusinessException() {
        UUID empleadoId = UUID.randomUUID();
        when(vempleadoRepository.existsById(empleadoId)).thenReturn(true);

        RegistrarSalidaPorteriaRequest request = new RegistrarSalidaPorteriaRequest(
                empleadoId,
                false,
                null,
                null,
                null,
                null,
                null,
                Instant.now(),
                null,
                null,
                List.of(new RegistroPorteriaActivoSalidaRequest(null, "   ", 1, null))
        );

        assertThrows(BusinessException.class, () -> service.registrarSalida(request));
    }

    @Test
    void registrarLlegada_conDetalleParcial_debeCompletarYRegistrarRetornos() {
        UUID registroId = UUID.randomUUID();
        UUID item1Id = UUID.randomUUID();
        UUID item2Id = UUID.randomUUID();
        UUID empleadoId = UUID.randomUUID();
        Instant salida = Instant.now().minus(2, ChronoUnit.HOURS);

        RegistroPorteria existente = RegistroPorteria.builder()
                .id(registroId)
                .numero("PRT-2026-0002")
                .empleadoId(empleadoId)
                .fechaHoraSalida(salida)
                .estado(EstadoRegistroPorteria.AFUERA)
                .activos(List.of(
                        RegistroPorteriaActivo.builder().id(item1Id).descripcionItem("Laptop").cantidad(1).build(),
                        RegistroPorteriaActivo.builder().id(item2Id).descripcionItem("Radio").cantidad(1).build()
                ))
                .build();

        when(repository.findById(registroId)).thenReturn(Optional.of(existente));
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.empty());
        when(repository.save(any(RegistroPorteria.class))).thenAnswer(inv -> inv.getArgument(0));
        when(vempleadoRepository.findAllById(any())).thenReturn(List.of());

        RegistrarLlegadaPorteriaRequest request = new RegistrarLlegadaPorteriaRequest(
                Instant.now(),
                "Retorno con novedad",
                List.of(
                        new RegistroPorteriaActivoLlegadaRequest(item1Id, true, "OK"),
                        new RegistroPorteriaActivoLlegadaRequest(item2Id, false, "Se quedó en subestación")
                )
        );

        RegistroPorteriaResponse response = service.registrarLlegada(registroId, request);

        assertEquals(EstadoRegistroPorteria.COMPLETADO, response.estado());
        assertNotNull(response.fechaHoraLlegada());
        assertEquals(Boolean.TRUE, response.activos().get(0).retornado());
        assertEquals(Boolean.FALSE, response.activos().get(1).retornado());
        assertEquals("Se quedó en subestación", response.activos().get(1).observacionLlegada());
    }

    @Test
    void registrarLlegada_fechaAnteriorASalida_debeLanzarBusinessException() {
        UUID registroId = UUID.randomUUID();
        Instant salida = Instant.now();

        RegistroPorteria existente = RegistroPorteria.builder()
                .id(registroId)
                .empleadoId(UUID.randomUUID())
                .fechaHoraSalida(salida)
                .estado(EstadoRegistroPorteria.AFUERA)
                .activos(List.of())
                .build();

        when(repository.findById(registroId)).thenReturn(Optional.of(existente));

        RegistrarLlegadaPorteriaRequest request = new RegistrarLlegadaPorteriaRequest(
                salida.minus(10, ChronoUnit.MINUTES),
                null,
                null
        );

        assertThrows(BusinessException.class, () -> service.registrarLlegada(registroId, request));
    }

    @Test
    void registrarSalida_externo_conPersonaYPlaca_debeGuardarCorrectamente() {
        UUID guardiaUserId = UUID.randomUUID();
        UUID guardiaPersonaId = UUID.randomUUID();
        UUID guardiaEmpleadoId = UUID.randomUUID();

        when(securityUtils.getCurrentUserId()).thenReturn(Optional.of(guardiaUserId));
        when(usuarioRepository.findById(guardiaUserId))
                .thenReturn(Optional.of(Usuario.builder().id(guardiaUserId).personaId(guardiaPersonaId).build()));
        when(empleadoRepository.findFirstByPersonaId(guardiaPersonaId))
                .thenReturn(Optional.of(Empleado.builder().id(guardiaEmpleadoId).build()));

        when(correlativoService.generar(eq(CorrelativoCodigo.REGISTRO_PORTERIA), any(Integer.class)))
                .thenReturn("PRT-2026-0002");

        when(repository.save(any(RegistroPorteria.class))).thenAnswer(inv -> {
            RegistroPorteria r = inv.getArgument(0);
            r.setId(UUID.randomUUID());
            r.getActivos().forEach(a -> a.setId(UUID.randomUUID()));
            return r;
        });

        VEmpleadoEntity guardia = new VEmpleadoEntity();
        guardia.setEmpleadoId(guardiaEmpleadoId);
        guardia.setNombreCompleto("Carlos Guardia");
        when(vempleadoRepository.findAllById(any())).thenReturn(List.of(guardia));

        RegistrarSalidaPorteriaRequest request = new RegistrarSalidaPorteriaRequest(
                null,
                true,
                "Pedro Visitante",
                "9876-ABC",
                null,
                null,
                "Campamento Minero",
                Instant.now(),
                null,
                "Visita técnica externa",
                null
        );

        RegistroPorteriaResponse response = service.registrarSalida(request);

        assertNotNull(response.id());
        assertTrue(response.esExterno());
        assertEquals("Pedro Visitante", response.personaExterna());
        assertEquals("9876-ABC", response.placaExterna());
        assertEquals("Pedro Visitante", response.empleadoNombre());
        assertEquals(1, response.activos().size());
        assertTrue(response.activos().get(0).descripcionItem().contains("9876-ABC"));
    }
}

