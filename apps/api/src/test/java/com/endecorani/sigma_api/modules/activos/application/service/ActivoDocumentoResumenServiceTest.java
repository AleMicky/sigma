package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoDocumentoResumenResponse;
import com.endecorani.sigma_api.modules.activos.domain.enums.DocumentoEstadoFilter;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoDocumentoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoDocumentoSearchCriteria;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TiposDocumentoRepository;
import com.endecorani.sigma_api.shared.application.storage.DocumentStorageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActivoDocumentoResumenServiceTest {

    @Mock private ActivoDocumentoRepository repository;
    @Mock private ActivoRepository activoRepository;
    @Mock private TiposDocumentoRepository tiposDocumentoRepository;
    @Mock private DocumentStorageService documentStorageService;

    @InjectMocks
    private ActivoDocumentoService service;

    @Test
    void resumen_cuentaLosCincoEstadosConLosMismosFiltrosDelListado() {
        UUID activoId = UUID.randomUUID();
        UUID tipoDocumentoId = UUID.randomUUID();
        when(repository.count(any(ActivoDocumentoSearchCriteria.class)))
                .thenReturn(10L, 2L, 3L, 1L, 4L);

        ActivoDocumentoResumenResponse response = service.resumen(
                activoId, tipoDocumentoId, "  factura  ");

        assertEquals(new ActivoDocumentoResumenResponse(10, 2, 3, 1, 4), response);

        ArgumentCaptor<ActivoDocumentoSearchCriteria> criterios =
                ArgumentCaptor.forClass(ActivoDocumentoSearchCriteria.class);
        verify(repository, times(5)).count(criterios.capture());
        List<ActivoDocumentoSearchCriteria> capturados = criterios.getAllValues();

        assertNull(capturados.get(0).estado());
        assertEquals(DocumentoEstadoFilter.VIGENTE, capturados.get(1).estado());
        assertEquals(DocumentoEstadoFilter.POR_VENCER, capturados.get(2).estado());
        assertEquals(DocumentoEstadoFilter.VENCIDO, capturados.get(3).estado());
        assertEquals(DocumentoEstadoFilter.PERMANENTE, capturados.get(4).estado());

        for (ActivoDocumentoSearchCriteria criteria : capturados) {
            assertEquals(activoId, criteria.activoId());
            assertEquals(tipoDocumentoId, criteria.tipoDocumentoId());
            assertEquals("factura", criteria.query());
        }
        for (int i = 1; i < capturados.size(); i++) {
            assertNotNull(capturados.get(i).fechaReferencia());
        }
    }
}
