package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.response;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoRegistroPorteria;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.TipoMovimientoPorteria;
import lombok.Builder;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Fila detallada del reporte tipo bitácora de portería con todos los datos registrados.
 */
@Builder
public record BitacoraPorteriaItemResponse(
        UUID id,
        String numero,
        TipoMovimientoPorteria tipoMovimiento,
        Integer dia,
        String diaSemana,
        String fechaFormateada,
        String horaSalidaFormateada,
        String horaLlegadaFormateada,
        Instant fechaHoraSalida,
        Instant fechaHoraLlegada,
        Long duracionMinutos,
        String duracionTexto,
        Boolean esExterno,
        String tipoRegistro,
        UUID empleadoId,
        String empleadoCodigo,
        String empleadoNombre,
        String empleadoCargo,
        String empleadoArea,
        String personaExterna,
        String placaExterna,
        UUID activoPrincipalId,
        String vehiculoPlaca,
        String vehiculoCodigo,
        String vehiculoNombre,
        String activosResumen,
        Integer totalActivos,
        Integer activosRetornados,
        Integer activosPendientesRetorno,
        List<RegistroPorteriaActivoResponse> activos,
        UUID origenUbicacionId,
        String origenUbicacionNombre,
        UUID destinoUbicacionId,
        String destinoUbicacionNombre,
        String destinoOtro,
        String rutaTexto,
        String descripcionActividad,
        UUID guardiaSalidaId,
        String guardiaSalidaNombre,
        UUID guardiaLlegadaId,
        String guardiaLlegadaNombre,
        UUID salidaVehicularId,
        String salidaVehicularNumero,
        String observacionSalida,
        String observacionLlegada,
        String observacionesConsolidadas,
        EstadoRegistroPorteria estado,
        Instant createdAt,
        Instant updatedAt,
        String createdBy,
        String updatedBy
) {
}
