package com.endecorani.sigma_api.modules.organizacion.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmpleadoInfoResolver {

    public record EmpleadoResumen(String nombreCompleto, String cargo) {
        public static final EmpleadoResumen EMPTY = new EmpleadoResumen("-", "");

        public String formatearConCargo() {
            if ("-".equals(nombreCompleto) || nombreCompleto == null || nombreCompleto.isBlank()) {
                return "-";
            }
            return (cargo != null && !cargo.isBlank())
                    ? nombreCompleto + " - " + cargo
                    : nombreCompleto;
        }
    }

    private final SpringVEmpleadoRepository springVEmpleadoRepository;
    private final EmpleadoRepository empleadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public EmpleadoResumen resolveById(UUID empleadoId) {
        if (empleadoId == null) {
            return EmpleadoResumen.EMPTY;
        }

        VEmpleadoEntity ve = springVEmpleadoRepository.findById(empleadoId).orElse(null);
        if (ve != null) {
            return new EmpleadoResumen(
                    ve.getNombreCompleto() != null ? ve.getNombreCompleto() : "-",
                    ve.getCargo() != null ? ve.getCargo() : ""
            );
        }

        Empleado emp = empleadoRepository.findById(empleadoId).orElse(null);
        if (emp != null) {
            return new EmpleadoResumen(
                    emp.getNombreCompleto() != null ? emp.getNombreCompleto() : "-",
                    emp.getCargo() != null ? emp.getCargo() : ""
            );
        }

        return EmpleadoResumen.EMPTY;
    }

    @Transactional(readOnly = true)
    public Optional<UUID> resolveEmpleadoIdByUsuarioId(UUID usuarioId) {
        if (usuarioId == null) {
            return Optional.empty();
        }
        return usuarioRepository.findById(usuarioId)
                .map(Usuario::getPersonaId)
                .flatMap(empleadoRepository::findFirstByPersonaId)
                .map(Empleado::getId);
    }

    @Transactional(readOnly = true)
    public Optional<UUID> resolveCurrentEmpleadoId() {
        return securityUtils.getCurrentUserId()
                .flatMap(this::resolveEmpleadoIdByUsuarioId);
    }

    @Transactional(readOnly = true)
    public String resolveCurrentGeneradoPor() {
        return resolveCurrentEmpleadoId()
                .map(this::resolveById)
                .map(EmpleadoResumen::formatearConCargo)
                .filter(formatted -> !"-".equals(formatted))
                .orElseGet(securityUtils::getCurrentUsername);
    }
}
