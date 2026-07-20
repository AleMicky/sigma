package com.endecorani.sigma_api.shared.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface BaseJpaRepository<ENTITY, ID> extends JpaRepository<ENTITY, ID> {
}
