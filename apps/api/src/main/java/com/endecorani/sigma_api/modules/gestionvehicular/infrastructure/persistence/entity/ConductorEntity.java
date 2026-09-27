package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoConductor;
import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(
        schema = "gestion_vehicular",
        name = "conductores",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_conductor_empleado",
                        columnNames = "empleado_id"
                )
        },
        indexes = {
                @Index(
                        name = "idx_conductor_empleado",
                        columnList = "empleado_id"
                ),
                @Index(
                        name = "idx_conductor_estado",
                        columnList = "estado"
                )
        }
)
public class ConductorEntity extends BaseEntity {

    @Column(
            name = "empleado_id",
            nullable = false
    )
    private UUID empleadoId;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "estado",
            nullable = false,
            length = 30
    )
    private EstadoConductor estado;

    @Column(
            name = "observacion",
            length = 1000
    )
    private String observacion;

    @Builder.Default
    @Column(
            name = "activo",
            nullable = false
    )
    private boolean activo = true;

    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "conductor_id", insertable = false, updatable = false)
    @Builder.Default
    private List<ConductorLicenciaEntity> licencias = new ArrayList<>();
}