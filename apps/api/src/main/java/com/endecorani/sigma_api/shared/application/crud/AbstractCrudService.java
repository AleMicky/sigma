package com.endecorani.sigma_api.shared.application.crud;

import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;

import java.util.List;

public abstract class AbstractCrudService<
        DOMAIN,
        REQUEST,
        RESPONSE,
        ID
        > implements CrudService<REQUEST, RESPONSE, ID> {

    protected abstract CrudRepository<DOMAIN, ID> repository();

    protected abstract DOMAIN toDomain(REQUEST request);

    protected abstract void updateDomain(
            DOMAIN domain,
            REQUEST request
    );

    protected abstract RESPONSE toResponse(DOMAIN domain);

    protected abstract String resourceName();

    @Override
    public RESPONSE create(REQUEST request) {
        DOMAIN domain = toDomain(request);
        DOMAIN saved = repository().save(domain);
        return toResponse(saved);
    }

    @Override
    public RESPONSE update(ID id, REQUEST request) {
        DOMAIN domain = findEntityById(id);
        updateDomain(domain, request);
        DOMAIN updated = repository().save(domain);
        return toResponse(updated);

    }

    @Override
    public RESPONSE findById(ID id) {
        return toResponse(findEntityById(id));
    }

    @Override
    public List<RESPONSE> findAll() {
        return repository()
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void delete(ID id) {
        if (!repository().existsById(id)) {
            throw new ResourceNotFoundException(
                    resourceName(),
                    id
            );
        }
        repository().deleteById(id);
    }

    protected DOMAIN findEntityById(ID id) {
        return repository()
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                resourceName(),
                                id
                        )
                );
    }
}
