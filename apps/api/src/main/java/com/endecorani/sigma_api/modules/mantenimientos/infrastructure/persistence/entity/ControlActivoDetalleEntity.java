package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(
        schema = "mantenimientos",
        name = "control_activo_detalle",
        indexes = {
                @Index(
                        name = "idx_control_activo_detalle_control",
                        columnList = "control_activo_id"
                ),
                @Index(
                        name = "idx_control_activo_detalle_accesorio",
                        columnList = "accesorio_id"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_control_activo_accesorio",
                        columnNames = {
                                "control_activo_id",
                                "accesorio_id"
                        }
                )
        }
)
public class ControlActivoDetalleEntity extends BaseEntity {

    @Column(
            name = "control_activo_id",
            nullable = false
    )
    private UUID controlActivoId;

    @Column(
            name = "accesorio_id",
            nullable = false
    )
    private UUID accesorioId;

    @Column(
            name = "cantidad_esperada",
            nullable = false
    )
    private Integer cantidadEsperada;

    @Column(
            name = "cantidad_encontrada",
            nullable = false
    )
    private Integer cantidadEncontrada;

    @Column(
            name = "conforme",
            nullable = false
    )
    private boolean conforme;

    @Column(
            name = "observacion",
            length = 300
    )
    private String observacion;
}