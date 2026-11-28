package com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.entity;

import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.EstadoAsignacionCuestionario;
import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(schema = "cuestionarios", name = "asignaciones")
public class CuestionarioAsignacionEntity extends BaseEntity {

    @Column(name = "cuestionario_id", nullable = false)
    private UUID cuestionarioId;

    @Column(name = "cuestionario_version", nullable = false)
    private Integer cuestionarioVersion;

    @Column(name = "modulo_origen", nullable = false, length = 50)
    private String moduloOrigen;

    @Column(name = "entidad_tipo", nullable = false, length = 60)
    private String entidadTipo;

    @Column(name = "entidad_id", nullable = false)
    private UUID entidadId;

    @Column(name = "entidad_codigo_ref", length = 80)
    private String entidadCodigoRef;

    @Column(name = "evaluado_tipo", length = 50)
    private String evaluadoTipo;

    @Column(name = "evaluado_id")
    private UUID evaluadoId;

    @Column(name = "evaluado_nombre_snapshot", length = 200)
    private String evaluadoNombreSnapshot;

    @Column(name = "evaluador_empleado_id", nullable = false)
    private UUID evaluadorEmpleadoId;

    @Column(name = "obligatorio", nullable = false)
    private Boolean obligatorio = false;

    @Column(name = "anonimo_en_reportes", nullable = false)
    private Boolean anonimoEnReportes = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoAsignacionCuestionario estado = EstadoAsignacionCuestionario.PENDIENTE;

    @Column(name = "fecha_habilitacion", nullable = false)
    private Instant fechaHabilitacion;

    @Column(name = "fecha_respuesta")
    private Instant fechaRespuesta;

    @Column(name = "puntaje_total", precision = 10, scale = 2)
    private BigDecimal puntajeTotal;

    @Column(name = "puntaje_maximo", precision = 10, scale = 2)
    private BigDecimal puntajeMaximo;

    @Column(name = "porcentaje", precision = 5, scale = 2)
    private BigDecimal porcentaje;

    @Column(name = "comentario_general", columnDefinition = "TEXT")
    private String comentarioGeneral;
}
