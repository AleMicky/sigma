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
import java.util.List;
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

            DocumentBuilderFactory factory =
                    DocumentBuilderFactory.newInstance();

            factory.setNamespaceAware(true);

            Document document =
                    factory.newDocumentBuilder()
                            .parse(
                                    new ByteArrayInputStream(
                                            bpmnXml.getBytes(
                                                    StandardCharsets.UTF_8
                                            )
                                    )
                            );

            document.getDocumentElement().normalize();

            String nextElementId =
                    obtenerTargetDirecto(
                            document,
                            taskDefinitionKey
                    );

            if (nextElementId == null) {
                return List.of();
            }

            Element nextElement =
                    buscarElementoPorId(
                            document,
                            nextElementId
                    );

            if (nextElement == null) {
                return List.of();
            }

            String localName =
                    nextElement.getLocalName();

            if (!"exclusiveGateway".equals(localName)) {
                return List.of();
            }

            return obtenerAccionesGateway(
                    document,
                    nextElementId
            );

        } catch (Exception ex) {
            throw new IllegalStateException(
                    "No se pudo analizar la definición BPMN",
                    ex
            );
        }
    }

    public List<WorkflowFieldResponse> obtenerCampos(
            String bpmnXml,
            String taskDefinitionKey
    ) {

        try {
            DocumentBuilderFactory factory =
                    DocumentBuilderFactory.newInstance();

            factory.setNamespaceAware(true);

            Document document =
                    factory.newDocumentBuilder()
                            .parse(
                                    new ByteArrayInputStream(
                                            bpmnXml.getBytes(
                                                    StandardCharsets.UTF_8
                                            )
                                    )
                            );

            document.getDocumentElement().normalize();

            Element task =
                    buscarElementoPorId(
                            document,
                            taskDefinitionKey
                    );

            if (task == null) {
                return List.of();
            }

            NodeList formProperties =
                    task.getElementsByTagNameNS(
                            "http://flowable.org/bpmn",
                            "formProperty"
                    );

            List<WorkflowFieldResponse> fields =
                    new ArrayList<>();

            for (int i = 0; i < formProperties.getLength(); i++) {

                Element formProperty =
                        (Element) formProperties.item(i);

                String id =
                        formProperty.getAttribute("id");

                String name =
                        formProperty.getAttribute("name");

                String type =
                        formProperty.getAttribute("type");

                boolean required =
                        Boolean.parseBoolean(
                                formProperty.getAttribute("required")
                        );

                boolean readable =
                        !"false".equalsIgnoreCase(
                                formProperty.getAttribute("readable")
                        );

                boolean writable =
                        !"false".equalsIgnoreCase(
                                formProperty.getAttribute("writable")
                        );

                List<WorkflowFieldOptionResponse> options =
                        obtenerOpciones(
                                formProperty
                        );

                fields.add(
                        new WorkflowFieldResponse(
                                id,
                                name,
                                type,
                                required,
                                readable,
                                writable,
                                options
                        )
                );
            }

            return fields;

        } catch (Exception ex) {
            throw new IllegalStateException(
                    "No se pudieron obtener los campos BPMN",
                    ex
            );
        }
    }


    private List<WorkflowFieldOptionResponse> obtenerOpciones(
            Element formProperty
    ) {

        NodeList values =
                formProperty.getElementsByTagNameNS(
                        "http://flowable.org/bpmn",
                        "value"
                );

        List<WorkflowFieldOptionResponse> options =
                new ArrayList<>();

        for (int i = 0; i < values.getLength(); i++) {

            Element value =
                    (Element) values.item(i);

            options.add(
                    new WorkflowFieldOptionResponse(
                            value.getAttribute("id"),
                            value.getAttribute("name")
                    )
            );
        }

        return options;
    }

    private String obtenerTargetDirecto(Document document, String sourceRef) {

        NodeList flows = document.getElementsByTagNameNS(
                        "*",
                        "sequenceFlow"
                );

        for (int i = 0; i < flows.getLength(); i++) {

            Element flow = (Element) flows.item(i);

            if (sourceRef.equals(
                    flow.getAttribute("sourceRef")
            )) {
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
        NodeList flows = document.getElementsByTagNameNS(
                        "*",
                        "sequenceFlow");

        for (int i = 0; i < flows.getLength(); i++) {

            Element flow = (Element) flows.item(i);
            if (!gatewayId.equals(
                    flow.getAttribute("sourceRef")
            )) {
                continue;
            }

            String name = flow.getAttribute("name");
            String expression = obtenerConditionExpression(flow);

            if (expression == null) {
                continue;
            }

            Matcher matcher = CONDITION_PATTERN.matcher(expression.trim());

            if (!matcher.find()) {
                continue;
            }

            String variable = matcher.group(1);
            String value = matcher.group(2);
            actions.add(new WorkflowActionResponse(
                            name,
                            variable,
                            value)
            );
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

            if (element
                    .getLocalName()
                    .equals("conditionExpression")) {

                return element.getTextContent();
            }
        }

        return null;
    }

    private Element buscarElementoPorId(
            Document document,
            String id
    ) {

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