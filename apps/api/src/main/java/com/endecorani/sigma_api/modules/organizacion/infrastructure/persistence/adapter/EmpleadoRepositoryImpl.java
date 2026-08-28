package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.application.dto.EmpleadoSearchCriteria;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.EmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.mapper.EmpleadoPersistenceMapper;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringEmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.specification.EmpleadoSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class EmpleadoRepositoryImpl implements EmpleadoRepository {

    private final SpringEmpleadoRepository springRepository;

    private final EmpleadoPersistenceMapper mapper;

    @Override
    public Empleado save(Empleado empleado) {
        EmpleadoEntity saved = springRepository.save(mapper.toEntity(empleado));
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Empleado> findById(UUID id) {
        return springRepository
                .findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Empleado> findAll(Pageable pageable) {
        return springRepository
                .findAll(pageable)
                .map(mapper::toDomain);
    }

    @Override
    public boolean existsById(UUID id) {
        return springRepository.existsById(id);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }

    @Override
    public boolean existsByCodigoIgnoreCase(String codigo) {
        return springRepository.existsByCodigoIgnoreCase(codigo);
    }

    @Override
    public boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    ) {
        return springRepository.existsByCodigoIgnoreCaseAndIdNot(codigo, id);
    }

    @Override
    public Page<Empleado> findAll(
            EmpleadoSearchCriteria criteria,
            Pageable pageable
    ) {
        return springRepository
                .findAll(EmpleadoSpecifications.withCriteria(criteria), pageable)
                .map(mapper::toDomain);
    }
}