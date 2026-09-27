package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.FlotaVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.FlotaVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.FlotaVehicularEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper.FlotaVehicularPersistenceMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringFlotaVehicularRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class FlotaVehicularRepositoryAdapter implements FlotaVehicularRepository {

    private final SpringFlotaVehicularRepository springRepository;
    private final FlotaVehicularPersistenceMapper mapper;

    @Override
    public Page<FlotaVehicular> findAll(Pageable pageable) {
        return springRepository.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public Page<FlotaVehicular> searchWithFilters(String search, Boolean activo, Pageable pageable) {
        return springRepository.searchWithFilters(search, activo, pageable).map(mapper::toDomain);
    }

    @Override
    public List<FlotaVehicular> findAllActivos() {
        return springRepository.findByActivoTrueOrderByNombreAsc().stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Optional<FlotaVehicular> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<FlotaVehicular> findByCodigo(String codigo) {
        return springRepository.findByCodigoIgnoreCase(codigo).map(mapper::toDomain);
    }

    @Override
    public FlotaVehicular save(FlotaVehicular flotaVehicular) {
        FlotaVehicularEntity entity = mapper.toEntity(flotaVehicular);
        FlotaVehicularEntity saved = springRepository.save(entity);
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
    public boolean existsByCodigoIgnoreCase(String codigo) {
        return springRepository.existsByCodigoIgnoreCase(codigo);
    }

    @Override
    public boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id) {
        return springRepository.existsByCodigoIgnoreCaseAndIdNot(codigo, id);
    }
}
