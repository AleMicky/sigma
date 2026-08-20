package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.organizacion.domain.model.Persona;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.PersonaRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.PersonaEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.mapper.PersonaPersistenceMapper;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class PersonaRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        Persona,
        PersonaEntity,
        UUID
        >
        implements PersonaRepository {

    private final SpringPersonaRepository springRepository;

    private final PersonaPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            PersonaEntity,
            UUID
            > jpaRepository() {

        return springRepository;
    }

    @Override
    protected PersonaEntity toEntity(Persona domain) {
        return mapper.toEntity(domain);
    }

    @Override
    protected Persona toDomain(PersonaEntity entity) {
        return mapper.toDomain(entity);
    }

    @Override
    public boolean existsByDocumento(
            String tipoDocumento,
            String numeroDocumento,
            String complemento
    ) {
        return springRepository.existsByDocumento(
                tipoDocumento,
                numeroDocumento,
                complemento
        );
    }

    @Override
    public boolean existsByDocumentoAndIdNot(
            String tipoDocumento,
            String numeroDocumento,
            String complemento,
            UUID id
    ) {
        return springRepository.existsByDocumentoAndIdNot(
                tipoDocumento,
                numeroDocumento,
                complemento,
                id
        );
    }

    @Override
    public Page<Persona> search(String query, Pageable pageable) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }
}