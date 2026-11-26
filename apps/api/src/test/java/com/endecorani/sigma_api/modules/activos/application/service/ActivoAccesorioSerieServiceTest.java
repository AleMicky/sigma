package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.request.ActivoAccesorioRequest;
import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAccesorio;
import com.endecorani.sigma_api.modules.activos.domain.repository.AccesorioRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoAccesorioRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActivoAccesorioSerieServiceTest {

    @Mock
    private ActivoAccesorioRepository activoAccesorioRepository;
    @Mock
    private ActivoRepository activoRepository;
    @Mock
    private AccesorioRepository accesorioRepository;

    @InjectMocks
    private ActivoAccesorioService service;

    @Test
    void create_conSerieDuplicadaIgnorandoMayusculasYEspacios_devuelve409() {
        UUID activoId = UUID.randomUUID();
        UUID accesorioId = UUID.randomUUID();
        allowCreate(activoId, accesorioId);
        when(activoAccesorioRepository.existsByAccesorioIdAndNumeroSerie(accesorioId, "SN-123"))
                .thenReturn(true);

        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> service.create(request(activoId, accesorioId, "  sn-123  "))
        );

        assertEquals("ACTIVO_ACCESORIO_NUMERO_SERIE_DUPLICADO", exception.getCode());
        verify(activoAccesorioRepository, never()).save(any());
    }

    @Test
    void update_conSerieDuplicadaEnOtroRegistro_devuelve409() {
        UUID id = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();
        UUID accesorioId = UUID.randomUUID();
        when(activoRepository.existsById(activoId)).thenReturn(true);
        when(accesorioRepository.existsById(accesorioId)).thenReturn(true);
        when(activoAccesorioRepository.findById(id))
                .thenReturn(Optional.of(ActivoAccesorio.builder().id(id).build()));
        when(activoAccesorioRepository.existsByActivoIdAndAccesorioIdAndIdNot(
                activoId, accesorioId, id)).thenReturn(false);
        when(activoAccesorioRepository.existsByAccesorioIdAndNumeroSerieAndIdNot(
                accesorioId, "SN-456", id)).thenReturn(true);

        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> service.update(id, request(activoId, accesorioId, "sn-456"))
        );

        assertEquals("ACTIVO_ACCESORIO_NUMERO_SERIE_DUPLICADO", exception.getCode());
        verify(activoAccesorioRepository, never()).save(any());
    }

    @Test
    void create_sinNumeroSerie_noConsultaUnicidadYGuarda() {
        UUID activoId = UUID.randomUUID();
        UUID accesorioId = UUID.randomUUID();
        allowCreate(activoId, accesorioId);
        when(activoAccesorioRepository.save(any(ActivoAccesorio.class)))
                .thenAnswer(invocation -> {
                    ActivoAccesorio domain = invocation.getArgument(0);
                    domain.setId(UUID.randomUUID());
                    return domain;
                });

        assertNotNull(service.create(request(activoId, accesorioId, "   ")));

        verify(activoAccesorioRepository, never())
                .existsByAccesorioIdAndNumeroSerie(any(), any());
        verify(activoAccesorioRepository).save(any(ActivoAccesorio.class));
    }

    private void allowCreate(UUID activoId, UUID accesorioId) {
        when(activoRepository.existsById(activoId)).thenReturn(true);
        when(accesorioRepository.existsById(accesorioId)).thenReturn(true);
        when(activoAccesorioRepository.existsByActivoIdAndAccesorioId(activoId, accesorioId))
                .thenReturn(false);
    }

    private static ActivoAccesorioRequest request(
            UUID activoId,
            UUID accesorioId,
            String numeroSerie
    ) {
        return new ActivoAccesorioRequest(activoId, accesorioId, 1, numeroSerie, null);
    }
}
