package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.PersonaEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringPersonaRepository
        extends BaseJpaRepository<
        PersonaEntity,
        UUID
        > {

    @Query("""
            select (count(p) > 0)
            from PersonaEntity p
            where lower(p.tipoDocumento) = lower(:tipoDocumento)
              and lower(p.numeroDocumento) = lower(:numeroDocumento)
              and coalesce(lower(p.complemento), '') = coalesce(lower(:complemento), '')
            """)
    boolean existsByDocumento(
            @Param("tipoDocumento") String tipoDocumento,
            @Param("numeroDocumento") String numeroDocumento,
            @Param("complemento") String complemento
    );

    @Query("""
            select (count(p) > 0)
            from PersonaEntity p
            where p.id <> :id
              and lower(p.tipoDocumento) = lower(:tipoDocumento)
              and lower(p.numeroDocumento) = lower(:numeroDocumento)
              and coalesce(lower(p.complemento), '') = coalesce(lower(:complemento), '')
            """)
    boolean existsByDocumentoAndIdNot(
            @Param("tipoDocumento") String tipoDocumento,
            @Param("numeroDocumento") String numeroDocumento,
            @Param("complemento") String complemento,
            @Param("id") UUID id
    );

    @Query("""
            select persona
            from PersonaEntity persona
            where lower(persona.nombres) like lower(concat('%', :query, '%'))
               or lower(persona.primerApellido) like lower(concat('%', :query, '%'))
               or lower(persona.segundoApellido) like lower(concat('%', :query, '%'))
               or lower(persona.numeroDocumento) like lower(concat('%', :query, '%'))
            """)
    Page<PersonaEntity> search(
            @Param("query") String query,
            Pageable pageable
    );
}