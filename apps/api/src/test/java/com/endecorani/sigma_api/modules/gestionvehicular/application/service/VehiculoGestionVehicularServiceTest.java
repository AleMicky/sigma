package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoValorEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.EstadoOperativoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.TipoActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringEstadoOperativoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringTipoActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.vehiculo.response.VehiculoCatalogoResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.FlotaVehicularEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.FlotaVehiculoEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringFlotaVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringFlotaVehiculoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringVehiculoCatalogoRepository;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.TipoDatoEntity;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.UbicacionEntity;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository.SpringTipoDatoRepository;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository.SpringUbicacionRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VehiculoGestionVehicularServiceTest {

    @Mock
    private SpringVehiculoCatalogoRepository vehiculoCatalogoRepository;
    @Mock
    private SpringTipoActivoRepository tipoActivoRepository;
    @Mock
    private SpringActivoAtributoRepository activoAtributoRepository;
    @Mock
    private SpringActivoAtributoValorRepository activoAtributoValorRepository;
    @Mock
    private SpringTipoDatoRepository tipoDatoRepository;
    @Mock
    private SpringUbicacionRepository ubicacionRepository;
    @Mock
    private SpringEstadoOperativoRepository estadoOperativoRepository;
    @Mock
    private SpringFlotaVehiculoRepository flotaVehiculoRepository;
    @Mock
    private SpringFlotaVehicularRepository flotaVehicularRepository;

    private VehiculoGestionVehicularService service;

    @BeforeEach
    void setUp() {
        service = new VehiculoGestionVehicularService(
                vehiculoCatalogoRepository,
                tipoActivoRepository,
                activoAtributoRepository,
                activoAtributoValorRepository,
                tipoDatoRepository,
                ubicacionRepository,
                estadoOperativoRepository,
                flotaVehiculoRepository,
                flotaVehicularRepository,
                JsonMapper.builder().build()
        );
    }

    @Test
    void retornaPaginaVaciaCuandoNoExisteTipoVehiculo() {
        TipoActivoEntity computador = new TipoActivoEntity();
        computador.setId(UUID.randomUUID());
        computador.setNombre("Computador");

        when(tipoActivoRepository.findAll()).thenReturn(List.of(computador));

        PageResponse<VehiculoCatalogoResponse> response = service.listarVehiculos(
                null,
                null,
                null,
                null,
                null,
                new PageRequestDto()
        );

        assertTrue(response.empty());
        assertEquals(0, response.totalElements());
        verifyNoInteractions(vehiculoCatalogoRepository);
    }

    @Test
    void listaVehiculosConAtributosFormateadosImagenYFlotas() {
        UUID tipoVehiculoId = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();
        UUID ubicacionId = UUID.randomUUID();
        UUID estadoId = UUID.randomUUID();
        UUID flotaId = UUID.randomUUID();
        UUID tipoDatoSelectId = UUID.randomUUID();
        UUID tipoDatoBooleanId = UUID.randomUUID();
        UUID attrCombustibleId = UUID.randomUUID();
        UUID attrGpsId = UUID.randomUUID();
        UUID attrOcultoId = UUID.randomUUID();

        TipoActivoEntity tipoVehiculo = new TipoActivoEntity();
        tipoVehiculo.setId(tipoVehiculoId);
        tipoVehiculo.setNombre("Vehículo");
        tipoVehiculo.setColor("#06B6D4");
        tipoVehiculo.setIcono("Car");

        ActivoEntity vehiculo = new ActivoEntity();
        vehiculo.setId(activoId);
        vehiculo.setCodigo("VEH-001");
        vehiculo.setCodigoAlternativo("4521-XYZ");
        vehiculo.setNombre("Toyota Hilux 4x4");
        vehiculo.setTipoActivoId(tipoVehiculoId);
        vehiculo.setUbicacionId(ubicacionId);
        vehiculo.setEstadoOperativoId(estadoId);
        vehiculo.setFechaAdquisicion(LocalDate.of(2025, 3, 15));
        vehiculo.setUrlImagen("/api/v1/uploads/activos/hilux.jpg");
        vehiculo.setActivo(true);

        ActivoAtributoEntity attrCombustible = new ActivoAtributoEntity();
        attrCombustible.setId(attrCombustibleId);
        attrCombustible.setTipoActivoId(tipoVehiculoId);
        attrCombustible.setCodigo("COMBUSTIBLE");
        attrCombustible.setEtiqueta("Combustible");
        attrCombustible.setTipoDatoId(tipoDatoSelectId);
        attrCombustible.setOrden(1);
        attrCombustible.setVisible(true);
        attrCombustible.setOpciones("[{\"value\":\"DIESEL\",\"label\":\"Diésel\"}]");

        ActivoAtributoEntity attrGps = new ActivoAtributoEntity();
        attrGps.setId(attrGpsId);
        attrGps.setTipoActivoId(tipoVehiculoId);
        attrGps.setCodigo("TIENE_GPS");
        attrGps.setEtiqueta("Cuenta con GPS");
        attrGps.setTipoDatoId(tipoDatoBooleanId);
        attrGps.setOrden(2);
        attrGps.setVisible(true);

        ActivoAtributoEntity attrOculto = new ActivoAtributoEntity();
        attrOculto.setId(attrOcultoId);
        attrOculto.setTipoActivoId(tipoVehiculoId);
        attrOculto.setCodigo("INTERNO");
        attrOculto.setEtiqueta("Interno");
        attrOculto.setTipoDatoId(tipoDatoBooleanId);
        attrOculto.setOrden(3);
        attrOculto.setVisible(false);

        ActivoAtributoEntity attrVisibleNull = new ActivoAtributoEntity();
        attrVisibleNull.setId(UUID.randomUUID());
        attrVisibleNull.setTipoActivoId(tipoVehiculoId);
        attrVisibleNull.setCodigo("SIN_FLAG");
        attrVisibleNull.setEtiqueta("Sin Flag");
        attrVisibleNull.setTipoDatoId(tipoDatoBooleanId);
        attrVisibleNull.setOrden(4);
        attrVisibleNull.setVisible(null);

        TipoDatoEntity tdSelect = new TipoDatoEntity();
        tdSelect.setId(tipoDatoSelectId);
        tdSelect.setCodigo("SELECT");

        TipoDatoEntity tdBoolean = new TipoDatoEntity();
        tdBoolean.setId(tipoDatoBooleanId);
        tdBoolean.setCodigo("BOOLEAN");

        ActivoAtributoValorEntity valCombustible = new ActivoAtributoValorEntity();
        valCombustible.setActivoId(activoId);
        valCombustible.setActivoAtributoId(attrCombustibleId);
        valCombustible.setValor("DIESEL");

        ActivoAtributoValorEntity valGps = new ActivoAtributoValorEntity();
        valGps.setActivoId(activoId);
        valGps.setActivoAtributoId(attrGpsId);
        valGps.setValor("true");

        UbicacionEntity ubicacion = new UbicacionEntity();
        ubicacion.setId(ubicacionId);
        ubicacion.setCodigo("CBBA");
        ubicacion.setNombre("Central Corani");

        EstadoOperativoEntity estado = new EstadoOperativoEntity();
        estado.setId(estadoId);
        estado.setCodigo("OPERATIVO");
        estado.setNombre("Operativo");
        estado.setColor("#10B981");

        FlotaVehiculoEntity link = new FlotaVehiculoEntity();
        link.setActivoId(activoId);
        link.setFlotaVehicularId(flotaId);
        link.setActivo(true);

        FlotaVehicularEntity flota = new FlotaVehicularEntity();
        flota.setId(flotaId);
        flota.setCodigo("FL-01");
        flota.setNombre("Flota Operaciones");
        flota.setActivo(true);

        when(tipoActivoRepository.findAll()).thenReturn(List.of(tipoVehiculo));
        when(vehiculoCatalogoRepository.searchVehiculos(
                anyCollection(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                any(Pageable.class)
        )).thenReturn(new PageImpl<>(List.of(vehiculo)));
        when(activoAtributoRepository.findByTipoActivoId(tipoVehiculoId))
                .thenReturn(List.of(attrGps, attrOculto, attrVisibleNull, attrCombustible));
        when(tipoDatoRepository.findAllById(anyCollection())).thenReturn(List.of(tdSelect, tdBoolean));
        when(activoAtributoValorRepository.findByActivoIdIn(List.of(activoId)))
                .thenReturn(List.of(valCombustible, valGps));
        when(ubicacionRepository.findAllById(anyCollection())).thenReturn(List.of(ubicacion));
        when(estadoOperativoRepository.findAllById(anyCollection())).thenReturn(List.of(estado));
        when(flotaVehiculoRepository.findByActivoIdInAndActivoTrue(List.of(activoId)))
                .thenReturn(List.of(link));
        when(flotaVehicularRepository.findAllById(anyCollection())).thenReturn(List.of(flota));

        PageResponse<VehiculoCatalogoResponse> response = service.listarVehiculos(
                null,
                null,
                null,
                null,
                null,
                new PageRequestDto()
        );

        assertEquals(1, response.content().size());
        VehiculoCatalogoResponse item = response.content().getFirst();
        assertEquals("VEH-001", item.codigo());
        assertEquals("/api/v1/uploads/activos/hilux.jpg", item.urlImagen());
        assertNotNull(item.estadoOperativo());
        assertEquals("Operativo", item.estadoOperativo().nombre());
        assertEquals(1, item.flotas().size());
        assertEquals("Flota Operaciones", item.flotas().getFirst().nombre());
        assertEquals(2, item.atributos().size());
        assertEquals("COMBUSTIBLE", item.atributos().get(0).codigo());
        assertEquals(Boolean.TRUE, item.atributos().get(0).visible());
        assertEquals("Diésel", item.atributos().get(0).valorFormateado());
        assertEquals("TIENE_GPS", item.atributos().get(1).codigo());
        assertEquals(Boolean.TRUE, item.atributos().get(1).visible());
        assertEquals("Sí", item.atributos().get(1).valorFormateado());
    }

    @Test
    void rechazaActivoQueNoEsTipoVehiculoEnDetalle() {
        UUID tipoVehiculoId = UUID.randomUUID();
        UUID tipoOtroId = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();

        TipoActivoEntity tipoVehiculo = new TipoActivoEntity();
        tipoVehiculo.setId(tipoVehiculoId);
        tipoVehiculo.setNombre("Vehículo");

        ActivoEntity computador = new ActivoEntity();
        computador.setId(activoId);
        computador.setTipoActivoId(tipoOtroId);

        when(tipoActivoRepository.findAll()).thenReturn(List.of(tipoVehiculo));
        when(vehiculoCatalogoRepository.findById(activoId)).thenReturn(Optional.of(computador));

        assertThrows(ResourceNotFoundException.class, () -> service.obtenerVehiculoPorId(activoId));
    }
}
