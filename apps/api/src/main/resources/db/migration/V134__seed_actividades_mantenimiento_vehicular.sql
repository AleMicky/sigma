-- ============================================================================
-- Migración: V134__seed_actividades_mantenimiento_vehicular.sql
-- Descripción: Limpia la data previa y carga el catálogo completo de actividades
--              de mantenimiento vehicular, sus aplicaciones por componente y sus
--              ítems de checklist de verificación técnica.
-- ============================================================================

-- 1. Limpiar data actual de checklists, aplicaciones y actividades de mantenimiento
TRUNCATE TABLE mantenimientos.checklist_items,
               mantenimientos.actividad_mantenimiento_aplicaciones,
               mantenimientos.actividades_mantenimiento CASCADE;

-- ============================================================================
-- 2. ACTIVIDADES DE MANTENIMIENTO
-- ============================================================================

INSERT INTO mantenimientos.actividades_mantenimiento (
    id, codigo, nombre, descripcion, created_at, updated_at, created_by, updated_by
) VALUES
-- Mantenimiento General de Vehículo
(
    'a1000000-0001-4000-8000-000000000001',
    'MANT_VEH_INSP_GENERAL',
    'Inspección Pre-Operacional y General del Vehículo',
    'Revisión integral de seguridad, documentación, niveles básicos y estado exterior/interior del vehículo.',
    NOW(), NOW(), 'system', 'system'
),
(
    'a1000000-0001-4000-8000-000000000002',
    'MANT_VEH_LAVADO_ENGRASE',
    'Lavado y Engrase General de Chasis y Carrocería',
    'Limpieza profunda de carrocería, lavado a presión de chasis y lubricación de puntos articulados.',
    NOW(), NOW(), 'system', 'system'
),
(
    'a1000000-0001-4000-8000-000000000003',
    'MANT_VEH_TEST_RUTA',
    'Diagnóstico Electrónico OBD-II y Prueba de Ruta',
    'Escaneo computarizado de la ECU/módulos y prueba de conducción para evaluación de desempeño.',
    NOW(), NOW(), 'system', 'system'
),

-- Motor
(
    'a1000000-0002-4000-8000-000000000001',
    'MANT_MOT_CAMBIO_ACEITE_FILTROS',
    'Cambio de Aceite de Motor y Filtros',
    'Drenaje y sustitución de lubricante de motor junto con reemplazo de filtros de aceite, aire y combustible.',
    NOW(), NOW(), 'system', 'system'
),
(
    'a1000000-0002-4000-8000-000000000002',
    'MANT_MOT_SISTEMA_REFRIGERACION',
    'Mantenimiento del Sistema de Refrigeración',
    'Inspección de radiador, mangueras, termostato, purga y reemplazo de líquido refrigerante/anticongelante.',
    NOW(), NOW(), 'system', 'system'
),
(
    'a1000000-0002-4000-8000-000000000003',
    'MANT_MOT_AFINAMIENTO',
    'Afinamiento Electrónico y Puesta a Punto',
    'Limpieza de inyectores, cuerpo de aceleración, sensores MAF/MAP y calibración/reemplazo de bujías.',
    NOW(), NOW(), 'system', 'system'
),
(
    'a1000000-0002-4000-8000-000000000004',
    'MANT_MOT_CORREAS_DISTRIBUCION',
    'Inspección y Reemplazo de Correas y Distribución',
    'Verificación de tensión, desgaste de correas de accesorios y kit de distribución (correa/cadena, tensores).',
    NOW(), NOW(), 'system', 'system'
),

-- Transmisión
(
    'a1000000-0003-4000-8000-000000000001',
    'MANT_TRA_FLUIDO_TRANSMISION',
    'Cambio de Fluido de Transmisión y Diferencial',
    'Reemplazo de fluido/valvulina de caja de cambios manual o automática (ATF/CVT) y aceite de diferencial.',
    NOW(), NOW(), 'system', 'system'
),
(
    'a1000000-0003-4000-8000-000000000002',
    'MANT_TRA_EMBRAGUE_CARDAN',
    'Mantenimiento de Embrague, Cardán y Semiejes',
    'Inspección del conjunto de embrague, crucetas, rodamiento de soporte cardán y fuelles de semiejes.',
    NOW(), NOW(), 'system', 'system'
),

-- Frenos
(
    'a1000000-0004-4000-8000-000000000001',
    'MANT_FRE_PASTILLAS_DISCOS',
    'Mantenimiento de Pastillas, Calipers y Discos de Freno',
    'Medición de desgaste, reemplazo o rectificado de discos, cambio de pastillas y engrase de guías.',
    NOW(), NOW(), 'system', 'system'
),
(
    'a1000000-0004-4000-8000-000000000002',
    'MANT_FRE_TAMBORES_ZAPATAS',
    'Mantenimiento de Frenos de Tambor y Freno de Mano',
    'Limpieza interior de tambores, cambio de zapatas/balatas y regulación del cable de freno de estacionamiento.',
    NOW(), NOW(), 'system', 'system'
),
(
    'a1000000-0004-4000-8000-000000000003',
    'MANT_FRE_PURGA_LIQUIDO',
    'Reemplazo y Purga de Líquido de Frenos',
    'Evaluación de humedad, purgado completo del circuito hidráulico y reposición de líquido DOT 4 / 5.1.',
    NOW(), NOW(), 'system', 'system'
),

-- Suspensión
(
    'a1000000-0005-4000-8000-000000000001',
    'MANT_SUS_AMORTIGUADORES',
    'Inspección y Reemplazo de Amortiguadores y Resortes',
    'Verificación de fugas, prueba de rebote, inspección de cazoletas, topes de suspensión y resortes helicoidales.',
    NOW(), NOW(), 'system', 'system'
),
(
    'a1000000-0005-4000-8000-000000000002',
    'MANT_SUS_BUJES_ROTULAS',
    'Mantenimiento de Trapecios, Rótulas y Barra Estabilizadora',
    'Inspección de holguras en bujes de brazo oscilante, rótulas de suspensión y bieletas estabilizadoras.',
    NOW(), NOW(), 'system', 'system'
),

-- Dirección
(
    'a1000000-0006-4000-8000-000000000001',
    'MANT_DIR_ALINEACION_BALANCEO',
    'Alineación Computarizada 3D y Balanceo de Ruedas',
    'Calibración de ángulos geométricos (camber, caster, convergencia) y balanceo estático/dinámico de neumáticos.',
    NOW(), NOW(), 'system', 'system'
),
(
    'a1000000-0006-4000-8000-000000000002',
    'MANT_DIR_CREMALLERA_TERMINALES',
    'Mantenimiento de Caja/Cremallera y Terminales de Dirección',
    'Inspección de axiales, terminales de dirección, fuelles protectores y sistema de asistencia hidráulica/eléctrica.',
    NOW(), NOW(), 'system', 'system'
),

-- Sistema Eléctrico
(
    'a1000000-0007-4000-8000-000000000001',
    'MANT_ELE_BATERIA_CARGA',
    'Mantenimiento y Diagnóstico de Batería y Sistema de Carga',
    'Prueba de vida útil (SOH/SOC), limpieza y protección de bornes, y prueba de alternador y motor de arranque.',
    NOW(), NOW(), 'system', 'system'
),
(
    'a1000000-0007-4000-8000-000000000002',
    'MANT_ELE_ILUMINACION_FUSIBLES',
    'Revisión de Sistema de Iluminación, Fusibles y Relés',
    'Inspección y calibración de luces exteriores/interiores, verificación de fusibles, relés y cableado general.',
    NOW(), NOW(), 'system', 'system'
),

-- Neumáticos
(
    'a1000000-0008-4000-8000-000000000001',
    'MANT_NEU_ROTACION_CALIBRACION',
    'Rotación, Calibración e Inspección de Neumáticos',
    'Rotación cruzada o paralela, medición de profundidad de labrado, verificación de daños y calibración de presión.',
    NOW(), NOW(), 'system', 'system'
),

-- Carrocería
(
    'a1000000-0009-4000-8000-000000000001',
    'MANT_CAR_CHASIS_ANTICORROSIVO',
    'Inspección Estructural de Chasis y Protección Anticorrosiva',
    'Revisión de largueros, travesaños, torque de pernos de carrocería y aplicación de protector inferior (undercoating).',
    NOW(), NOW(), 'system', 'system'
),
(
    'a1000000-0009-4000-8000-000000000002',
    'MANT_CAR_PUERTAS_MECANISMOS',
    'Mantenimiento de Puertas, Cerraduras y Cristales',
    'Lubricación de bisagras, cerraduras, inspección de mecanismos elevalunas y estado de burletes/empaques de goma.',
    NOW(), NOW(), 'system', 'system'
);

-- ============================================================================
-- 3. APLICACIONES DE ACTIVIDAD POR TIPO DE ACTIVO (VEHÍCULO) Y COMPONENTE
-- ============================================================================

INSERT INTO mantenimientos.actividad_mantenimiento_aplicaciones (
    id, actividad_mantenimiento_id, tipo_activo_id, componente_id, created_at, updated_at, created_by, updated_by
) VALUES
-- Aplicaciones Generales (Sin componente específico - Aplica a todo el vehículo)
(
    'b2000000-0001-4000-8000-000000000001',
    'a1000000-0001-4000-8000-000000000001', -- Inspección Pre-Operacional
    'b1c2d3e4-f5a6-4011-8001-000000000001', -- Tipo Activo: Vehículo
    NULL,
    NOW(), NOW(), 'system', 'system'
),
(
    'b2000000-0001-4000-8000-000000000002',
    'a1000000-0001-4000-8000-000000000002', -- Lavado y Engrase General
    'b1c2d3e4-f5a6-4011-8001-000000000001',
    NULL,
    NOW(), NOW(), 'system', 'system'
),
(
    'b2000000-0001-4000-8000-000000000003',
    'a1000000-0001-4000-8000-000000000003', -- Diagnóstico OBD-II y Prueba de Ruta
    'b1c2d3e4-f5a6-4011-8001-000000000001',
    NULL,
    NOW(), NOW(), 'system', 'system'
),

-- Aplicaciones para Componente: MOTOR ('d1e2f3a4-b5c6-4011-8001-000000000001')
(
    'b2000000-0002-4000-8000-000000000001',
    'a1000000-0002-4000-8000-000000000001', -- Cambio de Aceite y Filtros
    'b1c2d3e4-f5a6-4011-8001-000000000001',
    'd1e2f3a4-b5c6-4011-8001-000000000001',
    NOW(), NOW(), 'system', 'system'
),
(
    'b2000000-0002-4000-8000-000000000002',
    'a1000000-0002-4000-8000-000000000002', -- Sistema de Refrigeración
    'b1c2d3e4-f5a6-4011-8001-000000000001',
    'd1e2f3a4-b5c6-4011-8001-000000000001',
    NOW(), NOW(), 'system', 'system'
),
(
    'b2000000-0002-4000-8000-000000000003',
    'a1000000-0002-4000-8000-000000000003', -- Afinamiento Electrónico
    'b1c2d3e4-f5a6-4011-8001-000000000001',
    'd1e2f3a4-b5c6-4011-8001-000000000001',
    NOW(), NOW(), 'system', 'system'
),
(
    'b2000000-0002-4000-8000-000000000004',
    'a1000000-0002-4000-8000-000000000004', -- Correas y Distribución
    'b1c2d3e4-f5a6-4011-8001-000000000001',
    'd1e2f3a4-b5c6-4011-8001-000000000001',
    NOW(), NOW(), 'system', 'system'
),

-- Aplicaciones para Componente: TRANSMISIÓN ('d1e2f3a4-b5c6-4011-8001-000000000002')
(
    'b2000000-0003-4000-8000-000000000001',
    'a1000000-0003-4000-8000-000000000001', -- Fluido de Transmisión y Diferencial
    'b1c2d3e4-f5a6-4011-8001-000000000001',
    'd1e2f3a4-b5c6-4011-8001-000000000002',
    NOW(), NOW(), 'system', 'system'
),
(
    'b2000000-0003-4000-8000-000000000002',
    'a1000000-0003-4000-8000-000000000002', -- Embrague, Cardán y Semiejes
    'b1c2d3e4-f5a6-4011-8001-000000000001',
    'd1e2f3a4-b5c6-4011-8001-000000000002',
    NOW(), NOW(), 'system', 'system'
),

-- Aplicaciones para Componente: SISTEMA DE FRENOS ('d1e2f3a4-b5c6-4011-8001-000000000003')
(
    'b2000000-0004-4000-8000-000000000001',
    'a1000000-0004-4000-8000-000000000001', -- Pastillas, Calipers y Discos
    'b1c2d3e4-f5a6-4011-8001-000000000001',
    'd1e2f3a4-b5c6-4011-8001-000000000003',
    NOW(), NOW(), 'system', 'system'
),
(
    'b2000000-0004-4000-8000-000000000002',
    'a1000000-0004-4000-8000-000000000002', -- Tambores, Zapatas y Freno de Mano
    'b1c2d3e4-f5a6-4011-8001-000000000001',
    'd1e2f3a4-b5c6-4011-8001-000000000003',
    NOW(), NOW(), 'system', 'system'
),
(
    'b2000000-0004-4000-8000-000000000003',
    'a1000000-0004-4000-8000-000000000003', -- Purga y Líquido de Frenos
    'b1c2d3e4-f5a6-4011-8001-000000000001',
    'd1e2f3a4-b5c6-4011-8001-000000000003',
    NOW(), NOW(), 'system', 'system'
),

-- Aplicaciones para Componente: SUSPENSIÓN ('d1e2f3a4-b5c6-4011-8001-000000000004')
(
    'b2000000-0005-4000-8000-000000000001',
    'a1000000-0005-4000-8000-000000000001', -- Amortiguadores y Resortes
    'b1c2d3e4-f5a6-4011-8001-000000000001',
    'd1e2f3a4-b5c6-4011-8001-000000000004',
    NOW(), NOW(), 'system', 'system'
),
(
    'b2000000-0005-4000-8000-000000000002',
    'a1000000-0005-4000-8000-000000000002', -- Trapecios, Rótulas y Barra Estabilizadora
    'b1c2d3e4-f5a6-4011-8001-000000000001',
    'd1e2f3a4-b5c6-4011-8001-000000000004',
    NOW(), NOW(), 'system', 'system'
),

-- Aplicaciones para Componente: DIRECCIÓN ('d1e2f3a4-b5c6-4011-8001-000000000005')
(
    'b2000000-0006-4000-8000-000000000001',
    'a1000000-0006-4000-8000-000000000001', -- Alineación 3D y Balanceo
    'b1c2d3e4-f5a6-4011-8001-000000000001',
    'd1e2f3a4-b5c6-4011-8001-000000000005',
    NOW(), NOW(), 'system', 'system'
),
(
    'b2000000-0006-4000-8000-000000000002',
    'a1000000-0006-4000-8000-000000000002', -- Cremallera y Terminales
    'b1c2d3e4-f5a6-4011-8001-000000000001',
    'd1e2f3a4-b5c6-4011-8001-000000000005',
    NOW(), NOW(), 'system', 'system'
),

-- Aplicaciones para Componente: SISTEMA ELÉCTRICO ('d1e2f3a4-b5c6-4011-8001-000000000006')
(
    'b2000000-0007-4000-8000-000000000001',
    'a1000000-0007-4000-8000-000000000001', -- Batería y Sistema de Carga
    'b1c2d3e4-f5a6-4011-8001-000000000001',
    'd1e2f3a4-b5c6-4011-8001-000000000006',
    NOW(), NOW(), 'system', 'system'
),
(
    'b2000000-0007-4000-8000-000000000002',
    'a1000000-0007-4000-8000-000000000002', -- Iluminación, Fusibles y Relés
    'b1c2d3e4-f5a6-4011-8001-000000000001',
    'd1e2f3a4-b5c6-4011-8001-000000000006',
    NOW(), NOW(), 'system', 'system'
),

-- Aplicaciones para Componente: NEUMÁTICOS ('d1e2f3a4-b5c6-4011-8001-000000000007')
(
    'b2000000-0008-4000-8000-000000000001',
    'a1000000-0008-4000-8000-000000000001', -- Rotación, Calibración e Inspección
    'b1c2d3e4-f5a6-4011-8001-000000000001',
    'd1e2f3a4-b5c6-4011-8001-000000000007',
    NOW(), NOW(), 'system', 'system'
),

-- Aplicaciones para Componente: CARROCERÍA ('d1e2f3a4-b5c6-4011-8001-000000000008')
(
    'b2000000-0009-4000-8000-000000000001',
    'a1000000-0009-4000-8000-000000000001', -- Chasis y Tratamiento Anticorrosivo
    'b1c2d3e4-f5a6-4011-8001-000000000001',
    'd1e2f3a4-b5c6-4011-8001-000000000008',
    NOW(), NOW(), 'system', 'system'
),
(
    'b2000000-0009-4000-8000-000000000002',
    'a1000000-0009-4000-8000-000000000002', -- Puertas, Cerraduras y Cristales
    'b1c2d3e4-f5a6-4011-8001-000000000001',
    'd1e2f3a4-b5c6-4011-8001-000000000008',
    NOW(), NOW(), 'system', 'system'
);

-- ============================================================================
-- 4. ITEMS DE CHECKLIST DE VERIFICACIÓN
-- ============================================================================

INSERT INTO mantenimientos.checklist_items (
    id, actividad_mantenimiento_aplicacion_id, nombre, descripcion, orden, created_at, updated_at, created_by, updated_by
) VALUES

-- --- APLICACIÓN 1: Inspección Pre-Operacional General ('b2000000-0001-4000-8000-000000000001') ---
(
    'c3000001-0001-4000-8000-000000000001',
    'b2000000-0001-4000-8000-000000000001',
    'Verificación de documentación legal y vigente',
    'Revisar vigencia de SOAT, certificado de inspección técnica vehicular y tarjeta de propiedad.',
    1, NOW(), NOW(), 'system', 'system'
),
(
    'c3000001-0001-4000-8000-000000000002',
    'b2000000-0001-4000-8000-000000000001',
    'Revisión de kit de seguridad reglamentario',
    'Verificar presencia y carga vigente de extintor, triángulos, botiquín, gata hidráulica y llave de ruedas.',
    2, NOW(), NOW(), 'system', 'system'
),
(
    'c3000001-0001-4000-8000-000000000003',
    'b2000000-0001-4000-8000-000000000001',
    'Comprobación de niveles de fluidos esenciales',
    'Verificar niveles de aceite de motor, refrigerante, líquido de frenos y líquido limpiaparabrisas.',
    3, NOW(), NOW(), 'system', 'system'
),
(
    'c3000001-0001-4000-8000-000000000004',
    'b2000000-0001-4000-8000-000000000001',
    'Verificación de luces y señalización exterior',
    'Comprobar luces altas, bajas, direccionales, intermitentes de emergencia, reversa y freno.',
    4, NOW(), NOW(), 'system', 'system'
),
(
    'c3000001-0001-4000-8000-000000000005',
    'b2000000-0001-4000-8000-000000000001',
    'Inspección de cinturones de seguridad y bocina',
    'Probar mecanismo de retracción y anclaje de todos los cinturones y sonido de la bocina/claxon.',
    5, NOW(), NOW(), 'system', 'system'
),

-- --- APLICACIÓN 2: Lavado y Engrase General ('b2000000-0001-4000-8000-000000000002') ---
(
    'c3000001-0002-4000-8000-000000000001',
    'b2000000-0001-4000-8000-000000000002',
    'Lavado a alta presión de chasis y pasos de rueda',
    'Eliminar barro, sales y sedimentos acumulados en la parte inferior del vehículo.',
    1, NOW(), NOW(), 'system', 'system'
),
(
    'c3000001-0002-4000-8000-000000000002',
    'b2000000-0001-4000-8000-000000000002',
    'Engrase de graseras y articulaciones del tren rodante',
    'Aplicar grasa de litio/chasis en terminales, rótulas con grasera y crucetas según catálogo.',
    2, NOW(), NOW(), 'system', 'system'
),
(
    'c3000001-0002-4000-8000-000000000003',
    'b2000000-0001-4000-8000-000000000002',
    'Limpieza y aspirado profundo de habitáculo y maletero',
    'Aspirar tapicería, alfombras y limpiar superficies del tablero y paneles plásticos.',
    3, NOW(), NOW(), 'system', 'system'
),

-- --- APLICACIÓN 3: Diagnóstico OBD-II y Prueba de Ruta ('b2000000-0001-4000-8000-000000000003') ---
(
    'c3000001-0003-4000-8000-000000000001',
    'b2000000-0001-4000-8000-000000000003',
    'Escaneo electrónico de módulos ECU, TCU, ABS y Airbag',
    'Conectar escáner de diagnóstico para leer y registrar códigos de falla almacenados o pendientes (DTCs).',
    1, NOW(), NOW(), 'system', 'system'
),
(
    'c3000001-0003-4000-8000-000000000002',
    'b2000000-0001-4000-8000-000000000003',
    'Prueba de manejo en diferentes regímenes de velocidad',
    'Evaluar respuesta del acelerador, transiciones de marchas, ruidos anómalos o vibraciones.',
    2, NOW(), NOW(), 'system', 'system'
),
(
    'c3000001-0003-4000-8000-000000000003',
    'b2000000-0001-4000-8000-000000000003',
    'Verificación de temperatura de régimen y ciclo térmico',
    'Monitorear estabilidad térmica del motor en caliente y activación adecuada de electroventiladores.',
    3, NOW(), NOW(), 'system', 'system'
),

-- --- APLICACIÓN 4: Cambio de Aceite y Filtros ('b2000000-0002-4000-8000-000000000001') ---
(
    'c3000002-0001-4000-8000-000000000001',
    'b2000000-0002-4000-8000-000000000001',
    'Drenaje de aceite usado de motor en caliente',
    'Retirar tapón de cárter, drenar aceite por gravedad e inspeccionar presencia de virutas o sedimentos.',
    1, NOW(), NOW(), 'system', 'system'
),
(
    'c3000002-0001-4000-8000-000000000002',
    'b2000000-0002-4000-8000-000000000001',
    'Instalación de nuevo filtro de aceite con junta lubricada',
    'Reemplazar elemento filtrante, lubricar el empaque con aceite limpio y ajustar con el torque requerido.',
    2, NOW(), NOW(), 'system', 'system'
),
(
    'c3000002-0001-4000-8000-000000000003',
    'b2000000-0002-4000-8000-000000000001',
    'Sustitución de filtro de aire de motor',
    'Limpiar cavidad de la caja de filtro y colocar cartucho filtrante nuevo de aire.',
    3, NOW(), NOW(), 'system', 'system'
),
(
    'c3000002-0001-4000-8000-000000000004',
    'b2000000-0002-4000-8000-000000000001',
    'Reemplazo de filtro de combustible',
    'Sustituir filtro de combustible primario/secundario y verificar estanqueidad en acoples rápidos.',
    4, NOW(), NOW(), 'system', 'system'
),
(
    'c3000002-0001-4000-8000-000000000005',
    'b2000000-0002-4000-8000-000000000001',
    'Llenado de lubricante nuevo y verificación de nivel por varilla',
    'Rellenar aceite de especificación homologada (viscosidad SAE y norma API/ACEA) y verificar nivel entre marcas.',
    5, NOW(), NOW(), 'system', 'system'
),

-- --- APLICACIÓN 5: Sistema de Refrigeración ('b2000000-0002-4000-8000-000000000002') ---
(
    'c3000002-0002-4000-8000-000000000001',
    'b2000000-0002-4000-8000-000000000002',
    'Prueba de estanqueidad y presión del circuito',
    'Aplicar presión manométrica con bomba de vacío/presión para detectar posibles pérdidas en mangueras y panal.',
    1, NOW(), NOW(), 'system', 'system'
),
(
    'c3000002-0002-4000-8000-000000000002',
    'b2000000-0002-4000-8000-000000000002',
    'Drenaje y purgado de refrigerante antiguo',
    'Vaciar refrigerante degradado del bloque y radiador, y realizar enjuague si existen residuos óxidos.',
    2, NOW(), NOW(), 'system', 'system'
),
(
    'c3000002-0002-4000-8000-000000000003',
    'b2000000-0002-4000-8000-000000000002',
    'Carga con refrigerante orgánico (OAT/HOAT 50/50)',
    'Llenar con refrigerante anticongelante nuevo y purgar el aire del circuito térmico.',
    3, NOW(), NOW(), 'system', 'system'
),
(
    'c3000002-0002-4000-8000-000000000004',
    'b2000000-0002-4000-8000-000000000002',
    'Comprobación de tapa presurizada y termostato',
    'Verificar apertura térmica del termostato y válvula de alivio de presión en la tapa del vaso de expansión.',
    4, NOW(), NOW(), 'system', 'system'
),

-- --- APLICACIÓN 6: Afinamiento Electrónico ('b2000000-0002-4000-8000-000000000003') ---
(
    'c3000002-0003-4000-8000-000000000001',
    'b2000000-0002-4000-8000-000000000003',
    'Inspección, calibración o reemplazo de bujías',
    'Verificar separación de electrodos con galga o sustituir bujías por nuevas (iridio/platino/cobre).',
    1, NOW(), NOW(), 'system', 'system'
),
(
    'c3000002-0003-4000-8000-000000000002',
    'b2000000-0002-4000-8000-000000000003',
    'Limpieza y descarbonización del cuerpo de aceleración',
    'Limpiar mariposa de admisión con solvente especializado y realizar reprogramación/calibración de ralentí.',
    2, NOW(), NOW(), 'system', 'system'
),
(
    'c3000002-0003-4000-8000-000000000003',
    'b2000000-0002-4000-8000-000000000003',
    'Limpieza por ultrasonido y prueba de inyectores',
    'Comprobar patrón de pulverización, estanqueidad y caudal parejo en banco de prueba de inyección.',
    3, NOW(), NOW(), 'system', 'system'
),
(
    'c3000002-0003-4000-8000-000000000004',
    'b2000000-0002-4000-8000-000000000003',
    'Limpieza de sensores MAF / MAP / O2',
    'Descontaminar hilo/película caliente del sensor de flujo de aire con spray no residual.',
    4, NOW(), NOW(), 'system', 'system'
),

-- --- APLICACIÓN 7: Correas y Distribución ('b2000000-0002-4000-8000-000000000004') ---
(
    'c3000002-0004-4000-8000-000000000001',
    'b2000000-0002-4000-8000-000000000004',
    'Inspección de tensión y agrietamiento de correas poli-V',
    'Comprobar estado de las pistas, ruidos de poleas guía y alineación de la correa de accesorios.',
    1, NOW(), NOW(), 'system', 'system'
),
(
    'c3000002-0004-4000-8000-000000000002',
    'b2000000-0002-4000-8000-000000000004',
    'Revisión o sustitución de kit de distribución',
    'Sustituir correa/cadena de distribución, rodillos tensores y poleas según kilometraje de servicio.',
    2, NOW(), NOW(), 'system', 'system'
),
(
    'c3000002-0004-4000-8000-000000000003',
    'b2000000-0002-4000-8000-000000000003',
    'Inspección de bomba de agua y retenes de árbol de levas/cigüeñal',
    'Comprobar ausencia de holgura en el rodamiento de la bomba de agua y fugas en retenes frontales.',
    3, NOW(), NOW(), 'system', 'system'
),

-- --- APLICACIÓN 8: Fluido de Transmisión y Diferencial ('b2000000-0003-4000-8000-000000000001') ---
(
    'c3000003-0001-4000-8000-000000000001',
    'b2000000-0003-4000-8000-000000000001',
    'Drenaje y reposición de lubricante de caja de cambios',
    'Vaciar fluido usado, verificar color/aroma e ingresar fluido nuevo homologado (ATF, CVT o valvulina MTF).',
    1, NOW(), NOW(), 'system', 'system'
),
(
    'c3000003-0001-4000-8000-000000000002',
    'b2000000-0003-4000-8000-000000000001',
    'Reemplazo de filtro interno de transmisión y junta de cárter',
    'Limpiar imanes retenedores de ferrita en cárter y colocar nuevo filtro hidráulico.',
    2, NOW(), NOW(), 'system', 'system'
),
(
    'c3000003-0001-4000-8000-000000000003',
    'b2000000-0003-4000-8000-000000000001',
    'Inspección y cambio de aceite de diferencial y transfer',
    'Comprobar nivel y estado de aceite SAE 75W-90 / 80W-90 en diferenciales delantero y trasero.',
    3, NOW(), NOW(), 'system', 'system'
),

-- --- APLICACIÓN 9: Embrague, Cardán y Semiejes ('b2000000-0003-4000-8000-000000000002') ---
(
    'c3000003-0002-4000-8000-000000000001',
    'b2000000-0003-4000-8000-000000000002',
    'Verificación de punto de acople y recorrido del pedal de embrague',
    'Medir holgura libre del pedal y verificar suavidad de accionamiento de la bomba/bombín auxiliar.',
    1, NOW(), NOW(), 'system', 'system'
),
(
    'c3000003-0002-4000-8000-000000000002',
    'b2000000-0003-4000-8000-000000000002',
    'Inspección de fuelles y juntas homocinéticas de semiejes',
    'Revisar integridad de botas de goma en lados rueda y caja, y ausencia de fugas de grasa grafitada.',
    2, NOW(), NOW(), 'system', 'system'
),
(
    'c3000003-0002-4000-8000-000000000003',
    'b2000000-0003-4000-8000-000000000002',
    'Inspección de crucetas y soporte central de cardán',
    'Comprobar juego radial/axial en crucetas universales y estado del rodamiento intermedio.',
    3, NOW(), NOW(), 'system', 'system'
),

-- --- APLICACIÓN 10: Pastillas, Calipers y Discos ('b2000000-0004-4000-8000-000000000001') ---
(
    'c3000004-0001-4000-8000-000000000001',
    'b2000000-0004-4000-8000-000000000001',
    'Medición de espesor de material de fricción en pastillas',
    'Verificar que el espesor de las pastillas no sea inferior a 3.0 mm; sustituir si aplica.',
    1, NOW(), NOW(), 'system', 'system'
),
(
    'c3000004-0001-4000-8000-000000000002',
    'b2000000-0004-4000-8000-000000000001',
    'Medición con micrómetro y comparador de carátula de discos',
    'Verificar grosor mínimo estampado por el fabricante y alabeo lateral menor a 0.05 mm.',
    2, NOW(), NOW(), 'system', 'system'
),
(
    'c3000004-0001-4000-8000-000000000003',
    'b2000000-0004-4000-8000-000000000001',
    'Limpieza y lubricación de pernos guía de mordazas (calipers)',
    'Desmontar pasadores, limpiar con desengrasante y aplicar grasa de silicona para altas temperaturas.',
    3, NOW(), NOW(), 'system', 'system'
),
(
    'c3000004-0001-4000-8000-000000000004',
    'b2000000-0004-4000-8000-000000000001',
    'Inspección de pistones hidráulicos y guardapolvos de caliper',
    'Verificar que los guardapolvos no estén rotos ni presenten pérdidas de líquido de freno.',
    4, NOW(), NOW(), 'system', 'system'
),

-- --- APLICACIÓN 11: Tambores, Zapatas y Freno de Mano ('b2000000-0004-4000-8000-000000000002') ---
(
    'c3000004-0002-4000-8000-000000000001',
    'b2000000-0004-4000-8000-000000000002',
    'Desmontaje y limpieza interior de campanas/tambores',
    'Eliminar polvillo con limpiador de frenos y verificar diámetro interno máximo permisible.',
    1, NOW(), NOW(), 'system', 'system'
),
(
    'c3000004-0002-4000-8000-000000000002',
    'b2000000-0004-4000-8000-000000000002',
    'Inspección de balatas/zapatas y resortes de recuperación',
    'Verificar estado del material de fricción, anclajes y tensión de resortes de sujeción.',
    2, NOW(), NOW(), 'system', 'system'
),
(
    'c3000004-0002-4000-8000-000000000003',
    'b2000000-0004-4000-8000-000000000002',
    'Revisión de cilindros de freno de rueda trasera',
    'Comprobar que los sellos de goma de los bombines traseros no presenten fugas de líquido.',
    3, NOW(), NOW(), 'system', 'system'
),
(
    'c3000004-0002-4000-8000-000000000004',
    'b2000000-0004-4000-8000-000000000002',
    'Regulación de trinquete de freno de mano/estacionamiento',
    'Calibrar tensión de cables para asegurar bloqueo completo entre 4 a 7 clics de palanca.',
    4, NOW(), NOW(), 'system', 'system'
),

-- --- APLICACIÓN 12: Purga y Líquido de Frenos ('b2000000-0004-4000-8000-000000000003') ---
(
    'c3000004-0003-4000-8000-000000000001',
    'b2000000-0004-4000-8000-000000000003',
    'Medición del porcentaje de humedad en líquido de frenos',
    'Usar probador digital de líquido para corroborar si el porcentaje de agua supera el 2%.',
    1, NOW(), NOW(), 'system', 'system'
),
(
    'c3000003-0004-4000-8000-000000000002',
    'b2000000-0004-4000-8000-000000000003',
    'Purga hidráulica de las cuatro ruedas con equipo a presión',
    'Extraer líquido viejo y purgar burbujas de aire en orden: rueda más lejana a la más cercana a la bomba.',
    2, NOW(), NOW(), 'system', 'system'
),
(
    'c3000003-0004-4000-8000-000000000003',
    'b2000000-0004-4000-8000-000000000003',
    'Verificación de firmeza de pedal y prueba de estanqueidad',
    'Asegurar pedal firme sin hundimiento progresivo ni pérdidas en uniones de cañerías y latiguillos.',
    3, NOW(), NOW(), 'system', 'system'
),

-- --- APLICACIÓN 13: Amortiguadores y Resortes ('b2000000-0005-4000-8000-000000000001') ---
(
    'c3000005-0001-4000-8000-000000000001',
    'b2000000-0005-4000-8000-000000000001',
    'Inspección de fugas de aceite hidráulico en vástagos',
    'Examinar cuerpo de los amortiguadores delanteros y traseros descartando transpiraciones o goteo.',
    1, NOW(), NOW(), 'system', 'system'
),
(
    'c3000005-0001-4000-8000-000000000002',
    'b2000000-0005-4000-8000-000000000001',
    'Comprobación de cazoletas, copelas y rodamientos superiores',
    'Verificar ausencia de golpes o juego en las torretas de suspensión al girar la dirección.',
    2, NOW(), NOW(), 'system', 'system'
),
(
    'c3000005-0001-4000-8000-000000000003',
    'b2000000-0005-4000-8000-000000000001',
    'Inspección de espirales / ballestas y topes de goma',
    'Revisar que los resortes helicoidales o muelles no presenten fracturas o fatiga de altura.',
    3, NOW(), NOW(), 'system', 'system'
),

-- --- APLICACIÓN 14: Trapecios, Rótulas y Barra Estabilizadora ('b2000000-0005-4000-8000-000000000002') ---
(
    'c3000005-0002-4000-8000-000000000001',
    'b2000000-0005-4000-8000-000000000002',
    'Revisión de bujes silentblock en trapecios y brazos',
    'Inspeccionar con palanca que los bujes de caucho no tengan fisuras, desprendimiento ni holgura excesiva.',
    1, NOW(), NOW(), 'system', 'system'
),
(
    'c3000005-0002-4000-8000-000000000002',
    'b2000000-0005-4000-8000-000000000002',
    'Verificación de holgura axial/radial en rótulas de suspensión',
    'Comprobar juego en los muñones de suspensión inferior y superior, y estado de fuelles protectores.',
    2, NOW(), NOW(), 'system', 'system'
),
(
    'c3000005-0002-4000-8000-000000000003',
    'b2000000-0005-4000-8000-000000000002',
    'Inspección de tirantes (bieletas) y bujes de barra estabilizadora',
    'Verificar que las gomas de la barra estabilizadora y articulaciones esféricas de bieletas estén firmes.',
    3, NOW(), NOW(), 'system', 'system'
),

-- --- APLICACIÓN 15: Alineación 3D y Balanceo ('b2000000-0006-4000-8000-000000000001') ---
(
    'c3000006-0001-4000-8000-000000000001',
    'b2000000-0006-4000-8000-000000000001',
    'Medición y ajuste computarizado de cotas de alineación',
    'Corregir convergencia/divergencia (Toe), caída (Camber) y avance (Caster) según valores OEM.',
    1, NOW(), NOW(), 'system', 'system'
),
(
    'c3000006-0001-4000-8000-000000000002',
    'b2000000-0006-4000-8000-000000000001',
    'Balanceo dinámico y estático de ruedas en banco rotativo',
    'Colocar contrapesos de plomo/zinc para eliminar vibraciones en el volante a alta velocidad.',
    2, NOW(), NOW(), 'system', 'system'
),
(
    'c3000006-0001-4000-8000-000000000003',
    'b2000000-0006-4000-8000-000000000001',
    'Centrado de volante y calibración del sensor SAS',
    'Verificar volante centrado en línea recta y calibrar el sensor de ángulo de dirección (SAS) con escáner.',
    3, NOW(), NOW(), 'system', 'system'
),

-- --- APLICACIÓN 16: Cremallera y Terminales ('b2000000-0006-4000-8000-000000000002') ---
(
    'c3000006-0002-4000-8000-000000000001',
    'b2000000-0006-4000-8000-000000000002',
    'Inspección de terminales de dirección exteriores e interiores (axiales)',
    'Verificar ausencia de juego en terminales y brazos axiales de dirección.',
    1, NOW(), NOW(), 'system', 'system'
),
(
    'c3000006-0002-4000-8000-000000000002',
    'b2000000-0006-4000-8000-000000000002',
    'Comprobación de guardapolvos de la cremallera de dirección',
    'Revisar fuelles de goma garantizando sellado hermético contra agua y tierra.',
    2, NOW(), NOW(), 'system', 'system'
),
(
    'c3000006-0002-4000-8000-000000000003',
    'b2000000-0006-4000-8000-000000000002',
    'Verificación de fluido y bomba hidráulica / electroasistida (EPS)',
    'Inspeccionar nivel de fluido de dirección hidráulica o funcionamiento del motor eléctrico EPS.',
    3, NOW(), NOW(), 'system', 'system'
),

-- --- APLICACIÓN 17: Batería y Sistema de Carga ('b2000000-0007-4000-8000-000000000001') ---
(
    'c3000007-0001-4000-8000-000000000001',
    'b2000000-0007-4000-8000-000000000001',
    'Prueba de capacidad de arranque (CCA) y estado de salud (SOH)',
    'Medir conductancia de la batería con analizador digital verificando capacidad de retención de carga.',
    1, NOW(), NOW(), 'system', 'system'
),
(
    'c3000007-0001-4000-8000-000000000002',
    'b2000000-0007-4000-8000-000000000001',
    'Limpieza, desulfatación y ajuste de bornes con grasa dieléctrica',
    'Remover corrosión de los bornes positivo y negativo y aplicar protector anticorrosivo/vaselina.',
    2, NOW(), NOW(), 'system', 'system'
),
(
    'c3000007-0001-4000-8000-000000000003',
    'b2000000-0007-4000-8000-000000000001',
    'Prueba de voltaje de carga del alternador bajo carga eléctrica',
    'Verificar que el alternador entregue entre 13.8V y 14.5V con luces, aire acondicionado y radio encendidos.',
    3, NOW(), NOW(), 'system', 'system'
),
(
    'c3000007-0001-4000-8000-000000000004',
    'b2000000-0007-4000-8000-000000000001',
    'Comprobación de consumo en amperios del motor de arranque',
    'Verificar consumo de corriente en el arranque y caída de tensión no menor a 9.6V.',
    4, NOW(), NOW(), 'system', 'system'
),

-- --- APLICACIÓN 18: Iluminación, Fusibles y Relés ('b2000000-0007-4000-8000-000000000002') ---
(
    'c3000007-0002-4000-8000-000000000001',
    'b2000000-0007-4000-8000-000000000002',
    'Regulación y alineación de haz luminoso de faros principales',
    'Alinear inclinación y orientación de focos principales con regloscopio para evitar deslumbramientos.',
    1, NOW(), NOW(), 'system', 'system'
),
(
    'c3000007-0002-4000-8000-000000000002',
    'b2000000-0007-4000-8000-000000000002',
    'Inspección de fusibleras y relés de habitáculo y vano motor',
    'Verificar amperajes correctos de fusibles y descartar sobrecalentamiento o sulfatación en terminales.',
    2, NOW(), NOW(), 'system', 'system'
),
(
    'c3000007-0002-4000-8000-000000000003',
    'b2000000-0007-4000-8000-000000000002',
    'Verificación de funcionamiento de limpiaparabrisas y desempañador',
    'Probar velocidades del motor limpiaparabrisas, eyectores de agua y filamentos térmicos del desempañador.',
    3, NOW(), NOW(), 'system', 'system'
),

-- --- APLICACIÓN 19: Rotación, Calibración e Inspección ('b2000000-0008-4000-8000-000000000001') ---
(
    'c3000008-0001-4000-8000-000000000001',
    'b2000000-0008-4000-8000-000000000001',
    'Medición con profundímetro de la banda de rodadura en 3 puntos',
    'Constatar profundidad de ranura (mínimo legal 1.6 mm / aconsejable 3.0 mm) descartando desgaste irregular.',
    1, NOW(), NOW(), 'system', 'system'
),
(
    'c3000008-0001-4000-8000-000000000002',
    'b2000000-0008-4000-8000-000000000001',
    'Rotación periódica de las 4 ruedas más repuesto',
    'Efectuar patrón de rotación cruzado o longitudinal según tracción (delantera, trasera o 4x4).',
    2, NOW(), NOW(), 'system', 'system'
),
(
    'c3000008-0001-4000-8000-000000000003',
    'b2000000-0008-4000-8000-000000000001',
    'Inspección visual de flancos descartando deformaciones o cortes',
    'Revisar laterales de los neumáticos en busca de abultamientos (chichones), grietas o clavos incrustados.',
    3, NOW(), NOW(), 'system', 'system'
),
(
    'c3000008-0001-4000-8000-000000000004',
    'b2000000-0008-4000-8000-000000000001',
    'Calibración de presión en frío y reseteo de sensor TPMS',
    'Ajustar PSI recomendados por el fabricante y reiniciar el sistema de monitoreo de presión en el tablero.',
    4, NOW(), NOW(), 'system', 'system'
),

-- --- APLICACIÓN 20: Chasis y Tratamiento Anticorrosivo ('b2000000-0009-4000-8000-000000000001') ---
(
    'c3000009-0001-4000-8000-000000000001',
    'b2000000-0009-4000-8000-000000000001',
    'Inspección visual de fisuras o deformaciones en largueros del chasis',
    'Examinar integridad estructural del chasis descartando impactos o fatiga de metal.',
    1, NOW(), NOW(), 'system', 'system'
),
(
    'c3000009-0001-4000-8000-000000000002',
    'b2000000-0009-4000-8000-000000000001',
    'Aplicación y retoque de recubrimiento anticorrosivo (undercoating)',
    'Tratar áreas con inicio de oxidación y aplicar pintura bituminosa protectora en bajos.',
    2, NOW(), NOW(), 'system', 'system'
),
(
    'c3000009-0001-4000-8000-000000000003',
    'b2000000-0009-4000-8000-000000000001',
    'Comprobación de torque en pernos de montaje de carrocería y cabina',
    'Torquear pernos de unión de carrocería y silentblocks de cabina según tabla de apriete.',
    3, NOW(), NOW(), 'system', 'system'
),

-- --- APLICACIÓN 21: Puertas, Cerraduras y Cristales ('b2000000-0009-4000-8000-000000000002') ---
(
    'c3000009-0002-4000-8000-000000000001',
    'b2000000-0009-4000-8000-000000000002',
    'Lubricación de bisagras, cerraduras y retenedores de puertas',
    'Aplicar lubricante blanco de litio/teflón en bisagras, limitadores de apertura y pestillos de capó y maletero.',
    1, NOW(), NOW(), 'system', 'system'
),
(
    'c3000009-0002-4000-8000-000000000002',
    'b2000000-0009-4000-8000-000000000002',
    'Inspección y lubricación de guías de elevalunas eléctricos',
    'Lubricar rieles con spray de silicona y comprobar velocidad y cierre hermético de cristales.',
    2, NOW(), NOW(), 'system', 'system'
),
(
    'c3000009-0002-4000-8000-000000000003',
    'b2000000-0009-4000-8000-000000000002',
    'Revisión y humectación de burletes y gomas de sellado',
    'Inspeccionar empaques perimetrales de puertas para prevenir filtraciones de agua o polvo a cabina.',
    3, NOW(), NOW(), 'system', 'system'
);
