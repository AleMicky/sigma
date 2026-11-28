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
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(schema = "cuestionarios", name = "preguntas")
public class CuestionarioPreguntaEntity extends BaseEntity {

    @Column(name = "cuestionario_id", nullable = false)
    private UUID cuestionarioId;

    @Column(name = "seccion", length = 100)
    private String seccion;

    @Column(name = "orden", nullable = false)
    private Integer orden;

    @Column(name = "enunciado", nullable = false, length = 500)
    private String enunciado;

    @Column(name = "descripcion_ayuda", length = 500)
    private String descripcionAyuda;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_pregunta", nullable = false, length = 30)
    private TipoPregunta tipoPregunta;

    @Column(name = "obligatoria", nullable = false)
    private Boolean obligatoria = true;

    @Column(name = "peso", nullable = false, precision = 8, scale = 2)
    private BigDecimal peso = BigDecimal.ONE;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "config_json", columnDefinition = "jsonb")
    private Map<String, Object> configJson;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
}
