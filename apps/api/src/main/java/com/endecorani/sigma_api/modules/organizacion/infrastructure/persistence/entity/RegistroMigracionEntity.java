package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity;

import com.endecorani.sigma_api.modules.organizacion.domain.enums.EstadoMigracion;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(schema = "organizacion", name = "registros_migracion")
public class RegistroMigracionEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(unique = true, nullable = false)
    private UUID id;

    @Column(
            name = "sistema_origen",
            nullable = false,
            length = 50
    )
    private String sistemaOrigen;

    @Column(
            name = "entidad",
            nullable = false,
            length = 100
    )
    private String entidad;

    @Column(
            name = "id_origen",
            nullable = false,
            length = 200
    )
    private String idOrigen;

    @Column(
            name = "id_destino"
    )
    private UUID idDestino;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "estado",
            nullable = false,
            length = 20
    )
    private EstadoMigracion estado;

    @Column(
            name = "mensaje",
            columnDefinition = "text"
    )
    private String mensaje;

    @Column(
            name = "fecha_registro",
            nullable = false
    )
    private Instant fechaRegistro;
}