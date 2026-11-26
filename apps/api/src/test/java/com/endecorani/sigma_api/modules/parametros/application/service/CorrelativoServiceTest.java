package com.endecorani.sigma_api.modules.parametros.application.service;

import com.endecorani.sigma_api.modules.parametros.application.dto.request.CorrelativoRequest;
import com.endecorani.sigma_api.modules.parametros.domain.constant.CorrelativoCodigo;
import com.endecorani.sigma_api.modules.parametros.domain.model.Correlativo;
import com.endecorani.sigma_api.modules.parametros.domain.repository.CorrelativoRepository;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CorrelativoServiceTest {

    @Mock
    private CorrelativoRepository repository;

    @InjectMocks
    private CorrelativoService service;

    @Test
    void generar_cuandoYaExiste_debeIncrementarLaFilaBloqueadaSinInsertar() {
        Correlativo existente = correlativo(41, "SAL", CorrelativoCodigo.SALIDA_VEHICULAR, 4);
        when(repository.findForUpdate(CorrelativoCodigo.SALIDA_VEHICULAR, 2026))
                .thenReturn(Optional.of(existente));

        String numero = service.generar(CorrelativoCodigo.SALIDA_VEHICULAR, 2026);

        assertEquals("SAL-2026-0042", numero);
        verify(repository, never()).insertIfAbsent(any());
        verify(repository).save(argThat(c -> c.getUltimoNumero() == 42));
    }

    @Test
    void generar_cuandoOtroHiloGanaLaInsercion_debeReleerYUsarLaFilaCreada() {
        Correlativo ganador = correlativo(0, "SAL", CorrelativoCodigo.SALIDA_VEHICULAR, 4);
        when(repository.findForUpdate(CorrelativoCodigo.SALIDA_VEHICULAR, 2026))
                .thenReturn(Optional.empty(), Optional.of(ganador));
        when(repository.insertIfAbsent(any())).thenReturn(0);

        String numero = service.generar(CorrelativoCodigo.SALIDA_VEHICULAR, 2026);

        assertEquals("SAL-2026-0001", numero);
        ArgumentCaptor<Correlativo> captor = ArgumentCaptor.forClass(Correlativo.class);
        verify(repository).insertIfAbsent(captor.capture());
        assertEquals(0, captor.getValue().getUltimoNumero());
        assertEquals("SAL", captor.getValue().getPrefijo());
        assertEquals(4, captor.getValue().getLongitud());
        verify(repository, times(2)).findForUpdate(CorrelativoCodigo.SALIDA_VEHICULAR, 2026);
    }

    @Test
    void generar_cuandoInicializaCorrectamente_debeInsertarAtomicamenteYGenerarPrimerNumero() {
        Correlativo creado = correlativo(0, "ACT", CorrelativoCodigo.ACTIVO, 5);
        when(repository.findForUpdate(CorrelativoCodigo.ACTIVO, 2026))
                .thenReturn(Optional.empty(), Optional.of(creado));
        when(repository.insertIfAbsent(any())).thenReturn(1);

        String numero = service.generar(CorrelativoCodigo.ACTIVO, 2026);

        assertEquals("ACT-2026-00001", numero);
        verify(repository).insertIfAbsent(argThat(c ->
                CorrelativoCodigo.ACTIVO.equals(c.getCodigo()) && 5 == c.getLongitud()));
    }

    @Test
    void generar_cuandoNoExisteTrasInsertar_debeLanzarIllegalStateExceptionSinGuardar() {
        when(repository.findForUpdate(CorrelativoCodigo.ORDEN_TRABAJO, 2026))
                .thenReturn(Optional.empty(), Optional.empty());
        when(repository.insertIfAbsent(any())).thenReturn(1);

        assertThrows(IllegalStateException.class,
                () -> service.generar(CorrelativoCodigo.ORDEN_TRABAJO, 2026));
        verify(repository, never()).save(any());
    }

    @Test
    void crear_cuandoYaExiste_debeLanzarExcepcionControladaNoIllegalState() {
        when(repository.existsByCodigoAndGestion("ACTIVO", 2026)).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> service.crear(new CorrelativoRequest("ACTIVO", 2026, "ACT", 5)));
    }

    @Test
    void obtener_cuandoNoExiste_debeLanzarResourceNotFoundException() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> service.obtener(id));
        assertTrue(ex.getMessage().contains(id.toString()));
    }

    private Correlativo correlativo(int ultimoNumero, String prefijo, String codigo, int longitud) {
        return Correlativo.builder()
                .id(UUID.randomUUID())
                .codigo(codigo)
                .gestion(2026)
                .ultimoNumero(ultimoNumero)
                .prefijo(prefijo)
                .longitud(longitud)
                .build();
    }
}
