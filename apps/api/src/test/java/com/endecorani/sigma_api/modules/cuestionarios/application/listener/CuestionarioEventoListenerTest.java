package com.endecorani.sigma_api.modules.cuestionarios.application.listener;

import com.endecorani.sigma_api.modules.cuestionarios.application.service.CuestionarioAsignacionService;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.event.SolicitudVehicularFinalizadaEvent;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CuestionarioEventoListenerTest {

    @Mock
    private CuestionarioAsignacionService asignacionService;

    @InjectMocks
    private CuestionarioEventoListener listener;

    @Test
    void onSolicitudVehicularFinalizada_invocaCrearAsignacionConParametrosExactos() {
        UUID solicitudId = UUID.randomUUID();
        UUID solicitanteId = UUID.randomUUID();
        UUID conductorId = UUID.randomUUID();

        SolicitudVehicularFinalizadaEvent event = new SolicitudVehicularFinalizadaEvent(
                solicitudId, "SOL-2026-001", solicitanteId, conductorId, "Carlos Mamani"
        );
        when(asignacionService.crearAsignacionSiExistePublicado(
                "GESTION_VEHICULAR",
                "SOLICITUD_VEHICULAR",
                "AL_FINALIZAR",
                solicitudId,
                "SOL-2026-001",
                "CONDUCTOR",
                conductorId,
                "Carlos Mamani",
                solicitanteId
        )).thenReturn(Optional.empty());

        listener.onSolicitudVehicularFinalizada(event);

        verify(asignacionService).crearAsignacionSiExistePublicado(
                "GESTION_VEHICULAR",
                "SOLICITUD_VEHICULAR",
                "AL_FINALIZAR",
                solicitudId,
                "SOL-2026-001",
                "CONDUCTOR",
                conductorId,
                "Carlos Mamani",
                solicitanteId
        );
    }

    @Test
    void onSolicitudVehicularFinalizada_siServicioFalla_noPropagaExcepcion() {
        SolicitudVehicularFinalizadaEvent event = new SolicitudVehicularFinalizadaEvent(
                UUID.randomUUID(), "SOL-2026-002", UUID.randomUUID(), UUID.randomUUID(), "Conductor"
        );
        when(asignacionService.crearAsignacionSiExistePublicado(
                any(), any(), any(), any(), any(), any(), any(), any(), any()
        )).thenThrow(new RuntimeException("Fallo simulado"));

        assertDoesNotThrow(() -> listener.onSolicitudVehicularFinalizada(event));
    }

    @Test
    void onSolicitudVehicularFinalizada_eventoIncompleto_ignoraSinInvocarServicio() {
        listener.onSolicitudVehicularFinalizada(null);
        listener.onSolicitudVehicularFinalizada(new SolicitudVehicularFinalizadaEvent(
                UUID.randomUUID(), "SOL-1", null, UUID.randomUUID(), "Conductor"
        ));

        verifyNoInteractions(asignacionService);
    }
}
