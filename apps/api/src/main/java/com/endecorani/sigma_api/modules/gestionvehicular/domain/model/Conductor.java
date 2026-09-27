package com.endecorani.sigma_api.modules.gestionvehicular.domain.model;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoConductor;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoLicenciaConductor;
import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Conductor extends AuditableModel {
    private UUID id;
    private UUID empleadoId;
    private EstadoConductor estado;
    private String observacion;
    private boolean activo;

    @Builder.Default
    private List<ConductorLicencia> licencias = new ArrayList<>();

    public String getNumeroLicencia() {
        if (licencias == null || licencias.isEmpty()) {
            return null;
        }
        return licencias.stream()
                .filter(l -> l.getEstado() == EstadoLicenciaConductor.VIGENTE)
                .findFirst()
                .orElse(licencias.get(0))
                .getNumeroLicencia();
    }

    public String getCategoriaLicencia() {
        if (licencias == null || licencias.isEmpty()) {
            return null;
        }
        return licencias.stream()
                .filter(l -> l.getEstado() == EstadoLicenciaConductor.VIGENTE)
                .findFirst()
                .orElse(licencias.get(0))
                .getCategoriaLicencia();
    }

    public LocalDate getFechaVencimiento() {
        if (licencias == null || licencias.isEmpty()) {
            return null;
        }
        return licencias.stream()
                .filter(l -> l.getEstado() == EstadoLicenciaConductor.VIGENTE)
                .findFirst()
                .orElse(licencias.get(0))
                .getFechaVencimiento();
    }
}