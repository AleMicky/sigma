package com.endecorani.sigma_api.modules.mantenimientos.application.listener;

import java.math.BigDecimal;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.event.VehiculoKilometrajeRegistradoEvent;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.ProgramacionMantenimientoService;
import com.endecorani.sigma_api.modules.mantenimientos.domain.event.SolicitudMantenimientoEstadoCambiadoEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProgramacionMantenimientoEventListener {

    private final ProgramacionMantenimientoService programacionMantenimientoService;

    @EventListener
    public void onSolicitudEstadoCambiado(SolicitudMantenimientoEstadoCambiadoEvent event) {
        if (event == null || event.solicitudId() == null || event.nuevoEstado() == null) {
            return;
        }

        String estado = event.nuevoEstado().trim().toUpperCase();
        if (isEstadoFinalizacionMantenimiento(estado)) {
            log.info("Solicitud {} alcanzó estado de culminación ({}). Sincronizando criterios de programación preventiva...",
                    event.solicitudId(), estado);
            try {
                programacionMantenimientoService.sincronizarFinMantenimientoPorSolicitud(
                        event.solicitudId(),
                        event.activoId()
                );
            } catch (Exception e) {
                log.error("Error al sincronizar fin de mantenimiento para solicitud {}: {}",
                        event.solicitudId(), e.getMessage(), e);
            }
        }
    }

    @EventListener
    public void onVehiculoKilometrajeRegistrado(VehiculoKilometrajeRegistradoEvent event) {
        if (event == null || event.activoId() == null || event.kilometraje() == null) {
            return;
        }

        log.info("Actualizando telemetría de odómetro de activo {} a {} km (fuente: {})",
                event.activoId(), event.kilometraje(), event.origen());
        try {
            programacionMantenimientoService.actualizarTelemetriaActivo(
                    event.activoId(),
                    BigDecimal.valueOf(event.kilometraje()),
                    null
            );
        } catch (Exception e) {
            log.error("Error al sincronizar kilometraje para activo {}: {}", event.activoId(), e.getMessage(), e);
        }
    }

    private boolean isEstadoFinalizacionMantenimiento(String estado) {
        return "TRABAJO_REALIZADO".equals(estado)
                || "FINALIZADO".equals(estado)
                || "FINALIZADA".equals(estado)
                || "CERRADO".equals(estado);
    }
}
