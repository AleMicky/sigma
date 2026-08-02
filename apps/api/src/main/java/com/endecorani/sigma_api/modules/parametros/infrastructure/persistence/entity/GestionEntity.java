package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(schema = "parametros", name = "gestiones")
public class GestionEntity extends BaseEntity {

    @Column(
            name = "gestion",
            nullable = false
    )
    private Integer gestion;

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
