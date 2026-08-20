package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.parametros.domain.model.Correlativo;
import com.endecorani.sigma_api.modules.parametros.domain.repository.CorrelativoRepository;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.mapper.CorrelativoPersistenceMapper;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository.SpringCorrelativoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class CorrelativoRepositoryImpl implements CorrelativoRepository {

    private final SpringCorrelativoRepository repository;

    private final CorrelativoPersistenceMapper mapper;

    @Override
    public Correlativo save(Correlativo correlativo) {

        var entity = mapper.toEntity(correlativo);
        var saved = repository.save(entity);
        return mapper.toDomain(saved);

    }

    @Override
    public Optional<Correlativo> findById(UUID id) {
        return repository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<Correlativo> findForUpdate(String codigo, Integer gestion) {
        return repository.findForUpdate(codigo, gestion).map(mapper::toDomain);
    }

    @Override
    public boolean existsByCodigoAndGestion(String codigo, Integer gestion) {
        return repository.existsByCodigoIgnoreCaseAndGestion(codigo, gestion);
    }

}
