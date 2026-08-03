package com.endecorani.sigma_api.modules.organizacion.domain.model;

import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
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
public class Persona extends AuditableModel {
    private UUID id;

    private String tipoDocumento;

    private String numeroDocumento;

    private String complemento;

    private String nombres;

    private String primerApellido;

    private String segundoApellido;

    private LocalDate fechaNacimiento;

    private String telefono;

    private String correo;

    private String sistemaOrigen;

    private String codigoExterno;

    private Boolean activo;
}
