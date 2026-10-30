package com.endecorani.sigma_api.modules.mantenimientos.application.listener;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.event.VehiculoKilometrajeRegistradoEvent;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.EvaluacionProgramacionResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.ProgramacionMantenimientoService;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProgramacionMantenimientoEventListenerTest {

    @Mock
    private ProgramacionMantenimientoService programacionMantenimientoService;

    @InjectMocks
    private ProgramacionMantenimientoEventListener eventListener;

    @Test
    @DisplayName("Debe actualizar telemetría y evaluar preventivo al recibir VehiculoKilometrajeRegistradoEvent")
    void debeActualizarTelemetriaYEvaluarPreventivo() {
        UUID activoId = UUID.randomUUID();
        Long kilometraje = 52000L;
        VehiculoKilometrajeRegistradoEvent event = new VehiculoKilometrajeRegistradoEvent(
                activoId,
                kilometraje,
                "VIAJE_VEHICULAR_RETORNO"
        );

        EvaluacionProgramacionResponse evalResponse = new EvaluacionProgramacionResponse(
                UUID.randomUUID(),
                true,
                TipoCriterioMantenimiento.KILOMETRAJE,
                "Kilometraje límite alcanzado (52000 km >= 50000 km)",
                true,
                false,
                UUID.randomUUID(),
                "SOL-2026-0001",
                "Mantenimiento preventivo generado"
        );

        when(programacionMantenimientoService.evaluarPorActivo(activoId))
                .thenReturn(List.of(evalResponse));

        eventListener.onVehiculoKilometrajeRegistrado(event);

        verify(programacionMantenimientoService, times(1))
                .actualizarTelemetriaActivo(activoId, BigDecimal.valueOf(kilometraje), null);
        verify(programacionMantenimientoService, times(1))
                .evaluarPorActivo(activoId);
    }

    @Test
    @DisplayName("Debe ignorar evento nulo o con datos incompletos")
    void debeIgnorarEventoInvalido() {
        eventListener.onVehiculoKilometrajeRegistrado(null);
        eventListener.onVehiculoKilometrajeRegistrado(new VehiculoKilometrajeRegistradoEvent(null, 50000L, "TEST"));
        eventListener.onVehiculoKilometrajeRegistrado(new VehiculoKilometrajeRegistradoEvent(UUID.randomUUID(), null, "TEST"));

        verifyNoInteractions(programacionMantenimientoService);
    }
}

