package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.OrdenTrabajoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.OrdenTrabajoPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringOrdenTrabajoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class OrdenTrabajoRepositoryAdapter implements OrdenTrabajoRepository {

    private final SpringOrdenTrabajoRepository springRepository;
    private final OrdenTrabajoPersistenceMapper mapper;

    @Override
    public Page<OrdenTrabajo> findAll(Pageable pageable) {
        return springRepository.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public Page<OrdenTrabajo> search(String search, Pageable pageable) {
        return springRepository.search(search, pageable).map(mapper::toDomain);
    }

    @Override
    public Optional<OrdenTrabajo> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<OrdenTrabajo> findByNumero(String numero) {
        return springRepository.findByNumeroIgnoreCase(numero).map(mapper::toDomain);
    }

    @Override
    public Optional<OrdenTrabajo> findBySolicitudMantenimientoId(UUID solicitudMantenimientoId) {
        return springRepository.findBySolicitudMantenimientoId(solicitudMantenimientoId).map(mapper::toDomain);
    }

    @Override
    public Page<OrdenTrabajo> findBySolicitudMantenimientoId(UUID solicitudMantenimientoId, Pageable pageable) {
        return springRepository.findBySolicitudMantenimientoId(solicitudMantenimientoId, pageable).map(mapper::toDomain);
    }

    @Override
    public OrdenTrabajo save(OrdenTrabajo ordenTrabajo) {
        OrdenTrabajoEntity entity = mapper.toEntity(ordenTrabajo);
        OrdenTrabajoEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }

    @Override
    public boolean existsByNumeroIgnoreCase(String numero) {
        return springRepository.existsByNumeroIgnoreCase(numero);
    }

    @Override
    public boolean existsByNumeroIgnoreCaseAndIdNot(String numero, UUID id) {
        return springRepository.existsByNumeroIgnoreCaseAndIdNot(numero, id);
    }

    @Override
    public boolean existsBySolicitudMantenimientoId(UUID solicitudMantenimientoId) {
        return springRepository.existsBySolicitudMantenimientoId(solicitudMantenimientoId);
    }

    @Override
    public boolean existsBySolicitudMantenimientoIdAndIdNot(UUID solicitudMantenimientoId, UUID id) {
        return springRepository.existsBySolicitudMantenimientoIdAndIdNot(solicitudMantenimientoId, id);
    }
}
