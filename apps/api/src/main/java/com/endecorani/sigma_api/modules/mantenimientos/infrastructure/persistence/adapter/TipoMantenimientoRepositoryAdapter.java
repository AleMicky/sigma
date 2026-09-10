package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;


import com.endecorani.sigma_api.modules.mantenimientos.domain.model.TipoMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.TipoMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.TipoMantenimientoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.TipoMantenimientoPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringTipoMantenimientoRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@AllArgsConstructor
public class TipoMantenimientoRepositoryAdapter implements TipoMantenimientoRepository {

    private final SpringTipoMantenimientoRepository springRepository;

    private final TipoMantenimientoPersistenceMapper mapper;

    @Override
    public Page<TipoMantenimiento> findAll(
            Pageable pageable
    ) {
        return springRepository.findAll(pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<TipoMantenimiento> search(
            String search,
            Pageable pageable
    ) {
        return springRepository.search(search, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Optional<TipoMantenimiento> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public TipoMantenimiento save(TipoMantenimiento tipo) {

        TipoMantenimientoEntity entity = mapper.toEntity(tipo);
        TipoMantenimientoEntity saved = springRepository.save(entity);

        return mapper.toDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }

    @Override
    public boolean existsByCodigoIgnoreCase(
            String codigo
    ) {
        return springRepository
                .existsByCodigoIgnoreCase(codigo);
    }

    @Override
    public boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    ) {
        return springRepository
                .existsByCodigoIgnoreCaseAndIdNot(
                        codigo,
                        id
                );
    }


}