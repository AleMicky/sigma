package com.endecorani.sigma_api.modules.cuestionarios.application.listener;

import com.endecorani.sigma_api.modules.cuestionarios.application.service.CuestionarioAsignacionService;
import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EventoDisparadorCuestionario;
import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.ModuloOrigenCuestionario;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.event.SolicitudVehicularFinalizadaEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CuestionarioEventoListener {

    private static final String ENTIDAD_SOLICITUD_VEHICULAR = "SOLICITUD_VEHICULAR";
    private static final String EVALUADO_TIPO_CONDUCTOR = "CONDUCTOR";

    private final CuestionarioAsignacionService asignacionService;

    @EventListener
    public void onSolicitudVehicularFinalizada(SolicitudVehicularFinalizadaEvent event) {
        if (event == null || event.solicitudId() == null || event.solicitanteId() == null) {
            return;
        }

        try {
            asignacionService.crearAsignacionSiExistePublicado(
                    ModuloOrigenCuestionario.GESTION_VEHICULAR.name(),
                    ENTIDAD_SOLICITUD_VEHICULAR,
                    EventoDisparadorCuestionario.AL_FINALIZAR.name(),
                    event.solicitudId(),
                    event.numeroSolicitud(),
                    event.conductorId() != null ? EVALUADO_TIPO_CONDUCTOR : null,
                    event.conductorId(),
                    event.conductorNombre(),
                    event.solicitanteId()
            );
        } catch (Exception ex) {
            log.error(
                    "Error al habilitar cuestionario para solicitud vehicular finalizada {}: {}",
                    event.solicitudId(),
                    ex.getMessage(),
                    ex
            );
        }
    }
}
