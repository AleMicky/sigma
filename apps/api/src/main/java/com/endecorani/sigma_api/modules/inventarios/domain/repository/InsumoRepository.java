package com.endecorani.sigma_api.modules.inventarios.domain.repository;

import com.endecorani.sigma_api.modules.inventarios.domain.model.Insumo;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;

import java.util.UUID;

public interface InsumoRepository extends CrudRepository<Insumo, UUID> {
}
