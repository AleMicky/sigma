package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoActividadEvidencia;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoActividadEvidenciaRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.OrdenTrabajoActividadEvidenciaEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.OrdenTrabajoPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringOrdenTrabajoActividadEvidenciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class OrdenTrabajoActividadEvidenciaRepositoryAdapter implements OrdenTrabajoActividadEvidenciaRepository {

    private final SpringOrdenTrabajoActividadEvidenciaRepository springRepository;
    private final OrdenTrabajoPersistenceMapper mapper;

    @Override
    public Optional<OrdenTrabajoActividadEvidencia> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toEvidenciaDomain);
    }

    @Override
    public Page<OrdenTrabajoActividadEvidencia> findByOrdenTrabajoActividadId(UUID ordenTrabajoActividadId, Pageable pageable) {
        return springRepository.findByOrdenTrabajoActividadId(ordenTrabajoActividadId, pageable).map(mapper::toEvidenciaDomain);
    }

    @Override
    public List<OrdenTrabajoActividadEvidencia> findByOrdenTrabajoActividadId(UUID ordenTrabajoActividadId) {
        return springRepository.findByOrdenTrabajoActividadId(ordenTrabajoActividadId).stream()
                .map(mapper::toEvidenciaDomain)
                .collect(Collectors.toList());
    }

    @Override
    public OrdenTrabajoActividadEvidencia save(OrdenTrabajoActividadEvidencia evidencia) {
        OrdenTrabajoActividadEvidenciaEntity entity = mapper.toEvidenciaEntity(evidencia);
        OrdenTrabajoActividadEvidenciaEntity saved = springRepository.save(entity);
        return mapper.toEvidenciaDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }
}
