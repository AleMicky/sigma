package com.endecorani.sigma_api.modules.workflow.infrastructure.flowable;

import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowActionResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowFieldOptionResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowFieldResponse;
import org.springframework.stereotype.Component;
import org.w3c.dom.*;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class BpmnDefinitionParser {

    private static final Pattern CONDITION_PATTERN =
            Pattern.compile(
                    "\\$\\{\\s*([a-zA-Z0-9_]+)\\s*==\\s*['\"]([^'\"]+)['\"]\\s*}"
            );

    public List<WorkflowActionResponse> obtenerAcciones(
            String bpmnXml,
            String taskDefinitionKey
    ) {

        try {
            if (bpmnXml == null || bpmnXml.isBlank() || taskDefinitionKey == null || taskDefinitionKey.isBlank()) {
                return List.of();
            }

            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(false);

            Document document = factory.newDocumentBuilder()
                    .parse(new ByteArrayInputStream(bpmnXml.getBytes(StandardCharsets.UTF_8)));

            document.getDocumentElement().normalize();

            List<WorkflowActionResponse> actions = new ArrayList<>();
            String nextElementId = obtenerTargetDirecto(document, taskDefinitionKey);
            if (nextElementId != null) {
                Element nextElement = buscarElementoPorId(document, nextElementId);
                if (nextElement != null) {
                    String nodeName = nextElement.getNodeName();
                    if (nodeName != null && (nodeName.endsWith("exclusiveGateway") || nodeName.endsWith("Gateway"))) {
                        actions = obtenerAccionesGateway(document, nextElementId);
                    } else {
                        actions = obtenerAccionesDirectas(document, taskDefinitionKey);
                    }
                } else {
                    actions = obtenerAccionesDirectas(document, taskDefinitionKey);
                }
            } else {
                actions = obtenerAccionesDirectas(document, taskDefinitionKey);
            }

            if (actions == null || actions.isEmpty()) {
                Element taskElement = buscarElementoPorId(document, taskDefinitionKey);
                if (taskElement != null) {
                    actions = obtenerAccionesDesdeFormProperty(taskElement);
                }
            }

            if (actions == null || actions.isEmpty()) {
                actions = List.of(new WorkflowActionResponse("Completar", "action", "COMPLETAR"));
            }

            return actions;

        } catch (Exception ex) {
            return List.of(new WorkflowActionResponse("Completar", "action", "COMPLETAR"));
        }
    }

    private List<WorkflowActionResponse> obtenerAccionesDesdeFormProperty(Element taskElement) {
        List<WorkflowActionResponse> actions = new ArrayList<>();
        NodeList formProperties = taskElement.getElementsByTagName("flowable:formProperty");
        if (formProperties.getLength() == 0) {
            formProperties = taskElement.getElementsByTagName("formProperty");
        }

        for (int i = 0; i < formProperties.getLength(); i++) {
            Element fp = (Element) formProperties.item(i);
            String id = getAttributeValue(fp, "id");
            String type = getAttributeValue(fp, "type");
            if ("enum".equalsIgnoreCase(type) || "accion".equalsIgnoreCase(id) || "decision".equalsIgnoreCase(id)) {
                NodeList values = fp.getElementsByTagName("flowable:value");
                if (values.getLength() == 0) {
                    values = fp.getElementsByTagName("value");
                }
                for (int j = 0; j < values.getLength(); j++) {
                    Element val = (Element) values.item(j);
                    String valId = getAttributeValue(val, "id");
                    String valName = getAttributeValue(val, "name");
                    if (valId != null && !valId.isBlank()) {
                        actions.add(new WorkflowActionResponse(
                                valName != null && !valName.isBlank() ? valName : valId,
                                id != null && !id.isBlank() ? id : "accion",
                                valId
                        ));
                    }
                }
            }
        }
        return actions;
    }

    public List<WorkflowFieldResponse> obtenerCampos(
            String bpmnXml,
            String taskDefinitionKey
    ) {
        return obtenerCampos(bpmnXml, taskDefinitionKey, Map.of());
    }

    public List<WorkflowFieldResponse> obtenerCampos(
            String bpmnXml,
            String taskDefinitionKey,
            Map<String, Object> contextVariables
    ) {

        try {
            if (bpmnXml == null || bpmnXml.isBlank() || taskDefinitionKey == null || taskDefinitionKey.isBlank()) {
                return List.of();
            }

            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(false);

            Document document = factory.newDocumentBuilder()
                    .parse(new ByteArrayInputStream(bpmnXml.getBytes(StandardCharsets.UTF_8)));

            document.getDocumentElement().normalize();

            Element task = buscarElementoPorId(document, taskDefinitionKey);
            if (task == null) {
                return List.of();
            }

            NodeList formProperties = task.getElementsByTagName("flowable:formProperty");
            if (formProperties.getLength() == 0) {
                formProperties = task.getElementsByTagName("formProperty");
            }

            List<WorkflowFieldResponse> fields = new ArrayList<>();

            for (int i = 0; i < formProperties.getLength(); i++) {
                Element formProperty = (Element) formProperties.item(i);

                String id = getAttributeValue(formProperty, "id");
                String name = getAttributeValue(formProperty, "name");
                String type = getAttributeValue(formProperty, "type");

                boolean required = Boolean.parseBoolean(getAttributeValue(formProperty, "required"));
                boolean readable = !"false".equalsIgnoreCase(getAttributeValue(formProperty, "readable"));
                boolean writable = !"false".equalsIgnoreCase(getAttributeValue(formProperty, "writable"));

                String component = getAttributeValue(formProperty, "sigma:component", "component");
                String source = getAttributeValue(formProperty, "sigma:source", "source");
                String url = resolveVariables(getAttributeValue(formProperty, "sigma:url", "url"), contextVariables);
                String paramsStr = resolveVariables(getAttributeValue(formProperty, "sigma:params", "params"), contextVariables);
                Map<String, String> params = parseParams(paramsStr);

                List<WorkflowFieldOptionResponse> options = obtenerOpciones(formProperty);

                fields.add(WorkflowFieldResponse.builder()
                        .id(id)
                        .name(name != null && !name.isBlank() ? name : id)
                        .type(type != null && !type.isBlank() ? type : "string")
                        .required(required)
                        .readable(readable)
                        .writable(writable)
                        .component(component)
                        .source(source)
                        .url(url)
                        .params(params)
                        .options(options.isEmpty() ? null : options)
                        .build());
            }

            return fields;

        } catch (Exception ex) {
            throw new IllegalStateException(
                    "No se pudieron obtener los campos BPMN",
                    ex
            );
        }
    }

    private String resolveVariables(String text, Map<String, Object> contextVariables) {
        if (text == null || text.isBlank() || contextVariables == null || contextVariables.isEmpty()) {
            return text;
        }
        String result = text;
        for (Map.Entry<String, Object> entry : contextVariables.entrySet()) {
            if (entry.getKey() != null && entry.getValue() != null) {
                String placeholder1 = "${" + entry.getKey() + "}";
                String placeholder2 = "{" + entry.getKey() + "}";
                String valStr = entry.getValue().toString();
                result = result.replace(placeholder1, valStr).replace(placeholder2, valStr);
            }
        }
        return result;
    }

    private Map<String, String> parseParams(String paramsStr) {
        if (paramsStr == null || paramsStr.isBlank()) {
            return null;
        }

        Map<String, String> params = new LinkedHashMap<>();
        String[] pairs = paramsStr.split("[;,\n]+");
        for (String pair : pairs) {
            String trimmed = pair.trim();
            if (trimmed.isEmpty()) {
                continue;
            }
            int eqIndex = trimmed.indexOf('=');
            if (eqIndex > 0) {
                String key = trimmed.substring(0, eqIndex).trim();
                String value = trimmed.substring(eqIndex + 1).trim();
                if (!key.isEmpty()) {
                    params.put(key, value);
                }
            } else {
                params.put(trimmed, "");
            }
        }

        return params.isEmpty() ? null : params;
    }

    private String getAttributeValue(Element element, String... attributeNames) {
        if (element == null) {
            return null;
        }

        for (String attr : attributeNames) {
            if (element.hasAttribute(attr)) {
                String val = element.getAttribute(attr);
                if (val != null && !val.isBlank()) {
                    return val.trim();
                }
            }
        }

        NamedNodeMap attributes = element.getAttributes();
        if (attributes != null) {
            for (int i = 0; i < attributes.getLength(); i++) {
                Node node = attributes.item(i);
                String nodeName = node.getNodeName();
                for (String attr : attributeNames) {
                    if (nodeName.equalsIgnoreCase(attr) || nodeName.endsWith(":" + attr) || nodeName.equalsIgnoreCase("sigma:" + attr)) {
                        String val = node.getNodeValue();
                        if (val != null && !val.isBlank()) {
                            return val.trim();
                        }
                    }
                }
            }
        }

        return null;
    }

    private List<WorkflowFieldOptionResponse> obtenerOpciones(Element formProperty) {
        NodeList values = formProperty.getElementsByTagName("flowable:value");
        if (values.getLength() == 0) {
            values = formProperty.getElementsByTagName("value");
        }

        List<WorkflowFieldOptionResponse> options = new ArrayList<>();
        for (int i = 0; i < values.getLength(); i++) {
            Element value = (Element) values.item(i);
            options.add(new WorkflowFieldOptionResponse(
                    value.getAttribute("id"),
                    value.getAttribute("name")
            ));
        }

        return options;
    }

    private String obtenerTargetDirecto(Document document, String sourceRef) {
        NodeList flows = document.getElementsByTagName("sequenceFlow");

        for (int i = 0; i < flows.getLength(); i++) {
            Element flow = (Element) flows.item(i);
            if (sourceRef.equals(flow.getAttribute("sourceRef"))) {
                return flow.getAttribute("targetRef");
            }
        }

        return null;
    }

    private List<WorkflowActionResponse> obtenerAccionesGateway(
            Document document,
            String gatewayId
    ) {

        List<WorkflowActionResponse> actions = new ArrayList<>();
        NodeList flows = document.getElementsByTagName("sequenceFlow");

        String inferredVariable = "action";
        for (int i = 0; i < flows.getLength(); i++) {
            Element flow = (Element) flows.item(i);
            if (gatewayId.equals(flow.getAttribute("sourceRef"))) {
                String expression = obtenerConditionExpression(flow);
                if (expression != null && !expression.isBlank()) {
                    Matcher m = CONDITION_PATTERN.matcher(expression.trim());
                    if (m.find()) {
                        inferredVariable = m.group(1);
                        break;
                    }
                }
            }
        }

        for (int i = 0; i < flows.getLength(); i++) {
            Element flow = (Element) flows.item(i);
            if (!gatewayId.equals(flow.getAttribute("sourceRef"))) {
                continue;
            }

            String name = flow.getAttribute("name");
            String expression = obtenerConditionExpression(flow);

            if (expression == null || expression.isBlank()) {
                // Flujo por defecto o sin condición explícita
                if (name != null && !name.isBlank()) {
                    actions.add(new WorkflowActionResponse(
                            name,
                            inferredVariable,
                            name.trim().toUpperCase().replaceAll("[^A-Z0-9]+", "_")
                    ));
                }
                continue;
            }

            WorkflowActionResponse action = parsearAccionDesdeCondicion(name, expression);
            if (action != null) {
                actions.add(action);
            }
        }

        return actions;
    }

    private WorkflowActionResponse parsearAccionDesdeCondicion(String name, String expression) {
        if (expression == null || expression.isBlank()) {
            return null;
        }
        String cleanExpr = expression.trim();

        // 1. ${variable == 'VALUE'} o ${variable == "VALUE"}
        Matcher m1 = CONDITION_PATTERN.matcher(cleanExpr);
        if (m1.find()) {
            String variable = m1.group(1);
            String value = m1.group(2);
            return new WorkflowActionResponse(
                    name != null && !name.isBlank() ? name : value,
                    variable,
                    value
            );
        }

        // 2. ${variable == true} o ${variable == false}
        Matcher m2 = Pattern.compile("\\$\\{\\s*([a-zA-Z0-9_]+)\\s*==\\s*(true|false)\\s*}", Pattern.CASE_INSENSITIVE).matcher(cleanExpr);
        if (m2.find()) {
            String variable = m2.group(1);
            String value = m2.group(2).toLowerCase();
            return new WorkflowActionResponse(
                    name != null && !name.isBlank() ? name : ("true".equals(value) ? "Aprobar" : "Rechazar"),
                    variable,
                    value
            );
        }

        // 3. ${variable} (booleano directo)
        Matcher m3 = Pattern.compile("\\$\\{\\s*([a-zA-Z0-9_]+)\\s*}").matcher(cleanExpr);
        if (m3.find()) {
            String variable = m3.group(1);
            return new WorkflowActionResponse(
                    name != null && !name.isBlank() ? name : variable,
                    variable,
                    "true"
            );
        }

        // 4. ${!variable} (booleano negado)
        Matcher m4 = Pattern.compile("\\$\\{\\s*!\\s*([a-zA-Z0-9_]+)\\s*}").matcher(cleanExpr);
        if (m4.find()) {
            String variable = m4.group(1);
            return new WorkflowActionResponse(
                    name != null && !name.isBlank() ? name : variable,
                    variable,
                    "false"
            );
        }

        return null;
    }

    private List<WorkflowActionResponse> obtenerAccionesDirectas(
            Document document,
            String taskDefinitionKey
    ) {

        List<WorkflowActionResponse> actions = new ArrayList<>();
        NodeList flows = document.getElementsByTagName("sequenceFlow");

        for (int i = 0; i < flows.getLength(); i++) {
            Element flow = (Element) flows.item(i);
            if (!taskDefinitionKey.equals(flow.getAttribute("sourceRef"))) {
                continue;
            }

            String name = flow.getAttribute("name");
            if (name == null || name.isBlank()) {
                name = "Completar";
            }

            String variable = "action";
            String value = name.trim().toUpperCase().replaceAll("[^A-Z0-9]+", "_");

            actions.add(new WorkflowActionResponse(
                    name,
                    variable,
                    value
            ));
        }

        return actions;
    }

    private String obtenerConditionExpression(Element sequenceFlow) {
        NodeList children = sequenceFlow.getChildNodes();

        for (int i = 0; i < children.getLength(); i++) {
            Node node = children.item(i);
            if (node.getNodeType() != Node.ELEMENT_NODE) {
                continue;
            }

            Element element = (Element) node;
            String nodeName = element.getNodeName();
            if (nodeName != null && (nodeName.endsWith("conditionExpression") || nodeName.equals("conditionExpression"))) {
                return element.getTextContent();
            }
        }

        return null;
    }

    private Element buscarElementoPorId(Document document, String id) {
        NodeList nodes = document.getElementsByTagName("*");

        for (int i = 0; i < nodes.getLength(); i++) {
            Node node = nodes.item(i);
            if (!(node instanceof Element element)) {
                continue;
            }

            if (id.equals(element.getAttribute("id"))) {
                return element;
            }
        }

        return null;
    }
}