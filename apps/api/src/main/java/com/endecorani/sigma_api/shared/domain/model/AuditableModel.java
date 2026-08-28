package com.endecorani.sigma_api.shared.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public abstract class AuditableModel {

    private Instant createdAt;

    private Instant updatedAt;

    private String createdBy;

    private String updatedBy;

    private UUID createdById;

    private UUID updatedById;
}
