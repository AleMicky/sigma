package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.response.*;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.BitacoraVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SalidaVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SalidaVehicularEvento;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.BitacoraVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularEventoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SalidaVehicularReporteServiceTest {

    @Mock
    private SalidaVehicularRepository salidaRepository;

    @Mock
    private SalidaVehicularEventoRepository eventoRepository;

    @Mock
    private BitacoraVehicularRepository bitacoraRepository;

    @Mock
    private SalidaVehicularService salidaService;

    @Mock
    private SpringActivoRepository activoRepository;

    @Mock
    private SpringActivoAtributoRepository activoAtributoRepository;

    @Mock
    private SpringActivoAtributoValorRepository activoAtributoValorRepository;

    @Mock
    private SpringVEmpleadoRepository vempleadoRepository;

    @InjectMocks
    private SalidaVehicularReporteService reporteService;

    private UUID activoId;
    private UUID empleadoId;
    private UUID salidaId;
    private SalidaVehicular salida;

    @BeforeEach
    void setUp() {
        activoId = UUID.randomUUID();
        empleadoId = UUID.randomUUID();
        salidaId = UUID.randomUUID();

        salida = SalidaVehicular.builder()
                .id(salidaId)
                .numero("SAL-2026-0001")
                .activoId(activoId)
                .empleadoId(empleadoId)
                .motivo("Mantenimiento subestación")
                .origen("Cochabamba")
                .destino("Corani")
                .estado("FINALIZADA")
                .createdAt(Instant.now().minusSeconds(7200))
                .build();
    }

    @Test
    @DisplayName("Debe generar reporte general de salidas")
    void generarReporteGeneral_debeRetornarTotalesYLista() {
        when(salidaRepository.findForReporte(any(), any(), any(), any(), any(), any()))
                .thenReturn(List.of(salida));
        when(salidaService.mapListToResponse(anyList())).thenReturn(List.of(
                SalidaVehicularResponse.builder().id(salidaId).numero("SAL-2026-0001").estado("FINALIZADA").build()
        ));

        ReporteSalidasGeneralResponse response = reporteService.generarReporteGeneral(
                null, activoId, null, null, null, null
        );

        assertNotNull(response);
        assertEquals(1, response.totalSalidas());
        assertEquals(1, response.salidasFinalizadas());
        assertEquals(0, response.salidasActivas());
    }

    @Test
    @DisplayName("Debe generar reporte de vehículos y kilometraje")
    void generarReporteVehiculosKilometraje_debeCalcularRecorrido() {
        when(salidaRepository.findForReporte(any(), any(), any(), any(), any(), any()))
                .thenReturn(List.of(salida));

        SalidaVehicularEvento ev1 = SalidaVehicularEvento.builder()
                .salidaVehicularId(salidaId)
                .kilometraje(new BigDecimal("1000"))
                .fechaHora(Instant.now().minusSeconds(3600))
                .build();
        SalidaVehicularEvento ev2 = SalidaVehicularEvento.builder()
                .salidaVehicularId(salidaId)
                .kilometraje(new BigDecimal("1150"))
                .fechaHora(Instant.now())
                .build();

        when(eventoRepository.findBySalidaVehicularIdIn(anyList())).thenReturn(List.of(ev1, ev2));

        List<ReporteVehiculoKilometrajeResponse> report = reporteService.generarReporteVehiculosKilometraje(
                activoId, null, null
        );

        assertNotNull(report);
        assertEquals(1, report.size());
        assertEquals(new BigDecimal("150"), report.getFirst().kilometrajeTotalRecorrido());
    }

    @Test
    @DisplayName("Debe generar reporte de bitácoras, actividades e incidentes")
    void generarReporteBitacoras_debeContabilizarPorTipo() {
        BitacoraVehicular b1 = BitacoraVehicular.builder()
                .id(UUID.randomUUID())
                .salidaVehicularId(salidaId)
                .empleadoId(empleadoId)
                .tipo("ACTIVIDAD")
                .descripcion("Revisión de neumáticos")
                .fechaHora(Instant.now())
                .build();
        BitacoraVehicular b2 = BitacoraVehicular.builder()
                .id(UUID.randomUUID())
                .salidaVehicularId(salidaId)
                .empleadoId(empleadoId)
                .tipo("INCIDENTE")
                .descripcion("Falla sensor combustible")
                .fechaHora(Instant.now())
                .build();

        when(bitacoraRepository.findConFiltros(any(), any(), any(), any(), any()))
                .thenReturn(List.of(b1, b2));

        ReporteBitacorasActividadesIncidentesResponse report = reporteService.generarReporteBitacoras(
                salidaId, null, null, null, null
        );

        assertNotNull(report);
        assertEquals(2, report.totalBitacoras());
        assertEquals(1, report.totalActividades());
        assertEquals(1, report.totalIncidentes());
    }
}
