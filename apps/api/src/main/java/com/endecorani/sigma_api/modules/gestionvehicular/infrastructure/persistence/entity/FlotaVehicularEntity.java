package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import jakarta.persistence.UniqueConstraint;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(
        schema = "gestion_vehicular",
        name = "flotas_vehiculares",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_flota_vehicular_codigo",
                        columnNames = "codigo"
                )
        },
        indexes = {
                @Index(
                        name = "idx_flota_vehicular_activo",
                        columnList = "activo"
                )
        }
)
public class FlotaVehicularEntity extends BaseEntity {
    @Column(
            name = "codigo",
            nullable = false,
            length = 50
    )
    private String codigo;

    @Column(
            name = "nombre",
            nullable = false,
            length = 150
    )
    private String nombre;

    @Column(
            name = "descripcion",
            length = 500
    )
    private String descripcion;
}
