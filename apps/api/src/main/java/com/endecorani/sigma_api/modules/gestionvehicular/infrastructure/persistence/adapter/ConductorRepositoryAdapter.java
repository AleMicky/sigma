package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.Conductor;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ConductorRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper.ConductorPersistenceMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringConductorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ConductorRepositoryAdapter implements ConductorRepository {

    private final SpringConductorRepository springRepository;
    private final ConductorPersistenceMapper mapper;

    @Override
    public Page<Conductor> findAll(Pageable pageable) {
        return springRepository.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public Page<Conductor> search(String search, Pageable pageable) {
        return springRepository.search(search, pageable).map(mapper::toDomain);
    }

    @Override
    public Optional<Conductor> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Conductor save(Conductor conductor) {
        ConductorEntity entity = mapper.toEntity(conductor);
        ConductorEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }

    @Override
    public boolean existsByEmpleadoId(UUID empleadoId) {
        return springRepository.existsByEmpleadoId(empleadoId);
    }

    @Override
    public boolean existsByEmpleadoIdAndIdNot(UUID empleadoId, UUID id) {
        return springRepository.existsByEmpleadoIdAndIdNot(empleadoId, id);
    }

    @Override
    public boolean existsByNumeroLicenciaIgnoreCase(String numeroLicencia) {
        return springRepository.existsByNumeroLicenciaIgnoreCase(numeroLicencia);
    }

    @Override
    public boolean existsByNumeroLicenciaIgnoreCaseAndIdNot(String numeroLicencia, UUID id) {
        return springRepository.existsByNumeroLicenciaIgnoreCaseAndIdNot(numeroLicencia, id);
    }
}
