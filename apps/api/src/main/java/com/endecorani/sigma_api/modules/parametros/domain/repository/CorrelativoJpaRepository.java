package com.endecorani.sigma_api.modules.parametros.domain.repository;

import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.CorrelativoEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface CorrelativoJpaRepository extends JpaRepository<CorrelativoEntity, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
                SELECT c
                FROM CorrelativoEntity c
                WHERE c.codigo = :codigo
                  AND c.gestion = :gestion
            """)
    Optional<CorrelativoEntity> findForUpdate(
            @Param("codigo") String codigo,
            @Param("gestion") Integer gestion
    );

}
