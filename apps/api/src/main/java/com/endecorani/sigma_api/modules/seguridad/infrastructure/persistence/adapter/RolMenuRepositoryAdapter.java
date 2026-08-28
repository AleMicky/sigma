package com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.seguridad.domain.model.RolMenu;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.RolMenuRepository;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.MenuEntity;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.RolEntity;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.RolMenuEntity;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.mapper.RolMenuPersistenceMapper;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.RolMenuJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class RolMenuRepositoryAdapter implements RolMenuRepository {

    private final RolMenuJpaRepository rolMenuJpaRepository;
    private final RolMenuPersistenceMapper mapper;

    @Override
    public List<RolMenu> findByRolId(UUID rolId) {
        return rolMenuJpaRepository.findByRolId(rolId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<RolMenu> findByRolIdIn(List<UUID> rolIds) {
        return rolMenuJpaRepository.findByRolIdIn(rolIds)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<UUID> findMenuIdsByRolId(UUID rolId) {
        return rolMenuJpaRepository.findByRolId(rolId)
                .stream()
                .map(rm -> rm.getMenu().getId())
                .toList();
    }

    @Override
    public void asignarMenusARol(UUID rolId, List<UUID> menuIds) {
        rolMenuJpaRepository.deleteByRolId(rolId);
        if (menuIds != null && !menuIds.isEmpty()) {
            List<RolMenuEntity> entities = menuIds.stream()
                    .distinct()
                    .map(menuId -> {
                        RolEntity rol = new RolEntity();
                        rol.setId(rolId);
                        MenuEntity menu = new MenuEntity();
                        menu.setId(menuId);
                        RolMenuEntity entity = RolMenuEntity.builder()
                                .rol(rol)
                                .menu(menu)
                                .build();
                        return entity;
                    })
                    .toList();
            rolMenuJpaRepository.saveAll(entities);
        }
    }

    @Override
    public void deleteByRolId(UUID rolId) {
        rolMenuJpaRepository.deleteByRolId(rolId);
    }
}
