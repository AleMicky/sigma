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
        name = "salidas_vehiculares_eventos",
        schema = "gestion_vehicular",
        indexes = {
                @Index(
                        name = "idx_evento_salida_fecha",
                        columnList = "salida_vehicular_id, fecha_hora"
                ),
                @Index(
                        name = "idx_evento_tipo",
                        columnList = "tipo_evento"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SalidaVehicularEventoEntity extends BaseEntity {

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
            name = "tipo_evento",
            nullable = false,
            length = 80
    )
    private String tipoEvento;

    @Column(
            name = "fecha_hora",
            nullable = false,
            columnDefinition = "TIMESTAMP WITH TIME ZONE"
    )
    private Instant fechaHora;

    @Column(
            name = "kilometraje",
            precision = 12,
            scale = 2
    )
    private BigDecimal kilometraje;

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

    @Column(
            name = "observacion",
            columnDefinition = "TEXT"
    )
    private String observacion;
}