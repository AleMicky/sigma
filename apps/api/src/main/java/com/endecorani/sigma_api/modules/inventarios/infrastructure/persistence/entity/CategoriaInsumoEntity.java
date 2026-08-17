package com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        schema = "inventarios",
        name = "categorias_insumo",
        indexes = {
                @Index(
                        name = "idx_categoria_insumo_tipo",
                        columnList = "tipo_insumo_id"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_categoria_insumo_tipo_codigo",
                        columnNames = {"tipo_insumo_id", "codigo"}
                )
        }
)
public class CategoriaInsumoEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "tipo_insumo_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_categoria_insumo_tipo"
            )
    )
    private TipoInsumoEntity tipoInsumo;

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
}