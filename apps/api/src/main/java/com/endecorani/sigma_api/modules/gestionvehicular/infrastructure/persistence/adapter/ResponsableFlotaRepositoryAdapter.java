package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.ResponsableFlota;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ResponsableFlotaRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ResponsableFlotaEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper.ResponsableFlotaPersistenceMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringResponsableFlotaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ResponsableFlotaRepositoryAdapter implements ResponsableFlotaRepository {

    private final SpringResponsableFlotaRepository springRepository;
    private final ResponsableFlotaPersistenceMapper mapper;

    @Override
    public Page<ResponsableFlota> findAll(Pageable pageable) {
        return springRepository.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public Page<ResponsableFlota> searchWithFilters(UUID flotaVehicularId, UUID empleadoId, Boolean principal, Boolean activo, Pageable pageable) {
        return springRepository.searchWithFilters(flotaVehicularId, empleadoId, principal, activo, pageable).map(mapper::toDomain);
    }

    @Override
    public List<ResponsableFlota> findByFlotaVehicularId(UUID flotaVehicularId) {
        return springRepository.findByFlotaVehicularId(flotaVehicularId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<ResponsableFlota> findByEmpleadoId(UUID empleadoId) {
        return springRepository.findByEmpleadoId(empleadoId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Optional<ResponsableFlota> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<ResponsableFlota> findByFlotaVehicularIdAndEmpleadoId(UUID flotaVehicularId, UUID empleadoId) {
        return springRepository.findByFlotaVehicularIdAndEmpleadoId(flotaVehicularId, empleadoId).map(mapper::toDomain);
    }

    @Override
    public ResponsableFlota save(ResponsableFlota responsableFlota) {
        ResponsableFlotaEntity entity = mapper.toEntity(responsableFlota);
        ResponsableFlotaEntity saved = springRepository.save(entity);
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
    public boolean existsByFlotaVehicularIdAndEmpleadoId(UUID flotaVehicularId, UUID empleadoId) {
        return springRepository.existsByFlotaVehicularIdAndEmpleadoId(flotaVehicularId, empleadoId);
    }

    @Override
    public boolean existsByFlotaVehicularIdAndEmpleadoIdAndIdNot(UUID flotaVehicularId, UUID empleadoId, UUID id) {
        return springRepository.existsByFlotaVehicularIdAndEmpleadoIdAndIdNot(flotaVehicularId, empleadoId, id);
    }
}
