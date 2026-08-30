package com.endecorani.sigma_api.modules.workflow.infrastructure.flowable;

import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowActionResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowFieldResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class BpmnDefinitionParserTest {

    private BpmnDefinitionParser parser;
    private String bpmnXml;

    @BeforeEach
    void setUp() throws Exception {
        parser = new BpmnDefinitionParser();
        try (InputStream is = getClass().getResourceAsStream("/processes/solicitudMantenimientoProcess.bpmn20.xml")) {
            assertNotNull(is, "El archivo BPMN debe existir en resources");
            bpmnXml = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    @Test
    void testRevisarSolicitudAcciones() {
        List<WorkflowActionResponse> actions = parser.obtenerAcciones(bpmnXml, "revisarSolicitud");
        assertFalse(actions.isEmpty(), "revisarSolicitud debe tener acciones");
        assertEquals(2, actions.size());
        assertTrue(actions.stream().anyMatch(a -> a.name().equalsIgnoreCase("Aprobar")));
        assertTrue(actions.stream().anyMatch(a -> a.name().equalsIgnoreCase("Observar")));
    }

    @Test
    void testIniciarMantenimientoAcciones() {
        List<WorkflowActionResponse> actions = parser.obtenerAcciones(bpmnXml, "iniciarMantenimiento");
        assertFalse(actions.isEmpty(), "iniciarMantenimiento debe tener acciones directas");
        assertEquals("Iniciar mantenimiento", actions.getFirst().name());
    }

    @Test
    void testRevisarSolicitudCampos() {
        List<WorkflowFieldResponse> fields = parser.obtenerCampos(bpmnXml, "revisarSolicitud");
        assertNotNull(fields);
        assertEquals(2, fields.size());

        WorkflowFieldResponse responsableField = fields.stream()
                .filter(f -> "responsableId".equals(f.getId()))
                .findFirst()
                .orElse(null);

        assertNotNull(responsableField);
        assertEquals("Responsable de mantenimiento", responsableField.getName());
        assertEquals("string", responsableField.getType());
        assertTrue(Boolean.TRUE.equals(responsableField.getRequired()));
        assertTrue(Boolean.TRUE.equals(responsableField.getWritable()));
        assertEquals("select", responsableField.getComponent());
        assertEquals("rest", responsableField.getSource());
        assertEquals("/api/v1/usuarios", responsableField.getUrl());
        assertNotNull(responsableField.getParams());
        assertEquals("RESPONSABLE_MANTENIMIENTO", responsableField.getParams().get("rol"));
        assertEquals("${areaSolicitanteId}", responsableField.getParams().get("areaId"));
        assertEquals("true", responsableField.getParams().get("activo"));

        WorkflowFieldResponse comentarioField = fields.stream()
                .filter(f -> "comentario".equals(f.getId()))
                .findFirst()
                .orElse(null);

        assertNotNull(comentarioField);
        assertEquals("Comentario", comentarioField.getName());
        assertFalse(Boolean.TRUE.equals(comentarioField.getRequired()));
        assertTrue(Boolean.TRUE.equals(comentarioField.getWritable()));
    }
}
