package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(schema = "parametros", name = "unidades_medida")
public class UnidadMedidaEntity extends BaseEntity {

    @Column(
            name = "codigo",
            nullable = false,
            length = 50
    )
    private String codigo;

    @Column(
            name = "nombre",
            nullable = false,
            length = 100
    )
    private String nombre;

    @Column(
            name = "simbolo",
            nullable = false,
            length = 20
    )
    private String simbolo;

    @Column(
            name = "permite_decimal",
            nullable = false
    )
    private Boolean permiteDecimal;
}
