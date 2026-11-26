package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.request.ActivoAsignacionRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoAsignacionResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAsignacion;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoAsignacionRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.InOrder;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActivoAsignacionServiceTest {

    private static final LocalDateTime INICIO = LocalDateTime.of(2026, 1, 10, 8, 0);
    private static final LocalDateTime FIN = LocalDateTime.of(2026, 3, 10, 8, 0);

    @Mock
    private ActivoAsignacionRepository repository;
    @Mock
    private ActivoRepository activoRepository;

    @InjectMocks
    private ActivoAsignacionService service;

    @Test
    void create_conEmpleado_cierraAsignacionAbiertaPreviaYGuardaLaNueva() {
        UUID activoId = UUID.randomUUID();
        UUID empleadoId = UUID.randomUUID();
        UUID previaId = UUID.randomUUID();
        ActivoAsignacion previa = ActivoAsignacion.builder()
                .id(previaId)
                .activoId(activoId)
                .empleadoId(UUID.randomUUID())
                .fechaAsignacion(INICIO.minusDays(30))
                .build();

        when(activoRepository.existsById(activoId)).thenReturn(true);
        when(repository.findOpenByActivoId(activoId)).thenReturn(Optional.of(previa));
        when(repository.existsOverlappingByActivoId(activoId, INICIO, null, null)).thenReturn(false);
        when(repository.save(any(ActivoAsignacion.class))).thenAnswer(inv -> inv.getArgument(0));

        ActivoAsignacionResponse response = service.create(request(activoId, empleadoId, null, INICIO, null));

        assertEquals(empleadoId, response.empleadoId());
        assertEquals(INICIO, previa.getFechaDevolucion(), "La abierta previa debe cerrarse al inicio de la nueva");

        InOrder inOrder = inOrder(repository);
        inOrder.verify(repository).save(previa);
        ArgumentCaptor<ActivoAsignacion> nueva = ArgumentCaptor.forClass(ActivoAsignacion.class);
        inOrder.verify(repository).save(nueva.capture());
        assertEquals(activoId, nueva.getValue().getActivoId());
        assertNull(nueva.getValue().getFechaDevolucion());
        verify(repository).existsOverlappingByActivoId(activoId, INICIO, null, null);
    }

    @Test
    void create_conAreaSinEmpleado_esValida() {
        UUID activoId = UUID.randomUUID();
        UUID areaId = UUID.randomUUID();

        when(activoRepository.existsById(activoId)).thenReturn(true);
        when(repository.findOpenByActivoId(activoId)).thenReturn(Optional.empty());
        when(repository.existsOverlappingByActivoId(activoId, INICIO, FIN, null)).thenReturn(false);
        when(repository.save(any(ActivoAsignacion.class))).thenAnswer(inv -> inv.getArgument(0));

        ActivoAsignacionResponse response = service.create(request(activoId, null, areaId, INICIO, FIN));

        assertEquals(areaId, response.areaId());
        assertEquals(FIN, response.fechaDevolucion());
        verify(repository, never()).findById(any());
    }

    @Test
    void create_conEmpleadoYArea_lanzaBusinessRuleDeDestinatario() {
        UUID activoId = UUID.randomUUID();
        ActivoAsignacionRequest request = request(
                activoId, UUID.randomUUID(), UUID.randomUUID(), INICIO, null);

        BusinessException exception = assertThrows(
                BusinessException.class, () -> service.create(request));

        assertEquals("ASIGNACION_DESTINATARIO_INVALIDO", exception.getCode());
        verifyNoInteractions(repository, activoRepository);
    }

    @Test
    void create_sinEmpleadoNiArea_lanzaBusinessRuleDeDestinatario() {
        ActivoAsignacionRequest request = request(UUID.randomUUID(), null, null, INICIO, null);

        BusinessException exception = assertThrows(
                BusinessException.class, () -> service.create(request));

        assertEquals("ASIGNACION_DESTINATARIO_INVALIDO", exception.getCode());
        verifyNoInteractions(repository, activoRepository);
    }

    @Test
    void create_conDevolucionAnteriorAlInicio_lanzaBusinessRuleDeFechas() {
        UUID activoId = UUID.randomUUID();
        ActivoAsignacionRequest request = request(
                activoId, UUID.randomUUID(), null, INICIO, INICIO.minusMinutes(1));

        BusinessException exception = assertThrows(
                BusinessException.class, () -> service.create(request));

        assertEquals("ASIGNACION_FECHAS_INVALIDAS", exception.getCode());
        verifyNoInteractions(repository, activoRepository);
    }

    @Test
    void create_conPeriodoSolapado_lanzaBusinessRuleYNoGuarda() {
        UUID activoId = UUID.randomUUID();
        ActivoAsignacionRequest request = request(
                activoId, UUID.randomUUID(), null, INICIO, FIN);

        when(activoRepository.existsById(activoId)).thenReturn(true);
        when(repository.findOpenByActivoId(activoId)).thenReturn(Optional.empty());
        when(repository.existsOverlappingByActivoId(activoId, INICIO, FIN, null)).thenReturn(true);

        BusinessException exception = assertThrows(
                BusinessException.class, () -> service.create(request));

        assertEquals("ASIGNACION_FECHAS_SOLAPADAS", exception.getCode());
        verify(repository, never()).save(any(ActivoAsignacion.class));
    }

    @Test
    void create_conFechasContiguasNoSolapa() {
        UUID activoId = UUID.randomUUID();
        ActivoAsignacion previa = ActivoAsignacion.builder()
                .id(UUID.randomUUID())
                .activoId(activoId)
                .empleadoId(UUID.randomUUID())
                .fechaAsignacion(INICIO.minusDays(5))
                .fechaDevolucion(INICIO)
                .build();

        when(activoRepository.existsById(activoId)).thenReturn(true);
        when(repository.findOpenByActivoId(activoId)).thenReturn(Optional.empty());
        when(repository.existsOverlappingByActivoId(activoId, INICIO, FIN, null)).thenReturn(false);
        when(repository.save(any(ActivoAsignacion.class))).thenAnswer(inv -> inv.getArgument(0));

        ActivoAsignacionResponse response = service.create(request(
                activoId, UUID.randomUUID(), null, INICIO, FIN));

        assertEquals(INICIO, response.fechaAsignacion());
        assertEquals(INICIO, previa.getFechaDevolucion(), "No se debe modificar una asignación ya cerrada");
    }

    @Test
    void update_excluyePropioIdDeLaComprobacionDeSolapes() {
        UUID id = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();
        ActivoAsignacion existente = ActivoAsignacion.builder()
                .id(id)
                .activoId(activoId)
                .empleadoId(UUID.randomUUID())
                .fechaAsignacion(INICIO)
                .fechaDevolucion(FIN)
                .build();

        when(repository.findById(id)).thenReturn(Optional.of(existente));
        when(activoRepository.existsById(activoId)).thenReturn(true);
        when(repository.findOpenByActivoId(activoId)).thenReturn(Optional.empty());
        when(repository.existsOverlappingByActivoId(activoId, INICIO, FIN, id)).thenReturn(false);
        when(repository.save(any(ActivoAsignacion.class))).thenAnswer(inv -> inv.getArgument(0));

        ActivoAsignacionResponse response = service.update(id, request(
                activoId, UUID.randomUUID(), null, INICIO, FIN));

        assertEquals(FIN, response.fechaDevolucion());
        verify(repository).existsOverlappingByActivoId(activoId, INICIO, FIN, id);
    }

    @Test
    void update_cierraOtraAsignacionAbiertaDelMismoActivo() {
        UUID id = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();
        ActivoAsignacion existente = ActivoAsignacion.builder()
                .id(id)
                .activoId(activoId)
                .empleadoId(UUID.randomUUID())
                .fechaAsignacion(INICIO.minusDays(10))
                .fechaDevolucion(INICIO.minusDays(1))
                .build();
        ActivoAsignacion otraAbierta = ActivoAsignacion.builder()
                .id(UUID.randomUUID())
                .activoId(activoId)
                .empleadoId(UUID.randomUUID())
                .fechaAsignacion(INICIO.minusHours(2))
                .build();

        when(repository.findById(id)).thenReturn(Optional.of(existente));
        when(activoRepository.existsById(activoId)).thenReturn(true);
        when(repository.findOpenByActivoId(activoId)).thenReturn(Optional.of(otraAbierta));
        when(repository.existsOverlappingByActivoId(activoId, INICIO, null, id)).thenReturn(false);
        when(repository.save(any(ActivoAsignacion.class))).thenAnswer(inv -> inv.getArgument(0));

        service.update(id, request(activoId, UUID.randomUUID(), null, INICIO, null));

        assertEquals(INICIO, otraAbierta.getFechaDevolucion());
        verify(repository).save(otraAbierta);
        verify(repository).save(existente);
    }

    @Test
    void create_conActivoInexistente_lanzaNotFound() {
        UUID activoId = UUID.randomUUID();
        when(activoRepository.existsById(activoId)).thenReturn(false);

        assertThrows(com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException.class,
                () -> service.create(request(activoId, UUID.randomUUID(), null, INICIO, null)));

        verifyNoInteractions(repository);
    }

    private static ActivoAsignacionRequest request(
            UUID activoId,
            UUID empleadoId,
            UUID areaId,
            LocalDateTime fechaAsignacion,
            LocalDateTime fechaDevolucion
    ) {
        return new ActivoAsignacionRequest(
                activoId, empleadoId, areaId, fechaAsignacion, fechaDevolucion, null, null);
    }
}
