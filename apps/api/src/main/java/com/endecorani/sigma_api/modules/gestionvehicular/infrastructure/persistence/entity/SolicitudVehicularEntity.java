package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity;

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
        name = "solicitudes_vehiculares",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_solicitud_vehicular_numero",
                        columnNames = "numero"
                )
        }
)
public class SolicitudVehicularEntity extends BaseEntity {

    @Column(
            name = "numero",
            nullable = false,
            length = 50
    )
    private String numero;

    @Column(
            name = "tipo_solicitud_vehicular_id",
            nullable = false
    )
    private UUID tipoSolicitudVehicularId;

    @Column(
            name = "solicitante_id",
            nullable = false
    )
    private UUID solicitanteId;

    @Column(
            name = "motivo",
            nullable = false,
            length = 500
    )
    private String motivo;

    @Column(
            name = "justificacion",
            length = 1000
    )
    private String justificacion;

    @Column(
            name = "destino",
            nullable = false,
            length = 255
    )
    private String destino;

    @Column(
            name = "fecha_salida",
            nullable = false
    )
    private LocalDateTime fechaSalida;

    @Column(
            name = "fecha_retorno_estimada",
            nullable = false
    )
    private LocalDateTime fechaRetornoEstimada;

    @Column(
            name = "cantidad_pasajeros",
            nullable = false
    )
    private Integer cantidadPasajeros;

    @Column(
            name = "observacion",
            length = 1000
    )
    private String observacion;


    @Column(
            name = "estado",
            nullable = false,
            length = 30
    )
    private String estado;

    @Column(
            name = "process_instance_id",
            length = 100
    )
    private String processInstanceId;

}
