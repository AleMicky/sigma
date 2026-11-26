package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.config.storage.StorageProperties;
import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoResumenResponse;
import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.model.Categoria;
import com.endecorani.sigma_api.modules.activos.domain.model.EstadoOperativo;
import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoResumenProjection;
import com.endecorani.sigma_api.modules.activos.domain.repository.CategoriaRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.EstadoOperativoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoEstadoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.modules.parametros.domain.repository.UbicacionRepository;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.infrastructure.storage.LocalImageStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * REQ-BIZ-023: cobertura de imagen, toggle, borrado y export de disponibilidad.
 * El storage es real (sobre {@code @TempDir}) para ejercitar size/MIME/firma; la BD se simula.
 */
@ExtendWith(MockitoExtension.class)
class ActivoServiceHardeningTest {

    private static final long LIMITE_20_MB = 20L * 1024 * 1024;
    private static final byte[] PNG_MAGIC = new byte[]{
            (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
    private static final byte[] JPEG_MAGIC = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0};

    @TempDir
    Path tempDir;

    @Mock private ActivoRepository activoRepository;
    @Mock private TipoActivoRepository tipoActivoRepository;
    @Mock private UbicacionRepository ubicacionRepository;
    @Mock private EstadoOperativoRepository estadoOperativoRepository;
    @Mock private TipoActivoEstadoRepository tipoActivoEstadoRepository;
    @Mock private CategoriaRepository categoriaRepository;
    @Mock private DisponibilidadActivoExcelService disponibilidadActivoExcelService;

    private LocalImageStorageService imageStorageService;
    private ActivoService service;

    @BeforeEach
    void setUp() {
        imageStorageService = spy(new LocalImageStorageService(new StorageProperties(
                tempDir.toString(),
                LIMITE_20_MB,
                List.of("image/jpeg", "image/png", "image/webp", "image/gif"))));
        service = new ActivoService(
                activoRepository,
                tipoActivoRepository,
                ubicacionRepository,
                estadoOperativoRepository,
                tipoActivoEstadoRepository,
                categoriaRepository,
                imageStorageService,
                disponibilidadActivoExcelService);
    }

    @Test
    void uploadImagen_guardaElArchivoActualizaLaUrlYConservaLaAuditoria() throws Exception {
        UUID id = UUID.randomUUID();
        Activo existente = activo(id, null, true, null);
        when(activoRepository.findById(id)).thenReturn(Optional.of(existente));
        when(activoRepository.save(any(Activo.class))).thenAnswer(inv -> inv.getArgument(0));

        ActivoResponse response = service.uploadImagen(id, png());

        assertEquals("/api/v1/files/activos/" + id + ".png", response.urlImagen());
        assertEquals("seed", response.auditoria().createdBy());
        assertEquals(existente.getCreatedAt(), response.auditoria().createdAt());
        assertTrue(Files.exists(tempDir.resolve("activos").resolve(id + ".png")));
        verify(activoRepository).save(existente);
    }

    @Test
    void uploadImagen_reemplazaUnaImagenExistenteYLimpiaElArchivoAnterior() throws Exception {
        UUID id = UUID.randomUUID();
        String urlAnterior = "/api/v1/files/activos/" + id + ".png";
        Activo existente = activo(id, urlAnterior, true, null);
        Files.createDirectories(tempDir.resolve("activos"));
        Files.write(tempDir.resolve("activos").resolve(id + ".png"), PNG_MAGIC);
        when(activoRepository.findById(id)).thenReturn(Optional.of(existente));
        when(activoRepository.save(any(Activo.class))).thenAnswer(inv -> inv.getArgument(0));

        ActivoResponse response = service.uploadImagen(id,
                new MockMultipartFile("file", "foto.jpg", "image/jpeg", JPEG_MAGIC));

        assertEquals("/api/v1/files/activos/" + id + ".jpg", response.urlImagen());
        assertFalse(Files.exists(tempDir.resolve("activos").resolve(id + ".png")));
        assertTrue(Files.exists(tempDir.resolve("activos").resolve(id + ".jpg")));
    }

    @Test
    void uploadImagen_mayorA20MB_lanza422YNoPersiste() {
        UUID id = UUID.randomUUID();
        when(activoRepository.findById(id)).thenReturn(Optional.of(activo(id, null, true, null)));
        MultipartFile demasiadoGrande = mock(MultipartFile.class);
        when(demasiadoGrande.isEmpty()).thenReturn(false);
        when(demasiadoGrande.getSize()).thenReturn(LIMITE_20_MB + 1);

        BusinessException ex = assertThrows(
                BusinessException.class, () -> service.uploadImagen(id, demasiadoGrande));

        assertEquals("INVALID_IMAGE_SIZE", ex.getCode());
        verify(activoRepository, never()).save(any());
        verify(imageStorageService, never()).delete(anyString());
    }

    @Test
    void uploadImagen_mimeNoPermitido_lanza422YNoPersiste() {
        UUID id = UUID.randomUUID();
        when(activoRepository.findById(id)).thenReturn(Optional.of(activo(id, null, true, null)));
        MockMultipartFile pdf = new MockMultipartFile(
                "file", "ficha.pdf", "application/pdf", "%PDF-1.7".getBytes());

        BusinessException ex = assertThrows(
                BusinessException.class, () -> service.uploadImagen(id, pdf));

        assertEquals("INVALID_IMAGE_CONTENT_TYPE", ex.getCode());
        verify(activoRepository, never()).save(any());
    }

    @Test
    void uploadImagen_firmaFalsificada_lanza422YNoPersiste() {
        UUID id = UUID.randomUUID();
        when(activoRepository.findById(id)).thenReturn(Optional.of(activo(id, null, true, null)));
        MockMultipartFile falso = new MockMultipartFile(
                "file", "evil.png", "image/png", "<html>fake</html>".getBytes());

        BusinessException ex = assertThrows(
                BusinessException.class, () -> service.uploadImagen(id, falso));

        assertEquals("INVALID_FILE_SIGNATURE", ex.getCode());
        verify(activoRepository, never()).save(any());
    }

    @Test
    void uploadImagen_fallaLaPersistencia_revierteLaUrlYEliminaElArchivoNuevo() throws Exception {
        UUID id = UUID.randomUUID();
        String urlAnterior = "/api/v1/files/activos/" + id + ".png";
        Path anterior = tempDir.resolve("activos").resolve(id + ".png");
        Files.createDirectories(tempDir.resolve("activos"));
        Files.write(anterior, PNG_MAGIC);
        Activo existente = activo(id, urlAnterior, true, null);
        when(activoRepository.findById(id)).thenReturn(Optional.of(existente));
        when(activoRepository.save(any(Activo.class))).thenThrow(new IllegalStateException("BD caída"));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> service.uploadImagen(id,
                        new MockMultipartFile("file", "foto.jpg", "image/jpeg", JPEG_MAGIC)));

        assertEquals("BD caída", ex.getMessage());
        // La URL en memoria/BD se conserva y el archivo nuevo no queda huérfano.
        assertEquals(urlAnterior, existente.getUrlImagen());
        assertFalse(Files.exists(tempDir.resolve("activos").resolve(id + ".jpg")));
        verify(imageStorageService).delete("/api/v1/files/activos/" + id + ".jpg");
        // LIMITACIÓN CONOCIDA (hallazgo Medio): LocalImageStorageService.store() borra
        // los archivos previos del entityId ANTES de copiar el nuevo, por lo que la
        // imagen anterior no puede restaurarse sin ampliar el puerto de storage.
        // La BD conserva la URL anterior; el archivo físico previo ya no existe.
        assertTrue(Files.notExists(anterior));
    }

    @Test
    void uploadImagen_idInexistente_lanza404YNoEscribeArchivo() {
        UUID id = UUID.randomUUID();
        when(activoRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.uploadImagen(id, png()));

        verifyNoInteractions(imageStorageService);
        verify(activoRepository, never()).save(any());
    }

    @Test
    void deleteImagen_sinImagen_noGuardaNiEliminaArchivo() {
        UUID id = UUID.randomUUID();
        when(activoRepository.findById(id)).thenReturn(Optional.of(activo(id, null, true, null)));

        ActivoResponse response = service.deleteImagen(id);

        assertNull(response.urlImagen());
        verify(activoRepository, never()).save(any());
        verify(imageStorageService, never()).delete(anyString());
    }

    @Test
    void deleteImagen_conImagen_confirmaBDantesDeBorrarElArchivo() throws Exception {
        UUID id = UUID.randomUUID();
        String url = "/api/v1/files/activos/" + id + ".png";
        Path archivo = tempDir.resolve("activos").resolve(id + ".png");
        Files.createDirectories(tempDir.resolve("activos"));
        Files.write(archivo, PNG_MAGIC);
        Activo existente = activo(id, url, true, null);
        when(activoRepository.findById(id)).thenReturn(Optional.of(existente));
        when(activoRepository.save(any(Activo.class))).thenAnswer(inv -> inv.getArgument(0));

        ActivoResponse response = service.deleteImagen(id);

        assertNull(response.urlImagen());
        assertNull(existente.getUrlImagen());
        assertFalse(Files.exists(archivo));
        InOrder orden = inOrder(activoRepository, imageStorageService);
        orden.verify(activoRepository).save(existente);
        orden.verify(imageStorageService).delete(url);
    }

    @Test
    void deleteImagen_fallaLaPersistencia_conservaElArchivo() throws Exception {
        UUID id = UUID.randomUUID();
        String url = "/api/v1/files/activos/" + id + ".png";
        Path archivo = tempDir.resolve("activos").resolve(id + ".png");
        Files.createDirectories(tempDir.resolve("activos"));
        Files.write(archivo, PNG_MAGIC);
        when(activoRepository.findById(id)).thenReturn(Optional.of(activo(id, url, true, null)));
        when(activoRepository.save(any(Activo.class))).thenThrow(new IllegalStateException("BD caída"));

        assertThrows(IllegalStateException.class, () -> service.deleteImagen(id));

        assertTrue(Files.exists(archivo));
        verify(imageStorageService, never()).delete(anyString());
    }

    @Test
    void delete_borradoFisico_confirmaBDantesDeLiberarLaImagen() throws Exception {
        UUID id = UUID.randomUUID();
        String url = "/api/v1/files/activos/" + id + ".png";
        Path archivo = tempDir.resolve("activos").resolve(id + ".png");
        Files.createDirectories(tempDir.resolve("activos"));
        Files.write(archivo, PNG_MAGIC);
        when(activoRepository.findById(id)).thenReturn(Optional.of(activo(id, url, true, null)));

        service.delete(id);

        assertFalse(Files.exists(archivo));
        InOrder orden = inOrder(activoRepository, imageStorageService);
        orden.verify(activoRepository).deleteById(id);
        orden.verify(imageStorageService).delete(url);
        verify(activoRepository, never()).save(any());
    }

    @Test
    void delete_idInexistente_lanza404YNoEjecutaBorrado() {
        UUID id = UUID.randomUUID();
        when(activoRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.delete(id));

        verify(activoRepository, never()).deleteById(any());
        verifyNoInteractions(imageStorageService);
    }

    @Test
    void toggleActivo_cambiaElFlagYElResumenReflejaLaReglaDeBajaExcluyente() {
        UUID id = UUID.randomUUID();
        UUID estadoMantenimientoId = UUID.randomUUID();
        Activo existente = activo(id, null, true, estadoMantenimientoId);
        List<Activo> almacen = new ArrayList<>(List.of(existente));
        when(activoRepository.findById(id)).thenReturn(Optional.of(existente));
        when(activoRepository.save(any(Activo.class))).thenAnswer(inv -> inv.getArgument(0));
        when(activoRepository.summarize(any(), any(), any(), any(), any(), any()))
                .thenAnswer(inv -> projection(almacen, estadoMantenimientoId));

        ActivoResumenResponse activo = service.resumen(null, null, null, null, null, null);
        assertEquals(1, activo.enMantenimiento());
        assertEquals(1, activo.disponibles() + activo.enMantenimiento());

        ActivoResponse deBaja = service.toggleActivo(id, false);
        assertFalse(deBaja.activo());
        assertNotNull(deBaja.auditoria());
        ActivoResumenResponse resumenBaja = service.resumen(null, null, null, null, null, null);
        assertEquals(1, resumenBaja.total());
        assertEquals(1, resumenBaja.deBaja(), "de baja gana sobre MANTENIMIENTO");
        assertEquals(0, resumenBaja.enMantenimiento());
        assertEquals(0, resumenBaja.disponibles());
        assertEquals(0.0, resumenBaja.tasaDisponibilidad());

        service.toggleActivo(id, true);
        ActivoResumenResponse reactivado = service.resumen(null, null, null, null, null, null);
        assertEquals(0, reactivado.deBaja());
        assertEquals(1, reactivado.enMantenimiento());
    }

    @Test
    void toggleActivo_sinValor_defaultsAActivo() {
        UUID id = UUID.randomUUID();
        Activo existente = activo(id, null, false, null);
        when(activoRepository.findById(id)).thenReturn(Optional.of(existente));
        when(activoRepository.save(any(Activo.class))).thenAnswer(inv -> inv.getArgument(0));

        ActivoResponse response = service.toggleActivo(id, null);

        assertTrue(response.activo());
    }

    @Test
    void exportarDisponibilidadExcel_aplicaLosSeisFiltrosYConstruyeElMapaDeCategorias() {
        UUID estadoId = UUID.randomUUID();
        UUID tipoId = UUID.randomUUID();
        UUID categoriaId = UUID.randomUUID();
        UUID ubicacionId = UUID.randomUUID();
        UUID activoId = UUID.randomUUID();
        Activo dominio = activo(activoId, null, false, estadoId);
        dominio.setTipoActivoId(tipoId);
        byte[] excel = new byte[]{1, 2, 3};
        when(activoRepository.findForDisponibilidadExport(
                "ACT 1", estadoId, tipoId, categoriaId, ubicacionId, false))
                .thenReturn(List.of(dominio));
        when(tipoActivoRepository.findAllById(Set.of(tipoId))).thenReturn(List.of(
                TipoActivo.builder().id(tipoId).categoriaId(categoriaId).nombre("Vehículos").build()));
        when(estadoOperativoRepository.findAllById(Set.of(estadoId))).thenReturn(List.of(
                EstadoOperativo.builder().id(estadoId).codigo("DE_BAJA").nombre("De baja").build()));
        when(categoriaRepository.findAll()).thenReturn(List.of(
                Categoria.builder().id(categoriaId).nombre("Transporte").build()));
        when(disponibilidadActivoExcelService.generarExcel(anyList(), anyMap())).thenReturn(excel);

        assertArrayEquals(excel, service.exportarDisponibilidadExcel(
                "  ACT 1  \n", estadoId, tipoId, categoriaId, ubicacionId, false));

        verify(activoRepository).findForDisponibilidadExport(
                "ACT 1", estadoId, tipoId, categoriaId, ubicacionId, false);
        @SuppressWarnings("rawtypes")
        ArgumentCaptor<Map> categorias = ArgumentCaptor.forClass(Map.class);
        @SuppressWarnings("rawtypes")
        ArgumentCaptor<List> filas = ArgumentCaptor.forClass(List.class);
        verify(disponibilidadActivoExcelService).generarExcel(filas.capture(), categorias.capture());
        @SuppressWarnings("unchecked")
        Map<UUID, String> mapaCategorias = categorias.getValue();
        assertEquals("Transporte", mapaCategorias.get(categoriaId));
        assertEquals(1, filas.getValue().size());
        @SuppressWarnings("unchecked")
        List<ActivoResponse> responseFilas = filas.getValue();
        assertEquals("De baja", responseFilas.getFirst().estadoOperativo().nombre());
    }

    private static MockMultipartFile png() {
        return new MockMultipartFile("file", "foto.png", "image/png", PNG_MAGIC);
    }

    private static Activo activo(UUID id, String urlImagen, Boolean activo, UUID estadoOperativoId) {
        return Activo.builder()
                .id(id)
                .codigo("ACT-001")
                .nombre("Activo de prueba")
                .urlImagen(urlImagen)
                .activo(activo)
                .estadoOperativoId(estadoOperativoId)
                .createdAt(Instant.parse("2026-01-01T00:00:00Z"))
                .createdBy("seed")
                .build();
    }

    private static ActivoResumenProjection projection(List<Activo> almacen, UUID estadoMantenimientoId) {
        ActivoEstadoClasificador.Conteo conteo = ActivoEstadoClasificador.Conteo.de(almacen.stream()
                .map(activo -> new ActivoResponse(
                        activo.getId(),
                        activo.getCodigo(),
                        null,
                        activo.getNombre(),
                        null,
                        null,
                        null,
                        new ActivoResponse.EstadoOperativoInfo(
                                estadoMantenimientoId, "MANTENIMIENTO", "Mantenimiento", null, null),
                        null,
                        activo.getUrlImagen(),
                        activo.getActivo(),
                        null))
                .toList());
        return new ActivoResumenProjection() {
            @Override public long getTotal() { return conteo.total(); }
            @Override public long getDeBaja() { return conteo.deBaja(); }
            @Override public long getEnMantenimiento() { return conteo.enMantenimiento(); }
            @Override public long getOperativos() { return conteo.operativos(); }
            @Override public long getOperativo() { return conteo.operativo(); }
            @Override public long getReserva() { return conteo.reserva(); }
            @Override public long getEnViaje() { return conteo.enViaje(); }
            @Override public long getFueraServicio() { return conteo.fueraServicio(); }
            @Override public long getDisponibles() { return conteo.disponibles(); }
            @Override public double getTasaDisponibilidad() { return conteo.tasaDisponibilidad(); }
        };
    }
}
