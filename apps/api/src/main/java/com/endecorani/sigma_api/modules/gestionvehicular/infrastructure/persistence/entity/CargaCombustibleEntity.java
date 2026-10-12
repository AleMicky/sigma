package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
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
        name = "cargas_combustible",
        indexes = {
                @Index(
                        name = "idx_carga_combustible_activo",
                        columnList = "activo_id"
                ),
                @Index(
                        name = "idx_carga_combustible_viaje",
                        columnList = "viaje_vehicular_id"
                ),
                @Index(
                        name = "idx_carga_combustible_fecha",
                        columnList = "fecha_carga"
                )
        }
)
public class CargaCombustibleEntity  extends BaseEntity {
    @Column(
            name = "activo_id",
            nullable = false
    )
    private UUID activoId;

    @Column(
            name = "viaje_vehicular_id"
    )
    private UUID viajeVehicularId;

    @Column(
            name = "insumo_id",
            nullable = false
    )
    private UUID insumoId;

    @Column(
            name = "fecha_carga",
            nullable = false
    )
    private LocalDateTime fechaCarga;

    @Column(
            name = "litros",
            nullable = false,
            precision = 12,
            scale = 3
    )
    private BigDecimal litros;

    @Column(
            name = "precio_total",
            nullable = false,
            precision = 14,
            scale = 2
    )
    private BigDecimal precioTotal;

    @Column(
            name = "numero_factura",
            length = 100
    )
    private String numeroFactura;

    @Column(
            name = "empleado_id",
            nullable = false
    )
    private UUID empleadoId;
}
