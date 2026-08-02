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

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(schema = "parametros", name = "catalogo_items")
public class CatalogoItemEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "catalogo_id",
            nullable = false
    )
    private CatalogoEntity catalogo;

    @Column(
            name = "nombre",
            nullable = false,
            length = 100
    )
    private String nombre;

    @Column(
            name = "valor",
            nullable = false,
            length = 50
    )
    private String valor;

    @Column(
            name = "orden",
            nullable = false
    )
    private Integer orden = 0;
}
