package com.endecorani.sigma_api.modules.seguridad.domain.repository;

import com.endecorani.sigma_api.modules.seguridad.domain.model.RolMenu;

import java.util.List;
import java.util.UUID;

public interface RolMenuRepository {

    List<RolMenu> findByRolId(UUID rolId);

    List<RolMenu> findByRolIdIn(List<UUID> rolIds);

    List<UUID> findMenuIdsByRolId(UUID rolId);

    void asignarMenusARol(UUID rolId, List<UUID> menuIds);

    void deleteByRolId(UUID rolId);
}
