package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringTipoActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.bitacora.response.BitacoraConsolidadaReporteResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SalidaVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularEventoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.AsignacionVehicularEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ViajeVehicularEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.*;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.shared.infrastructure.report.JasperReportService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BitacoraConsolidadaServiceTest {

    @Mock
    private SalidaVehicularRepository salidaRepository;
    @Mock
    private SalidaVehicularEventoRepository eventoRepository;
    @Mock
    private SpringViajeVehicularRepository viajeVehicularRepository;
    @Mock
    private SpringAsignacionVehicularRepository asignacionVehicularRepository;
    @Mock
    private SpringSolicitudVehicularRepository solicitudVehicularRepository;
    @Mock
    private SpringConductorRepository conductorRepository;
    @Mock
    private SpringCargaCombustibleRepository cargaCombustibleRepository;
    @Mock
    private SpringActivoRepository activoRepository;
    @Mock
    private SpringTipoActivoRepository tipoActivoRepository;
    @Mock
    private SpringActivoAtributoRepository activoAtributoRepository;
    @Mock
    private SpringActivoAtributoValorRepository activoAtributoValorRepository;
    @Mock
    private SpringVEmpleadoRepository vempleadoRepository;
    @Mock
    private JasperReportService jasperReportService;

    @InjectMocks
    private BitacoraConsolidadaService service;

    @Test
    void generarReporte_placaWithNoPrefix_shouldExtractCorrectPlaca() {
        UUID activoId = UUID.randomUUID();
        LocalDate desde = LocalDate.of(2026, 10, 1);
        LocalDate hasta = LocalDate.of(2026, 10, 30);

        ActivoEntity activo = new ActivoEntity();
        activo.setId(activoId);
        activo.setCodigo("MDF105");
        activo.setNombre("CAMIONETA");
        activo.setDescripcion("CAMIONETA TOYOTA HILUX PLACA NO.4688HPD CHASIS Nº 8...");

        SalidaVehicular salida = SalidaVehicular.builder()
                .id(UUID.randomUUID())
                .numero("SAL-001")
                .activoId(activoId)
                .fecha(Instant.now())
                .descripcionActividad("Supervisión técnica")
                .estado("FINALIZADA")
                .build();

        when(salidaRepository.findForReporte(any(), any(), any(), any(), any(), any()))
                .thenReturn(List.of(salida));
        when(viajeVehicularRepository.findBitacoraViajes(any(), any(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(cargaCombustibleRepository.findByActivoIdAndFechaCargaBetween(any(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(activoRepository.findAllById(any()))
                .thenReturn(List.of(activo));
        when(activoAtributoValorRepository.findByActivoIdIn(any()))
                .thenReturn(Collections.emptyList());
        when(eventoRepository.findBySalidaVehicularIdIn(any()))
                .thenReturn(Collections.emptyList());

        BitacoraConsolidadaReporteResponse response = service.generarReporte(activoId, desde, hasta, null);
        assertNotNull(response);
        assertEquals(1, response.items().size());
        assertEquals("4688HPD", response.items().get(0).vehiculoPlaca());
    }
}
