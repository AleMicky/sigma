package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoResumenResponse;
import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoResumenProjection;
import com.endecorani.sigma_api.modules.activos.domain.repository.CategoriaRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.EstadoOperativoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoEstadoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.modules.parametros.domain.repository.UbicacionRepository;
import com.endecorani.sigma_api.shared.application.storage.ImageStorageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActivoResumenServiceTest {

    @Mock private ActivoRepository activoRepository;
    @Mock private TipoActivoRepository tipoActivoRepository;
    @Mock private UbicacionRepository ubicacionRepository;
    @Mock private EstadoOperativoRepository estadoOperativoRepository;
    @Mock private TipoActivoEstadoRepository tipoActivoEstadoRepository;
    @Mock private CategoriaRepository categoriaRepository;
    @Mock private ImageStorageService imageStorageService;
    @Mock private DisponibilidadActivoExcelService disponibilidadActivoExcelService;

    @InjectMocks
    private ActivoService service;

    @Test
    void resumen_aplicaLosMismosFiltrosDelListadoYDevuelveLosKpis() {
        UUID tipoId = UUID.randomUUID();
        UUID ubicacionId = UUID.randomUUID();
        UUID estadoId = UUID.randomUUID();
        UUID categoriaId = UUID.randomUUID();
        when(activoRepository.summarize("ACT-1", tipoId, ubicacionId, true, estadoId, categoriaId))
                .thenReturn(projection(20, 3, 4, 13, 7, 3, 2, 1, 12, 60.0));

        ActivoResumenResponse response = service.resumen(
                "  ACT-1  ", tipoId, ubicacionId, true, estadoId, categoriaId);

        assertEquals(20, response.total());
        assertEquals(3, response.deBaja());
        assertEquals(4, response.enMantenimiento());
        assertEquals(13, response.operativos());
        assertEquals(7, response.operativo());
        assertEquals(3, response.reserva());
        assertEquals(2, response.enViaje());
        assertEquals(1, response.fueraServicio());
        assertEquals(12, response.disponibles());
        assertEquals(60.0, response.tasaDisponibilidad());
        verify(activoRepository).summarize("ACT-1", tipoId, ubicacionId, true, estadoId, categoriaId);
    }

    @Test
    void resumen_bajaYMantenimientoSonExcluyentesYNormalizaLaBusqueda() {
        UUID estadoId = UUID.randomUUID();
        UUID categoriaId = UUID.randomUUID();
        // q con espacios y salto de línea: el repositorio debe recibir "ACT-1 resumen".
        when(activoRepository.summarize(
                "ACT-1 resumen", null, null, null, estadoId, categoriaId))
                .thenReturn(projection(10, 3, 2, 5, 2, 1, 1, 1, 4, 40.0));

        ActivoResumenResponse response = service.resumen(
                "  ACT-1   \n resumen ", null, null, null, estadoId, categoriaId);

        assertEquals(10, response.total());
        assertEquals(3, response.deBaja());
        assertEquals(2, response.enMantenimiento());
        assertEquals(5, response.operativos());
        assertEquals(2, response.operativo());
        assertEquals(1, response.reserva());
        assertEquals(1, response.enViaje());
        assertEquals(1, response.fueraServicio());

        // Invariantes del contrato: baja gana y los cubos son una partición.
        assertEquals(response.total(), response.deBaja() + response.enMantenimiento() + response.operativos());
        assertEquals(response.total(), response.deBaja()
                + response.enMantenimiento()
                + response.fueraServicio()
                + response.reserva()
                + response.enViaje()
                + response.operativo());
        assertEquals(response.operativo() + response.reserva() + response.enViaje(), response.disponibles());
        assertEquals(response.disponibles() * 100.0 / response.total(), response.tasaDisponibilidad());

        verify(activoRepository).summarize(
                "ACT-1 resumen", null, null, null, estadoId, categoriaId);
    }

    @Test
    void findById_exponeColorEIconoDelTipoDeActivo() {
        UUID id = UUID.randomUUID();
        UUID tipoId = UUID.randomUUID();
        Activo dominio = Activo.builder()
                .id(id)
                .codigo("ACT-001")
                .nombre("Vehículo de prueba")
                .tipoActivoId(tipoId)
                .activo(true)
                .build();
        TipoActivo tipo = TipoActivo.builder()
                .id(tipoId)
                .categoriaId(UUID.randomUUID())
                .nombre("Vehículo")
                .descripcion("Flota liviana")
                .color("#0B4F8A")
                .icono("truck")
                .build();
        when(activoRepository.findById(id)).thenReturn(Optional.of(dominio));
        when(tipoActivoRepository.findById(tipoId)).thenReturn(Optional.of(tipo));

        ActivoResponse response = service.findById(id);

        assertNotNull(response.tipoActivo());
        assertEquals(tipoId, response.tipoActivo().id());
        assertEquals("#0B4F8A", response.tipoActivo().color());
        assertEquals("truck", response.tipoActivo().icono());
    }

    private static ActivoResumenProjection projection(
            long total,
            long deBaja,
            long enMantenimiento,
            long operativos,
            long operativo,
            long reserva,
            long enViaje,
            long fueraServicio,
            long disponibles,
            double tasaDisponibilidad
    ) {
        return new ActivoResumenProjection() {
            @Override public long getTotal() { return total; }
            @Override public long getDeBaja() { return deBaja; }
            @Override public long getEnMantenimiento() { return enMantenimiento; }
            @Override public long getOperativos() { return operativos; }
            @Override public long getOperativo() { return operativo; }
            @Override public long getReserva() { return reserva; }
            @Override public long getEnViaje() { return enViaje; }
            @Override public long getFueraServicio() { return fueraServicio; }
            @Override public long getDisponibles() { return disponibles; }
            @Override public double getTasaDisponibilidad() { return tasaDisponibilidad; }
        };
    }
}
