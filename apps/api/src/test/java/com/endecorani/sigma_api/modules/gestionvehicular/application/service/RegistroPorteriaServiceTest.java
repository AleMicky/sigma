package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.AnularRegistroPorteriaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.RegistrarLlegadaPorteriaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.RegistrarSalidaPorteriaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.RegistroPorteriaActivoLlegadaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.RegistroPorteriaActivoSalidaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.response.RegistroPorteriaResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.response.ReporteBitacoraPorteriaResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoRegistroPorteria;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.TipoMovimientoPorteria;
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
import com.endecorani.sigma_api.shared.domain.exception.ForbiddenException;
import com.endecorani.sigma_api.shared.infrastructure.report.JasperReportService;
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
    private SpringActivoAtributoRepository activoAtributoRepository;
    @Mock
    private SpringActivoAtributoValorRepository activoAtributoValorRepository;
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
    @Mock
    private JasperReportService jasperReportService;

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
                null,
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
        assertEquals(TipoMovimientoPorteria.SALIDA, response.tipoMovimiento());
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
                TipoMovimientoPorteria.SALIDA,
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
        when(securityUtils.isAdmin()).thenReturn(true);
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
        when(securityUtils.isAdmin()).thenReturn(true);

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
                TipoMovimientoPorteria.ENTRADA,
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
        assertEquals(TipoMovimientoPorteria.ENTRADA, response.tipoMovimiento());
        assertTrue(response.esExterno());
        assertEquals("Pedro Visitante", response.personaExterna());
        assertEquals("9876-ABC", response.placaExterna());
        assertEquals("Pedro Visitante", response.empleadoNombre());
        assertEquals(1, response.activos().size());
        assertTrue(response.activos().get(0).descripcionItem().contains("9876-ABC"));
    }

    @Test
    void registrarLlegada_cuandoMovimientoInicialEsEntrada_debeCompletarConSalidaYValidarFecha() {
        UUID registroId = UUID.randomUUID();
        Instant entrada = Instant.now().minus(1, ChronoUnit.HOURS);

        RegistroPorteria existente = RegistroPorteria.builder()
                .id(registroId)
                .numero("PRT-2026-0099")
                .tipoMovimiento(TipoMovimientoPorteria.ENTRADA)
                .esExterno(true)
                .personaExterna("Carlos Proveedor")
                .placaExterna("1234-XYZ")
                .fechaHoraSalida(entrada)
                .estado(EstadoRegistroPorteria.AFUERA)
                .activos(List.of())
                .build();

        when(repository.findById(registroId)).thenReturn(Optional.of(existente));
        when(securityUtils.isAdmin()).thenReturn(true);

        // Fecha anterior a la entrada debe lanzar error específico
        RegistrarLlegadaPorteriaRequest reqInvalido = new RegistrarLlegadaPorteriaRequest(
                entrada.minus(5, ChronoUnit.MINUTES),
                null,
                null
        );
        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.registrarLlegada(registroId, reqInvalido));
        assertTrue(ex.getMessage().contains("salida no puede ser anterior"));

        // Fecha posterior completa correctamente
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.empty());
        when(repository.save(any(RegistroPorteria.class))).thenAnswer(inv -> inv.getArgument(0));

        RegistrarLlegadaPorteriaRequest reqValido = new RegistrarLlegadaPorteriaRequest(
                Instant.now(),
                "Salió sin novedades",
                null
        );
        RegistroPorteriaResponse response = service.registrarLlegada(registroId, reqValido);

        assertEquals(TipoMovimientoPorteria.ENTRADA, response.tipoMovimiento());
        assertEquals(EstadoRegistroPorteria.COMPLETADO, response.estado());
        assertNotNull(response.fechaHoraLlegada());
        assertEquals("Salió sin novedades", response.observacionLlegada());
    }

    @Test
    void generarReporteBitacora_debeRetornarTodosLosDatosYMetricasConsolidadas() {
        UUID empleadoId = UUID.randomUUID();
        UUID guardiaId = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();
        Instant salida1 = Instant.parse("2026-11-18T12:00:00Z");
        Instant llegada1 = Instant.parse("2026-11-18T14:30:00Z");
        Instant salida2 = Instant.parse("2026-11-18T15:00:00Z");

        when(securityUtils.isAdmin()).thenReturn(true);

        RegistroPorteria reg1 = RegistroPorteria.builder()
                .id(UUID.randomUUID())
                .numero("PRT-2026-0010")
                .esExterno(false)
                .empleadoId(empleadoId)
                .guardiaSalidaId(guardiaId)
                .guardiaLlegadaId(guardiaId)
                .origenUbicacionNombre("Planta Corani")
                .destinoOtro("Subestación Sacaba")
                .fechaHoraSalida(salida1)
                .fechaHoraLlegada(llegada1)
                .estado(EstadoRegistroPorteria.COMPLETADO)
                .observacionSalida("Inspección técnica")
                .observacionLlegada("Retorno sin novedad")
                .activos(List.of(
                        RegistroPorteriaActivo.builder()
                                .id(UUID.randomUUID())
                                .activoId(activoId)
                                .cantidad(1)
                                .retornado(true)
                                .build()
                ))
                .build();

        RegistroPorteria reg2 = RegistroPorteria.builder()
                .id(UUID.randomUUID())
                .numero("PRT-2026-0011")
                .esExterno(true)
                .personaExterna("María Proveedora")
                .placaExterna("4512-XYZ")
                .destinoOtro("Almacén Central")
                .guardiaSalidaId(guardiaId)
                .fechaHoraSalida(salida2)
                .estado(EstadoRegistroPorteria.AFUERA)
                .observacionSalida("Entrega de repuestos")
                .activos(List.of(
                        RegistroPorteriaActivo.builder()
                                .id(UUID.randomUUID())
                                .descripcionItem("Vehículo externo - Placa: 4512-XYZ")
                                .cantidad(1)
                                .build()
                ))
                .build();

        when(repository.findAllForReporte(any(), any(), any(), any(), any(), eq(false), any(), any(), any(), any()))
                .thenReturn(List.of(reg2, reg1));

        VEmpleadoEntity emp = new VEmpleadoEntity();
        emp.setEmpleadoId(empleadoId);
        emp.setCodigo("EMP-101");
        emp.setNombreCompleto("Luis Mamani");
        emp.setCargo("Ingeniero Eléctrico");
        emp.setArea("Operaciones");

        VEmpleadoEntity guardia = new VEmpleadoEntity();
        guardia.setEmpleadoId(guardiaId);
        guardia.setNombreCompleto("Carlos Guardia");

        when(vempleadoRepository.findAllById(any())).thenReturn(List.of(emp, guardia));

        ActivoEntity activo = new ActivoEntity();
        activo.setId(activoId);
        activo.setCodigo("VEH-005");
        activo.setNombre("Camioneta Toyota Hilux");
        activo.setDescripcion("CAMIONETA PLACA: 3042-YHB COLOR BLANCO");
        when(activoRepository.findAllById(any())).thenReturn(List.of(activo));
        when(activoAtributoValorRepository.findByActivoIdIn(any())).thenReturn(List.of());

        ReporteBitacoraPorteriaResponse reporte = service.generarReporteBitacora(
                null, null, null, null, null, null, null, salida1, salida2
        );

        assertEquals(2, reporte.totalRegistros());
        assertEquals(1L, reporte.totalInternos());
        assertEquals(1L, reporte.totalExternos());
        assertEquals(1L, reporte.totalCompletados());
        assertEquals(1L, reporte.totalAfuera());
        assertEquals(0L, reporte.totalAnulados());
        assertEquals(2L, reporte.totalActivosMovilizados());
        assertEquals(150.0, reporte.duracionPromedioMinutos());

        // Orden cronológico ascendente (reg1 primero, reg2 después)
        var item1 = reporte.items().get(0);
        assertEquals("PRT-2026-0010", item1.numero());
        assertEquals("INTERNO", item1.tipoRegistro());
        assertEquals("Luis Mamani", item1.empleadoNombre());
        assertEquals("EMP-101", item1.empleadoCodigo());
        assertEquals("Operaciones", item1.empleadoArea());
        assertEquals("3042-YHB", item1.vehiculoPlaca());
        assertEquals("Planta Corani -> Subestación Sacaba", item1.rutaTexto());
        assertEquals(150L, item1.duracionMinutos());
        assertEquals("2h 30m", item1.duracionTexto());

        var item2 = reporte.items().get(1);
        assertEquals("PRT-2026-0011", item2.numero());
        assertEquals("EXTERNO", item2.tipoRegistro());
        assertEquals("María Proveedora", item2.empleadoNombre());
        assertEquals("4512-XYZ", item2.vehiculoPlaca());
        assertEquals("En curso", item2.duracionTexto());
    }

    @Test
    void registrarLlegada_cuandoUsuarioSinAccesoAlAreaNiCreador_debeLanzarForbiddenException() {
        UUID registroId = UUID.randomUUID();
        UUID otroCreadorId = UUID.randomUUID();
        UUID usuarioActualId = UUID.randomUUID();
        UUID personaActualId = UUID.randomUUID();
        UUID areaActualId = UUID.randomUUID();
        UUID areaAjenaId = UUID.randomUUID();
        UUID empleadoAjenoId = UUID.randomUUID();

        RegistroPorteria existente = RegistroPorteria.builder()
                .id(registroId)
                .createdById(otroCreadorId)
                .empleadoId(empleadoAjenoId)
                .fechaHoraSalida(Instant.now().minus(1, ChronoUnit.HOURS))
                .estado(EstadoRegistroPorteria.AFUERA)
                .activos(List.of())
                .build();

        when(repository.findById(registroId)).thenReturn(Optional.of(existente));
        when(securityUtils.isAdmin()).thenReturn(false);
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.of(usuarioActualId));
        when(usuarioRepository.findById(usuarioActualId))
                .thenReturn(Optional.of(Usuario.builder().id(usuarioActualId).personaId(personaActualId).build()));
        when(empleadoRepository.findFirstByPersonaId(personaActualId))
                .thenReturn(Optional.of(Empleado.builder().id(UUID.randomUUID()).areaId(areaActualId).build()));
        when(empleadoRepository.findAllById(any()))
                .thenReturn(List.of(Empleado.builder().id(empleadoAjenoId).areaId(areaAjenaId).build()));

        RegistrarLlegadaPorteriaRequest request = new RegistrarLlegadaPorteriaRequest(Instant.now(), "OK", null);

        assertThrows(ForbiddenException.class, () -> service.registrarLlegada(registroId, request));
    }

    @Test
    void anular_cuandoUsuarioSinAccesoAlAreaNiCreador_debeLanzarForbiddenException() {
        UUID registroId = UUID.randomUUID();
        UUID otroCreadorId = UUID.randomUUID();
        UUID usuarioActualId = UUID.randomUUID();
        UUID personaActualId = UUID.randomUUID();
        UUID areaActualId = UUID.randomUUID();
        UUID areaAjenaId = UUID.randomUUID();
        UUID empleadoAjenoId = UUID.randomUUID();

        RegistroPorteria existente = RegistroPorteria.builder()
                .id(registroId)
                .createdById(otroCreadorId)
                .empleadoId(empleadoAjenoId)
                .fechaHoraSalida(Instant.now().minus(1, ChronoUnit.HOURS))
                .estado(EstadoRegistroPorteria.AFUERA)
                .activos(List.of())
                .build();

        when(repository.findById(registroId)).thenReturn(Optional.of(existente));
        when(securityUtils.isAdmin()).thenReturn(false);
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.of(usuarioActualId));
        when(usuarioRepository.findById(usuarioActualId))
                .thenReturn(Optional.of(Usuario.builder().id(usuarioActualId).personaId(personaActualId).build()));
        when(empleadoRepository.findFirstByPersonaId(personaActualId))
                .thenReturn(Optional.of(Empleado.builder().id(UUID.randomUUID()).areaId(areaActualId).build()));
        when(empleadoRepository.findAllById(any()))
                .thenReturn(List.of(Empleado.builder().id(empleadoAjenoId).areaId(areaAjenaId).build()));

        AnularRegistroPorteriaRequest request = new AnularRegistroPorteriaRequest("Duplicado");

        assertThrows(ForbiddenException.class, () -> service.anular(registroId, request));
    }

    @Test
    void anular_cuandoUsuarioEsCreadorDelRegistro_debePermitirAnular() {
        UUID registroId = UUID.randomUUID();
        UUID usuarioActualId = UUID.randomUUID();

        RegistroPorteria existente = RegistroPorteria.builder()
                .id(registroId)
                .createdById(usuarioActualId)
                .fechaHoraSalida(Instant.now().minus(1, ChronoUnit.HOURS))
                .estado(EstadoRegistroPorteria.AFUERA)
                .activos(List.of())
                .build();

        when(repository.findById(registroId)).thenReturn(Optional.of(existente));
        when(securityUtils.isAdmin()).thenReturn(false);
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.of(usuarioActualId));
        when(usuarioRepository.findById(usuarioActualId)).thenReturn(Optional.empty());
        when(repository.save(any(RegistroPorteria.class))).thenAnswer(inv -> inv.getArgument(0));

        RegistroPorteriaResponse response = service.anular(registroId, new AnularRegistroPorteriaRequest("Error de digitación"));

        assertEquals(EstadoRegistroPorteria.ANULADO, response.estado());
        assertEquals("Error de digitación", response.observacionLlegada());
    }
}

