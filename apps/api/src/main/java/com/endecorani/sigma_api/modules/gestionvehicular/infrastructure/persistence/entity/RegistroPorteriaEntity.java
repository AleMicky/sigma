package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoRegistroPorteria;
import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.Instant;
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
        schema = "gestion_vehicular",
        name = "registros_porteria",
        indexes = {
                @Index(name = "idx_registro_porteria_empleado", columnList = "empleado_id"),
                @Index(name = "idx_registro_porteria_estado", columnList = "estado"),
                @Index(name = "idx_registro_porteria_fecha_salida", columnList = "fecha_hora_salida"),
                @Index(name = "idx_registro_porteria_salida_vehicular", columnList = "salida_vehicular_id")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_registro_porteria_numero", columnNames = "numero")
        }
)
public class RegistroPorteriaEntity extends BaseEntity {

    @Column(name = "numero", nullable = false, unique = true, length = 30)
    private String numero;

    @Column(name = "empleado_id")
    private UUID empleadoId;

    @Builder.Default
    @Column(name = "es_externo", nullable = false)
    private Boolean esExterno = false;

    @Column(name = "persona_externa", length = 200)
    private String personaExterna;

    @Column(name = "placa_externa", length = 50)
    private String placaExterna;

    @Column(name = "guardia_salida_id")
    private UUID guardiaSalidaId;

    @Column(name = "guardia_llegada_id")
    private UUID guardiaLlegadaId;

    @Column(name = "salida_vehicular_id")
    private UUID salidaVehicularId;

    @Column(name = "fecha_hora_salida", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant fechaHoraSalida;

    @Column(name = "fecha_hora_llegada", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant fechaHoraLlegada;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 30)
    private EstadoRegistroPorteria estado;

    @Column(name = "observacion_salida", columnDefinition = "TEXT")
    private String observacionSalida;

    @Column(name = "observacion_llegada", columnDefinition = "TEXT")
    private String observacionLlegada;

    @Builder.Default
    @OneToMany(mappedBy = "registroPorteria", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<RegistroPorteriaActivoEntity> activos = new ArrayList<>();
}

