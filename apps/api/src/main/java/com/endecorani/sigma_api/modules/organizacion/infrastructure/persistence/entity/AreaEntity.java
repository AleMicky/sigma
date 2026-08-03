package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity;

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
@Table(schema = "organizacion", name = "areas")
public class AreaEntity extends BaseEntity {

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
            name = "descripcion",
            length = 255
    )
    private String descripcion;

    @Column(
            name = "sistema_origen",
            length = 50
    )
    private String sistemaOrigen;

    @Column(
            name = "codigo_externo",
            length = 100
    )
    private String codigoExterno;
}