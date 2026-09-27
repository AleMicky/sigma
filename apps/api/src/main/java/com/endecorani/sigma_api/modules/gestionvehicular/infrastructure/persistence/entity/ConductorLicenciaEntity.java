package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoLicenciaConductor;
import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
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
        name = "conductor_licencias",
        indexes = {
                @Index(
                        name = "idx_conductor_licencia_conductor",
                        columnList = "conductor_id"
                ),
                @Index(
                        name = "idx_conductor_licencia_estado",
                        columnList = "estado"
                ),
                @Index(
                        name = "idx_conductor_licencia_vencimiento",
                        columnList = "fecha_vencimiento"
                )
        }
)
public class ConductorLicenciaEntity extends BaseEntity {

    @Column(
            name = "conductor_id",
            nullable = false
    )
    private UUID conductorId;

    @Column(
            name = "categoria_licencia",
            nullable = false,
            length = 20
    )
    private String categoriaLicencia;

    @Column(
            name = "numero_licencia",
            nullable = false,
            length = 100
    )
    private String numeroLicencia;

    @Column(
            name = "fecha_emision",
            nullable = false
    )
    private LocalDate fechaEmision;

    @Column(
            name = "fecha_vencimiento",
            nullable = false
    )
    private LocalDate fechaVencimiento;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "estado",
            nullable = false,
            length = 30
    )
    private EstadoLicenciaConductor estado;

    @Column(
            name = "nombre_archivo",
            length = 255
    )
    private String nombreArchivo;

    @Column(
            name = "nombre_original",
            length = 255
    )
    private String nombreOriginal;

    @Column(
            name = "url",
            length = 1000
    )
    private String url;

    @Column(
            name = "mime_type",
            length = 100
    )
    private String mimeType;

    @Column(
            name = "size"
    )
    private Long size;

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
}
