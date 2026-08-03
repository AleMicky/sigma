package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.organizacion.domain.enums.EstadoMigracion;
import com.endecorani.sigma_api.modules.organizacion.domain.model.RegistroMigracion;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.RegistroMigracionRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.RegistroMigracionEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.mapper.RegistroMigracionPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class RegistroMigracionRepositoryImpl
        implements RegistroMigracionRepository {

    private final SpringRegistroMigracionRepository springRepository;

    private final RegistroMigracionPersistenceMapper mapper;

    @Override
    public Optional<RegistroMigracion> findById(UUID id) {
        return springRepository
                .findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public Page<RegistroMigracion> findAll(
            String sistemaOrigen,
            String entidad,
            String estado,
            Instant fechaDesde,
            Instant fechaHasta,
            String query,
            Pageable pageable
    ) {
        EstadoMigracion estadoEnum = null;
        if (estado != null && !estado.isBlank()) {
            try {
                estadoEnum = EstadoMigracion.valueOf(estado.toUpperCase());
            } catch (IllegalArgumentException ignored) {
                estadoEnum = null;
            }
        }

        return springRepository
                .findAllByFilter(
                        estadoEnum,
                        sistemaOrigen,
                        entidad,
                        fechaDesde,
                        fechaHasta,
                        query,
                        pageable
                )
                .map(mapper::toDomain);
    }
}