package com.endecorani.sigma_api.modules.cuestionarios.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(schema = "cuestionarios", name = "pregunta_opciones")
public class CuestionarioPreguntaOpcionEntity extends BaseEntity {

    @Column(name = "pregunta_id", nullable = false)
    private UUID preguntaId;

    @Column(name = "orden", nullable = false)
    private Integer orden;

    @Column(name = "etiqueta", nullable = false, length = 200)
    private String etiqueta;

    @Column(name = "valor", nullable = false, length = 100)
    private String valor;

    @Column(name = "puntaje", nullable = false, precision = 8, scale = 2)
    private BigDecimal puntaje = BigDecimal.ZERO;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
}
