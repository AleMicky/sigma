package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.organizacion.domain.model.EmpleadoResponsabilidad;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoResponsabilidadRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.EmpleadoResponsabilidadEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.mapper.EmpleadoResponsabilidadPersistenceMapper;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringEmpleadoResponsabilidadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class EmpleadoResponsabilidadRepositoryImpl implements EmpleadoResponsabilidadRepository {

    private final SpringEmpleadoResponsabilidadRepository springRepository;

    private final EmpleadoResponsabilidadPersistenceMapper mapper;

    @Override
    public EmpleadoResponsabilidad save(EmpleadoResponsabilidad empleadoResponsabilidad) {
        EmpleadoResponsabilidadEntity saved = springRepository.save(mapper.toEntity(empleadoResponsabilidad));
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<EmpleadoResponsabilidad> findById(UUID id) {
        return springRepository
                .findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public Page<EmpleadoResponsabilidad> findAll(Pageable pageable) {
        return springRepository
                .findAll(pageable)
                .map(mapper::toDomain);
    }

    @Override
    public List<EmpleadoResponsabilidad> findByResponsabilidadId(UUID responsabilidadId) {
        return springRepository
                .findByResponsabilidadId(responsabilidadId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Page<EmpleadoResponsabilidad> findByResponsabilidadId(
            UUID responsabilidadId,
            Pageable pageable
    ) {
        return springRepository
                .findByResponsabilidadId(responsabilidadId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }
}
