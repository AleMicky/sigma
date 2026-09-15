package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Immutable;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Immutable
@Table(schema = "organizacion", name = "vempleados")
public class VEmpleadoEntity {

    @Id
    @Column(name = "empleado_id")
    private UUID empleadoId;

    @Column(name = "codigo")
    private String codigo;

    @Column(name = "nombre_completo")
    private String nombreCompleto;

    @Column(name = "cargo")
    private String cargo;

    @Column(name = "area")
    private String area;
}
