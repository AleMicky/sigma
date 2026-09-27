package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(
        schema = "gestion_vehicular",
        name = "flota_vehiculos",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_flota_vehiculo",
                        columnNames = {
                                "flota_vehicular_id",
                                "activo_id"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_flota_vehiculo_flota",
                        columnList = "flota_vehicular_id"
                ),
                @Index(
                        name = "idx_flota_vehiculo_activo",
                        columnList = "activo_id"
                )
        }
)
public class FlotaVehiculoEntity  extends BaseEntity {
    @Column(
            name = "flota_vehicular_id",
            nullable = false
    )
    private UUID flotaVehicularId;

    @Column(
            name = "activo_id",
            nullable = false
    )
    private UUID activoId;
}
