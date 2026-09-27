package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
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
        name = "responsables_flota",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_responsable_flota",
                        columnNames = {
                                "flota_vehicular_id",
                                "empleado_id"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_responsable_flota_flota",
                        columnList = "flota_vehicular_id"
                ),
                @Index(
                        name = "idx_responsable_flota_empleado",
                        columnList = "empleado_id"
                ),
                @Index(
                        name = "idx_responsable_flota_activo",
                        columnList = "activo"
                )
        }
)
public class ResponsableFlotaEntity extends BaseEntity {

    @Column(
            name = "flota_vehicular_id",
            nullable = false
    )
    private UUID flotaVehicularId;

    @Column(
            name = "empleado_id",
            nullable = false
    )
    private UUID empleadoId;

    @Builder.Default
    @Column(
            name = "principal",
            nullable = false
    )
    private boolean principal = false;

    @Builder.Default
    @Column(
            name = "activo",
            nullable = false
    )
    private boolean activo = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flota_vehicular_id", insertable = false, updatable = false)
    private FlotaVehicularEntity flotaVehicular;
}
