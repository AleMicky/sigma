package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(schema = "mantenimientos", name = "prioridades")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrioridadEntity extends BaseEntity {
    @Column(nullable = false, unique = true, length = 30)
    private String codigo;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 300)
    private String descripcion;

    @Column(nullable = false)
    private Integer nivel;

    @Builder.Default
    @Column(name = "por_defecto", nullable = false)
    private Boolean porDefecto = false;
}
