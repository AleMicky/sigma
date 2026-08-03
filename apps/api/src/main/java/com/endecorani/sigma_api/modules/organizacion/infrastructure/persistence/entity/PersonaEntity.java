package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(schema = "organizacion", name = "personas")
public class PersonaEntity extends BaseEntity {

    @Column(
            name = "tipo_documento",
            nullable = false,
            length = 20
    )
    private String tipoDocumento;

    @Column(
            name = "numero_documento",
            nullable = false,
            length = 50
    )
    private String numeroDocumento;

    @Column(
            name = "complemento",
            length = 10
    )
    private String complemento;

    @Column(
            name = "nombres",
            nullable = false,
            length = 100
    )
    private String nombres;

    @Column(
            name = "primer_apellido",
            nullable = false,
            length = 100
    )
    private String primerApellido;

    @Column(
            name = "segundo_apellido",
            length = 100
    )
    private String segundoApellido;

    @Column(
            name = "fecha_nacimiento"
    )
    private java.time.LocalDate fechaNacimiento;

    @Column(
            name = "telefono",
            length = 30
    )
    private String telefono;

    @Column(
            name = "correo",
            length = 150
    )
    private String correo;

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