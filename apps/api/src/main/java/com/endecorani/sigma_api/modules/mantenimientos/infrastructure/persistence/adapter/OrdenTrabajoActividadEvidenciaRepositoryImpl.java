package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoActividadEvidencia;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoActividadEvidenciaRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.OrdenTrabajoActividadEvidenciaEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.OrdenTrabajoActividadEvidenciaPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringOrdenTrabajoActividadEvidenciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class OrdenTrabajoActividadEvidenciaRepositoryImpl
        implements OrdenTrabajoActividadEvidenciaRepository {

    private final SpringOrdenTrabajoActividadEvidenciaRepository springRepository;
    private final OrdenTrabajoActividadEvidenciaPersistenceMapper mapper;

    @Override
    public OrdenTrabajoActividadEvidencia save(OrdenTrabajoActividadEvidencia domain) {
        OrdenTrabajoActividadEvidenciaEntity entity = mapper.toEntity(domain);
        OrdenTrabajoActividadEvidenciaEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<OrdenTrabajoActividadEvidencia> findById(UUID id) {
        return springRepository
                .findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public Page<OrdenTrabajoActividadEvidencia> findByOrdenTrabajoActividadId(
            UUID ordenTrabajoActividadId,
            Pageable pageable
    ) {
        return springRepository
                .findByOrdenTrabajoActividadId(ordenTrabajoActividadId, pageable)
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
}
