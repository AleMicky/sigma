package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.TipoControlActivo;
import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity(name = "ControlActivoVehicularEntity")
@Table(
        schema = "gestion_vehicular",
        name = "control_activo",
        indexes = {
                @Index(
                        name = "idx_control_activo_gv_solicitud",
                        columnList = "solicitud_vehicular_id"
                ),
                @Index(
                        name = "idx_control_activo_gv_asignacion",
                        columnList = "asignacion_vehicular_id"
                ),
                @Index(
                        name = "idx_control_activo_gv_activo",
                        columnList = "activo_id"
                )
        }
)
public class ControlActivoVehicularEntity extends BaseEntity {

    @Column(
            name = "solicitud_vehicular_id"
    )
    private UUID solicitudVehicularId;

    @Column(
            name = "asignacion_vehicular_id"
    )
    private UUID asignacionVehicularId;

    @Column(
            name = "activo_id",
            nullable = false
    )
    private UUID activoId;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "tipo",
            nullable = false,
            length = 20
    )
    private TipoControlActivo tipo;

    @Column(
            name = "recibido_por_id"
    )
    private UUID recibidoPorId;

    @Column(
            name = "fecha",
            nullable = false
    )
    private LocalDateTime fecha;

    @Column(
            name = "conforme",
            nullable = false
    )
    private boolean conforme;

    @Column(
            name = "observacion",
            length = 500
    )
    private String observacion;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "control_activo_id", nullable = false)
    @Builder.Default
    private List<ControlActivoVehicularDetalleEntity> detalles = new ArrayList<>();
}
