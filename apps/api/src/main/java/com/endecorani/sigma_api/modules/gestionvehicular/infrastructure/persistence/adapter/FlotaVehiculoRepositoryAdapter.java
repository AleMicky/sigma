package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.FlotaVehiculo;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.FlotaVehiculoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.FlotaVehiculoEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper.FlotaVehiculoPersistenceMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringFlotaVehiculoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class FlotaVehiculoRepositoryAdapter implements FlotaVehiculoRepository {

    private final SpringFlotaVehiculoRepository springRepository;
    private final FlotaVehiculoPersistenceMapper mapper;

    @Override
    public Page<FlotaVehiculo> findAll(Pageable pageable) {
        return springRepository.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public Page<FlotaVehiculo> searchWithFilters(UUID flotaVehicularId, UUID activoId, Boolean activo, Pageable pageable) {
        return springRepository.searchWithFilters(flotaVehicularId, activoId, activo, pageable).map(mapper::toDomain);
    }

    @Override
    public List<FlotaVehiculo> findByFlotaVehicularId(UUID flotaVehicularId) {
        return springRepository.findByFlotaVehicularId(flotaVehicularId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Optional<FlotaVehiculo> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<FlotaVehiculo> findByFlotaVehicularIdAndActivoId(UUID flotaVehicularId, UUID activoId) {
        return springRepository.findByFlotaVehicularIdAndActivoId(flotaVehicularId, activoId).map(mapper::toDomain);
    }

    @Override
    public FlotaVehiculo save(FlotaVehiculo flotaVehiculo) {
        FlotaVehiculoEntity entity = mapper.toEntity(flotaVehiculo);
        FlotaVehiculoEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }

    @Override
    public boolean existsById(UUID id) {
        return springRepository.existsById(id);
    }

    @Override
    public boolean existsByFlotaVehicularIdAndActivoId(UUID flotaVehicularId, UUID activoId) {
        return springRepository.existsByFlotaVehicularIdAndActivoId(flotaVehicularId, activoId);
    }

    @Override
    public boolean existsByFlotaVehicularIdAndActivoIdAndIdNot(UUID flotaVehicularId, UUID activoId, UUID id) {
        return springRepository.existsByFlotaVehicularIdAndActivoIdAndIdNot(flotaVehicularId, activoId, id);
    }
}
