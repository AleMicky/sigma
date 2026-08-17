package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        schema = "activos",
        name = "activo_accesorios",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_activo_accesorio",
                        columnNames = {"activo_id", "accesorio_id"}
                )
        },
        indexes = {
                @Index(
                        name = "idx_activo_accesorio_activo",
                        columnList = "activo_id"
                ),
                @Index(
                        name = "idx_activo_accesorio_accesorio",
                        columnList = "accesorio_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivoAccesorioEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "activo_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_activo_accesorio_activo"
            )
    )
    private ActivoEntity activo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "accesorio_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_activo_accesorio_accesorio"
            )
    )
    private AccesorioEntity accesorio;

    @Column(
            name = "cantidad",
            nullable = false
    )
    @Builder.Default
    private Integer cantidad = 1;

    @Column(
            name = "numero_serie",
            length = 100
    )
    private String numeroSerie;

    @Column(
            name = "observacion",
            length = 500
    )
    private String observacion;
}