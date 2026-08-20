package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(schema = "parametros", name = "correlativos",
        indexes = {
                @Index(name = "idx_correlativo_codigo", columnList = "codigo"),
                @Index(name = "idx_correlativo_gestion", columnList = "gestion")},
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_correlativo_codigo_gestion",
                        columnNames = {"codigo", "gestion"})})
public class CorrelativoEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(unique = true, nullable = false)
    private UUID id;

    @Column(name = "codigo", nullable = false, length = 100)
    private String codigo;

    @Column(name = "gestion", nullable = false)
    private Integer gestion;

    @Column(name = "ultimo_numero", nullable = false)
    private Integer ultimoNumero;

    @Column(name = "prefijo", length = 20)
    private String prefijo;

    @Column(name = "longitud", nullable = false)
    private Integer longitud;
}