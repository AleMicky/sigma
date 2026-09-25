package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
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
                ),
                @UniqueConstraint(
                        name = "uk_conductor_numero_licencia",
                        columnNames = "numero_licencia"
                )
        }
)
public class ConductorEntity extends BaseEntity {

    @Column(
            name = "empleado_id",
            nullable = false
    )
    private UUID empleadoId;

    @Column(
            name = "numero_licencia",
            nullable = false,
            length = 50
    )
    private String numeroLicencia;

    @Column(
            name = "categoria_licencia",
            nullable = false,
            length = 20
    )
    private String categoriaLicencia;

    @Column(
            name = "fecha_vencimiento",
            nullable = false
    )
    private LocalDate fechaVencimiento;

    @Column(
            name = "activo",
            nullable = false
    )
    @Builder.Default
    private boolean activo = true;
}