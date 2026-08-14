package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.parametros.domain.enums.TipoUbicacion;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.UbicacionEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringUbicacionRepository
        extends BaseJpaRepository<
        UbicacionEntity,
        UUID
        > {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

    @Query("""
            select ub
            from UbicacionEntity ub
            where lower(ub.codigo) like lower(concat('%', :query, '%'))
               or lower(ub.nombre) like lower(concat('%', :query, '%'))
            """)
    Page<UbicacionEntity> search(
            @Param("query") String query,
            Pageable pageable
    );

    Page<UbicacionEntity> findByTipo(
            TipoUbicacion tipo,
            Pageable pageable
    );

    List<UbicacionEntity> findByUbicacionPadreId(UUID ubicacionPadreId);

    List<UbicacionEntity> findByUbicacionPadreIdIsNull();

    boolean existsByUbicacionPadreId(UUID ubicacionPadreId);
}