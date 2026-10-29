package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
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
        name = "salidas_vehiculares",
        indexes = {
                @Index(
                        name = "idx_salida_activo",
                        columnList = "activo_id"
                ),
                @Index(
                        name = "idx_salida_empleado",
                        columnList = "empleado_id"
                ),
                @Index(
                        name = "idx_salida_estado",
                        columnList = "estado"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_salida_numero",
                        columnNames = "numero"
                ),
                @UniqueConstraint(
                        name = "uk_salida_process_instance",
                        columnNames = "process_instance_id"
                )
        }
)
public class SalidaVehicularEntity extends BaseEntity {
    @Column(name = "numero", nullable = false, unique = true, length = 30)
    private String numero;

    @Column(name = "activo_id", nullable = false)
    private UUID activoId;

    @Column(name = "empleado_id", nullable = false)
    private UUID empleadoId;

    @Column(name = "descripcion_actividad", nullable = false, columnDefinition = "TEXT")
    private String descripcionActividad;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "estado", nullable = false, length = 50)
    private String estado;

    @Column(name = "process_instance_id", length = 100)
    private String processInstanceId;
}
