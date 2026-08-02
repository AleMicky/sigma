package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(schema = "parametros", name = "periodos")
public class PeriodoEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "gestion_id",
            nullable = false
    )
    private GestionEntity gestion;

    @Column(
            name = "periodo",
            nullable = false
    )
    private Integer periodo;

    @Column(
            name = "literal",
            nullable = false,
            length = 50
    )
    private String literal;

    @Column(
            name = "fecha_inicio",
            nullable = false
    )
    private LocalDate fechaInicio;

    @Column(
            name = "fecha_fin",
            nullable = false
    )
    private LocalDate fechaFin;
}
