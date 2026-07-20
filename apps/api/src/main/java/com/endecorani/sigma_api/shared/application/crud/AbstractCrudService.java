package com.endecorani.sigma_api.shared.application.crud;

import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional
    public RESPONSE create(REQUEST request) {
        DOMAIN domain = toDomain(request);
        DOMAIN saved = repository().save(domain);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public RESPONSE update(ID id, REQUEST request) {
        DOMAIN domain = findDomainById(id);
        updateDomain(domain, request);
        DOMAIN updated = repository().save(domain);
        return toResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public RESPONSE findById(ID id) {
        return toResponse(findDomainById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RESPONSE> findAll(PageRequestDto pageRequest) {
        return PageResponse.from(
                repository().findAll(pageRequest.toPageable()),
                this::toResponse
        );
    }

    @Override
    @Transactional
    public void delete(ID id) {
        if (!repository().existsById(id)) {
            throw new ResourceNotFoundException(
                    resourceName(),
                    id
            );
        }
        repository().deleteById(id);
    }

    protected DOMAIN findDomainById(ID id) {
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
