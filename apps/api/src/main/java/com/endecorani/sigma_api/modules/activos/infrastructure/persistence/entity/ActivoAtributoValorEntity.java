package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity;

import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(schema = "activos", name = "activo_atributo_valores")
public class ActivoAtributoValorEntity extends BaseEntity {

    @Column(name = "activo_id", nullable = false)
    private UUID activoId;

    @Column(name = "activo_atributo_id", nullable = false)
    private UUID activoAtributoId;

    @Column(name = "valor", columnDefinition = "TEXT")
    private String valor;
}
