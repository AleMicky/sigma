package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.response.BitacoraPorteriaItemResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoRegistroPorteria;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.RegistroPorteria;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SalidaVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.RegistroPorteriaRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository.SpringUbicacionRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.infrastructure.report.JasperReportService;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/** REQ-VEH-019: reporte paginado y resolución de salidas en una sola consulta. */
@ExtendWith(MockitoExtension.class)
class RegistroPorteriaServicePaginadoTest {

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
    void reportePaginado_debeLimitarTamanoYResolversalidasConFindAllByIdIn() {
        UUID salidaId = UUID.randomUUID();
        RegistroPorteria registro = RegistroPorteria.builder()
                .id(UUID.randomUUID())
                .numero("PRT-2026-0001")
                .empleadoId(UUID.randomUUID())
                .salidaVehicularId(salidaId)
                .fechaHoraSalida(Instant.parse("2026-11-26T08:00:00Z"))
                .build();

        when(securityUtils.isAdmin()).thenReturn(true);
        when(repository.findAll(isNull(), isNull(), isNull(), isNull(), isNull(), eq(false),
                isNull(), isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(registro), PageRequest.of(0, 2), 25));
        when(salidaVehicularRepository.findAllByIdIn(anyCollection())).thenReturn(List.of(
                SalidaVehicular.builder().id(salidaId).numero("SV-2026-0001").build()));

        PageResponse<BitacoraPorteriaItemResponse> response =
                service.generarReporteBitacoraPaginado(0, 2);

        assertEquals(2, response.size());
        assertEquals(25, response.totalElements());
        assertEquals(13, response.totalPages());
        assertFalse(response.content().isEmpty());
        assertEquals("SV-2026-0001", response.content().get(0).salidaVehicularNumero());

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(repository).findAll(isNull(), isNull(), isNull(), isNull(), isNull(), eq(false),
                isNull(), isNull(), isNull(), isNull(), pageableCaptor.capture());
        assertEquals(2, pageableCaptor.getValue().getPageSize());

        ArgumentCaptor<Collection<UUID>> idsCaptor = ArgumentCaptor.forClass(Collection.class);
        verify(salidaVehicularRepository).findAllByIdIn(idsCaptor.capture());
        assertEquals(List.of(salidaId), List.copyOf(idsCaptor.getValue()));
    }

    @Test
    void reportePaginado_conFiltros_debePasarlosAlRepositorioYAcotarSize() {
        UUID empleadoId = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();
        UUID areaId = UUID.randomUUID();
        UUID createdById = UUID.randomUUID();
        Instant desde = Instant.parse("2026-11-01T04:00:00Z");
        Instant hasta = Instant.parse("2026-11-26T03:59:59Z");
        RegistroPorteria registro = RegistroPorteria.builder()
                .id(UUID.randomUUID())
                .numero("PRT-2026-0002")
                .fechaHoraSalida(Instant.parse("2026-11-26T08:00:00Z"))
                .build();

        when(securityUtils.isAdmin()).thenReturn(true);
        when(repository.findAll(eq("ABC-123"), eq(empleadoId), eq(activoId), eq(areaId), eq(createdById),
                eq(false), isNull(), eq(EstadoRegistroPorteria.COMPLETADO), eq(desde), eq(hasta), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(registro),
                        PageRequest.of(0, ApiConstants.MAX_PAGE_SIZE), 1));

        PageResponse<BitacoraPorteriaItemResponse> response = service.generarReporteBitacoraPaginado(
                0, 9999, "ABC-123", empleadoId, activoId, areaId, createdById, null,
                EstadoRegistroPorteria.COMPLETADO, desde, hasta);

        assertEquals(ApiConstants.MAX_PAGE_SIZE, response.size());
        assertEquals(1, response.totalElements());

        ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
        verify(repository).findAll(eq("ABC-123"), eq(empleadoId), eq(activoId), eq(areaId), eq(createdById),
                eq(false), isNull(), eq(EstadoRegistroPorteria.COMPLETADO), eq(desde), eq(hasta),
                pageable.capture());
        assertEquals(ApiConstants.MAX_PAGE_SIZE, pageable.getValue().getPageSize());
        assertEquals(Sort.by(Sort.Direction.ASC, "fechaHoraSalida"), pageable.getValue().getSort());
    }

    @Test
    void reportePaginado_conEsExterno_debeUsarLaSobrecargaQueFiltraExternos() {
        UUID activoId = UUID.randomUUID();

        when(securityUtils.isAdmin()).thenReturn(true);
        when(repository.findAll(isNull(), isNull(), eq(activoId), isNull(), isNull(), eq(false), eq(true),
                isNull(), eq(EstadoRegistroPorteria.AFUERA), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));

        PageResponse<BitacoraPorteriaItemResponse> response = service.generarReporteBitacoraPaginado(
                0, 20, null, null, activoId, null, null, true, EstadoRegistroPorteria.AFUERA, null, null);

        assertTrue(response.empty());
        verify(repository).findAll(isNull(), isNull(), eq(activoId), isNull(), isNull(), eq(false), eq(true),
                isNull(), eq(EstadoRegistroPorteria.AFUERA), isNull(), isNull(), any(Pageable.class));
        verifyNoInteractions(salidaVehicularRepository);
    }

    @Test
    void reportePaginado_noAdmin_debeIgnorarAreaSolicitadaYAplicarAlcanceDelUsuario() {
        UUID userId = UUID.randomUUID();
        UUID personaId = UUID.randomUUID();
        UUID areaReal = UUID.randomUUID();
        UUID areaSolicitada = UUID.randomUUID();

        when(securityUtils.isAdmin()).thenReturn(false);
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.of(userId));
        when(usuarioRepository.findById(userId))
                .thenReturn(Optional.of(Usuario.builder().id(userId).personaId(personaId).build()));
        when(empleadoRepository.findFirstByPersonaId(personaId))
                .thenReturn(Optional.of(Empleado.builder().areaId(areaReal).build()));
        when(repository.findAll(isNull(), isNull(), isNull(), eq(areaReal), eq(userId), eq(true),
                isNull(), isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));

        PageResponse<BitacoraPorteriaItemResponse> response = service.generarReporteBitacoraPaginado(
                0, 20, null, null, null, areaSolicitada, null, null, null, null, null);

        assertTrue(response.empty());
        verify(repository).findAll(isNull(), isNull(), isNull(), eq(areaReal), eq(userId), eq(true),
                isNull(), isNull(), isNull(), isNull(), any(Pageable.class));
    }

    @Test
    void reportePaginado_sinAlcance_debeDevolverPaginaVaciaAcotadaSinConsultar() {
        when(securityUtils.isAdmin()).thenReturn(false);
        when(securityUtils.getCurrentUserId()).thenReturn(Optional.empty());

        PageResponse<BitacoraPorteriaItemResponse> response = service.generarReporteBitacoraPaginado(0, 20);

        assertTrue(response.empty());
        assertEquals(20, response.size());
        verifyNoInteractions(repository, salidaVehicularRepository);
    }

    @Test
    void reportePaginado_rangoInvertido_debeRechazarSinConsultar() {
        Instant desde = Instant.parse("2026-11-26T08:00:00Z");

        assertThrows(BusinessException.class, () -> service.generarReporteBitacoraPaginado(
                0, 20, null, null, null, null, null, null, null, desde, desde.minusSeconds(1)));

        verifyNoInteractions(repository);
    }
}
