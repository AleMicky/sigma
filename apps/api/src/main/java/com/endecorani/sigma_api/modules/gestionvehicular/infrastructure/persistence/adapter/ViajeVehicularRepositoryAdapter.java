package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoViajeVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.ViajeVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ViajeVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ViajeVehicularEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper.ViajeVehicularPersistenceMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringViajeVehicularRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ViajeVehicularRepositoryAdapter implements ViajeVehicularRepository {

    private final SpringViajeVehicularRepository springRepository;
    private final ViajeVehicularPersistenceMapper mapper;

    @Override
    public Page<ViajeVehicular> findAll(Pageable pageable) {
        return springRepository.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public Page<ViajeVehicular> searchWithFilters(
            String search,
            UUID asignacionVehicularId,
            UUID solicitudVehicularId,
            UUID activoId,
            UUID conductorId,
            EstadoViajeVehicular estado,
            Pageable pageable
    ) {
        return springRepository.searchWithFilters(
                search,
                asignacionVehicularId,
                solicitudVehicularId,
                activoId,
                conductorId,
                estado,
                pageable
        ).map(mapper::toDomain);
    }

    @Override
    public Optional<ViajeVehicular> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<ViajeVehicular> findByAsignacionVehicularId(UUID asignacionVehicularId) {
        return springRepository.findByAsignacionVehicularId(asignacionVehicularId).map(mapper::toDomain);
    }

    @Override
    public Optional<ViajeVehicular> findBySolicitudVehicularId(UUID solicitudVehicularId) {
        return springRepository.findBySolicitudVehicularId(solicitudVehicularId).map(mapper::toDomain);
    }

    @Override
    public List<ViajeVehicular> findByConductorId(UUID conductorId) {
        return springRepository.findByConductorId(conductorId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<ViajeVehicular> findByActivoId(UUID activoId) {
        return springRepository.findByActivoId(activoId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Optional<ViajeVehicular> findUltimoByActivoId(UUID activoId) {
        return springRepository.findUltimoByActivoId(activoId).map(mapper::toDomain);
    }

    @Override
    public ViajeVehicular save(ViajeVehicular viajeVehicular) {
        ViajeVehicularEntity entity = mapper.toEntity(viajeVehicular);
        ViajeVehicularEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }

    @Override
    public boolean existsByAsignacionVehicularId(UUID asignacionVehicularId) {
        return springRepository.existsByAsignacionVehicularId(asignacionVehicularId);
    }
}
