package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(schema = "organizacion", name = "empleados")
public class EmpleadoEntity extends BaseEntity {

    @Column(
            name = "persona_id",
            nullable = false
    )
    private UUID personaId;

    @Column(
            name = "area_id",
            nullable = false
    )
    private UUID areaId;

    @Column(
            name = "cargo_id",
            nullable = false
    )
    private UUID cargoId;

    @Column(
            name = "codigo",
            nullable = false,
            length = 50
    )
    private String codigo;

    @Column(
            name = "fecha_inicio"
    )
    private LocalDate fechaInicio;

    @Column(
            name = "fecha_fin"
    )
    private LocalDate fechaFin;

    @Column(
            name = "sistema_origen",
            length = 50
    )
    private String sistemaOrigen;

    @Column(
            name = "codigo_externo",
            length = 100
    )
    private String codigoExterno;

    @Column(
            name = "activo",
            nullable = false
    )
    private Boolean activo = Boolean.TRUE;
}