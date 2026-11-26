package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoValorEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.EstadoOperativoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringEstadoOperativoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.dashboard.GestionVehicularDashboardResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoViajeVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.AsignacionVehicularEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorLicenciaEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.FlotaVehiculoEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.SolicitudVehicularEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ViajeVehicularEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.*;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/** REQ-VEH-019: el dashboard usa agregaciones SQL y Consultas acotadas, sin findAll(). */
@ExtendWith(MockitoExtension.class)
class GestionVehicularDashboardServiceTest {

    @Mock private SpringFlotaVehiculoRepository flotaVehiculoRepository;
    @Mock private SpringViajeVehicularRepository viajeVehicularRepository;
    @Mock private SpringSolicitudVehicularRepository solicitudVehicularRepository;
    @Mock private SpringCargaCombustibleRepository cargaCombustibleRepository;
    @Mock private SpringConductorRepository conductorRepository;
    @Mock private SpringConductorLicenciaRepository conductorLicenciaRepository;
    @Mock private SpringAsignacionVehicularRepository asignacionVehicularRepository;
    @Mock private SpringActivoRepository activoRepository;
    @Mock private SpringActivoAtributoValorRepository activoAtributoValorRepository;
    @Mock private SpringActivoAtributoRepository activoAtributoRepository;
    @Mock private SpringEstadoOperativoRepository estadoOperativoRepository;
    @Mock private SpringVEmpleadoRepository vEmpleadoRepository;

    @InjectMocks
    private GestionVehicularDashboardService service;

    @Test
    void dashboard_debeUsarAgregacionesSQLUnaSolaVezSinFindAll() {
        UUID flotaId = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();
        UUID asignacionId = UUID.randomUUID();
        UUID conductorId = UUID.randomUUID();
        UUID solicitudId = UUID.randomUUID();
        String periodo = LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM"));

        ActivoEntity activo = new ActivoEntity();
        activo.setId(activoId);
        activo.setCodigo("ACT-001");

        lenient().when(flotaVehiculoRepository.findByFlotaVehicularId(flotaId)).thenReturn(List.of(
                FlotaVehiculoEntity.builder().flotaVehicularId(flotaId).activoId(activoId).activo(true).build()));
        lenient().when(activoRepository.findAllById(anyCollection())).thenReturn(List.of(activo));
        lenient().when(estadoOperativoRepository.findAllById(anyCollection())).thenReturn(List.of());
        lenient().when(asignacionVehicularRepository.findByActivoIdIn(anyCollection())).thenReturn(List.of(
                AsignacionVehicularEntity.builder()
                        .id(asignacionId)
                        .activoId(activoId)
                        .conductorId(conductorId)
                        .solicitudVehicularId(solicitudId)
                        .build()));
        lenient().when(viajeVehicularRepository.findByAsignacionVehicularIdIn(anyCollection())).thenReturn(List.of(
                ViajeVehicularEntity.builder()
                        .id(UUID.randomUUID())
                        .asignacionVehicularId(asignacionId)
                        .estado(EstadoViajeVehicular.EN_CURSO)
                        .build()));
        lenient().when(conductorRepository.findAllById(anyCollection())).thenReturn(List.<ConductorEntity>of());
        lenient().when(conductorLicenciaRepository.findByConductorIdInAndFechaVencimientoLessThanEqual(anyCollection(), any()))
                .thenReturn(List.<ConductorLicenciaEntity>of());
        lenient().when(solicitudVehicularRepository.findAllById(anyCollection())).thenReturn(List.of(
                SolicitudVehicularEntity.builder().id(solicitudId).estado("APROBADA").build()));
        lenient().when(activoAtributoValorRepository.findByActivoIdIn(anyCollection()))
                .thenReturn(List.<ActivoAtributoValorEntity>of());
        lenient().when(activoAtributoRepository.findAllById(anyCollection())).thenReturn(List.<ActivoAtributoEntity>of());
        lenient().when(viajeVehicularRepository.resumenMensualPorActivos(anyCollection(), any(), any()))
                .thenReturn(List.<Object[]>of(new Object[]{
                        periodo, BigInteger.ONE, BigInteger.ZERO, BigInteger.ZERO, BigInteger.ONE, BigDecimal.TEN}));
        lenient().when(cargaCombustibleRepository.resumenMensualPorActivos(anyCollection(), any(), any()))
                .thenReturn(List.<Object[]>of(new Object[]{
                        periodo, BigInteger.ONE, new BigDecimal("12.500"), new BigDecimal("80.00")}));
        lenient().when(solicitudVehicularRepository.contarPorEstado(anyCollection()))
                .thenReturn(List.<Object[]>of(new Object[]{"APROBADA", BigInteger.ONE}));
        lenient().when(viajeVehicularRepository.topActivosPorKm(anyCollection()))
                .thenReturn(List.<Object[]>of(new Object[]{activoId, BigInteger.ONE, BigDecimal.TEN}));
        lenient().when(cargaCombustibleRepository.topActivosPorCosto(anyCollection()))
                .thenReturn(List.<Object[]>of(new Object[]{
                        activoId, BigInteger.ONE, new BigDecimal("12.500"), new BigDecimal("80.00")}));

        GestionVehicularDashboardResponse response = service.obtenerDashboard(12, flotaId);

        assertEquals(1, response.getKpis().getTotalVehiculosFlota());
        assertEquals(1, response.getKpis().getViajesMesActual());
        assertEquals(10L, response.getKpis().getKmRecorridosMesActual());
        assertEquals(12, response.getTendenciaViajesYKm().size());
        assertEquals(12, response.getTendenciaCombustible().size());

        verify(viajeVehicularRepository).resumenMensualPorActivos(anyCollection(), any(), any());
        verify(cargaCombustibleRepository).resumenMensualPorActivos(anyCollection(), any(), any());
        verify(solicitudVehicularRepository).contarPorEstado(anyCollection());
        verify(viajeVehicularRepository).topActivosPorKm(anyCollection());
        verify(cargaCombustibleRepository).topActivosPorCosto(anyCollection());
        verify(viajeVehicularRepository, never()).findAll();
        verify(solicitudVehicularRepository, never()).findAll();
        verify(cargaCombustibleRepository, never()).findAll();
        verify(asignacionVehicularRepository, never()).findAll();
        verify(conductorRepository, never()).findAll();
        verify(conductorLicenciaRepository, never()).findAll();
        verify(flotaVehiculoRepository, never()).findAll();
        verify(estadoOperativoRepository, never()).findAll();
        verify(viajeVehicularRepository, times(1)).findByAsignacionVehicularIdIn(any(Collection.class));
    }
}
