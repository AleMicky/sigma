package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.request.ActivoRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.modules.parametros.domain.model.Ubicacion;
import com.endecorani.sigma_api.modules.parametros.domain.repository.UbicacionRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.storage.ImageStorageService;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActivoServiceTest {

    @Mock
    private ActivoRepository activoRepository;

    @Mock
    private TipoActivoRepository tipoActivoRepository;

    @Mock
    private UbicacionRepository ubicacionRepository;

    @Mock
    private ImageStorageService imageStorageService;

    @InjectMocks
    private ActivoService service;

    private UUID activoId;
    private UUID tipoActivoId;
    private UUID ubicacionId;
    private Activo activoDomain;
    private TipoActivo tipoActivoDomain;
    private Ubicacion ubicacionDomain;

    @BeforeEach
    void setUp() {
        activoId = UUID.randomUUID();
        tipoActivoId = UUID.randomUUID();
        ubicacionId = UUID.randomUUID();

        activoDomain = Activo.builder()
                .id(activoId)
                .codigo("ACT-001")
                .nombre("Camioneta Toyota")
                .descripcion("Vehículo de campo")
                .tipoActivoId(tipoActivoId)
                .ubicacionId(ubicacionId)
                .fechaAdquisicion(LocalDate.now().minusMonths(6))
                .activo(true)
                .build();

        tipoActivoDomain = TipoActivo.builder()
                .id(tipoActivoId)
                .nombre("Vehículo")
                .descripcion("Vehículos livianos")
                .build();

        ubicacionDomain = Ubicacion.builder()
                .id(ubicacionId)
                .codigo("UB-01")
                .nombre("Planta Central")
                .build();
    }

    @Test
    @DisplayName("Debe listar activos con paginación y resolver relaciones en batch sin N+1")
    void debeListarActivosEnBatch() {
        PageRequestDto pageRequest = new PageRequestDto();
        when(activoRepository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(activoDomain)));
        when(tipoActivoRepository.findAllById(any())).thenReturn(List.of(tipoActivoDomain));
        when(ubicacionRepository.findAllById(any())).thenReturn(List.of(ubicacionDomain));

        PageResponse<ActivoResponse> response = service.findAll(null, pageRequest);

        assertNotNull(response);
        assertEquals(1, response.content().size());
        assertEquals("ACT-001", response.content().get(0).codigo());
        assertNotNull(response.content().get(0).tipoActivo());
        assertEquals("Vehículo", response.content().get(0).tipoActivo().nombre());
        assertNotNull(response.content().get(0).ubicacion());
        assertEquals("Planta Central", response.content().get(0).ubicacion().nombre());

        // Verificar que solo se invocó findAllById una vez por tipo/ubicación para toda la página
        verify(tipoActivoRepository, times(1)).findAllById(any());
        verify(ubicacionRepository, times(1)).findAllById(any());
        verify(tipoActivoRepository, never()).findById(any());
        verify(ubicacionRepository, never()).findById(any());
    }

    @Test
    @DisplayName("Debe crear un activo correctamente cuando no existe duplicado")
    void debeCrearActivoCorrectamente() {
        ActivoRequest request = new ActivoRequest(
                "ACT-001",
                "Camioneta Toyota",
                "Vehículo de campo",
                tipoActivoId,
                ubicacionId,
                LocalDate.now().minusMonths(6),
                true
        );

        when(tipoActivoRepository.existsById(tipoActivoId)).thenReturn(true);
        when(ubicacionRepository.existsById(ubicacionId)).thenReturn(true);
        when(activoRepository.existsByCodigoIgnoreCase("ACT-001")).thenReturn(false);
        when(activoRepository.save(any(Activo.class))).thenReturn(activoDomain);
        when(tipoActivoRepository.findById(tipoActivoId)).thenReturn(Optional.of(tipoActivoDomain));
        when(ubicacionRepository.findById(ubicacionId)).thenReturn(Optional.of(ubicacionDomain));

        ActivoResponse response = service.create(request);

        assertNotNull(response);
        assertEquals("ACT-001", response.codigo());
        assertEquals("Camioneta Toyota", response.nombre());
    }

    @Test
    @DisplayName("Debe lanzar ConflictException si ya existe un activo con el mismo código")
    void debeLanzarConflictExceptionSiCodigoDuplicado() {
        ActivoRequest request = new ActivoRequest(
                "ACT-001",
                "Camioneta Toyota",
                "Vehículo de campo",
                tipoActivoId,
                ubicacionId,
                LocalDate.now().minusMonths(6),
                true
        );

        when(tipoActivoRepository.existsById(tipoActivoId)).thenReturn(true);
        when(ubicacionRepository.existsById(ubicacionId)).thenReturn(true);
        when(activoRepository.existsByCodigoIgnoreCase("ACT-001")).thenReturn(true);

        assertThrows(ConflictException.class, () -> service.create(request));
        verify(activoRepository, never()).save(any());
    }
}
