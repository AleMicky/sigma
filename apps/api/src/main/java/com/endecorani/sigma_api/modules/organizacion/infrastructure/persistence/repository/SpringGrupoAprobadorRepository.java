package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.GrupoAprobadorEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringGrupoAprobadorRepository
        extends BaseJpaRepository<
        GrupoAprobadorEntity,
        UUID
        > {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

    @Query("""
            select grupoAprobador
            from GrupoAprobadorEntity grupoAprobador
            where lower(grupoAprobador.codigo) like lower(concat('%', :query, '%'))
               or lower(grupoAprobador.nombre) like lower(concat('%', :query, '%'))
            """)
    Page<GrupoAprobadorEntity> search(
            @Param("query") String query,
            Pageable pageable
    );
}
