package com.endecorani.sigma_api.shared.infrastructure.persistence.listener;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.shared.infrastructure.persistence.model.BaseEntity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
public class AuditUserEntityListener {

    private static ObjectProvider<SecurityUtils> securityUtilsProvider;

    @Autowired
    public void init(ObjectProvider<SecurityUtils> provider) {
        AuditUserEntityListener.securityUtilsProvider = provider;
    }

    @PrePersist
    public void prePersist(BaseEntity entity) {
        UUID currentUserId = resolveCurrentUserId();
        if (currentUserId != null) {
            if (entity.getCreatedById() == null) {
                entity.setCreatedById(currentUserId);
            }
            if (entity.getUpdatedById() == null) {
                entity.setUpdatedById(currentUserId);
            }
        }
    }

    @PreUpdate
    public void preUpdate(BaseEntity entity) {
        UUID currentUserId = resolveCurrentUserId();
        if (currentUserId != null) {
            entity.setUpdatedById(currentUserId);
        }
    }

    private UUID resolveCurrentUserId() {
        if (securityUtilsProvider != null) {
            SecurityUtils securityUtils = securityUtilsProvider.getIfAvailable();
            if (securityUtils != null) {
                return securityUtils.getCurrentUserId().orElse(null);
            }
        }
        return null;
    }
}
