package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoResumenResponse;
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
        when(activoRepository.summarize("ACT-1", tipoId, ubicacionId, true))
                .thenReturn(projection(20, 3, 4, 13));

        ActivoResumenResponse response = service.resumen(
                "  ACT-1  ", tipoId, ubicacionId, true);

        assertEquals(20, response.total());
        assertEquals(3, response.deBaja());
        assertEquals(4, response.enMantenimiento());
        assertEquals(13, response.operativos());
        verify(activoRepository).summarize("ACT-1", tipoId, ubicacionId, true);
    }

    private static ActivoResumenProjection projection(
            long total,
            long deBaja,
            long enMantenimiento,
            long operativos
    ) {
        return new ActivoResumenProjection() {
            @Override public long getTotal() { return total; }
            @Override public long getDeBaja() { return deBaja; }
            @Override public long getEnMantenimiento() { return enMantenimiento; }
            @Override public long getOperativos() { return operativos; }
        };
    }
}
