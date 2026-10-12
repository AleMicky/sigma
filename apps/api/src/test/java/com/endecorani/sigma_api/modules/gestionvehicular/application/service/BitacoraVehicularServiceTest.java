package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringTipoActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.bitacora.response.BitacoraVehicularReporteResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoViajeVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.*;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.*;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.infrastructure.report.JasperReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BitacoraVehicularServiceTest {

    @Mock
    private SpringActivoRepository activoRepository;

    @Mock
    private SpringTipoActivoRepository tipoActivoRepository;

    @Mock
    private SpringActivoAtributoRepository activoAtributoRepository;

    @Mock
    private SpringActivoAtributoValorRepository activoAtributoValorRepository;

    @Mock
    private SpringViajeVehicularRepository viajeVehicularRepository;

    @Mock
    private SpringAsignacionVehicularRepository asignacionVehicularRepository;

    @Mock
    private SpringSolicitudVehicularRepository solicitudVehicularRepository;

    @Mock
    private SpringConductorRepository conductorRepository;

    @Mock
    private SpringConductorLicenciaRepository conductorLicenciaRepository;

    @Mock
    private SpringCargaCombustibleRepository cargaCombustibleRepository;

    @Mock
    private SpringVEmpleadoRepository vempleadoRepository;

    @Mock
    private JasperReportService jasperReportService;

    @InjectMocks
    private BitacoraVehicularService service;

    private UUID activoId;
    private UUID asignacionId;
    private UUID solicitudId;
    private UUID viajeId;
    private UUID conductorId;
    private UUID empleadoId;
    private ActivoEntity activoEntity;

    @BeforeEach
    void setUp() {
        activoId = UUID.randomUUID();
        asignacionId = UUID.randomUUID();
        solicitudId = UUID.randomUUID();
        viajeId = UUID.randomUUID();
        conductorId = UUID.randomUUID();
        empleadoId = UUID.randomUUID();

        activoEntity = new ActivoEntity();
        activoEntity.setId(activoId);
        activoEntity.setCodigo("ACT-VEH-001");
        activoEntity.setNombre("Toyota Land Cruiser");
        activoEntity.setDescripcion("PLACA: 4564-SNT - Vagoneta blanca");
    }

    @Test
    @DisplayName("Debe fallar si falta el vehículo o las fechas son inválidas")
    void testValidacionParametros() {
        LocalDate hoy = LocalDate.now();

        assertThrows(BusinessException.class, () ->
                service.generarReporte(null, hoy, hoy, null)
        );

        assertThrows(BusinessException.class, () ->
                service.generarReporte(activoId, null, hoy, null)
        );

        assertThrows(BusinessException.class, () ->
                service.generarReporte(activoId, hoy, null, null)
        );

        assertThrows(BusinessException.class, () ->
                service.generarReporte(activoId, hoy.plusDays(5), hoy, null)
        );
    }

    @Test
    @DisplayName("Debe generar reporte consolidado con viajes y combustible")
    void testGenerarReporteExitoso() {
        LocalDate inicio = LocalDate.of(2026, 9, 1);
        LocalDate fin = LocalDate.of(2026, 9, 30);

        when(activoRepository.findById(activoId)).thenReturn(Optional.of(activoEntity));
        when(activoAtributoValorRepository.findByActivoId(activoId)).thenReturn(Collections.emptyList());

        // Viaje de prueba
        ViajeVehicularEntity viaje = ViajeVehicularEntity.builder()
                .id(viajeId)
                .asignacionVehicularId(asignacionId)
                .fechaSalidaReal(LocalDateTime.of(2026, 9, 1, 8, 0))
                .kilometrajeSalida(97307L)
                .fechaRetornoReal(LocalDateTime.of(2026, 9, 1, 18, 0))
                .kilometrajeRetorno(97687L)
                .estado(EstadoViajeVehicular.FINALIZADO)
                .observacion("Viaje a La Paz")
                .build();

        when(viajeVehicularRepository.findBitacoraViajes(eq(activoId), any(), any(), eq(null)))
                .thenReturn(List.of(viaje));

        // Asignación de prueba
        AsignacionVehicularEntity asignacion = AsignacionVehicularEntity.builder()
                .id(asignacionId)
                .activoId(activoId)
                .solicitudVehicularId(solicitudId)
                .conductorId(conductorId)
                .asignadoPorId(empleadoId)
                .fechaAsignacion(LocalDateTime.of(2026, 9, 1, 7, 30))
                .build();
        when(asignacionVehicularRepository.findAllById(anySet())).thenReturn(List.of(asignacion));

        // Solicitud de prueba
        SolicitudVehicularEntity solicitud = SolicitudVehicularEntity.builder()
                .id(solicitudId)
                .numero("SOL-2026-001")
                .destino("LA PAZ")
                .motivo("Reunión ejecutiva")
                .build();
        when(solicitudVehicularRepository.findAllById(anySet())).thenReturn(List.of(solicitud));

        // Conductor y Empleado
        ConductorEntity conductor = ConductorEntity.builder()
                .id(conductorId)
                .empleadoId(empleadoId)
                .activo(true)
                .build();
        when(conductorRepository.findAllById(anySet())).thenReturn(List.of(conductor));

        VEmpleadoEntity emp = new VEmpleadoEntity();
        emp.setEmpleadoId(empleadoId);
        emp.setCodigo("EMP-001");
        emp.setNombreCompleto("Luis Choque");
        emp.setCargo("Conductor Profesional");
        when(vempleadoRepository.findAllById(anySet())).thenReturn(List.of(emp));

        // Carga de combustible vinculada al viaje
        CargaCombustibleEntity carga = CargaCombustibleEntity.builder()
                .id(UUID.randomUUID())
                .activoId(activoId)
                .viajeVehicularId(viajeId)
                .insumoId(UUID.randomUUID())
                .fechaCarga(LocalDateTime.of(2026, 9, 1, 8, 30))
                .litros(new BigDecimal("54.80"))
                .precioTotal(new BigDecimal("380.02"))
                .numeroFactura("20846")
                .empleadoId(empleadoId)
                .build();
        when(cargaCombustibleRepository.findByActivoIdAndFechaCargaBetween(eq(activoId), any(), any()))
                .thenReturn(List.of(carga));

        BitacoraVehicularReporteResponse reporte = service.generarReporte(activoId, inicio, fin, null);

        assertNotNull(reporte);
        assertEquals("4564-SNT", reporte.vehiculo().placa());
        assertEquals("Toyota Land Cruiser", reporte.vehiculo().nombre());
        assertEquals(1, reporte.items().size());

        var item = reporte.items().get(0);
        assertEquals(1, item.dia());
        assertEquals(97307L, item.kmSalida());
        assertEquals(97687L, item.kmLlegada());
        assertEquals(380L, item.kmRecorrido());
        assertEquals("LA PAZ", item.descripcionTrabajo());
        assertEquals("20846", item.combustibleFactura());
        assertEquals(new BigDecimal("54.80"), item.combustibleLitros());
        assertEquals(new BigDecimal("380.02"), item.combustibleImporte());
        assertEquals("Luis Choque", item.conductorNombre());

        assertEquals(1, reporte.resumen().totalViajes());
        assertEquals(380L, reporte.resumen().totalKmRecorridos());
        assertEquals(new BigDecimal("54.80"), reporte.resumen().totalLitrosCombustible());
        assertEquals(new BigDecimal("380.02"), reporte.resumen().totalImporteCombustible());
    }
}
