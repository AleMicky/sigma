package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "bitacoras_vehiculares",
        schema = "gestion_vehicular",
        indexes = {
                @Index(
                        name = "idx_bitacora_salida_fecha",
                        columnList = "salida_vehicular_id, fecha_hora"
                ),
                @Index(
                        name = "idx_bitacora_tipo",
                        columnList = "tipo"
                ),
                @Index(
                        name = "idx_bitacora_empleado",
                        columnList = "empleado_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class BitacoraVehicularEntity extends BaseEntity {

    @Column(
            name = "salida_vehicular_id",
            nullable = false
    )
    private UUID salidaVehicularId;

    @Column(
            name = "empleado_id",
            nullable = false
    )
    private UUID empleadoId;

    @Column(
            name = "tipo",
            nullable = false,
            length = 80
    )
    private String tipo;

    @Column(
            name = "fecha_hora",
            nullable = false,
            columnDefinition = "TIMESTAMP WITH TIME ZONE"
    )
    private Instant fechaHora;

    @Column(
            name = "descripcion",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String descripcion;

    @Column(
            name = "latitud",
            precision = 10,
            scale = 7
    )
    private BigDecimal latitud;

    @Column(
            name = "longitud",
            precision = 10,
            scale = 7
    )
    private BigDecimal longitud;
}