package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.CargoEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringCargoRepository
        extends BaseJpaRepository<
        CargoEntity,
        UUID
        > {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

    @Query("""
            select cargo
            from CargoEntity cargo
            where lower(cargo.codigo) like lower(concat('%', :query, '%'))
               or lower(cargo.nombre) like lower(concat('%', :query, '%'))
            """)
    Page<CargoEntity> search(
            @Param("query") String query,
            Pageable pageable
    );
}