package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.TipoSolicitudVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.TipoSolicitudVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.TipoSolicitudVehicularEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper.TipoSolicitudVehicularPersistenceMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringTipoSolicitudVehicularRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class TipoSolicitudVehicularRepositoryAdapter implements TipoSolicitudVehicularRepository {

    private final SpringTipoSolicitudVehicularRepository springRepository;
    private final TipoSolicitudVehicularPersistenceMapper mapper;

    @Override
    public Page<TipoSolicitudVehicular> findAll(Pageable pageable) {
        return springRepository.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public Page<TipoSolicitudVehicular> search(String search, Pageable pageable) {
        return springRepository.search(search, pageable).map(mapper::toDomain);
    }

    @Override
    public Optional<TipoSolicitudVehicular> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<TipoSolicitudVehicular> findByCodigo(String codigo) {
        return springRepository.findByCodigoIgnoreCase(codigo).map(mapper::toDomain);
    }

    @Override
    public TipoSolicitudVehicular save(TipoSolicitudVehicular tipoSolicitudVehicular) {
        TipoSolicitudVehicularEntity entity = mapper.toEntity(tipoSolicitudVehicular);
        TipoSolicitudVehicularEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
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
    public boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id) {
        return springRepository.existsByCodigoIgnoreCaseAndIdNot(codigo, id);
    }
}
