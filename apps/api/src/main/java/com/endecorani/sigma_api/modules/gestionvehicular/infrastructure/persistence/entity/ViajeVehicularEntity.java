package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoViajeVehicular;
import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.UUID;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(
        schema = "gestion_vehicular",
        name = "viajes_vehiculares",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_viaje_vehicular_asignacion",
                        columnNames = "asignacion_vehicular_id"
                )
        },
        indexes = {
                @Index(
                        name = "idx_viaje_vehicular_asignacion",
                        columnList = "asignacion_vehicular_id"
                ),
                @Index(
                        name = "idx_viaje_vehicular_estado",
                        columnList = "estado"
                )
        }
)
public class ViajeVehicularEntity extends BaseEntity {
    @Column(
            name = "asignacion_vehicular_id",
            nullable = false
    )
    private UUID asignacionVehicularId;

    @Column(
            name = "fecha_salida_real"
    )
    private LocalDateTime fechaSalidaReal;

    @Column(
            name = "kilometraje_salida"
    )
    private Long kilometrajeSalida;

    @Column(
            name = "fecha_retorno_real"
    )
    private LocalDateTime fechaRetornoReal;

    @Column(
            name = "kilometraje_retorno"
    )
    private Long kilometrajeRetorno;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "estado",
            nullable = false,
            length = 30
    )
    private EstadoViajeVehicular estado;

    @Column(
            name = "observacion",
            length = 1000
    )
    private String observacion;
}
