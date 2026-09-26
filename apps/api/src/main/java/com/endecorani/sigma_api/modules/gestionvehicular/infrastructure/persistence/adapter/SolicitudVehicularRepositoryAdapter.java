package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SolicitudVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SolicitudVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.SolicitudVehicularEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.mapper.SolicitudVehicularPersistenceMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringSolicitudVehicularRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class SolicitudVehicularRepositoryAdapter implements SolicitudVehicularRepository {

    private final SpringSolicitudVehicularRepository springRepository;
    private final SolicitudVehicularPersistenceMapper mapper;

    @Override
    public Page<SolicitudVehicular> findAll(Pageable pageable) {
        return springRepository.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public Page<SolicitudVehicular> search(String search, Pageable pageable) {
        return springRepository.search(search, pageable).map(mapper::toDomain);
    }

    @Override
    public Page<SolicitudVehicular> searchWithFilters(
            String search,
            String estado,
            UUID tipoSolicitudVehicularId,
            UUID solicitanteId,
            Pageable pageable
    ) {
        return springRepository.searchWithFilters(search, estado, tipoSolicitudVehicularId, solicitanteId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Optional<SolicitudVehicular> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<SolicitudVehicular> findByNumero(String numero) {
        return springRepository.findByNumeroIgnoreCase(numero).map(mapper::toDomain);
    }

    @Override
    public SolicitudVehicular save(SolicitudVehicular solicitudVehicular) {
        SolicitudVehicularEntity entity = mapper.toEntity(solicitudVehicular);
        SolicitudVehicularEntity saved = springRepository.save(entity);
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
}
