package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.request.ActivoRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.request.CambiarEstadoOperativoRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.model.EstadoOperativo;
import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivoEstado;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.CategoriaRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.EstadoOperativoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoEstadoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.modules.parametros.domain.repository.UbicacionRepository;
import com.endecorani.sigma_api.shared.application.storage.ImageStorageService;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActivoServiceEstadoOperativoTest {

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
    void create_sinEstado_usaElPredeterminadoDelTipoYNoHardcodeaOperativo() {
        UUID tipoId = UUID.randomUUID();
        UUID estadoPredeterminadoId = UUID.randomUUID();

        when(tipoActivoRepository.existsById(tipoId)).thenReturn(true);
        when(activoRepository.existsByCodigoIgnoreCase("ACT-001")).thenReturn(false);
        when(tipoActivoEstadoRepository.findByTipoActivoIdAndPredeterminadoTrue(tipoId))
                .thenReturn(Optional.of(TipoActivoEstado.builder()
                        .tipoActivoId(tipoId)
                        .estadoOperativoId(estadoPredeterminadoId)
                        .predeterminado(true)
                        .build()));
        when(activoRepository.save(any(Activo.class))).thenAnswer(inv -> inv.getArgument(0));

        service.create(request(tipoId, null));

        ArgumentCaptor<Activo> guardado = ArgumentCaptor.forClass(Activo.class);
        verify(activoRepository).save(guardado.capture());
        assertEquals(estadoPredeterminadoId, guardado.getValue().getEstadoOperativoId());
        verify(estadoOperativoRepository, never()).findByCodigoIgnoreCase(any());
    }

    @Test
    void create_conEstadoPertenecienteAlTipo_loGuarda() {
        UUID tipoId = UUID.randomUUID();
        UUID estadoId = UUID.randomUUID();

        when(tipoActivoRepository.existsById(tipoId)).thenReturn(true);
        when(activoRepository.existsByCodigoIgnoreCase("ACT-001")).thenReturn(false);
        when(tipoActivoEstadoRepository.existsByTipoActivoIdAndEstadoOperativoId(tipoId, estadoId))
                .thenReturn(true);
        when(activoRepository.save(any(Activo.class))).thenAnswer(inv -> inv.getArgument(0));

        ActivoResponse response = service.create(request(tipoId, estadoId));

        ArgumentCaptor<Activo> guardado = ArgumentCaptor.forClass(Activo.class);
        verify(activoRepository).save(guardado.capture());
        assertEquals(estadoId, guardado.getValue().getEstadoOperativoId());
        assertNotNull(response);
        verify(tipoActivoEstadoRepository, never()).findByTipoActivoIdAndPredeterminadoTrue(any());
    }

    @Test
    void create_conEstadoDeOtroTipo_lanzaBusinessException422() {
        UUID tipoId = UUID.randomUUID();
        UUID estadoAjeno = UUID.randomUUID();

        when(tipoActivoRepository.existsById(tipoId)).thenReturn(true);
        when(activoRepository.existsByCodigoIgnoreCase("ACT-001")).thenReturn(false);
        when(tipoActivoEstadoRepository.existsByTipoActivoIdAndEstadoOperativoId(tipoId, estadoAjeno))
                .thenReturn(false);

        BusinessException exception = assertThrows(
                BusinessException.class, () -> service.create(request(tipoId, estadoAjeno)));

        assertEquals("ESTADO_OPERATIVO_NO_PERMITIDO_PARA_TIPO", exception.getCode());
        verify(activoRepository, never()).save(any(Activo.class));
    }

    @Test
    void create_sinPredeterminadoConfigurado_lanzaBusinessException422() {
        UUID tipoId = UUID.randomUUID();

        when(tipoActivoRepository.existsById(tipoId)).thenReturn(true);
        when(activoRepository.existsByCodigoIgnoreCase("ACT-001")).thenReturn(false);
        when(tipoActivoEstadoRepository.findByTipoActivoIdAndPredeterminadoTrue(tipoId))
                .thenReturn(Optional.empty());

        BusinessException exception = assertThrows(
                BusinessException.class, () -> service.create(request(tipoId, null)));

        assertEquals("ESTADO_OPERATIVO_PREDETERMINADO_NO_CONFIGURADO", exception.getCode());
        verify(activoRepository, never()).save(any(Activo.class));
    }

    @Test
    void update_cambiaTipoConEstadoExplicitoNoPerteneciente_lanzaBusinessException422() {
        UUID id = UUID.randomUUID();
        UUID tipoActual = UUID.randomUUID();
        UUID tipoNuevo = UUID.randomUUID();
        UUID estadoInvalido = UUID.randomUUID();
        Activo existente = activo(id, tipoActual, UUID.randomUUID());

        when(tipoActivoRepository.existsById(tipoNuevo)).thenReturn(true);
        when(activoRepository.findById(id)).thenReturn(Optional.of(existente));
        when(activoRepository.existsByCodigoIgnoreCaseAndIdNot("ACT-001", id)).thenReturn(false);
        when(tipoActivoEstadoRepository.existsByTipoActivoIdAndEstadoOperativoId(tipoNuevo, estadoInvalido))
                .thenReturn(false);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.update(id, request(tipoNuevo, estadoInvalido)));

        assertEquals("ESTADO_OPERATIVO_NO_PERMITIDO_PARA_TIPO", exception.getCode());
        verify(activoRepository, never()).save(any(Activo.class));
    }

    @Test
    void update_cambiaTipoSinEstadoAsignadoUsaElPredeterminadoDelNuevoTipo() {
        UUID id = UUID.randomUUID();
        UUID tipoActual = UUID.randomUUID();
        UUID tipoNuevo = UUID.randomUUID();
        UUID estadoViejo = UUID.randomUUID();
        UUID estadoNuevo = UUID.randomUUID();
        Activo existente = activo(id, tipoActual, estadoViejo);

        when(tipoActivoRepository.existsById(tipoNuevo)).thenReturn(true);
        when(activoRepository.findById(id)).thenReturn(Optional.of(existente));
        when(activoRepository.existsByCodigoIgnoreCaseAndIdNot("ACT-001", id)).thenReturn(false);
        when(tipoActivoEstadoRepository.findByTipoActivoIdAndPredeterminadoTrue(tipoNuevo))
                .thenReturn(Optional.of(TipoActivoEstado.builder()
                        .tipoActivoId(tipoNuevo)
                        .estadoOperativoId(estadoNuevo)
                        .predeterminado(true)
                        .build()));
        when(activoRepository.save(any(Activo.class))).thenAnswer(inv -> inv.getArgument(0));

        service.update(id, request(tipoNuevo, null));

        assertEquals(estadoNuevo, existente.getEstadoOperativoId());
    }

    @Test
    void cambiarEstadoOperativo_estadoNoDelTipo_lanzaBusinessException422() {
        UUID id = UUID.randomUUID();
        UUID tipoId = UUID.randomUUID();
        UUID estadoId = UUID.randomUUID();
        Activo existente = activo(id, tipoId, UUID.randomUUID());

        when(activoRepository.findById(id)).thenReturn(Optional.of(existente));
        when(estadoOperativoRepository.findById(estadoId))
                .thenReturn(Optional.of(estado(estadoId, "MANTENIMIENTO")));
        when(tipoActivoEstadoRepository.existsByTipoActivoIdAndEstadoOperativoId(tipoId, estadoId))
                .thenReturn(false);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.cambiarEstadoOperativo(
                        id, new CambiarEstadoOperativoRequest(estadoId, null, null)));

        assertEquals("ESTADO_OPERATIVO_NO_PERMITIDO_PARA_TIPO", exception.getCode());
        verify(activoRepository, never()).save(any(Activo.class));
    }

    @Test
    void cambiarEstadoOperativo_porCodigoPertenecienteAlTipo_actualiza() {
        UUID id = UUID.randomUUID();
        UUID tipoId = UUID.randomUUID();
        UUID estadoId = UUID.randomUUID();
        Activo existente = activo(id, tipoId, UUID.randomUUID());

        when(activoRepository.findById(id)).thenReturn(Optional.of(existente));
        when(estadoOperativoRepository.findByCodigoIgnoreCase("MANTENIMIENTO"))
                .thenReturn(Optional.of(estado(estadoId, "MANTENIMIENTO")));
        when(tipoActivoEstadoRepository.existsByTipoActivoIdAndEstadoOperativoId(tipoId, estadoId))
                .thenReturn(true);
        when(activoRepository.save(any(Activo.class))).thenAnswer(inv -> inv.getArgument(0));

        ActivoResponse response = service.cambiarEstadoOperativo(
                id, new CambiarEstadoOperativoRequest(null, "MANTENIMIENTO", null));

        assertEquals(estadoId, existente.getEstadoOperativoId());
        assertNotNull(response);
    }

    private static ActivoRequest request(UUID tipoId, UUID estadoOperativoId) {
        return new ActivoRequest(
                "ACT-001", null, "ACT-001", "Activo de prueba", tipoId, null,
                LocalDate.of(2026, 1, 1), true, estadoOperativoId);
    }

    private static Activo activo(UUID id, UUID tipoId, UUID estadoOperativoId) {
        return Activo.builder()
                .id(id)
                .codigo("ACT-001")
                .nombre("Activo de prueba")
                .tipoActivoId(tipoId)
                .estadoOperativoId(estadoOperativoId)
                .activo(true)
                .build();
    }

    private static EstadoOperativo estado(UUID id, String codigo) {
        return EstadoOperativo.builder()
                .id(id)
                .codigo(codigo)
                .nombre(codigo)
                .build();
    }
}
