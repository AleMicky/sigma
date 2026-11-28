package com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.entity;

import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.TipoPregunta;
import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(schema = "cuestionarios", name = "respuestas_detalle")
public class CuestionarioRespuestaDetalleEntity extends BaseEntity {

    @Column(name = "asignacion_id", nullable = false)
    private UUID asignacionId;

    @Column(name = "pregunta_id", nullable = false)
    private UUID preguntaId;

    @Column(name = "pregunta_enunciado_snapshot", nullable = false, length = 500)
    private String preguntaEnunciadoSnapshot;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_pregunta_snapshot", nullable = false, length = 30)
    private TipoPregunta tipoPreguntaSnapshot;

    @Column(name = "valor_texto", columnDefinition = "TEXT")
    private String valorTexto;

    @Column(name = "valor_numerico", precision = 12, scale = 2)
    private BigDecimal valorNumerico;

    @Column(name = "valor_booleano")
    private Boolean valorBooleano;

    @Column(name = "opcion_id")
    private UUID opcionId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "opciones_ids", columnDefinition = "jsonb")
    private List<UUID> opcionesIds;

    @Column(name = "puntaje_obtenido", precision = 10, scale = 2)
    private BigDecimal puntajeObtenido;
}
