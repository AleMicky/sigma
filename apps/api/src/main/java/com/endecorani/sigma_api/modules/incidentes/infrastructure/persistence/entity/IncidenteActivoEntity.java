package com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.entity;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
        name = "incidentes_activos",
        schema = "incidentes",
        indexes = {
                @Index(name = "idx_incidente_activo_activo_id", columnList = "activo_id"),
                @Index(name = "idx_incidente_activo_estado", columnList = "estado"),
                @Index(name = "idx_incidente_activo_fecha_hora", columnList = "fecha_hora"),
                @Index(name = "idx_incidente_activo_empleado", columnList = "empleado_reporta_id")
        }
)
public class IncidenteActivoEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "activo_id", nullable = false)
    private ActivoEntity activo;

    @Column(name = "tipo_incidente", nullable = false, length = 100)
    private String tipoIncidente;

    @Column(name = "prioridad", nullable = false, length = 50)
    private String prioridad;

    @Column(name = "estado", nullable = false, length = 50)
    private String estado;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    @Column(name = "ubicacion", length = 255)
    private String ubicacion;

    @Column(name = "latitud", precision = 10, scale = 7)
    private BigDecimal latitud;

    @Column(name = "longitud", precision = 10, scale = 7)
    private BigDecimal longitud;

    @Column(name = "descripcion", columnDefinition = "TEXT", nullable = false)
    private String descripcion;

    @Column(name = "empleado_reporta_id", nullable = false)
    private UUID empleadoReportaId;

    @Column(name = "process_instance_id", length = 100)
    private String processInstanceId;

    @Builder.Default
    @OneToMany(mappedBy = "incidenteActivo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<IncidenteInvolucradoEntity> involucrados = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "incidenteActivo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<IncidenteEvidenciaEntity> evidencias = new ArrayList<>();
}
