package com.endecorani.sigma_api.modules.cuestionarios.domain.model;

import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EstadoAsignacionCuestionario;
import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CuestionarioAsignacion extends AuditableModel {

    private UUID id;
    private UUID cuestionarioId;
    private Integer cuestionarioVersion;
    private String moduloOrigen;
    private String entidadTipo;
    private UUID entidadId;
    private String entidadCodigoRef;
    private String evaluadoTipo;
    private UUID evaluadoId;
    private String evaluadoNombreSnapshot;
    private UUID evaluadorEmpleadoId;

    @Builder.Default
    private Boolean obligatorio = false;

    @Builder.Default
    private Boolean anonimoEnReportes = false;

    @Builder.Default
    private EstadoAsignacionCuestionario estado = EstadoAsignacionCuestionario.PENDIENTE;

    private Instant fechaHabilitacion;
    private Instant fechaRespuesta;
    private BigDecimal puntajeTotal;
    private BigDecimal puntajeMaximo;
    private BigDecimal porcentaje;
    private String comentarioGeneral;
}
