package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.parametros.domain.enums.TipoUbicacion;
import com.endecorani.sigma_api.modules.parametros.domain.model.Ubicacion;
import com.endecorani.sigma_api.modules.parametros.domain.repository.UbicacionRepository;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.UbicacionEntity;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.mapper.UbicacionPersistenceMapper;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository.SpringUbicacionRepository;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class UbicacionRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        Ubicacion,
        UbicacionEntity,
        UUID
        >
        implements UbicacionRepository {

    private final SpringUbicacionRepository springRepository;

    private final UbicacionPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            UbicacionEntity,
            UUID
            > jpaRepository() {
        return springRepository;
    }

    @Override
    protected UbicacionEntity toEntity(Ubicacion domain) {
        return mapper.toEntity(domain);
    }

    @Override
    protected Ubicacion toDomain(UbicacionEntity entity) {
        return mapper.toDomain(entity);
    }

    @Override
    public boolean existsByCodigoIgnoreCase(String codigo) {
        return springRepository.existsByCodigoIgnoreCase(codigo);
    }

    @Override
    public boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    ) {
        return springRepository.existsByCodigoIgnoreCaseAndIdNot(codigo, id);
    }

    @Override
    public Page<Ubicacion> search(
            String query,
            Pageable pageable
    ) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Ubicacion> findByTipo(
            TipoUbicacion tipo,
            Pageable pageable
    ) {
        return springRepository
                .findByTipo(tipo, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public List<Ubicacion> findByUbicacionPadreId(UUID ubicacionPadreId) {
        return springRepository
                .findByUbicacionPadreId(ubicacionPadreId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<Ubicacion> findByUbicacionPadreIdIsNull() {
        return springRepository
                .findByUbicacionPadreIdIsNull()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<Ubicacion> findAll() {
        return springRepository
                .findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public boolean existsByUbicacionPadreId(UUID ubicacionPadreId) {
        return springRepository.existsByUbicacionPadreId(ubicacionPadreId);
    }
}