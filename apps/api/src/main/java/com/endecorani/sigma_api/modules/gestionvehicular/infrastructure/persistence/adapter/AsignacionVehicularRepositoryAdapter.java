package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.AsignacionVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.AsignacionVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.AsignacionVehicularEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper.AsignacionVehicularPersistenceMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringAsignacionVehicularRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class AsignacionVehicularRepositoryAdapter implements AsignacionVehicularRepository {

    private final SpringAsignacionVehicularRepository springRepository;
    private final AsignacionVehicularPersistenceMapper mapper;

    @Override
    public Page<AsignacionVehicular> findAll(Pageable pageable) {
        return springRepository.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public Page<AsignacionVehicular> searchWithFilters(
            String search,
            UUID solicitudVehicularId,
            UUID activoId,
            UUID conductorId,
            UUID asignadoPorId,
            Pageable pageable
    ) {
        return springRepository.searchWithFilters(
                search,
                solicitudVehicularId,
                activoId,
                conductorId,
                asignadoPorId,
                pageable
        ).map(mapper::toDomain);
    }

    @Override
    public Optional<AsignacionVehicular> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<AsignacionVehicular> findBySolicitudVehicularId(UUID solicitudVehicularId) {
        return springRepository.findBySolicitudVehicularId(solicitudVehicularId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<AsignacionVehicular> findByActivoId(UUID activoId) {
        return springRepository.findByActivoId(activoId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<AsignacionVehicular> findByConductorId(UUID conductorId) {
        return springRepository.findByConductorId(conductorId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public AsignacionVehicular save(AsignacionVehicular asignacionVehicular) {
        AsignacionVehicularEntity entity = mapper.toEntity(asignacionVehicular);
        AsignacionVehicularEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }

    @Override
    public boolean existsBySolicitudVehicularId(UUID solicitudVehicularId) {
        return springRepository.existsBySolicitudVehicularId(solicitudVehicularId);
    }
}
