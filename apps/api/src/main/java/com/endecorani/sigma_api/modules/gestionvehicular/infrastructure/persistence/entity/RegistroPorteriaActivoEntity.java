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
        name = "registros_porteria_activos",
        indexes = {
                @Index(name = "idx_registro_porteria_activos_cabecera", columnList = "registro_porteria_id"),
                @Index(name = "idx_registro_porteria_activos_activo", columnList = "activo_id")
        }
)
public class RegistroPorteriaActivoEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registro_porteria_id", nullable = false)
    private RegistroPorteriaEntity registroPorteria;

    @Column(name = "registro_porteria_id", nullable = false, insertable = false, updatable = false)
    private UUID registroPorteriaId;

    @Column(name = "activo_id")
    private UUID activoId;

    @Column(name = "descripcion_item", length = 300)
    private String descripcionItem;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "observacion_salida", length = 500)
    private String observacionSalida;

    @Column(name = "retornado")
    private Boolean retornado;

    @Column(name = "observacion_llegada", length = 500)
    private String observacionLlegada;
}

