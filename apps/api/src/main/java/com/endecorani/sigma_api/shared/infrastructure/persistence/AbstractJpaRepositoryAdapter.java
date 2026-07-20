package com.endecorani.sigma_api.shared.infrastructure.persistence;

import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public abstract class AbstractJpaRepositoryAdapter<
        DOMAIN,
        ENTITY,
        ID
        > implements CrudRepository<DOMAIN, ID> {

    protected abstract BaseJpaRepository<ENTITY, ID> jpaRepository();

    protected abstract ENTITY toEntity(DOMAIN domain);

    protected abstract DOMAIN toDomain(ENTITY entity);

    @Override
    public DOMAIN save(DOMAIN domain) {
        ENTITY entity = toEntity(domain);
        ENTITY saved = jpaRepository().save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<DOMAIN> findById(ID id) {
        return jpaRepository()
                .findById(id)
                .map(this::toDomain);
    }

    @Override
    public List<DOMAIN> findAll() {
        return jpaRepository()
                .findAll()
                .stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public boolean existsById(ID id) {
        return jpaRepository().existsById(id);
    }

    @Override
    public void deleteById(ID id) {
        jpaRepository().deleteById(id);
    }
}
