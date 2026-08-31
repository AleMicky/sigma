TRUNCATE TABLE
    organizacion.empleados,
    organizacion.cargos,
    organizacion.areas,
    organizacion.personas
    CASCADE;

-- ============================================================================
-- 1. ÁREAS (organizacion.areas)
-- ============================================================================
WITH datos AS (SELECT *
               FROM jsonb_to_recordset($json$[
                 {
                   "id": "2c35db81-c91c-5d56-b179-767fecfd3e7f",
                   "codigo": "GRS",
                   "nombre": "GERENCIA DE RESPONSABILIDAD SOCIAL",
                   "codigo_externo": "GRS"
                 },
                 {
                   "id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "codigo": "GOM",
                   "nombre": "GERENCIA DE OPERACIONES Y MANTENIMIENTO",
                   "codigo_externo": "GOM"
                 },
                 {
                   "id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "codigo": "GPP",
                   "nombre": "GERENCIA DE PLANIFICACIÓN Y PROYECTOS",
                   "codigo_externo": "GPP"
                 },
                 {
                   "id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "codigo": "GG",
                   "nombre": "GERENCIA GENERAL",
                   "codigo_externo": "GG"
                 },
                 {
                   "id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "codigo": "GAF",
                   "nombre": "GERENCIA ADMINISTRATIVA FINANCIERA",
                   "codigo_externo": "GAF"
                 }
               ]$json$::jsonb)
                        AS x(id uuid, codigo varchar(50), nombre varchar(100), codigo_externo varchar(100)))
INSERT
INTO  organizacion.areas (id, codigo, nombre, descripcion, sistema_origen, codigo_externo, created_at, updated_at, created_by,
                          updated_by)
SELECT id,
       codigo,
       nombre,
       NULL,
       'Result_2.xlsx',
       codigo_externo,
       NOW(),
       NULL,
       'migracion_excel',
       NULL
FROM datos;

-- ============================================================================
-- 2. CARGOS (organizacion.cargos)
-- ============================================================================
WITH datos AS (SELECT *
               FROM jsonb_to_recordset($json$[
                 {
                   "id": "3eefaac0-b178-5c25-b4d9-b12117ffdb79",
                   "codigo": "CARGO_783B4E0723C2",
                   "nombre": "COORDINADOR DE GESTION SOCIAL",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "5f35ea47-38d8-5a15-ae8b-3112138c6fa5",
                   "codigo": "1117",
                   "nombre": "OPERADOR COR-SIS IV",
                   "codigo_externo": "1117"
                 },
                 {
                   "id": "b8741500-7744-5d56-8990-1e5feaf0d495",
                   "codigo": "1185",
                   "nombre": "OPERADOR COR-SIS III",
                   "codigo_externo": "1185"
                 },
                 {
                   "id": "67d01745-f50d-5833-a897-e700f4ecefdb",
                   "codigo": "1194",
                   "nombre": "TEC. MANT. ELEC. MEC. COR-III",
                   "codigo_externo": "1194"
                 },
                 {
                   "id": "6a126c6a-bf02-5aec-988e-752c31746fbd",
                   "codigo": "1245",
                   "nombre": "MANTENEDOR",
                   "codigo_externo": "1245"
                 },
                 {
                   "id": "2e489bed-a737-5ccb-be6f-07d2942050d8",
                   "codigo": "1295",
                   "nombre": "TEC. SUP. OBRAS CIVILES I",
                   "codigo_externo": "1295"
                 },
                 {
                   "id": "722334cb-b526-57a4-91b7-79bd88758332",
                   "codigo": "CARGO_94AD0CEAD6CF",
                   "nombre": "LIDER TECNICO DE MANTENIMIENTO",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "c7176e92-ceea-53b3-a6fb-47371be40872",
                   "codigo": "1364",
                   "nombre": "OPERADOR COR-SIS VIII",
                   "codigo_externo": "1364"
                 },
                 {
                   "id": "cf68645e-db23-5bb4-b081-f0b5e044167e",
                   "codigo": "1481",
                   "nombre": "OPERADOR COR-SIS VII",
                   "codigo_externo": "1481"
                 },
                 {
                   "id": "76665567-bb01-5fab-b118-ab50a803603d",
                   "codigo": "1483",
                   "nombre": "OPERADOR COR-SIS VI",
                   "codigo_externo": "1483"
                 },
                 {
                   "id": "a3c5ba56-1ef3-59af-a6a3-a2743b9468b8",
                   "codigo": "1554",
                   "nombre": "OPERADOR COR-SIS V",
                   "codigo_externo": "1554"
                 },
                 {
                   "id": "6713dc10-1aa5-5e16-8feb-9e7b41b89b9a",
                   "codigo": "1557",
                   "nombre": "OPERADOR COR-SIS IX",
                   "codigo_externo": "1557"
                 },
                 {
                   "id": "01e8a881-d66f-525e-80ba-4f4dc03bab6f",
                   "codigo": "CARGO_01445BABCB9D",
                   "nombre": "COORDINADORA ADMINISTRATIVA FINANCIERA UPE",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "4480fbc4-95b7-59ea-99d3-b3a75817e6e0",
                   "codigo": "CARGO_32CD68600D2F",
                   "nombre": "RESPONSABLE CONTABLE DE G.R.S.",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "421c3be1-9ebd-5676-8d9e-887671a71a56",
                   "codigo": "1704",
                   "nombre": "TEC. MANT. ELEC. MEC. SIS-III",
                   "codigo_externo": "1704"
                 },
                 {
                   "id": "928c413b-a773-5929-9e0f-599d5cb973d2",
                   "codigo": "CARGO_EF9531F5213F",
                   "nombre": "LIDER TECNICO DE MANTENIMIENTO",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "02e6f3c8-1bf8-57dd-ab73-ce3d9907290d",
                   "codigo": "1711",
                   "nombre": "Ingeniero Analista de Mantenimiento Civil",
                   "codigo_externo": "1711"
                 },
                 {
                   "id": "92b3edc5-5c69-5416-b81c-2e71511cd23d",
                   "codigo": "7802",
                   "nombre": "ENCARGADO DEPARTAMENTO DE PLANIFICACIÓN Y ESTUDIOS a.i.",
                   "codigo_externo": "7802"
                 },
                 {
                   "id": "ead369f8-1224-5152-81fb-d39362f9b8a3",
                   "codigo": "1717",
                   "nombre": "MANTENEDOR SIS-I",
                   "codigo_externo": "1717"
                 },
                 {
                   "id": "d2914f38-ab99-5714-b930-ee75c1341d36",
                   "codigo": "CARGO_A8BB30B0FB4A",
                   "nombre": "CONTADOR UIP",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "e2f5bef9-492e-5651-b4c8-cc6589b40ab8",
                   "codigo": "1721",
                   "nombre": "TEC. SUP. OBRAS CIVILES III",
                   "codigo_externo": "1721"
                 },
                 {
                   "id": "fc499a5d-ff5e-5a21-b33d-95d6672c488c",
                   "codigo": "7808",
                   "nombre": "CHOFER / MENSAJERO UPE",
                   "codigo_externo": "7808"
                 },
                 {
                   "id": "753d2240-e243-575b-b190-ed930ef82a92",
                   "codigo": "CARGO_57443FCC4ABC",
                   "nombre": "INGENIERO DE GESTION Y PLANIFICACION",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "50496122-80a2-558a-beab-2fc7b3ed9489",
                   "codigo": "CARGO_AC0917E96AF2",
                   "nombre": "COORDINADOR ADMINISTRATIVO FINANCIERO DE LA UNIDAD DE INGENIERIA DE PROYECTOS",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "659855c6-1459-535b-8309-077730cd1326",
                   "codigo": "CARGO_0F0EA6FE1390",
                   "nombre": "SUPERVISOR DE ALMACENES CENTRALES COR - SIS",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "608a3733-3202-58f5-9ba9-0767266afda1",
                   "codigo": "7702",
                   "nombre": "APOYO U.T.I.C.",
                   "codigo_externo": "7702"
                 },
                 {
                   "id": "39646356-677b-5b91-8782-fbb016ddbeb0",
                   "codigo": "CARGO_7DFBA7AFF038",
                   "nombre": "SECRETARIA DE LA UNIDAD DE PROYECTOS EOLICOS",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "090113f3-a6e6-5bd2-89c3-6173bb918378",
                   "codigo": "7901",
                   "nombre": "RESP. AREA DE HIDROLOGIA",
                   "codigo_externo": "7901"
                 },
                 {
                   "id": "227faa99-dc82-5011-8462-cf54dbd3cbbd",
                   "codigo": "CARGO_78A8CA6FC838",
                   "nombre": "RESPONSABLE DE ÁREA GEOLOGÍA Y GEOTECNIA a.i.",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "507f3a4c-452c-5100-be21-fbb336fc2223",
                   "codigo": "1750",
                   "nombre": "SUPERVISOR DE MANTENIMIENTO OBRAS CIVILES E HIDRÁULICAS.",
                   "codigo_externo": "1750"
                 },
                 {
                   "id": "6e5abf40-093d-5bb3-b324-b48288015bef",
                   "codigo": "CARGO_3E1B150FC574",
                   "nombre": "ASISTENTE ADMINISTRATIVO G.R.S.",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "2859936b-a54f-53e3-a733-87d45a1587ae",
                   "codigo": "CARGO_30A4A61FBF71",
                   "nombre": "TOPOGRAFO DIBUJANTE",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "d810432e-fb79-520d-91da-7560d6e07742",
                   "codigo": "CARGO_5207764F8FB1",
                   "nombre": "JEFE UNIDAD GESTIÓN SOCIAL a.i.",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "b44b74b2-bf0d-53a7-901e-505c734cc350",
                   "codigo": "7206",
                   "nombre": "RESPONSABLE CONTABLE",
                   "codigo_externo": "7206"
                 },
                 {
                   "id": "0de7ad22-dc2a-5927-9a4c-21cbe9a7fce5",
                   "codigo": "CARGO_455318286CEB",
                   "nombre": "ASISTENTE DE OPERACIÓN MISICUNI",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "b005ed37-ab15-5d46-aa52-cd5fe2f45185",
                   "codigo": "CARGO_6329C918D9FA",
                   "nombre": "OPERADOR RETROEXCAVADORA",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "4e36b2d5-3d33-5a1b-bf58-6fbe5ce81db0",
                   "codigo": "CARGO_51C41F5123EC",
                   "nombre": "CHOFER",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "b6024e2c-0149-5500-9064-28775218017b",
                   "codigo": "7564",
                   "nombre": "RESPONSABLE DE ARQUITECTURA",
                   "codigo_externo": "7564"
                 },
                 {
                   "id": "49585089-a65e-56b4-8c00-2951ee87711d",
                   "codigo": "7305",
                   "nombre": "ENCARGADA DE MEDIO AMBIENTE P.H.S.J",
                   "codigo_externo": "7305"
                 },
                 {
                   "id": "c74b969c-b122-5b37-a375-0e3c88c18e0b",
                   "codigo": "CARGO_D2AB046D537F",
                   "nombre": "INGENIERO DE OBRAS DE SUPERFICIE",
                   "codigo_externo": "Item"
                 },
                 {
                   "id": "ffa220c1-78f6-5ef3-b765-af9bda6f3190",
                   "codigo": "CARGO_C1E396940ACE",
                   "nombre": "RESPONSABLE DE OPERACIONES",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "0f9c8672-74b3-540e-9d5a-92fb9f68c9ba",
                   "codigo": "7567",
                   "nombre": "INGENIERO DE COSTOS Y EVALUACION ECONOMICA",
                   "codigo_externo": "7567"
                 },
                 {
                   "id": "6c3058c5-f671-5f88-a9df-ce34b51bd2f2",
                   "codigo": "CARGO_6D57EA488E74",
                   "nombre": "SECRETARIA EJECUTIVA DE LA GERENCIA DE PLANIFICACION Y PROYECTOS",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "4c6c00d5-5db7-524f-b20a-c6864e9dbc54",
                   "codigo": "CARGO_F38F992BF89A",
                   "nombre": "JEFE DEL PROYECTO HIDROELECTRICO MIGUILLAS a.i.",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "7168cffb-00b1-5de1-bb78-6f76094efd03",
                   "codigo": "7417",
                   "nombre": "AUXILIAR COMERCIAL DE LA UME",
                   "codigo_externo": "7417"
                 },
                 {
                   "id": "7f7931b6-857f-5651-9278-d527931f1733",
                   "codigo": "7303",
                   "nombre": "RESPONSABLE DE SEGURIDAD INDUSTRIAL",
                   "codigo_externo": "7303"
                 },
                 {
                   "id": "9a1f17f0-9ccc-54df-9ef2-20b3acefe6cc",
                   "codigo": "1815",
                   "nombre": "RESP.MON/CONTR.PROYECTOS",
                   "codigo_externo": "1815"
                 },
                 {
                   "id": "9db4b17e-25a0-5fc6-8404-b8f307ed2160",
                   "codigo": "CARGO_5EFD70AAC727",
                   "nombre": "TRADUCTOR DE CHINO MANDARIN",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "7da6ff34-5eaf-5001-b036-cd4ea50aeb02",
                   "codigo": "7202",
                   "nombre": "AUXILIAR DE ACTIVOS FIJOS II.",
                   "codigo_externo": "7202"
                 },
                 {
                   "id": "f9ef0b10-07e9-52ed-a5e3-ae07a2285fef",
                   "codigo": "2251",
                   "nombre": "ING. CIVIL ESTRUCTURISTA",
                   "codigo_externo": "2251"
                 },
                 {
                   "id": "0174e9fd-124c-5539-b6aa-c46711f4d8da",
                   "codigo": "7805",
                   "nombre": "INGENIERO MECANICO",
                   "codigo_externo": "7805"
                 },
                 {
                   "id": "7575afc2-380d-5350-9543-8e962a936784",
                   "codigo": "CARGO_AC4A123C2E70",
                   "nombre": "ANALISTA DE TESORERIA",
                   "codigo_externo": "Item"
                 },
                 {
                   "id": "4eab3308-f0c9-5e35-8dee-6d62e575ca63",
                   "codigo": "CARGO_EBAA48B48550",
                   "nombre": "RESPONSABLE DE COMUNICACIÓN EMPRESARIAL",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "01562a5f-722a-58d2-b893-d65a6eb1b009",
                   "codigo": "7415",
                   "nombre": "ENCARGADO DE EVALUACION OPERATIVA Y ANALISIS DE PROYECTOS DE LA UME",
                   "codigo_externo": "7415"
                 },
                 {
                   "id": "5e060199-689d-5e53-b022-a72a91ebb4cb",
                   "codigo": "7566",
                   "nombre": "RESPONSABLE DE COSTOS Y PRESUPUESTOS UIP",
                   "codigo_externo": "7566"
                 },
                 {
                   "id": "a8121400-82ca-5b13-8ffd-6140eac35960",
                   "codigo": "CARGO_0022FE8EBB75",
                   "nombre": "ENCARGADA DE ADQUISICIONES",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "b292ab38-fbde-52ca-9e3f-c79066c717ed",
                   "codigo": "CARGO_BBBF2FC6D129",
                   "nombre": "ASISTENTE DE OPERACIÓN COR-SIS",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "7e3ed480-fbf1-5c1b-82b8-c32655c9911f",
                   "codigo": "2322",
                   "nombre": "INGENIERO CIVIL ESPECIALISTA EN OBRAS HIDRAULICAS",
                   "codigo_externo": "2322"
                 },
                 {
                   "id": "d3aa0206-56e0-5eba-beb5-a866e15a76b9",
                   "codigo": "7596",
                   "nombre": "CHOFER",
                   "codigo_externo": "7596"
                 },
                 {
                   "id": "45d63620-12c9-5a49-83c5-49072d5a28c9",
                   "codigo": "CARGO_992434C18EE2",
                   "nombre": "OPERADOR DE EQUIPO",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "997b7236-10e6-555f-b604-094744f1e67d",
                   "codigo": "CARGO_0B544F6F14B1",
                   "nombre": "ENCARGADO DE ADQUISICIONES Y SERVICIOS DE LA UNIDAD DE PROYECTOS EÓLICOS",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "71b664b4-01e8-5b7c-9387-bfe118880622",
                   "codigo": "1913",
                   "nombre": "ENC.PROCESAM.DE DATOS",
                   "codigo_externo": "1913"
                 },
                 {
                   "id": "54cd0dbb-f1df-5cdd-9965-8fe6b08a4b8f",
                   "codigo": "CARGO_4659452B34F9",
                   "nombre": "INGENIERO DE ESTUDIOS DE PLANIFICACIÓN",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "83660d31-95a1-5b67-995c-a16a93707eee",
                   "codigo": "2305",
                   "nombre": "RESPONSABLE DE GESTIÓN FINANCIERA",
                   "codigo_externo": "2305"
                 },
                 {
                   "id": "7c3b696b-fa7e-5d42-9a03-3ec752ddce1f",
                   "codigo": "1918",
                   "nombre": "JEFE ADQUISICIONES Y SERVICIOS",
                   "codigo_externo": "1918"
                 },
                 {
                   "id": "373a9e70-c551-5edd-b1ab-41d19c0791de",
                   "codigo": "7591",
                   "nombre": "RESPONSABLE DE MONITOREO Y CONTROL DE PROYECTO",
                   "codigo_externo": "7591"
                 },
                 {
                   "id": "3a223c8d-abd9-59c7-b5dd-8ca372418097",
                   "codigo": "CARGO_025F2DEC3082",
                   "nombre": "ARQUITECTO",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "990c5b4e-647f-57f4-b2d3-da0609e068c4",
                   "codigo": "CARGO_7206D7095BA1",
                   "nombre": "RESPONSABLE DE PROYECTOS HIDROELECTRICOS Y MULTIPLES",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "9ae79e4e-16aa-5d56-b557-e49f7655c8b8",
                   "codigo": "7418",
                   "nombre": "JEFE UNIDAD DE MOVIMIENTO DE ENERGIA",
                   "codigo_externo": "7418"
                 },
                 {
                   "id": "377b7681-14b4-5f46-a3b7-c6c8e45c101b",
                   "codigo": "CARGO_BF836180576E",
                   "nombre": "JEFE DE LA UNIDAD DE INGENIERIA DE PROYECTOS",
                   "codigo_externo": "Item"
                 },
                 {
                   "id": "96f86ce0-7c9a-5695-a44b-f74c27b5e0ad",
                   "codigo": "CARGO_C833A5572704",
                   "nombre": "Responsable de Proyectos Hidroeléctricos Múltiples",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "4dd93e01-f2ea-5ad2-946b-6484f2ed9920",
                   "codigo": "CARGO_5FD3060977C6",
                   "nombre": "INGENIERO DE PROYECTOS",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "82945ed5-d903-5437-a303-7776dc914ad3",
                   "codigo": "CARGO_2293D6549DF4",
                   "nombre": "RESPONSABLE DE CORRESPONDENCIA",
                   "codigo_externo": "Item"
                 },
                 {
                   "id": "41e67432-c10e-52c0-96a0-0e1a8cdf6bdc",
                   "codigo": "CARGO_B5C110D072B4",
                   "nombre": "AUXILIAR DE RECURSOS HUMANOS II",
                   "codigo_externo": "Item"
                 },
                 {
                   "id": "277a9f62-bd34-51d4-8d19-c4be61c73e9b",
                   "codigo": "7703",
                   "nombre": "AUXILIAR DE SOPORTE TECNICO 1",
                   "codigo_externo": "7703"
                 },
                 {
                   "id": "6561c21a-e043-58ff-830f-62f47a2875a0",
                   "codigo": "7704",
                   "nombre": "AUXILIAR DE SOPORTE TECNICO 2",
                   "codigo_externo": "7704"
                 },
                 {
                   "id": "8e860da8-a57d-56d8-a2db-6aff075691d5",
                   "codigo": "CARGO_1A3BB6745ABA",
                   "nombre": "ENCARGADA DE COMPRAS",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "1fd99ea0-70df-5f29-ba52-532faaf856a9",
                   "codigo": "1970",
                   "nombre": "RESPONSABLE DE ACTIVOS FIJOS Y PRESUPUESTOS",
                   "codigo_externo": "1970"
                 },
                 {
                   "id": "ba774698-db76-5fa3-8d1c-a3006c111b62",
                   "codigo": "CARGO_494FF9404DD9",
                   "nombre": "ASISTENTE DE ALMACENES",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "820b21f1-927d-5cfd-80e4-daa1d5f565a3",
                   "codigo": "1974",
                   "nombre": "JEFE MEDICO/SALUD OCUP.",
                   "codigo_externo": "1974"
                 },
                 {
                   "id": "73265965-fbf9-5464-9b09-ecd96d59ba11",
                   "codigo": "CARGO_75F62E5733AF",
                   "nombre": "PROFESIONAL DE SOPORTE ADMINISTRATIVO",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "53fd0db7-1965-53d8-a2cf-63091aa3aacd",
                   "codigo": "CARGO_B0B9F988CF69",
                   "nombre": "ASISTENTE ADMINISTRATIVA Y CORPORATIVA",
                   "codigo_externo": "Item"
                 },
                 {
                   "id": "f2f1deee-9e90-5aeb-b80f-7aa9c010d304",
                   "codigo": "CARGO_42160434F083",
                   "nombre": "CHOFER",
                   "codigo_externo": "Item"
                 },
                 {
                   "id": "c180c13f-338b-5c2d-9207-1228f52b93d1",
                   "codigo": "2011",
                   "nombre": "ENCARGADA DE TESORERÍA",
                   "codigo_externo": "2011"
                 },
                 {
                   "id": "dfafde50-92ae-58ce-ae47-a0c33d1a9ad9",
                   "codigo": "CARGO_C2EBEF5AA198",
                   "nombre": "ASISTENTE DE MANTENIMIENTO ELECTROMECANICO",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "5bae5a65-d0c2-59fb-8019-e226c9326bb8",
                   "codigo": "CARGO_CF654EAFC184",
                   "nombre": "TECNICO MANTENEDOR",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "7c48179c-b87f-5e61-b868-c419c8836863",
                   "codigo": "CARGO_E2F6E31D84CB",
                   "nombre": "MANTENEDOR",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "0c9fc719-45fd-5aa3-a584-b68c91e75851",
                   "codigo": "CARGO_193E4C461F8C",
                   "nombre": "ENCARGADO DE CENTRALES CORANI Y SANTA ISABEL",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "95ec9cd9-da6a-5219-b74e-74a164fa5da5",
                   "codigo": "CARGO_0BC14A71E27E",
                   "nombre": "INGENIERO ESTUDIOS APLICADOS HIDROLOGIA E HIDRAULICA",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "c1338ef6-c5e4-549d-822d-93f200788810",
                   "codigo": "CARGO_55B5EB48BB0E",
                   "nombre": "ENCARGADA DE DESARROLLO DE SOFTWARE",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "4ad3fd6d-9ea7-58af-9d3f-bb92de688775",
                   "codigo": "2272",
                   "nombre": "AUXILIAR DE OFICINA",
                   "codigo_externo": "2272"
                 },
                 {
                   "id": "816294b8-cf6a-55e7-b081-c7bb4f0227ab",
                   "codigo": "2282",
                   "nombre": "AUXILIAR CONTABLE",
                   "codigo_externo": "2282"
                 },
                 {
                   "id": "e60002bb-557b-5d2a-84a4-13ba74995415",
                   "codigo": "2321",
                   "nombre": "CHOFER",
                   "codigo_externo": "2321"
                 },
                 {
                   "id": "7801b9ea-408d-5108-988a-af065d717e3e",
                   "codigo": "2031",
                   "nombre": "HIDROGEÓLOGO ESPECIALISTA EN ESTUDIOS DE PROYECTOS HIDROELÉCTRICOS",
                   "codigo_externo": "2031"
                 },
                 {
                   "id": "cce7f2fb-91fc-5518-b29c-79380263f11d",
                   "codigo": "CARGO_BE9B39F9DD52",
                   "nombre": "AUXILIAR DE CORRESPONDENCIA",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "77dd3205-4a3d-56bd-9b01-ad0cedb992ff",
                   "codigo": "795",
                   "nombre": "ABOGADA",
                   "codigo_externo": "795"
                 },
                 {
                   "id": "204dc2c9-4333-54e8-b5a8-4d4ebb780027",
                   "codigo": "1986",
                   "nombre": "MANTENEDOR",
                   "codigo_externo": "1986"
                 },
                 {
                   "id": "d4bfb288-b2d9-5c90-9f24-dc815c84119e",
                   "codigo": "CARGO_03DA123A05D9",
                   "nombre": "INSPECTOR DE MEDIO AMBIENTE",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "877e7f4d-0f5c-5d6e-ad8c-65b0dd12bae1",
                   "codigo": "1235",
                   "nombre": "ASISTENTE DE INVESTIGACIÓN DE MERCADOS Y CONTRATACIONES ESPECIALES",
                   "codigo_externo": "1235"
                 },
                 {
                   "id": "19aeb877-443e-5a70-ba49-ac15cf899b65",
                   "codigo": "2074",
                   "nombre": "ASISTENTE DE PROCESAMIENTO DE DATOS",
                   "codigo_externo": "2074"
                 },
                 {
                   "id": "ccdc8626-2222-5732-8caa-ae5ac6dde092",
                   "codigo": "CARGO_A35C516413E6",
                   "nombre": "JEFE DE SEGURIDAD Y SALUD OCUPACIONAL",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "124bfd10-c913-54f6-a279-626ef7830363",
                   "codigo": "CARGO_BF3C34F7844B",
                   "nombre": "ENCARGADO DE CENTRALES SAN JOSE 1 Y 2",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "65c91681-cd95-5b2a-a230-e0d62c2750bf",
                   "codigo": "CARGO_BBEB80C1BAE5",
                   "nombre": "TEC. MNTDOR. CENTRAL S. JOSE",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "83a4e198-b270-57ee-b9b5-0086cbb46412",
                   "codigo": "2259",
                   "nombre": "ASISTENTE TÉCNICO II",
                   "codigo_externo": "2259"
                 },
                 {
                   "id": "d3bd94d7-a633-5e25-87aa-b8c0afa28e3c",
                   "codigo": "CARGO_303440CDE6B2",
                   "nombre": "TEC. MNTDOR SAN JOSE I",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "522addf4-b90c-59bb-aeb5-42a0bb37fe75",
                   "codigo": "CARGO_EFCC88162677",
                   "nombre": "TECNICO OPERADOR",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "f5c50415-84d1-5258-9028-5df5a334ed85",
                   "codigo": "CARGO_2F83BC6CF0EA",
                   "nombre": "ENCARGADO DE CENTRAL EOLICA",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "a6559195-16bb-5bec-be4c-37164a5febb1",
                   "codigo": "CARGO_EC6A12258E36",
                   "nombre": "RESPONSABLE DE MANTENIMIENTO",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "1683a8a8-cdae-5896-9fa8-db4b52568e8a",
                   "codigo": "2091",
                   "nombre": "ASIS. CENTRAL QOLLPANA",
                   "codigo_externo": "2091"
                 },
                 {
                   "id": "174df67f-bd75-5e30-9c0f-fa41f45f6cc4",
                   "codigo": "CARGO_E1537FEFAC6F",
                   "nombre": "SUPERVISOR DE MANTENIMIENTO ELECTROMECANCO a.i.",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "8a8e93e3-4553-50f9-82a2-1542aed3be98",
                   "codigo": "2252",
                   "nombre": "GESTOR SOCIAL",
                   "codigo_externo": "2252"
                 },
                 {
                   "id": "166dd0b0-48c9-5ac7-bcd9-e5610ba8165b",
                   "codigo": "CARGO_C41488F7B70D",
                   "nombre": "CHOFER",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "3fbd090b-a061-5b99-bf0e-a838808b1d11",
                   "codigo": "CARGO_9D607A6A6E61",
                   "nombre": "RESPONSABLE DE INFRAESTRUCTURA Y SOPORTE TÉCNICO",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "e5e2cb4f-5ee2-599d-9ff7-34ac6c7fbbd0",
                   "codigo": "CARGO_6C8DDCE4C21A",
                   "nombre": "COORDINADOR DE MEDIO AMBIENTE , SEGURIDAD INDUSTRIAL Y SALUD OCUPACIONAL  PHM",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "0443cc12-07b0-55d4-a0c0-a3ced85b345a",
                   "codigo": "2290",
                   "nombre": "AUXILIAR DE SOPORTE TECNICO",
                   "codigo_externo": "2290"
                 },
                 {
                   "id": "0bb6eb69-84b1-5c61-9751-99f3f2378601",
                   "codigo": "CARGO_0961DA46604B",
                   "nombre": "INGENIERO TUBERÍA FORZADA",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "f91f67d7-dfec-5fa9-8ddd-34107902d993",
                   "codigo": "CARGO_FCF86DDE41EC",
                   "nombre": "INGENIERO DE CONFIABILIDAD DE ACTIVOS",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "d8eec784-3e1a-54aa-9238-459d7c397a12",
                   "codigo": "CARGO_3C95A76F17E7",
                   "nombre": "ASESOR LEGAL  INTERINO",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "cf47dee9-ebd6-5b1d-97b3-d0fd5f4bfcad",
                   "codigo": "CARGO_2C1D88A420ED",
                   "nombre": "INGENIERO JEFE DE OBRAS DE SUPERFICIE",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "e0b2b1c9-46ee-5da2-8688-edcd8fcfb6e8",
                   "codigo": "CARGO_03F60339F05C",
                   "nombre": "GERENTE DE OPERACIONES Y MANTENIMIENTO a.i.",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "aefef5be-aa76-5e3e-ade0-70b2ce5437af",
                   "codigo": "2227",
                   "nombre": "SECRETARIA",
                   "codigo_externo": "2227"
                 },
                 {
                   "id": "97e9cc73-394d-50d6-94b7-2a61e085ba4e",
                   "codigo": "2233",
                   "nombre": "JEFE DE UNIDAD ACTIVOS FIJOS",
                   "codigo_externo": "2233"
                 },
                 {
                   "id": "5abcb0e6-f05e-5e6a-9a45-df748a7a1320",
                   "codigo": "CARGO_1E45602C17BE",
                   "nombre": "RESPONSABLE DE LA UNIDAD DE TRANSPARENCIA Y LUCHA CONTRA LA CORRUPCION",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "c01511bb-bd80-594f-8a3a-9a056a7c8ba9",
                   "codigo": "CARGO_02FA2A58B3FB",
                   "nombre": "CONDUCTOR Y AUXILIAR DE CAMPAMENTO",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "fb5767bc-ba6c-5d28-8f57-14af7041074e",
                   "codigo": "CARGO_1E764A23355D",
                   "nombre": "PARAMEDICO",
                   "codigo_externo": "Contrato"
                 },
                 {
                   "id": "caa306e4-b257-5e05-9ef3-5197accf0b7c",
                   "codigo": "2266",
                   "nombre": "ALARIFE",
                   "codigo_externo": "2266"
                 },
                 {
                   "id": "3013ac6d-6d78-51b7-ba77-909b7600f919",
                   "codigo": "2267",
                   "nombre": "ESPECIALISTA CIVIL EN GESTIÓN Y DOCUMENTACIÓN DE CALIDAD II",
                   "codigo_externo": "2267"
                 },
                 {
                   "id": "c1e58158-c98d-5b46-9359-8e342361e0d7",
                   "codigo": "2268",
                   "nombre": "SECRETARIA DE OFICINA",
                   "codigo_externo": "2268"
                 },
                 {
                   "id": "cb03ab59-89d1-5075-a05b-b709e2bbb2a8",
                   "codigo": "2258",
                   "nombre": "ASISTENTE ELECTROMECANICO Y DE PROTECCIONES",
                   "codigo_externo": "2258"
                 },
                 {
                   "id": "92a36808-b873-5d8d-81c3-7786de64cb92",
                   "codigo": "2230",
                   "nombre": "JEFE MEDICO PHM",
                   "codigo_externo": "2230"
                 },
                 {
                   "id": "95f6f771-9301-5304-a186-21ed8e2f40b6",
                   "codigo": "2276",
                   "nombre": "COORDINADOR DE SUPERVISION",
                   "codigo_externo": "2276"
                 },
                 {
                   "id": "b506898d-3116-5e51-892a-d36a716b1996",
                   "codigo": "2284",
                   "nombre": "AUXILIAR CONTABLE",
                   "codigo_externo": "2284"
                 },
                 {
                   "id": "1725c4b4-ac78-5ec6-9736-b0c829842ba7",
                   "codigo": "CARGO_BD378A3873E0",
                   "nombre": "TECNICO  MANTENEDOR",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "7d1311a3-2244-5636-8a15-5df0deeed8b5",
                   "codigo": "2315",
                   "nombre": "TOPOGRAFO II",
                   "codigo_externo": "2315"
                 },
                 {
                   "id": "7a4c09ea-e20a-559f-a488-854a9d2e4158",
                   "codigo": "2317",
                   "nombre": "INSPECTOR DE MEDIO AMBIENTE II",
                   "codigo_externo": "2317"
                 },
                 {
                   "id": "68bed6e1-630a-5e31-bd62-a6f05e6d6ede",
                   "codigo": "2318",
                   "nombre": "ALARIFE III",
                   "codigo_externo": "2318"
                 },
                 {
                   "id": "5ba1c4b3-be25-55f9-bccb-0f2810d5c814",
                   "codigo": "2319",
                   "nombre": "AUXILIAR DE ACTIVOS FIJOS",
                   "codigo_externo": "2319"
                 },
                 {
                   "id": "0bf41751-085b-5866-8a9b-78f600382ca4",
                   "codigo": "2333",
                   "nombre": "ENFERMERA 2",
                   "codigo_externo": "2333"
                 },
                 {
                   "id": "2ac276b2-b3d7-521e-9c2b-d1b731f8885e",
                   "codigo": "2334",
                   "nombre": "MEDICO 2",
                   "codigo_externo": "2334"
                 },
                 {
                   "id": "6c647bdc-b29e-54b0-bbe2-51854f3b3a0d",
                   "codigo": "CARGO_F0738E175995",
                   "nombre": "COORDINADOR DE MEDIO AMBIENTE GESTION SOCIAL, SEGURIDAD Y SALUD OCUPACIONAL",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "a48ea988-ca60-5a76-946f-e0f86a9111d7",
                   "codigo": "CARGO_3A0FB895475F",
                   "nombre": "ASISTENTE CENTRAL QOLLPANA",
                   "codigo_externo": "Item"
                 },
                 {
                   "id": "56ab8007-22df-5d36-aed9-9a8852bef657",
                   "codigo": "CARGO_F698ECA72C42",
                   "nombre": "PROFESIONAL IV - CONTABILIDAD",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "67ef8381-b23e-506d-9ee8-7934132f7a5f",
                   "codigo": "CARGO_E24D2451EA76",
                   "nombre": "TECNICO MANTENEDOR",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "10622059-dc48-50f7-9e0a-b5b0315305c3",
                   "codigo": "CARGO_D0028871CF34",
                   "nombre": "PROFESIONAL DE RECURSOS HUMANOS",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "912e3818-a932-578e-8f16-b59fbebcc14b",
                   "codigo": "CARGO_B2A0DCB50FE3",
                   "nombre": "ASISTENTE DE OPERACIÓN SAN JOSE 1 Y 2",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "be3104b5-7640-55e1-b91f-42058972acba",
                   "codigo": "CARGO_29385A787B19",
                   "nombre": "PROFESIONAL DE COMUNICACIÓN",
                   "codigo_externo": "Item"
                 },
                 {
                   "id": "aab9e59b-72d6-5683-9c2f-c6b26d4c6145",
                   "codigo": "CARGO_8FBD138E0EA2",
                   "nombre": "GESTOR LEGAL",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "1b46ef77-5a0c-51a5-81d0-c964cc24ee4e",
                   "codigo": "CARGO_1B109086A687",
                   "nombre": "JEFE UNIDAD EJECUTORA DE PROYECTOS HIDROELECTRICOS",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "7dc68b72-334a-511f-bdd5-32797c0923fa",
                   "codigo": "CARGO_4D6D80FB4508",
                   "nombre": "JEFE DE DEPARTAMENTO DE MARKETING Y COMUNICACIONES",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "ab0f8ef5-d8ad-5c37-89c5-c2f3ad549adf",
                   "codigo": "CARGO_76FF1BC7CCB0",
                   "nombre": "ASISTENTE TÉCNICO III",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "8311ef4d-973d-5561-a32d-e0f6cd270ca3",
                   "codigo": "CARGO_ED8AC2BB7616",
                   "nombre": "COORDINADOR DE CONTROL DE GESTION",
                   "codigo_externo": "Contrato"
                 },
                 {
                   "id": "d1767bf2-64ea-5ccc-bf43-9ef377d86d49",
                   "codigo": "CARGO_1926A7BA8E90",
                   "nombre": "ABOGADO ESPECIALISTA EN PROYECTOS",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "40bc5d16-b2c0-5386-a5a9-498c29cc5ef2",
                   "codigo": "CARGO_6BDA5A55C74C",
                   "nombre": "AUXILIAR DE SOPORTE TÉCNICO",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "1989ff59-72c2-526a-8bf4-a39e40951334",
                   "codigo": "CARGO_8490D70E0E93",
                   "nombre": "ASISTENTE TÉCNICO III- DESARROLLADOR DE SOFTWARE",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "68fbd23e-939a-5e39-843f-d4e6f587c387",
                   "codigo": "CARGO_F30FACD4E6BD",
                   "nombre": "CHOFER-MENSAJERO",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "f71b744e-a9a8-5f84-b51c-d0bc52e6f539",
                   "codigo": "CARGO_1DC8B975F81A",
                   "nombre": "AUXILIAR DE PLANTA CENTRAL SAN JOSE",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "64946d9d-1362-5903-a5c2-9fff54e9e8e3",
                   "codigo": "CARGO_E7A177840469",
                   "nombre": "MEDICO ALTERNO",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "a90559ac-610b-5c80-80a0-cf82534b90d5",
                   "codigo": "CARGO_09C9E3F7D802",
                   "nombre": "AUXILIAR PROCESAMIENTO DATOS",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "c7080d5a-4d01-5519-8b90-ad4e7e5f11fc",
                   "codigo": "CARGO_934756D0A9E1",
                   "nombre": "GERENTE GENERAL INTERINO",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "01b78100-4db3-5675-a843-95e26e6c905e",
                   "codigo": "CARGO_97FA355553B3",
                   "nombre": "GERENTE DE RESPONSABILIDAD SOCIAL",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "5f9d06b8-81ed-5e07-9cdf-67b872fad955",
                   "codigo": "CARGO_71992897AD64",
                   "nombre": "JEFE DE DEPARTAMENTO DE TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIÓN",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "af320cf0-bca5-5096-b5b9-31791610f352",
                   "codigo": "CARGO_DA9867A3FC16",
                   "nombre": "COORDINADOR DE RECURSOS HUMANOS",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "23d7bca1-0b3a-5c44-ae3d-5e459eb3b462",
                   "codigo": "CARGO_144154C35486",
                   "nombre": "JEFE DE RECURSOS HUMANOS Y PROCESOS",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "ed0062ea-a3f9-5489-ac66-4a704c163ca8",
                   "codigo": "CARGO_73337A832CC2",
                   "nombre": "ABOGADO",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "aa42168c-a519-589c-bd8b-f54cff9b79a9",
                   "codigo": "CARGO_2A4BDA1C9CCF",
                   "nombre": "GERENTE ADMINISTRATIVO FINANCIERO a.i.",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "2046fa90-e255-5785-813c-d4da1aacd317",
                   "codigo": "CARGO_4A90FA3E62D7",
                   "nombre": "JEFE UNIDAD LEGAL",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "cfea459a-b5f9-5f52-ab4d-9e5e7fd8dc88",
                   "codigo": "CARGO_BFC1F58A51F2",
                   "nombre": "PROFESIONAL DE SOPORTE LEGAL",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "52810cbb-8a29-5b5b-b9d4-886b72734ec4",
                   "codigo": "CARGO_C2B9A7A51A7F",
                   "nombre": "JEFE DE OPERACION Y MANTENIMIENTO",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "8eaa4840-adfa-5e85-a0e5-9b9fb8d6e76e",
                   "codigo": "CARGO_AD6A7812916C",
                   "nombre": "CHOFER / MENSAJERO",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "822a4e16-7bac-5924-9b7c-ab59f7e7b6b0",
                   "codigo": "CARGO_1503DA94DB3A",
                   "nombre": "JEFE DE MOVIMIENTO DE ENERGIA",
                   "codigo_externo": "ITEM"
                 },
                 {
                   "id": "78b6fdc6-7247-5d98-9353-753996951023",
                   "codigo": "CARGO_2384D033AAD9",
                   "nombre": "AUXILIAR DE CONTABILIDAD",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "9c9188a6-6395-55db-84be-4f4310bb83af",
                   "codigo": "CARGO_BE92924FCAC4",
                   "nombre": "GERENTE DE PLANIFICACION Y PROYECTOS",
                   "codigo_externo": "item"
                 },
                 {
                   "id": "9778de2d-4ba2-5095-a534-75d1413c57c1",
                   "codigo": "CARGO_11871EE2B06C",
                   "nombre": "ASISTENTE TECNICO III - MATENIMIENTO CIVIL - ESTRUCTURAS Y VIAS",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "7cf801a9-398b-5b36-bc6e-e6d776184f07",
                   "codigo": "CARGO_9A423B075F8D",
                   "nombre": "ASISTENTE GERENCIA GENERAL",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "85bc50e4-18e7-5b6c-b6db-27ba0a6e68a5",
                   "codigo": "CARGO_DA7AC4EBDD72",
                   "nombre": "AUXILIAR DE ACTIVOS FIJOS Y ALMACENES",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "0565ce34-826c-580b-8527-8eb3bde2b164",
                   "codigo": "CARGO_4FE0FE0B6C0D",
                   "nombre": "AUXILIAR II DE ACTIVOS FIJOS Y ALMACENES",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "e0f23e49-e128-57c3-8ad3-fcc3f9b7f69a",
                   "codigo": "CARGO_95F2D46FF32E",
                   "nombre": "DESARROLLADOR DE SOFTWARE",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "78bb3d73-d2b0-5576-9552-8dbedaa02a3c",
                   "codigo": "CARGO_CC6291FAA14C",
                   "nombre": "ENCARGADO DE COMPRAS I",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "cc98fea1-2e80-53aa-b67d-935ac7e23e51",
                   "codigo": "CARGO_9B727DDE1CDE",
                   "nombre": "ENCARGADO ADMINISTRATIVO I",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "301bd535-20c0-5c74-aadc-ec15bd2a8956",
                   "codigo": "CARGO_CB25640DDE97",
                   "nombre": "RESPONSABLE DE SERVICIOS GENERALES CAMPAMENTO",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "bb0c8298-a4da-5908-8be2-8d3afc46bc06",
                   "codigo": "CARGO_BED5679F9D15",
                   "nombre": "ANALISTA TECNICO",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "3f8f9d9c-3fe9-520a-a10b-ab4c71720595",
                   "codigo": "CARGO_EE9C8FB5B8A2",
                   "nombre": "PROFESIONAL EN RECURSOS ENERGETICOS DEL SECTOR ELECTRICO",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "700a34ad-d3a9-520b-8ff1-07a2676318f0",
                   "codigo": "CARGO_F6BD17011477",
                   "nombre": "PROFESIONAL III DE SEGUROS",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "b364cf1a-05f7-5cff-9ae2-d11ba9409b33",
                   "codigo": "CARGO_D58524580847",
                   "nombre": "COORDINADOR DE MARKETING Y COMUNICACIONES",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "f6eabdbf-9dfb-5989-b0e0-9d406128bae0",
                   "codigo": "CARGO_B0BAAC2F6690",
                   "nombre": "RESPONSABLE DEL AREA DE VIALIDAD SIG TOPOGRAFIA Y CARTOGRAFIA",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "9d8b3788-0b50-5745-9e29-e544d9d3dc6e",
                   "codigo": "CARGO_FA49A2FA979F",
                   "nombre": "PROFESIONAL DE AUDITORIA",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "8acad1e1-bcba-5bc7-8f5e-47bebd77244c",
                   "codigo": "CARGO_723D99DBD49A",
                   "nombre": "JEFE DE MEDIO AMBIENTE",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "1c1a30cb-3325-5e56-9294-11aa4bf479dc",
                   "codigo": "CARGO_C4B0C3DE9D10",
                   "nombre": "AUXILIAR DE SEGURIDAD INDUSTRIAL",
                   "codigo_externo": "contrato"
                 },
                 {
                   "id": "f73ab325-3de6-526d-9346-4396dbd47d41",
                   "codigo": "CARGO_7075EA3FE5FC",
                   "nombre": "ASISTENTE CENTRAL QOLLPANA",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "04ee6971-0735-598b-9c34-5aa09de56507",
                   "codigo": "CARGO_5E465D849D8C",
                   "nombre": "AUXILIAR DE AUDITORIA INTERNA",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "59c2ec9c-ad14-5185-8f63-e362a879bc73",
                   "codigo": "CARGO_7AC51808D6A5",
                   "nombre": "RESPONSABLE DE TRANSPORTES Y LOGISTICA",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "eeb440b0-bbdc-5b6f-acc4-27eba66804d2",
                   "codigo": "CARGO_D41AF458DB85",
                   "nombre": "AUXILIAR ADQUISICIONES",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "adf576a8-ef9d-59a1-9d6e-8262b5ced224",
                   "codigo": "CARGO_A4EC0488DFE7",
                   "nombre": "COORDINADOR DE GESTION FINANCIERA",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "f66ed77d-5e12-56e7-a281-fee9e5a2f37a",
                   "codigo": "CARGO_E2C9A993E6A1",
                   "nombre": "ABOGADA",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "349907f0-88f3-583d-8e22-19c7d847f354",
                   "codigo": "CARGO_250112E80B30",
                   "nombre": "ASISTENTE TECNICO III DE MANTENIMIENTO CIVIL - ESTRUCTURAS Y VIAS",
                   "codigo_externo": "CONTRATO"
                 },
                 {
                   "id": "7ad7dfd6-413b-5a85-a37f-93c133772c19",
                   "codigo": "CARGO_C8309A045D37",
                   "nombre": "TECNICO OPERADOR",
                   "codigo_externo": "CONTRATO"
                 }
               ]$json$::jsonb)
                        AS x(id uuid, codigo varchar(50), nombre varchar(100), codigo_externo varchar(100)))
INSERT
INTO organizacion.cargos (id, codigo, nombre, descripcion, sistema_origen, codigo_externo, created_at, updated_at, created_by,
                          updated_by)
SELECT id,
       codigo,
       nombre,
       NULL,
       'Result_2.xlsx',
       codigo_externo,
       NOW(),
       NULL,
       'migracion_excel',
       NULL
FROM datos;

-- ============================================================================
-- 3. PERSONAS (organizacion.personas)
-- ============================================================================
WITH datos AS (SELECT *
               FROM jsonb_to_recordset($json$[
                 {
                   "id": "f27c1e09-4d0e-56a6-a80a-2bcabdf60b8b",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "854639",
                   "complemento": null,
                   "nombres": "LUIS FERNANDO",
                   "primer_apellido": "RODRIGUEZ",
                   "segundo_apellido": "COSIO",
                   "fecha_nacimiento": "1953-05-30",
                   "telefono": null,
                   "correo": "fernando.rodriguez@endecorani.bo",
                   "codigo_externo": "fernando.rodriguez"
                 },
                 {
                   "id": "c8f55168-9b3a-5438-8371-55180934118b",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "2872611",
                   "complemento": "1F",
                   "nombres": "OSCAR",
                   "primer_apellido": "CASTRO",
                   "segundo_apellido": "MEDRANO",
                   "fecha_nacimiento": "1959-09-20",
                   "telefono": null,
                   "correo": "oscar.castro@endecorani.bo",
                   "codigo_externo": "oscar.castro"
                 },
                 {
                   "id": "de411c75-391b-53ab-9752-9e53e4b8c9ef",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "2890084",
                   "complemento": null,
                   "nombres": "ENRIQUE",
                   "primer_apellido": "ROJAS",
                   "segundo_apellido": "SANDOVAL",
                   "fecha_nacimiento": "1958-02-10",
                   "telefono": null,
                   "correo": "enrique.rojas@endecorani.bo",
                   "codigo_externo": "enrique.rojas"
                 },
                 {
                   "id": "465be4d0-aadf-5b25-9ab8-abe665f84749",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "8608955",
                   "complemento": null,
                   "nombres": "CARLOS",
                   "primer_apellido": "VERGARA",
                   "segundo_apellido": "PRIETO",
                   "fecha_nacimiento": "1959-11-03",
                   "telefono": null,
                   "correo": "carlos.vergara@endecorani.bo",
                   "codigo_externo": "carlos.vergara"
                 },
                 {
                   "id": "7f68e10a-32c0-5bd1-938a-2ce9faa5a12c",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3129912",
                   "complemento": null,
                   "nombres": "RUDY ELOY",
                   "primer_apellido": "CESPEDES",
                   "segundo_apellido": "WINNIPEG",
                   "fecha_nacimiento": "1967-06-25",
                   "telefono": null,
                   "correo": "rudy.cespedes@endecorani.bo",
                   "codigo_externo": "rudy.cespedes"
                 },
                 {
                   "id": "53d793dd-9988-5f25-bfb8-d41208a338ca",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3132517",
                   "complemento": null,
                   "nombres": "WALTER",
                   "primer_apellido": "SEJAS",
                   "segundo_apellido": "POZO",
                   "fecha_nacimiento": "1964-09-28",
                   "telefono": "72220337",
                   "correo": "walter.sejas@endecorani.bo",
                   "codigo_externo": "walter.sejas"
                 },
                 {
                   "id": "0c90781a-ae81-5b26-bd38-3203835b793f",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "675775",
                   "complemento": null,
                   "nombres": "ROLANDO",
                   "primer_apellido": "GUZMAN",
                   "segundo_apellido": "VIA",
                   "fecha_nacimiento": "1956-09-29",
                   "telefono": null,
                   "correo": "rolando.guzman@endecorani.bo",
                   "codigo_externo": "rolando.guzman"
                 },
                 {
                   "id": "838ee682-9d97-5a65-b337-48cb536a6be5",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "2797750",
                   "complemento": null,
                   "nombres": "CARLOS ALBERTO",
                   "primer_apellido": "TICONA",
                   "segundo_apellido": "FELIPEZ",
                   "fecha_nacimiento": "1964-01-08",
                   "telefono": null,
                   "correo": "carlos.ticona@endecorani.bo",
                   "codigo_externo": "carlos.ticona"
                 },
                 {
                   "id": "e2ead22c-6a36-58f7-ab6f-0b87ac4a9575",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3357651",
                   "complemento": null,
                   "nombres": "FREDDY FRANCISCO",
                   "primer_apellido": "RIVERO",
                   "segundo_apellido": "CENTELLAS",
                   "fecha_nacimiento": "1965-07-24",
                   "telefono": null,
                   "correo": "freddy.rivero@endecorani.bo",
                   "codigo_externo": "freddy.rivero"
                 },
                 {
                   "id": "19d07071-0ca5-5310-9a2f-2dc76e3932f3",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "2266297",
                   "complemento": null,
                   "nombres": "DEMETRIO",
                   "primer_apellido": "FERNANDEZ",
                   "segundo_apellido": "CHAMBI",
                   "fecha_nacimiento": "1961-08-29",
                   "telefono": null,
                   "correo": "demetrio.fernandez@endecorani.bo",
                   "codigo_externo": "demetrio.fernandez"
                 },
                 {
                   "id": "2390bcc1-af43-510d-b3c5-c82f95c14941",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3041385",
                   "complemento": null,
                   "nombres": "CESAR",
                   "primer_apellido": "FLORES",
                   "segundo_apellido": "CRUZ",
                   "fecha_nacimiento": "1964-11-22",
                   "telefono": null,
                   "correo": "cesar.flores@endecorani.bo",
                   "codigo_externo": "cesar.flores"
                 },
                 {
                   "id": "7984b706-bbb0-5c09-bd37-ed009beb2a9d",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "2939229",
                   "complemento": null,
                   "nombres": "RONY",
                   "primer_apellido": "URCULLO",
                   "segundo_apellido": "FLORES",
                   "fecha_nacimiento": "1964-06-19",
                   "telefono": null,
                   "correo": "rony.urcullo@endecorani.bo",
                   "codigo_externo": "rony.urcullo"
                 },
                 {
                   "id": "cbc8c6eb-72f5-577a-ad70-9ba3defc6e55",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3592929",
                   "complemento": null,
                   "nombres": "MARIA ELENA",
                   "primer_apellido": "BARRERA",
                   "segundo_apellido": "RIOS",
                   "fecha_nacimiento": "1968-12-09",
                   "telefono": null,
                   "correo": "maria.barrera@endecorani.bo",
                   "codigo_externo": "maria.barrera"
                 },
                 {
                   "id": "45d4907f-a95e-5d02-b1c3-4b6dde9954c3",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "964962",
                   "complemento": null,
                   "nombres": "VICTOR HUGO",
                   "primer_apellido": "BAYA",
                   "segundo_apellido": "GARCIA",
                   "fecha_nacimiento": "1958-12-31",
                   "telefono": null,
                   "correo": "victor.baya@endecorani.bo",
                   "codigo_externo": "victor.baya"
                 },
                 {
                   "id": "7278b5f1-1299-57a2-972e-634c1b9e75b2",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3749876",
                   "complemento": null,
                   "nombres": "JOSE MARTINI",
                   "primer_apellido": "FERNANDEZ",
                   "segundo_apellido": "CLAROS",
                   "fecha_nacimiento": "1971-11-03",
                   "telefono": null,
                   "correo": "jose.fernandez@endecorani.bo",
                   "codigo_externo": "jose.fernandez"
                 },
                 {
                   "id": "cca31714-79bb-576a-9964-9e0c8bda8478",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3394096",
                   "complemento": null,
                   "nombres": "YONY JUAN",
                   "primer_apellido": "QUISPE",
                   "segundo_apellido": "QUISPE",
                   "fecha_nacimiento": "1968-03-06",
                   "telefono": null,
                   "correo": "yony.quispe@endecorani.bo",
                   "codigo_externo": "yony.quispe"
                 },
                 {
                   "id": "8e0d8391-f9b7-5cea-b562-00d5365b8ede",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "2441374",
                   "complemento": null,
                   "nombres": "ELOY",
                   "primer_apellido": "COLQUE",
                   "segundo_apellido": "ARUQUIPA",
                   "fecha_nacimiento": "1970-09-09",
                   "telefono": null,
                   "correo": "eloy.colque@endecorani.bo",
                   "codigo_externo": "eloy.colque"
                 },
                 {
                   "id": "ea4fe33f-f1bb-58cd-bae1-60d9f2d742f8",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "2743226",
                   "complemento": null,
                   "nombres": "HUMBERTO",
                   "primer_apellido": "NINA",
                   "segundo_apellido": "CRESPO",
                   "fecha_nacimiento": "1962-04-30",
                   "telefono": "72208177",
                   "correo": "humberto.nina@endecorani.bo",
                   "codigo_externo": "humberto.nina"
                 },
                 {
                   "id": "824c6f57-3eef-5d07-9509-f325a934fd86",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3482645",
                   "complemento": null,
                   "nombres": "NELSON MARTIN",
                   "primer_apellido": "URIZAR",
                   "segundo_apellido": "ACARAPI",
                   "fecha_nacimiento": "1979-11-08",
                   "telefono": null,
                   "correo": "nelson.urizar@endecorani.bo",
                   "codigo_externo": "nelson.urizar"
                 },
                 {
                   "id": "f24197b2-27fb-55c0-831c-5ddc445e6dc0",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6149009",
                   "complemento": null,
                   "nombres": "EDWIN ROLANDO",
                   "primer_apellido": "CHOQUE",
                   "segundo_apellido": "APAZA",
                   "fecha_nacimiento": "1983-08-12",
                   "telefono": null,
                   "correo": "edwin.choque@endecorani.bo",
                   "codigo_externo": "edwin.choque"
                 },
                 {
                   "id": "7808fc4e-4668-560d-97fa-b17297c8cb05",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4414538",
                   "complemento": null,
                   "nombres": "LUD MILKA",
                   "primer_apellido": "LEDEZMA",
                   "segundo_apellido": "ORIAS",
                   "fecha_nacimiento": "1975-03-13",
                   "telefono": null,
                   "correo": "lud.ledezma@endecorani.bo",
                   "codigo_externo": "lud.ledezma"
                 },
                 {
                   "id": "8f8bfdb9-1a44-5ecd-8143-b88efad65505",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6445467",
                   "complemento": null,
                   "nombres": "DIETER",
                   "primer_apellido": "ARTEAGA",
                   "segundo_apellido": "COCA",
                   "fecha_nacimiento": "1985-02-18",
                   "telefono": "72207178",
                   "correo": "dieter.arteaga@endecorani.bo",
                   "codigo_externo": "dieter.arteaga"
                 },
                 {
                   "id": "08b7a1c0-63dd-51b1-a530-488677138c68",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4412393",
                   "complemento": null,
                   "nombres": "JOSE RONALD",
                   "primer_apellido": "OSINAGA",
                   "segundo_apellido": "ZAMBRANA",
                   "fecha_nacimiento": "1978-01-24",
                   "telefono": null,
                   "correo": "jose.osinaga@endecorani.bo",
                   "codigo_externo": "jose.osinaga"
                 },
                 {
                   "id": "c9fafa76-3b46-5c62-8f3f-f0afeea0ee68",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4532063",
                   "complemento": null,
                   "nombres": "RICHARD BEIMAR",
                   "primer_apellido": "SEJAS",
                   "segundo_apellido": "SALGUERO",
                   "fecha_nacimiento": "1979-06-10",
                   "telefono": null,
                   "correo": "beimar.sejas@endecorani.bo",
                   "codigo_externo": "beimar.sejas"
                 },
                 {
                   "id": "717000fa-cbe7-5786-8589-f7d43d8ea87a",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5211242",
                   "complemento": null,
                   "nombres": "CESAR",
                   "primer_apellido": "ORELLANA",
                   "segundo_apellido": "ORELLANA",
                   "fecha_nacimiento": "1981-01-17",
                   "telefono": "67405442",
                   "correo": "cesar.orellana@endecorani.bo",
                   "codigo_externo": "cesar.orellana"
                 },
                 {
                   "id": "9793ccb4-23a0-5569-ad64-ba8330879032",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3132727",
                   "complemento": null,
                   "nombres": "RICHARD",
                   "primer_apellido": "LEON",
                   "segundo_apellido": "ARZE",
                   "fecha_nacimiento": "1964-11-20",
                   "telefono": "71732760",
                   "correo": "richard.leon@endecorani.bo",
                   "codigo_externo": "richard.leon"
                 },
                 {
                   "id": "4e1c732d-29da-5426-90fe-dccbef170407",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6292766",
                   "complemento": null,
                   "nombres": "FAVIANA",
                   "primer_apellido": "PIMENTEL",
                   "segundo_apellido": "TRUJILLO",
                   "fecha_nacimiento": "1983-05-29",
                   "telefono": null,
                   "correo": "faviana.pimentel@endecorani.bo",
                   "codigo_externo": "faviana.pimentel"
                 },
                 {
                   "id": "e43c9c9b-3846-5544-8cc1-b0e8f61e2091",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3150620",
                   "complemento": null,
                   "nombres": "MARY MARTHA",
                   "primer_apellido": "ALCOCER",
                   "segundo_apellido": "JAIMES",
                   "fecha_nacimiento": "1965-05-01",
                   "telefono": null,
                   "correo": "mary.alcocer@endecorani.bo",
                   "codigo_externo": "mary.alcocer"
                 },
                 {
                   "id": "b34c20ff-6452-5e0b-8515-f2d97172e1e8",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3606815",
                   "complemento": null,
                   "nombres": "OSCAR RENAN",
                   "primer_apellido": "ZARATE",
                   "segundo_apellido": "BERMUDEZ",
                   "fecha_nacimiento": "1969-07-08",
                   "telefono": "72224009",
                   "correo": "oscar.zarate@endecorani.bo",
                   "codigo_externo": "oscar.zarate"
                 },
                 {
                   "id": "377326f9-7c71-501d-b7fa-40a46fba7f61",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5287962",
                   "complemento": null,
                   "nombres": "HECTOR ANTONIO",
                   "primer_apellido": "TORRICO",
                   "segundo_apellido": "LA TAPIA",
                   "fecha_nacimiento": "1983-07-11",
                   "telefono": null,
                   "correo": "antonio.torrico@endecorani.bo",
                   "codigo_externo": "antonio.torrico"
                 },
                 {
                   "id": "828ad265-c2db-5555-b824-269e0665e1c6",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4059232",
                   "complemento": null,
                   "nombres": "RONALD",
                   "primer_apellido": "QUISPE",
                   "segundo_apellido": "MAMANI",
                   "fecha_nacimiento": "1982-05-22",
                   "telefono": "71731698",
                   "correo": "ronald.quispe@endecorani.bo",
                   "codigo_externo": "ronald.quispe"
                 },
                 {
                   "id": "552330fa-1ee2-5d3f-8375-90ec500ae468",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3578571",
                   "complemento": null,
                   "nombres": "JAQUELINE ARACELY",
                   "primer_apellido": "CLAURE",
                   "segundo_apellido": "CASTELLON",
                   "fecha_nacimiento": "1969-04-12",
                   "telefono": null,
                   "correo": "jaqueline.claure@endecorani.bo",
                   "codigo_externo": "jaqueline.claure"
                 },
                 {
                   "id": "1f3fb831-45e1-553b-a5aa-085515aec0ef",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5908623",
                   "complemento": null,
                   "nombres": "DAVID",
                   "primer_apellido": "PEÑA",
                   "segundo_apellido": "VILLARROEL",
                   "fecha_nacimiento": "1983-04-10",
                   "telefono": null,
                   "correo": "david.pena@endecorani.bo",
                   "codigo_externo": "david.pena"
                 },
                 {
                   "id": "f553e24a-a935-52f5-b160-e72f15ee15f5",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4418085",
                   "complemento": null,
                   "nombres": "JOAQUIN DANIEL",
                   "primer_apellido": "PEREZ",
                   "segundo_apellido": "ORRUEL",
                   "fecha_nacimiento": "1977-01-19",
                   "telefono": "71722685",
                   "correo": "daniel.perez@endecorani.bo",
                   "codigo_externo": "daniel.perez"
                 },
                 {
                   "id": "3be679af-bb1c-55de-8676-77cc6bae9a35",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5318520",
                   "complemento": null,
                   "nombres": "ALDO CESAR",
                   "primer_apellido": "MALDONADO",
                   "segundo_apellido": "FERNANDEZ",
                   "fecha_nacimiento": "1987-07-15",
                   "telefono": "72225744",
                   "correo": "aldo.maldonado@endecorani.bo",
                   "codigo_externo": "aldo.maldonado"
                 },
                 {
                   "id": "f6ea4767-7284-5e80-a5df-cf89bde8d024",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5277846",
                   "complemento": null,
                   "nombres": "ALVARO",
                   "primer_apellido": "VARGAS",
                   "segundo_apellido": "QUIROZ",
                   "fecha_nacimiento": "1983-07-26",
                   "telefono": "72223262",
                   "correo": "alvaro.vargas@endecorani.bo",
                   "codigo_externo": "alvaro.vargas"
                 },
                 {
                   "id": "caca14d0-6486-5a0f-abfd-cacb60dab2d1",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6411140",
                   "complemento": null,
                   "nombres": "FERNANDO",
                   "primer_apellido": "LABRA",
                   "segundo_apellido": "LABRA",
                   "fecha_nacimiento": "1985-03-04",
                   "telefono": "71731972",
                   "correo": "fernando.labra@endecorani.bo",
                   "codigo_externo": "fernando.labra"
                 },
                 {
                   "id": "1fec8ca0-947d-5fc4-8187-b1cca5f84940",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "2363169",
                   "complemento": null,
                   "nombres": "RAFAEL",
                   "primer_apellido": "SAVE",
                   "segundo_apellido": "SALINAS",
                   "fecha_nacimiento": "1960-03-04",
                   "telefono": null,
                   "correo": "rafael.save@endecorani.bo",
                   "codigo_externo": "rafael.save"
                 },
                 {
                   "id": "6c65027e-e0bb-5c84-a0cd-8efbd7cdd746",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4460084",
                   "complemento": null,
                   "nombres": "JULIO",
                   "primer_apellido": "ARNEZ",
                   "segundo_apellido": "AGREDA",
                   "fecha_nacimiento": "1978-06-21",
                   "telefono": null,
                   "correo": "julio.arnez@endecorani.bo",
                   "codigo_externo": "julio.arnez"
                 },
                 {
                   "id": "7c66ec46-8eb6-59e0-bd9d-4d6933596a94",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4421661",
                   "complemento": null,
                   "nombres": "CARLA",
                   "primer_apellido": "FLORES",
                   "segundo_apellido": "INGALA",
                   "fecha_nacimiento": "1975-04-01",
                   "telefono": null,
                   "correo": "carla.flores@endecorani.bo",
                   "codigo_externo": "carla.flores"
                 },
                 {
                   "id": "4fb93007-5ae0-57e7-a8d6-b407166dc49c",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6403807",
                   "complemento": null,
                   "nombres": "REMBERTO CESAR",
                   "primer_apellido": "COCA",
                   "segundo_apellido": "ROJAS",
                   "fecha_nacimiento": "1985-01-27",
                   "telefono": "71731348",
                   "correo": "cesar.coca@endecorani.bo",
                   "codigo_externo": "cesar.coca"
                 },
                 {
                   "id": "59d6e134-f004-5196-b633-d29f9d82669f",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5760108",
                   "complemento": null,
                   "nombres": "XELIER NATANIEL",
                   "primer_apellido": "TAPIA",
                   "segundo_apellido": "ANDIA",
                   "fecha_nacimiento": "1988-11-13",
                   "telefono": null,
                   "correo": "nataniel.tapia@endecorani.bo",
                   "codigo_externo": "nataniel.tapia"
                 },
                 {
                   "id": "d61eea73-4624-5288-a643-c2e9410f1f81",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5185280",
                   "complemento": null,
                   "nombres": "RAINER MAURICIO",
                   "primer_apellido": "OLIVARES",
                   "segundo_apellido": "HUAPALLA",
                   "fecha_nacimiento": "1982-12-27",
                   "telefono": null,
                   "correo": "mauricio.olivares@endecorani.bo",
                   "codigo_externo": "mauricio.olivares"
                 },
                 {
                   "id": "3045bb81-5b8d-57cb-87f1-75fbf3f0149a",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6532793",
                   "complemento": null,
                   "nombres": "KARLA BRISA",
                   "primer_apellido": "ROCHA",
                   "segundo_apellido": "DURAN",
                   "fecha_nacimiento": "1985-10-21",
                   "telefono": null,
                   "correo": "karla.rocha@endecorani.bo",
                   "codigo_externo": "karla.rocha"
                 },
                 {
                   "id": "6fab4359-194f-545b-994a-cfeed3f22424",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3132282",
                   "complemento": null,
                   "nombres": "WALDO IVAN",
                   "primer_apellido": "VARGAS",
                   "segundo_apellido": "REVOLLO",
                   "fecha_nacimiento": "1964-08-01",
                   "telefono": null,
                   "correo": "ivan.vargas@endecorani.bo",
                   "codigo_externo": "ivan.vargas"
                 },
                 {
                   "id": "086926eb-955c-527f-8080-ff90a10f81f3",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6503850",
                   "complemento": null,
                   "nombres": "DANY",
                   "primer_apellido": "ROJAS",
                   "segundo_apellido": "BECERRA",
                   "fecha_nacimiento": "1988-01-09",
                   "telefono": null,
                   "correo": "dany.rojas@endecorani.bo",
                   "codigo_externo": "dany.rojas"
                 },
                 {
                   "id": "1b88e1e0-8173-5d9c-8f23-7e4a683d3c7c",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "7890100",
                   "complemento": null,
                   "nombres": "MAISY",
                   "primer_apellido": "TORRICO",
                   "segundo_apellido": "FERNANDEZ",
                   "fecha_nacimiento": "1988-11-21",
                   "telefono": null,
                   "correo": "maisy.torrico@endecorani.bo",
                   "codigo_externo": "maisy.torrico"
                 },
                 {
                   "id": "78dd374c-08bb-55ca-b4da-73c826d1a585",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5298962",
                   "complemento": null,
                   "nombres": "AMILCAR",
                   "primer_apellido": "CORRALES",
                   "segundo_apellido": "IMACA",
                   "fecha_nacimiento": "1988-04-20",
                   "telefono": "72207182",
                   "correo": "amilcar.corrales@endecorani.bo",
                   "codigo_externo": "amilcar.corrales"
                 },
                 {
                   "id": "08a5eb93-d4a0-57ac-947d-5e71e28af7b2",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3605865",
                   "complemento": null,
                   "nombres": "JORGE MANUEL",
                   "primer_apellido": "LEONI",
                   "segundo_apellido": "MERCADO",
                   "fecha_nacimiento": "1969-02-01",
                   "telefono": null,
                   "correo": "manuel.leoni@endecorani.bo",
                   "codigo_externo": "manuel.leoni"
                 },
                 {
                   "id": "30e8f5ea-fcd3-50f7-a4b3-a0077ac0aed8",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "13590131",
                   "complemento": null,
                   "nombres": "ALBERT ALEXANDER",
                   "primer_apellido": "TUDELA",
                   "segundo_apellido": "CORRAL",
                   "fecha_nacimiento": "1977-05-03",
                   "telefono": null,
                   "correo": "albert.tudela@endecorani.bo",
                   "codigo_externo": "albert.tudela"
                 },
                 {
                   "id": "bad1a214-5592-5458-b06c-371e83af247a",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3589035",
                   "complemento": null,
                   "nombres": "CINTHIA JIMENA",
                   "primer_apellido": "AYALA",
                   "segundo_apellido": "BALDELOMAR",
                   "fecha_nacimiento": "1969-02-18",
                   "telefono": null,
                   "correo": "cinthia.ayala@endecorani.bo",
                   "codigo_externo": "cinthia.ayala"
                 },
                 {
                   "id": "8b61f212-0b48-5f33-9a92-53fb3f0afae0",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5178395",
                   "complemento": null,
                   "nombres": "OLIVER ARTURO",
                   "primer_apellido": "MEDINA",
                   "segundo_apellido": "GARCIA",
                   "fecha_nacimiento": "1980-04-26",
                   "telefono": null,
                   "correo": "oliver.medina@endecorani.bo",
                   "codigo_externo": "oliver.medina"
                 },
                 {
                   "id": "50fe80ef-2782-5a00-bfa1-8d4a92aad606",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6478863",
                   "complemento": null,
                   "nombres": "DAVID ENRIQUE",
                   "primer_apellido": "ALANIS",
                   "segundo_apellido": "ROJAS",
                   "fecha_nacimiento": "1987-12-29",
                   "telefono": null,
                   "correo": "david.alanis@endecorani.bo",
                   "codigo_externo": "david.alanis"
                 },
                 {
                   "id": "5997b360-7f3d-5a8a-9873-fc1ad9a8149c",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "8772280",
                   "complemento": null,
                   "nombres": "NATALY",
                   "primer_apellido": "BENAVIDEZ",
                   "segundo_apellido": "RAMALLO",
                   "fecha_nacimiento": "1990-11-27",
                   "telefono": null,
                   "correo": "nataly.benavidez@endecorani.bo",
                   "codigo_externo": "nataly.benavidez"
                 },
                 {
                   "id": "ef14bf48-1226-5dd6-97e2-ddde724f6014",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4046021",
                   "complemento": null,
                   "nombres": "ANDREINA VERONICA",
                   "primer_apellido": "CASTRO",
                   "segundo_apellido": "CORDERO",
                   "fecha_nacimiento": "1983-07-11",
                   "telefono": "68580937",
                   "correo": "andreina.castro@endecorani.bo",
                   "codigo_externo": "andreina.castro"
                 },
                 {
                   "id": "aca3e7eb-cf5d-5410-ba83-8d93a6f1d031",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5196189",
                   "complemento": null,
                   "nombres": "SERGIO IVAN",
                   "primer_apellido": "MORENO",
                   "segundo_apellido": "VALVERDE",
                   "fecha_nacimiento": "1987-01-13",
                   "telefono": null,
                   "correo": "sergio.moreno@endecorani.bo",
                   "codigo_externo": "sergio.moreno"
                 },
                 {
                   "id": "e876e94e-ac3d-53b3-8f18-e4526612c175",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "1018558",
                   "complemento": null,
                   "nombres": "HERNANDO",
                   "primer_apellido": "PALMA",
                   "segundo_apellido": "DURAN",
                   "fecha_nacimiento": "1944-07-26",
                   "telefono": null,
                   "correo": "hernando.palma@endecorani.bo",
                   "codigo_externo": "hernando.palma"
                 },
                 {
                   "id": "b9a76900-14d9-5f2c-a932-c718265d6c4b",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4332262",
                   "complemento": null,
                   "nombres": "WENDY VANESSA",
                   "primer_apellido": "NAVIA",
                   "segundo_apellido": "PAZ",
                   "fecha_nacimiento": "1980-02-05",
                   "telefono": "71790461",
                   "correo": "wendy.navia@endecorani.bo",
                   "codigo_externo": "wendy.navia"
                 },
                 {
                   "id": "c4bf4ab2-db49-5428-b7d4-cdcf1cd91fd2",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6523937",
                   "complemento": null,
                   "nombres": "JAVIER EDWIN",
                   "primer_apellido": "MARCANI",
                   "segundo_apellido": "YUCRA",
                   "fecha_nacimiento": "1987-11-01",
                   "telefono": null,
                   "correo": "javier.marcani@endecorani.bo",
                   "codigo_externo": "javier.marcani"
                 },
                 {
                   "id": "b0e00e34-42ac-5955-9beb-001e15f8cadc",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "801751",
                   "complemento": null,
                   "nombres": "JUAN EDMUNDO",
                   "primer_apellido": "MEJIA",
                   "segundo_apellido": "VILLARROEL",
                   "fecha_nacimiento": "1953-05-13",
                   "telefono": null,
                   "correo": "juan.mejia@endecorani.bo",
                   "codigo_externo": "juan.mejia"
                 },
                 {
                   "id": "ddbff004-85f0-5b94-8c6d-d84bc3f4af40",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5254988",
                   "complemento": null,
                   "nombres": "MARCELO",
                   "primer_apellido": "EQUILEA",
                   "segundo_apellido": "RIVERA",
                   "fecha_nacimiento": "1981-06-06",
                   "telefono": null,
                   "correo": "marcelo.equilea@endecorani.bo",
                   "codigo_externo": "marcelo.equilea"
                 },
                 {
                   "id": "e25a9578-a721-5b44-9fdc-4745d5aef405",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5254553",
                   "complemento": null,
                   "nombres": "ARIEL RODRIGO",
                   "primer_apellido": "VILLEGAS",
                   "segundo_apellido": "CASTRO",
                   "fecha_nacimiento": "1982-11-12",
                   "telefono": "71720933",
                   "correo": "ariel.villegas@endecorani.bo",
                   "codigo_externo": "ariel.villegas"
                 },
                 {
                   "id": "150ed9dd-d627-5b08-b376-06733038154a",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5157723",
                   "complemento": null,
                   "nombres": "RODRIGO",
                   "primer_apellido": "ALVARADO",
                   "segundo_apellido": "ALBORTA",
                   "fecha_nacimiento": "1987-06-02",
                   "telefono": null,
                   "correo": "rodrigo.alvarado@endecorani.bo",
                   "codigo_externo": "rodrigo.alvarado"
                 },
                 {
                   "id": "0ad83c57-cc79-5889-a596-4b4c8592c2a6",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4532708",
                   "complemento": null,
                   "nombres": "ROGER MARCELO",
                   "primer_apellido": "CAMACHO",
                   "segundo_apellido": "VEGA",
                   "fecha_nacimiento": "1979-03-18",
                   "telefono": null,
                   "correo": "roger.camacho@endecorani.bo",
                   "codigo_externo": "roger.camacho"
                 },
                 {
                   "id": "63e47ea7-1188-545a-8d8e-e1daa37b07b5",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "8690256",
                   "complemento": null,
                   "nombres": "PAOLA KAREN",
                   "primer_apellido": "BELTRAN",
                   "segundo_apellido": "MERCADO",
                   "fecha_nacimiento": "1990-07-15",
                   "telefono": null,
                   "correo": "paola.beltran@endecorani.bo",
                   "codigo_externo": "paola.beltran"
                 },
                 {
                   "id": "3b337ff2-8511-5924-91b2-3fa604e86da8",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5221300",
                   "complemento": null,
                   "nombres": "BORIS",
                   "primer_apellido": "MONTES DE OCA",
                   "segundo_apellido": "PRADO",
                   "fecha_nacimiento": "1984-05-16",
                   "telefono": null,
                   "correo": "boris.montesdeoca@endecorani.bo",
                   "codigo_externo": "boris.montesdeoca"
                 },
                 {
                   "id": "601ed26e-d01a-5cde-b4c4-5555e09562b3",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "1069529",
                   "complemento": null,
                   "nombres": "JESUS GONZALO",
                   "primer_apellido": "HUAYLLA",
                   "segundo_apellido": "ALIAGA",
                   "fecha_nacimiento": "1963-09-30",
                   "telefono": null,
                   "correo": "jesus.huaylla@endecorani.bo",
                   "codigo_externo": "gonzalo.huaylla"
                 },
                 {
                   "id": "526b4bcb-8fa1-577c-8660-d9f27ed069ae",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5936597",
                   "complemento": null,
                   "nombres": "LESLIE ANDREA",
                   "primer_apellido": "MALDONADO",
                   "segundo_apellido": "TORRICO",
                   "fecha_nacimiento": "1984-06-24",
                   "telefono": "72232318",
                   "correo": "leslie.maldonado@endecorani.bo",
                   "codigo_externo": "leslie.maldonado"
                 },
                 {
                   "id": "10bbe984-6e12-5b23-9526-a988e60c8f3b",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6443305",
                   "complemento": null,
                   "nombres": "MAYERLYN FLORITA",
                   "primer_apellido": "CARVAJAL",
                   "segundo_apellido": "CASTELLON",
                   "fecha_nacimiento": "1986-02-26",
                   "telefono": null,
                   "correo": "mayerlyn.carvajal@endecorani.bo",
                   "codigo_externo": "mayerlyn.carvajal"
                 },
                 {
                   "id": "eb715158-bfcf-5927-a9b3-5a09848b68db",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "7890758",
                   "complemento": null,
                   "nombres": "ANELICE",
                   "primer_apellido": "ANDIA",
                   "segundo_apellido": "REYNOLDS",
                   "fecha_nacimiento": "1987-10-19",
                   "telefono": null,
                   "correo": "anelice.reynolds@endecorani.bo",
                   "codigo_externo": "anelice.andia"
                 },
                 {
                   "id": "618c9e0d-6412-5662-bca3-f1742494d1ad",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "1004041",
                   "complemento": null,
                   "nombres": "ROBERTO",
                   "primer_apellido": "LLOBET",
                   "segundo_apellido": "TAVOLARA",
                   "fecha_nacimiento": "1941-01-28",
                   "telefono": null,
                   "correo": "roberto.llobet@endecorani.bo",
                   "codigo_externo": "roberto.llobet"
                 },
                 {
                   "id": "a593b789-4c6b-521a-96b9-9c31639e8efa",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "1047773",
                   "complemento": null,
                   "nombres": "IVAN FRANCISCO",
                   "primer_apellido": "MATULIC",
                   "segundo_apellido": "BEZMALINOVIC",
                   "fecha_nacimiento": "1964-11-24",
                   "telefono": null,
                   "correo": "ivan.matulic@endecorani.bo",
                   "codigo_externo": "ivan.matulic"
                 },
                 {
                   "id": "e41e9987-801e-5421-a823-84460b7dec4a",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5160265",
                   "complemento": null,
                   "nombres": "GUSTAVO JOSE",
                   "primer_apellido": "ARDAYA",
                   "segundo_apellido": "VEIZAGA",
                   "fecha_nacimiento": "1979-12-29",
                   "telefono": "71725832",
                   "correo": "gustavo.ardaya@endecorani.bo",
                   "codigo_externo": "gustavo.ardaya"
                 },
                 {
                   "id": "64736679-5117-5092-a4e6-152ef68567dd",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "2759818",
                   "complemento": null,
                   "nombres": "DELIA",
                   "primer_apellido": "GARCIA",
                   "segundo_apellido": "HIGUERAS",
                   "fecha_nacimiento": "1960-07-21",
                   "telefono": null,
                   "correo": "delia.garcia@endecorani.bo",
                   "codigo_externo": "delia.garcia"
                 },
                 {
                   "id": "009a1891-e849-52d4-a0c8-d18dcbf13266",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "2878621",
                   "complemento": null,
                   "nombres": "AUGUSTO ISMAEL",
                   "primer_apellido": "PRUDENCIO",
                   "segundo_apellido": "VACAFLOR",
                   "fecha_nacimiento": "1961-07-02",
                   "telefono": "71440452",
                   "correo": "augusto.prudencio@endecorani.bo",
                   "codigo_externo": "augusto.prudencio"
                 },
                 {
                   "id": "bbe06073-6078-53f3-b474-a376e2c5159a",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "2632315",
                   "complemento": null,
                   "nombres": "MARIA TERESA",
                   "primer_apellido": "ALFARO",
                   "segundo_apellido": "LOAYZA",
                   "fecha_nacimiento": "1965-08-18",
                   "telefono": null,
                   "correo": "teresa.alfaro@endecorani.bo",
                   "codigo_externo": "teresa.alfaro"
                 },
                 {
                   "id": "df5eb0f2-f756-5129-8656-fdef89916411",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6542547",
                   "complemento": null,
                   "nombres": "TELMA GABRIELA",
                   "primer_apellido": "PEÑARRIETA",
                   "segundo_apellido": "OLMOS",
                   "fecha_nacimiento": "1991-03-20",
                   "telefono": "71725322",
                   "correo": "gabriela.penarrieta@endecorani.bo",
                   "codigo_externo": "gabriela.penarrieta"
                 },
                 {
                   "id": "66869c52-0367-54f1-be4f-6abacdbfbe37",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4476189",
                   "complemento": null,
                   "nombres": "SILVANO",
                   "primer_apellido": "LLANOS",
                   "segundo_apellido": "LEON",
                   "fecha_nacimiento": "1970-02-19",
                   "telefono": "67404018",
                   "correo": "silvano.llanos@endecorani.bo",
                   "codigo_externo": "silvano.llanos"
                 },
                 {
                   "id": "8a0244c6-fcb1-51bd-9af3-b344230ff065",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5284139",
                   "complemento": null,
                   "nombres": "EDSON",
                   "primer_apellido": "COCA",
                   "segundo_apellido": "HERRERA",
                   "fecha_nacimiento": "1982-09-27",
                   "telefono": "67404019",
                   "correo": "edson.coca@endecorani.bo",
                   "codigo_externo": "edson.coca"
                 },
                 {
                   "id": "fed4f6b9-dba2-5257-9538-cb9f511c457c",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "8693436",
                   "complemento": null,
                   "nombres": "ISABEL ANTONELLA",
                   "primer_apellido": "FERNANDEZ",
                   "segundo_apellido": "SOLIZ",
                   "fecha_nacimiento": "1988-06-07",
                   "telefono": null,
                   "correo": "antonella.fernandez@endecorani.bo",
                   "codigo_externo": "antonella.fernandez"
                 },
                 {
                   "id": "4de99836-6bdb-54e1-9636-a3bc204518f3",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5234988",
                   "complemento": null,
                   "nombres": "OLIVER",
                   "primer_apellido": "SOLIZ",
                   "segundo_apellido": "TORRICO",
                   "fecha_nacimiento": "1983-12-10",
                   "telefono": "72232652",
                   "correo": "oliver.soliz@endecorani.bo",
                   "codigo_externo": "oliver.soliz"
                 },
                 {
                   "id": "7c120b2a-271d-5a1c-ad10-9d51339b12b1",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5935110",
                   "complemento": null,
                   "nombres": "EFRAIN MANACES",
                   "primer_apellido": "CHAMBI",
                   "segundo_apellido": "SANDOVAL",
                   "fecha_nacimiento": "1984-03-18",
                   "telefono": null,
                   "correo": "efrain.chambi@endecorani.bo",
                   "codigo_externo": "efrain.chambi"
                 },
                 {
                   "id": "db59fde2-29e1-5ca1-a5f3-1289e3dd3130",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3992799",
                   "complemento": null,
                   "nombres": "JORGE VIDAL",
                   "primer_apellido": "VILLCA",
                   "segundo_apellido": "VILLCHEZ",
                   "fecha_nacimiento": "1977-08-31",
                   "telefono": "72221202",
                   "correo": "jorge.villca@endecorani.bo",
                   "codigo_externo": "jorge.villca"
                 },
                 {
                   "id": "5357c8ca-8d60-53a4-a06f-8b475c579e4c",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6440578",
                   "complemento": null,
                   "nombres": "CAROL JHOANA",
                   "primer_apellido": "AGUILAR",
                   "segundo_apellido": "AGUILAR",
                   "fecha_nacimiento": "1985-05-13",
                   "telefono": "72228397",
                   "correo": "carol.aguilar@endecorani.bo",
                   "codigo_externo": "carol.aquilar"
                 },
                 {
                   "id": "d211a223-1069-50bc-9604-2918bc032a9e",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6431024",
                   "complemento": null,
                   "nombres": "LITZI",
                   "primer_apellido": "GUTIERREZ",
                   "segundo_apellido": "ACHA",
                   "fecha_nacimiento": "1985-04-15",
                   "telefono": "71724493",
                   "correo": "litzi.gutierrez@endecorani.bo",
                   "codigo_externo": "litzi.gutierrez"
                 },
                 {
                   "id": "81ed7a15-b40d-5607-9dfd-d11ae36d5250",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4508523",
                   "complemento": null,
                   "nombres": "ARTURO ELIOT",
                   "primer_apellido": "ADRIAZOLA",
                   "segundo_apellido": "GALLARDO",
                   "fecha_nacimiento": "1978-06-30",
                   "telefono": null,
                   "correo": "arturo.adriozola@endecorani.bo",
                   "codigo_externo": "arturo.ariozola"
                 },
                 {
                   "id": "b6e5d4ea-9c28-56b7-9278-869d0371b6c8",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "8018326",
                   "complemento": null,
                   "nombres": "KARINA",
                   "primer_apellido": "PEREIRA",
                   "segundo_apellido": "SARAVIA",
                   "fecha_nacimiento": "1990-10-12",
                   "telefono": null,
                   "correo": "karina.pereira@endecorani.bo",
                   "codigo_externo": "karina.pereira"
                 },
                 {
                   "id": "ad6be814-0f75-562a-982d-ce85ee2982be",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "7887913",
                   "complemento": null,
                   "nombres": "JOB ALEXIS",
                   "primer_apellido": "CANELAS",
                   "segundo_apellido": "BLAS",
                   "fecha_nacimiento": "1988-06-17",
                   "telefono": "67403117",
                   "correo": "alexis.canelas@endecorani.bo",
                   "codigo_externo": "alexis.canelas"
                 },
                 {
                   "id": "09e9d8d8-01ea-59ba-86ab-b23f0d668c34",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6518680",
                   "complemento": null,
                   "nombres": "MARCELO",
                   "primer_apellido": " - ",
                   "segundo_apellido": "ROCHA",
                   "fecha_nacimiento": "1987-10-29",
                   "telefono": null,
                   "correo": "marcelo.rocha@endecorani.bo",
                   "codigo_externo": "marcelo.rocha"
                 },
                 {
                   "id": "3faed279-dec0-53d8-8cdf-0a0fa1ab0a25",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "7310944",
                   "complemento": null,
                   "nombres": "MARCO ANTONIO",
                   "primer_apellido": "GODOY",
                   "segundo_apellido": "MIRANDA",
                   "fecha_nacimiento": "1994-02-22",
                   "telefono": null,
                   "correo": "marco.godoy@endecorani.bo",
                   "codigo_externo": "marco.godoy"
                 },
                 {
                   "id": "8b2dffe5-9202-5aef-8142-f16f56af4912",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6442711",
                   "complemento": null,
                   "nombres": "JHONNY",
                   "primer_apellido": "SOLIZ",
                   "segundo_apellido": "CHOQUE",
                   "fecha_nacimiento": "1986-05-08",
                   "telefono": null,
                   "correo": "jhonny.soliz@endecorani.bo",
                   "codigo_externo": "jhonny.soliz"
                 },
                 {
                   "id": "ee81e577-3c04-5cee-8c26-39229491029f",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "8002117",
                   "complemento": null,
                   "nombres": "MILTON",
                   "primer_apellido": "COLQUE",
                   "segundo_apellido": "SEJAS",
                   "fecha_nacimiento": "1991-07-03",
                   "telefono": null,
                   "correo": "milton.colque@endecorani.bo",
                   "codigo_externo": "milton.colque"
                 },
                 {
                   "id": "2d65620f-5532-5b72-b619-5c81de98f412",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5301600",
                   "complemento": null,
                   "nombres": "OMAR",
                   "primer_apellido": "VILLARROEL",
                   "segundo_apellido": "SCHNEIDER",
                   "fecha_nacimiento": "1984-06-27",
                   "telefono": "72202416",
                   "correo": "omar.villarroel@endecorani.bo",
                   "codigo_externo": "omar.villarroel"
                 },
                 {
                   "id": "5b12dc59-fe5e-51a9-ae27-f6f128ad3bbc",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3772562",
                   "complemento": null,
                   "nombres": "OSCAR",
                   "primer_apellido": "HERRERA",
                   "segundo_apellido": "GUZMAN",
                   "fecha_nacimiento": "1981-05-25",
                   "telefono": null,
                   "correo": "oscar.herrera@endecorani.bo",
                   "codigo_externo": "oscar.herrera"
                 },
                 {
                   "id": "201dacf2-40d6-5cf4-a040-5e74d77a6fa4",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5203653",
                   "complemento": null,
                   "nombres": "RAMIRO",
                   "primer_apellido": "CONDORI",
                   "segundo_apellido": "MONTAÑO",
                   "fecha_nacimiento": "1988-04-12",
                   "telefono": null,
                   "correo": "ramiro.condori@endecorani.bo",
                   "codigo_externo": "ramiro.condori"
                 },
                 {
                   "id": "22f943d3-4fd4-5140-8ef0-d430d46f1742",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "8817123",
                   "complemento": null,
                   "nombres": "RUBEN",
                   "primer_apellido": "ZENTENO",
                   "segundo_apellido": "MEDRANO",
                   "fecha_nacimiento": "1993-01-02",
                   "telefono": null,
                   "correo": "ruben.zenteno@endecorani.bo",
                   "codigo_externo": "ruben.zenteno"
                 },
                 {
                   "id": "37b788cc-0f87-54c4-b0cf-5670a2388d01",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "7903088",
                   "complemento": null,
                   "nombres": "WILFREDO",
                   "primer_apellido": "PINAYA",
                   "segundo_apellido": "MAITA",
                   "fecha_nacimiento": "1991-05-27",
                   "telefono": null,
                   "correo": "wilfredo.pinaya@endecorani.bo",
                   "codigo_externo": "wilfredo.pinaya"
                 },
                 {
                   "id": "f5dc307b-39ce-5a39-b148-7f0df6c732e4",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "8826651",
                   "complemento": null,
                   "nombres": "WILLIAM WILFREDO",
                   "primer_apellido": "GOITIA",
                   "segundo_apellido": "CABRERA",
                   "fecha_nacimiento": "1994-08-15",
                   "telefono": null,
                   "correo": "william.goitia@endecorani.bo",
                   "codigo_externo": "william.goitia"
                 },
                 {
                   "id": "12af9b2c-e56c-5255-a1f5-9737e91670fe",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4013122",
                   "complemento": null,
                   "nombres": "JUAN GABRIEL",
                   "primer_apellido": "CHAVEZ",
                   "segundo_apellido": "NAVARRO",
                   "fecha_nacimiento": "1987-06-26",
                   "telefono": null,
                   "correo": "gabriel.chavez@endecorani.bo",
                   "codigo_externo": "gabriel.chavez"
                 },
                 {
                   "id": "7f1a29b9-b5c3-54be-a60c-9123743c4235",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4003900",
                   "complemento": null,
                   "nombres": "ANA MARIA",
                   "primer_apellido": "VILLEGAS",
                   "segundo_apellido": "QUISPE",
                   "fecha_nacimiento": "1978-09-25",
                   "telefono": "71732681",
                   "correo": "ana.villegas@endecorani.bo",
                   "codigo_externo": "ana.villegas"
                 },
                 {
                   "id": "815cd764-b7af-502e-8571-c8ff14ed2e58",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6489513",
                   "complemento": null,
                   "nombres": "ANTONIO EDUARDO",
                   "primer_apellido": "PATZI",
                   "segundo_apellido": "ROJAS",
                   "fecha_nacimiento": "1987-06-04",
                   "telefono": null,
                   "correo": "antonio.patzi@endecorani.bo",
                   "codigo_externo": "antonio.patzi"
                 },
                 {
                   "id": "d3b7557c-2b96-5eb7-b240-5ff3d61537e5",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "8674780",
                   "complemento": null,
                   "nombres": "MAGNIBENS EDUARDO",
                   "primer_apellido": "VILLA",
                   "segundo_apellido": "MEDINA",
                   "fecha_nacimiento": "1992-09-19",
                   "telefono": null,
                   "correo": "eduardo.villa@endecorani.bo",
                   "codigo_externo": "eduardo.villa"
                 },
                 {
                   "id": "46a1d1f4-7f08-5857-9686-1ad618cf3ce9",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3041868",
                   "complemento": null,
                   "nombres": "JOSSPHEP WILLSON",
                   "primer_apellido": "VARGAS",
                   "segundo_apellido": "GOMEZ",
                   "fecha_nacimiento": "1966-08-27",
                   "telefono": null,
                   "correo": "jossphep.vargas@endecorani.bo",
                   "codigo_externo": "jossphep.vargas"
                 },
                 {
                   "id": "8acc2d12-7d87-5eac-9b12-45be6009efec",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3124516",
                   "complemento": null,
                   "nombres": "DAVID JHON",
                   "primer_apellido": "ROCHA",
                   "segundo_apellido": "ECHEVERRIA",
                   "fecha_nacimiento": "1971-12-20",
                   "telefono": null,
                   "correo": "david.rocha@endecorani.bo",
                   "codigo_externo": "david.rocha"
                 },
                 {
                   "id": "96e1d528-7885-59b7-b9b1-7c08826384a2",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6559243",
                   "complemento": null,
                   "nombres": "AURORA MIRIAM",
                   "primer_apellido": "TERCEROS",
                   "segundo_apellido": "TAPIA",
                   "fecha_nacimiento": "1977-09-04",
                   "telefono": null,
                   "correo": "aurora.terceros@endecorani.bo",
                   "codigo_externo": "aurora.terceros"
                 },
                 {
                   "id": "b8d58599-d597-52d7-93e3-f80b0fbfa45e",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3391253",
                   "complemento": null,
                   "nombres": "GABRIELA DEL PILAR",
                   "primer_apellido": "VELARDE",
                   "segundo_apellido": "VELASQUEZ",
                   "fecha_nacimiento": "1974-01-06",
                   "telefono": null,
                   "correo": "gabriela.velarde@endecorani.bo",
                   "codigo_externo": "gabriela.velarde"
                 },
                 {
                   "id": "441c5e99-7465-5b02-a63d-43e592e36ea9",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "977722",
                   "complemento": null,
                   "nombres": "DESIDERIO",
                   "primer_apellido": "HERRERA",
                   "segundo_apellido": "ESPADA",
                   "fecha_nacimiento": "1949-02-11",
                   "telefono": null,
                   "correo": "desiderio.herrera@endecorani.bo",
                   "codigo_externo": "desiderio.herrera"
                 },
                 {
                   "id": "2a4875dd-c8e2-5d38-a8ae-65b310adc3c0",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3795187",
                   "complemento": null,
                   "nombres": "EDWIN ABAD",
                   "primer_apellido": "SILES",
                   "segundo_apellido": "MONTAÑO",
                   "fecha_nacimiento": "1972-08-21",
                   "telefono": null,
                   "correo": "edwin.siles@endecorani.bo",
                   "codigo_externo": "edwin.siles"
                 },
                 {
                   "id": "0029a12a-86ae-5466-bbff-f6361a2150d3",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5187101",
                   "complemento": null,
                   "nombres": "BRISA FERNANDA",
                   "primer_apellido": "ROMAN",
                   "segundo_apellido": "ACHA",
                   "fecha_nacimiento": "1989-08-21",
                   "telefono": "71731610",
                   "correo": "brisa.roman@endecorani.bo",
                   "codigo_externo": "brisa.roman"
                 },
                 {
                   "id": "140487f0-64a7-54b7-b248-9b4d46318cd6",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "7928410",
                   "complemento": null,
                   "nombres": "ADRIANA",
                   "primer_apellido": "VILLARROEL",
                   "segundo_apellido": "RIVERA",
                   "fecha_nacimiento": "1994-11-02",
                   "telefono": null,
                   "correo": "adriana.villarroel@endecorani.bo",
                   "codigo_externo": "adriana.villarroel"
                 },
                 {
                   "id": "fc2a4395-5fd2-5353-81bf-05424a4bd224",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4394832",
                   "complemento": null,
                   "nombres": "MARCO ANTONIO",
                   "primer_apellido": "FLORES",
                   "segundo_apellido": "SOLIZ",
                   "fecha_nacimiento": "1978-09-29",
                   "telefono": "71725821",
                   "correo": "marco.flores@endecorani.bo",
                   "codigo_externo": "marco.flores"
                 },
                 {
                   "id": "61d7da2a-004d-52d0-9d41-b8626eab1daf",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6087510",
                   "complemento": null,
                   "nombres": "EDGAR RICHARD",
                   "primer_apellido": "QUISPE",
                   "segundo_apellido": "LLANQUECHOQUE",
                   "fecha_nacimiento": "1981-12-24",
                   "telefono": null,
                   "correo": "edgar.quispe@endecorani.bo",
                   "codigo_externo": "edgar.quispe"
                 },
                 {
                   "id": "f746a385-fb3b-50e9-b372-54e64db6d7c8",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6780311",
                   "complemento": null,
                   "nombres": "ALVARO",
                   "primer_apellido": "NICOLAS",
                   "segundo_apellido": "AGUDO",
                   "fecha_nacimiento": "1988-06-22",
                   "telefono": null,
                   "correo": "alvaro.nicolas@endecorani.bo",
                   "codigo_externo": "alvaro.nicolas"
                 },
                 {
                   "id": "42eee50a-98c6-56b8-a5e8-109daa44bd16",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3028430",
                   "complemento": null,
                   "nombres": "ELIZABETH",
                   "primer_apellido": "CASTELLON",
                   "segundo_apellido": "CLAURE",
                   "fecha_nacimiento": "1968-04-17",
                   "telefono": null,
                   "correo": "elizabeth.castellon@endecorani.bo",
                   "codigo_externo": "elizabeth.castellon"
                 },
                 {
                   "id": "7882da5e-c7a7-54eb-a7f6-0ee047e78319",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5939842",
                   "complemento": null,
                   "nombres": "LIMBER PABLO",
                   "primer_apellido": "PEREIRA",
                   "segundo_apellido": "ESCALERA",
                   "fecha_nacimiento": "1990-04-22",
                   "telefono": null,
                   "correo": "limber.pereira@endecorani.bo",
                   "codigo_externo": "limber.pereira"
                 },
                 {
                   "id": "a34ca94f-f862-54f9-a88c-f3fd68e006eb",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5273542",
                   "complemento": null,
                   "nombres": "DANIEL SANTIAGO",
                   "primer_apellido": "PETTENKOFER",
                   "segundo_apellido": "AREVALO",
                   "fecha_nacimiento": "1990-05-08",
                   "telefono": null,
                   "correo": "daniel.pettenkofer@endecorani.bo",
                   "codigo_externo": "daniel.pettenkofer"
                 },
                 {
                   "id": "f69efda4-e95c-5c0f-9b39-370164410bde",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5939685",
                   "complemento": null,
                   "nombres": "MAURICIO",
                   "primer_apellido": "ORTUÑO",
                   "segundo_apellido": "ARCE",
                   "fecha_nacimiento": "1991-02-18",
                   "telefono": "71728190",
                   "correo": "mauricio.ortuno@endecorani.bo",
                   "codigo_externo": "mauricio.ortuno"
                 },
                 {
                   "id": "6bcb1311-2f5b-58e4-88b5-291af50aa3b7",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6460477",
                   "complemento": null,
                   "nombres": "SAUL MAURICIO",
                   "primer_apellido": "LIJERON",
                   "segundo_apellido": "GARCIA",
                   "fecha_nacimiento": "1990-03-16",
                   "telefono": "71734320",
                   "correo": "saul.lijeron@endecorani.bo",
                   "codigo_externo": "saul.lijeron"
                 },
                 {
                   "id": "a654fda8-3cbf-5f4d-8ef7-96a6afc73fa5",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "13589311",
                   "complemento": null,
                   "nombres": "LUIS ALBERTO",
                   "primer_apellido": "ORELLANA",
                   "segundo_apellido": null,
                   "fecha_nacimiento": "1989-05-12",
                   "telefono": null,
                   "correo": "luis.orellana@endecorani.bo",
                   "codigo_externo": "luis.orellana"
                 },
                 {
                   "id": "30b520b2-ad30-53fb-b388-85c923de933c",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5076258",
                   "complemento": null,
                   "nombres": "ANGEL DIMAR",
                   "primer_apellido": "ECOS",
                   "segundo_apellido": "HUANACO",
                   "fecha_nacimiento": "1983-03-16",
                   "telefono": "67405749",
                   "correo": "angel.ecos@endecorani.bo",
                   "codigo_externo": "angel.ecos"
                 },
                 {
                   "id": "8338a739-c28f-57e1-93db-d8207634c7d1",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5151416",
                   "complemento": null,
                   "nombres": "WALTER",
                   "primer_apellido": "ROCABADO",
                   "segundo_apellido": "GARCIA",
                   "fecha_nacimiento": "1980-05-10",
                   "telefono": null,
                   "correo": "walter.rocabado@endecorani.bo",
                   "codigo_externo": "walter.rocabado"
                 },
                 {
                   "id": "a125c4a7-d43b-5ee1-ae51-9dfec269e04b",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3614015",
                   "complemento": null,
                   "nombres": "ALFREDO",
                   "primer_apellido": "DEL CARPIO",
                   "segundo_apellido": "BUSTAMANTE",
                   "fecha_nacimiento": "1972-11-27",
                   "telefono": null,
                   "correo": "alfredo.delcarpio@endecorani.bo",
                   "codigo_externo": "alfredo.delcarpio"
                 },
                 {
                   "id": "e0dcf2e2-ddc0-52b8-a1b9-795130e95c6b",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4539889",
                   "complemento": null,
                   "nombres": "MARY LUZ",
                   "primer_apellido": "JALDIN",
                   "segundo_apellido": "RODRIGUEZ",
                   "fecha_nacimiento": "1979-06-05",
                   "telefono": "72227729",
                   "correo": "mary.jaldin@endecorani.bo",
                   "codigo_externo": "mary.jaldin"
                 },
                 {
                   "id": "3269c709-9eb1-57d5-9e8d-977ed1c4b90c",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5525386",
                   "complemento": null,
                   "nombres": "PAMELA CRISTINA",
                   "primer_apellido": "ANTEZANA",
                   "segundo_apellido": "GOMEZ",
                   "fecha_nacimiento": "1983-01-09",
                   "telefono": null,
                   "correo": "pamela.antezana@endecorani.bo",
                   "codigo_externo": "pamela.antezana"
                 },
                 {
                   "id": "fdfc7d75-b0cf-5bf2-807d-808ad788e75a",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5193366",
                   "complemento": null,
                   "nombres": "MARCO ANTONIO",
                   "primer_apellido": "AMURRIO",
                   "segundo_apellido": "ESPINOZA",
                   "fecha_nacimiento": "1978-12-01",
                   "telefono": null,
                   "correo": "marco.amurrio@endecorani.bo",
                   "codigo_externo": "marco.amurrio"
                 },
                 {
                   "id": "7d09517c-958f-5beb-a033-222942636ef8",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6528303",
                   "complemento": null,
                   "nombres": "JOSÉ DAVID",
                   "primer_apellido": "PÉREZ",
                   "segundo_apellido": "TORRICO",
                   "fecha_nacimiento": "1989-08-26",
                   "telefono": null,
                   "correo": "jose.perez@endecorani.bo",
                   "codigo_externo": "jose.perez"
                 },
                 {
                   "id": "87303de9-f439-52e8-9b58-8d364d7b84e5",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3764763",
                   "complemento": null,
                   "nombres": "RAMIRO",
                   "primer_apellido": "AYZACAYO",
                   "segundo_apellido": "MAMANI",
                   "fecha_nacimiento": "1970-03-15",
                   "telefono": null,
                   "correo": "ramiro.ayzacayo@endecorani.bo",
                   "codigo_externo": "ramiro.ayzacayo"
                 },
                 {
                   "id": "aa4790eb-6ff3-561c-9619-e2c2d4848d3e",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4470102",
                   "complemento": null,
                   "nombres": "JOAQUIN GARY",
                   "primer_apellido": "AGUILAR",
                   "segundo_apellido": "CUSICANQUI",
                   "fecha_nacimiento": "1977-03-07",
                   "telefono": "72238412",
                   "correo": "gary.aguilar@endecorani.bo",
                   "codigo_externo": "gary.aguilar"
                 },
                 {
                   "id": "a649af5c-7893-502b-b3cf-5bf20ac8e70d",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "1334861",
                   "complemento": null,
                   "nombres": "VICTOR",
                   "primer_apellido": "ALVIS",
                   "segundo_apellido": "FLORES",
                   "fecha_nacimiento": "1960-06-07",
                   "telefono": null,
                   "correo": "victor.alvis@endecorani",
                   "codigo_externo": "victor.alvis"
                 },
                 {
                   "id": "1c28ea94-56af-554d-b674-157a601862a1",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "2866068",
                   "complemento": null,
                   "nombres": "RODOLFO ALEJANDRO",
                   "primer_apellido": "VIRREIRA",
                   "segundo_apellido": "TARDIO",
                   "fecha_nacimiento": "1961-08-07",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "rodolfo.virreira"
                 },
                 {
                   "id": "0d0ad089-e179-5d55-b57b-93f71e2a34fb",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "2615008",
                   "complemento": null,
                   "nombres": "MARIA ALEJANDRA",
                   "primer_apellido": "VALDIVIA",
                   "segundo_apellido": "LAPEYRIERE",
                   "fecha_nacimiento": "1976-11-28",
                   "telefono": null,
                   "correo": "alejandra.valdivia@endecorani.bo",
                   "codigo_externo": "alejandra.valdivia"
                 },
                 {
                   "id": "cbc934bd-2f2f-5ad3-89ae-6cf4331b48c0",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "1920776",
                   "complemento": null,
                   "nombres": "ENRIQUE",
                   "primer_apellido": "BRUCKNER",
                   "segundo_apellido": "PARADA",
                   "fecha_nacimiento": "1974-09-27",
                   "telefono": null,
                   "correo": "enrique.bruckner@endecorani.bo",
                   "codigo_externo": "enrique.bruckner"
                 },
                 {
                   "id": "200eb9bd-eda5-58c0-9ba9-a06726756f46",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3565035",
                   "complemento": null,
                   "nombres": "MARCELO ROLANDO",
                   "primer_apellido": "ARZE",
                   "segundo_apellido": "BASS WERNER",
                   "fecha_nacimiento": "1979-03-04",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "marcelo.arze"
                 },
                 {
                   "id": "2ef90b8e-6ec6-59d3-9509-f5676e7cbac0",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4631628",
                   "complemento": null,
                   "nombres": "JUAN CARLOS",
                   "primer_apellido": "TITO",
                   "segundo_apellido": "OPORTO",
                   "fecha_nacimiento": "1971-02-27",
                   "telefono": null,
                   "correo": "juan.tito@endecorani.bo",
                   "codigo_externo": "juan.tito"
                 },
                 {
                   "id": "718fea85-77d0-5acc-a7a2-540b1aa802ed",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6503175",
                   "complemento": null,
                   "nombres": "JORGE",
                   "primer_apellido": "VALENCIA",
                   "segundo_apellido": "MOYA",
                   "fecha_nacimiento": "1984-11-01",
                   "telefono": null,
                   "correo": "jorge.valencia@endecorani.bo",
                   "codigo_externo": "jorge.valencia"
                 },
                 {
                   "id": "31d32815-91dd-593f-90d9-1b22c424e05b",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "8015466",
                   "complemento": null,
                   "nombres": "KEVIN CARLOS",
                   "primer_apellido": "DURAN",
                   "segundo_apellido": "DELGADILLO",
                   "fecha_nacimiento": "1991-05-26",
                   "telefono": null,
                   "correo": "kevin.duran@endecorani.bo",
                   "codigo_externo": "kevin.duran"
                 },
                 {
                   "id": "8c43bb0e-f351-5a62-9356-cea49a028d1d",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "8729896",
                   "complemento": null,
                   "nombres": "MOISES SAMUEL",
                   "primer_apellido": "MERINO",
                   "segundo_apellido": "ROCHA",
                   "fecha_nacimiento": "1999-03-15",
                   "telefono": null,
                   "correo": "moises.merino@endecorani.bo",
                   "codigo_externo": "moises.merino"
                 },
                 {
                   "id": "ac3f6a85-c1e4-5ef4-9893-947998b44d16",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3722679",
                   "complemento": null,
                   "nombres": "HOMERO",
                   "primer_apellido": "ANGULO",
                   "segundo_apellido": "VARGAS",
                   "fecha_nacimiento": "1987-12-16",
                   "telefono": null,
                   "correo": "homero.angulo@endecorani.bo",
                   "codigo_externo": "homero.angulo"
                 },
                 {
                   "id": "10de9944-5470-5ac8-9644-95d9d908fd55",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "8015227",
                   "complemento": null,
                   "nombres": "MARLENE",
                   "primer_apellido": "COTRINA",
                   "segundo_apellido": "TRUJILLO",
                   "fecha_nacimiento": "1989-08-21",
                   "telefono": null,
                   "correo": "marlene.cotrina@endecorani.bo",
                   "codigo_externo": "marlene.cotrina"
                 },
                 {
                   "id": "8898914a-79cd-5381-875b-efb8c7880e91",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "1234567",
                   "complemento": null,
                   "nombres": "DAVID ARIEL",
                   "primer_apellido": "PEREDO",
                   "segundo_apellido": "MIRANDA",
                   "fecha_nacimiento": "1979-01-01",
                   "telefono": null,
                   "correo": "david.peredo@endecorani.bo",
                   "codigo_externo": "david.peredo"
                 },
                 {
                   "id": "c68f3fd5-851a-532c-bf54-34b403d7bb95",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5277411",
                   "complemento": null,
                   "nombres": "ALEX EMILIO",
                   "primer_apellido": "OROZCO",
                   "segundo_apellido": "MENESES",
                   "fecha_nacimiento": "1979-01-01",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "alex.orozco"
                 },
                 {
                   "id": "234ccb9b-1862-53c0-80b3-6047bd6e5cad",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3733070",
                   "complemento": null,
                   "nombres": "CARLOS ELIODORO",
                   "primer_apellido": "MONTAN",
                   "segundo_apellido": "RODRIGUEZ",
                   "fecha_nacimiento": "1973-03-30",
                   "telefono": null,
                   "correo": "carlos.montan@endecorani.bo",
                   "codigo_externo": "carlos.montan"
                 },
                 {
                   "id": "3a1aec62-4101-5e53-ace4-e80be557c26e",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3790867",
                   "complemento": null,
                   "nombres": "MARIA VIVIAN",
                   "primer_apellido": "MARTINEZ",
                   "segundo_apellido": "CLAROS",
                   "fecha_nacimiento": "1974-04-28",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "maria.martinez"
                 },
                 {
                   "id": "980c6a8b-8b32-5fdc-afd4-157a8b54f757",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "7996677",
                   "complemento": null,
                   "nombres": "JINMY OMAR",
                   "primer_apellido": "ARNEZ",
                   "segundo_apellido": "SEJAS",
                   "fecha_nacimiento": "1991-03-19",
                   "telefono": null,
                   "correo": "jinmy.arnez@endecorani.bo",
                   "codigo_externo": "jinmy.arnez"
                 },
                 {
                   "id": "fec3e3ee-eaef-515f-a8e7-84617eb7df4c",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "SIN-DOC-FC2315",
                   "complemento": null,
                   "nombres": "JUAN CARLOS",
                   "primer_apellido": "VELIZ",
                   "segundo_apellido": "VALDIVIA",
                   "fecha_nacimiento": "1982-01-01",
                   "telefono": null,
                   "correo": "juan.veliz@endecorani.bo?",
                   "codigo_externo": "juan.veliz"
                 },
                 {
                   "id": "27b924f7-c3f4-5381-a502-7f9a4ec54805",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "SIN-DOC-FC2317",
                   "complemento": null,
                   "nombres": "SERGIO MAURO",
                   "primer_apellido": "ARCE",
                   "segundo_apellido": "PEDRAZAS",
                   "fecha_nacimiento": "1982-11-01",
                   "telefono": null,
                   "correo": "sergio.arce@endecorani.bo",
                   "codigo_externo": "sergio.arce"
                 },
                 {
                   "id": "a50ba660-968d-516d-bac6-15770b2e17f1",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "SIN-DOC-FC2318",
                   "complemento": null,
                   "nombres": "RAMIRO",
                   "primer_apellido": "MAMANI",
                   "segundo_apellido": "LOBO",
                   "fecha_nacimiento": "1982-11-01",
                   "telefono": null,
                   "correo": "ramiro.lobo@endecorani.bo",
                   "codigo_externo": "ramiro.lobo"
                 },
                 {
                   "id": "c414e096-f36d-5637-beb5-25b046af37d8",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "SIN-DOC-FC2319",
                   "complemento": null,
                   "nombres": "RICARDO",
                   "primer_apellido": "ZAMBRANA",
                   "segundo_apellido": "ARAMAYO",
                   "fecha_nacimiento": "1982-01-01",
                   "telefono": null,
                   "correo": "ricardo.aramayo@endecorani.bo",
                   "codigo_externo": "ricardo.aramayo"
                 },
                 {
                   "id": "a34c438a-47c2-575e-bf5f-490551234b25",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "7934096",
                   "complemento": null,
                   "nombres": "GABRIELA",
                   "primer_apellido": "COLQUE",
                   "segundo_apellido": "LAMAS",
                   "fecha_nacimiento": "1990-09-20",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "gabriela.colque"
                 },
                 {
                   "id": "ddb28903-f646-5027-8a54-890a18cb9348",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "E-006992",
                   "complemento": null,
                   "nombres": "EILANE",
                   "primer_apellido": "LOPEZ",
                   "segundo_apellido": "DA SILVA",
                   "fecha_nacimiento": "1982-09-14",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "eilane.lopez"
                 },
                 {
                   "id": "bb4b7bf8-377a-5a8b-997c-833f91bd82d5",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "SIN-DOC-FC2353",
                   "complemento": null,
                   "nombres": "ALVARO",
                   "primer_apellido": "HUBNER",
                   "segundo_apellido": "MENDEZ",
                   "fecha_nacimiento": "1950-06-10",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "julio.hubner"
                 },
                 {
                   "id": "0708b4a8-f4f1-51fb-bc84-7d6ac784b468",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "8670632",
                   "complemento": null,
                   "nombres": "BORIS CRISTHIAN",
                   "primer_apellido": "CONDORI",
                   "segundo_apellido": "TICONA",
                   "fecha_nacimiento": "1993-03-30",
                   "telefono": null,
                   "correo": "boris.condori@endecorani.bo",
                   "codigo_externo": "boris.condori"
                 },
                 {
                   "id": "10fd55ff-e250-5e7a-bf43-674923923607",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6466426",
                   "complemento": null,
                   "nombres": "LESLIE",
                   "primer_apellido": "MANCILLA",
                   "segundo_apellido": "AREVALO",
                   "fecha_nacimiento": "1994-09-28",
                   "telefono": null,
                   "correo": "leslie.mancilla@endecorani.bo",
                   "codigo_externo": "leslie.mancilla"
                 },
                 {
                   "id": "8e663167-0f50-573d-ab67-5ed3063c5415",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5781894",
                   "complemento": null,
                   "nombres": "RAMIRO",
                   "primer_apellido": "CHOQUE",
                   "segundo_apellido": "CHINO",
                   "fecha_nacimiento": "1983-03-17",
                   "telefono": null,
                   "correo": "ramiro.choque@endecorani.bo",
                   "codigo_externo": "ramiro.choque"
                 },
                 {
                   "id": "754f3118-61c7-54df-bf23-81432051cb42",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "7337399",
                   "complemento": null,
                   "nombres": "ROGER JHONNY",
                   "primer_apellido": "SILES",
                   "segundo_apellido": "ROJAS",
                   "fecha_nacimiento": "1991-12-27",
                   "telefono": null,
                   "correo": "roger.siles@endecorani.bo",
                   "codigo_externo": "roger.siles"
                 },
                 {
                   "id": "1c4d4b50-dc0d-5378-8370-157f8748962e",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6582038",
                   "complemento": null,
                   "nombres": "ROBERTO CARLOS",
                   "primer_apellido": "LOPEZ",
                   "segundo_apellido": "TAMES",
                   "fecha_nacimiento": "1987-05-14",
                   "telefono": null,
                   "correo": "carlos.lopez@endecorani.bo",
                   "codigo_externo": "carlos.lopez"
                 },
                 {
                   "id": "bb5ccbba-18c9-5c82-a847-a420d9dee2c8",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "7719544",
                   "complemento": null,
                   "nombres": "JORGE ALBERTO",
                   "primer_apellido": "HURTADO",
                   "segundo_apellido": "SOLIZ",
                   "fecha_nacimiento": "1995-06-10",
                   "telefono": null,
                   "correo": "jorge.hurtado@endecorani.bo",
                   "codigo_externo": "jorge.hurtado"
                 },
                 {
                   "id": "9332fd33-5856-5501-b10b-53f4f9e5816d",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6142920",
                   "complemento": null,
                   "nombres": "JORGE EMILIO",
                   "primer_apellido": "RUIZ",
                   "segundo_apellido": "ALEGRIA",
                   "fecha_nacimiento": "1987-06-11",
                   "telefono": null,
                   "correo": "jorge.ruiz@endecorani.bo",
                   "codigo_externo": "jorge.ruiz"
                 },
                 {
                   "id": "e83a3fbf-2250-55cc-8f64-4d0474f81f25",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4816105",
                   "complemento": null,
                   "nombres": "BRYAN ALVARO",
                   "primer_apellido": "PAEZ",
                   "segundo_apellido": "SILVA",
                   "fecha_nacimiento": "1983-11-06",
                   "telefono": "68027070",
                   "correo": "bryan.paez@endecorani.bo",
                   "codigo_externo": "bryan.paez"
                 },
                 {
                   "id": "bfe3f407-1cc9-556b-ad45-13346e0d798a",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4527465",
                   "complemento": null,
                   "nombres": "RONALD",
                   "primer_apellido": "GAMBOA",
                   "segundo_apellido": "AGUILAR",
                   "fecha_nacimiento": "1981-01-12",
                   "telefono": "68516377",
                   "correo": "ronald.gamboa@endecorani.bo",
                   "codigo_externo": "ronald.gamboa"
                 },
                 {
                   "id": "e1021d57-7696-5989-a651-c9a24fdeeff2",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5904585",
                   "complemento": null,
                   "nombres": "JORGE ANTONIO",
                   "primer_apellido": "ENCINAS",
                   "segundo_apellido": "AGUIRRE",
                   "fecha_nacimiento": "1984-04-30",
                   "telefono": "72242483",
                   "correo": "jorge.encinas@endecorani.bo",
                   "codigo_externo": "jorge.encinas"
                 },
                 {
                   "id": "429cff14-53b0-52dc-8edb-719a99266366",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "9519237",
                   "complemento": null,
                   "nombres": "ALEJANDRA BELEN",
                   "primer_apellido": "MARCA",
                   "segundo_apellido": "LLANOS",
                   "fecha_nacimiento": "1995-12-08",
                   "telefono": null,
                   "correo": "alejandra.marca@endecorani.bo",
                   "codigo_externo": "alejandra.marca"
                 },
                 {
                   "id": "2ea4a149-83db-54e7-9c30-0c8b40dc1cce",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6492700",
                   "complemento": null,
                   "nombres": "JHON ARIEL",
                   "primer_apellido": "VILLAFUERTE",
                   "segundo_apellido": "PARDO",
                   "fecha_nacimiento": "1994-03-12",
                   "telefono": null,
                   "correo": "jhon.villafuerte@endecorani.bo",
                   "codigo_externo": "jhon.villafuerte"
                 },
                 {
                   "id": "504cc0be-4e31-5c10-957f-c0fee2f68147",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "12752838",
                   "complemento": null,
                   "nombres": "DARYNKA ROXANA",
                   "primer_apellido": "BASTO",
                   "segundo_apellido": "GOMEZ",
                   "fecha_nacimiento": "1999-12-27",
                   "telefono": "68581460",
                   "correo": "darynka.basto@endecorani.bo",
                   "codigo_externo": "darynka.basto"
                 },
                 {
                   "id": "cbaad4a3-c589-5bfa-b50d-cafa11b56a03",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "8019106",
                   "complemento": null,
                   "nombres": "JUAN PABLO",
                   "primer_apellido": "GOMEZ",
                   "segundo_apellido": "ROJAS",
                   "fecha_nacimiento": "1990-04-28",
                   "telefono": null,
                   "correo": "juan.gomez@endecorani.bo",
                   "codigo_externo": "juan.gomez"
                 },
                 {
                   "id": "0fecda8a-4a34-5ac5-a569-e6a47e611b0f",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "8783485",
                   "complemento": null,
                   "nombres": "ALBA ANIER",
                   "primer_apellido": "MONTENEGRO",
                   "segundo_apellido": "ANGULO",
                   "fecha_nacimiento": "2000-12-22",
                   "telefono": "67404144",
                   "correo": "alba.montenegro@endecorani.bo",
                   "codigo_externo": "alba.montenegro"
                 },
                 {
                   "id": "3db79e81-04a9-542a-8bc4-8273e669e51d",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6408629",
                   "complemento": null,
                   "nombres": "ISIDORO",
                   "primer_apellido": "TORRICO",
                   "segundo_apellido": "MAMANI",
                   "fecha_nacimiento": "1983-05-15",
                   "telefono": null,
                   "correo": "isidoro.torrico@endecorani.bo",
                   "codigo_externo": "isidoro.torrico"
                 },
                 {
                   "id": "f1ae9f15-322d-5ab3-b4b4-121622c70f8b",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6783002",
                   "complemento": null,
                   "nombres": "WALKER",
                   "primer_apellido": "ORIHUELA",
                   "segundo_apellido": "GONZALES",
                   "fecha_nacimiento": "1985-09-18",
                   "telefono": "72242420",
                   "correo": "walker.orihuela@endecorani.bo",
                   "codigo_externo": "walker.orihuela"
                 },
                 {
                   "id": "8313f574-3606-538e-8aa1-7db728a64ceb",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "8821162",
                   "complemento": null,
                   "nombres": "CARLOS",
                   "primer_apellido": "LAFUENTE",
                   "segundo_apellido": "GRAGEDA",
                   "fecha_nacimiento": "1995-04-06",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "carlos.lafuente"
                 },
                 {
                   "id": "02950bb0-fbcb-5dd6-9dea-8670de3443a2",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5043096",
                   "complemento": null,
                   "nombres": "JHOANNY",
                   "primer_apellido": "JUSTINIANO",
                   "segundo_apellido": "LOPEZ",
                   "fecha_nacimiento": "1996-05-18",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "jhoanny.justiniano"
                 },
                 {
                   "id": "50758cfc-5c27-5cfd-99a0-934ac1ae266d",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "7310035",
                   "complemento": null,
                   "nombres": "ALEJANDRO CELSO",
                   "primer_apellido": "SORIA",
                   "segundo_apellido": "GUZMAN",
                   "fecha_nacimiento": "1994-07-25",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "alejandro.soria"
                 },
                 {
                   "id": "7922cb90-69b4-53ec-8cfc-4fdbd61f6cf5",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6412966",
                   "complemento": null,
                   "nombres": "JORGE",
                   "primer_apellido": "MENDEZ",
                   "segundo_apellido": "MARQUINA",
                   "fecha_nacimiento": "1985-07-31",
                   "telefono": "72207436",
                   "correo": "jorge.mendez@endecorani.bo",
                   "codigo_externo": "jorge.mendez"
                 },
                 {
                   "id": "5e98a821-7859-5468-aa9e-022892c51053",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4433413",
                   "complemento": null,
                   "nombres": "SERGIO MAURICIO",
                   "primer_apellido": "MONTAÑO",
                   "segundo_apellido": "DE LA FUENTE",
                   "fecha_nacimiento": "1980-06-09",
                   "telefono": null,
                   "correo": "sergio.montano@endecorani.bo",
                   "codigo_externo": "sergio.montano"
                 },
                 {
                   "id": "47e13a77-847a-55fb-a47e-4113f04237d7",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4452472",
                   "complemento": null,
                   "nombres": "ALFONSO MAURICIO",
                   "primer_apellido": "LOPEZ",
                   "segundo_apellido": "ZABALAGA",
                   "fecha_nacimiento": "1978-08-12",
                   "telefono": "71724745",
                   "correo": "mauricio.lopez@endecorani.bo",
                   "codigo_externo": "mlopez"
                 },
                 {
                   "id": "06b2ee4b-4cb4-57ed-ad16-93a0b33feaac",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "7964069",
                   "complemento": null,
                   "nombres": "JACKELINE XIMENA",
                   "primer_apellido": "LUIZAGA",
                   "segundo_apellido": "TAPIA",
                   "fecha_nacimiento": "1990-03-01",
                   "telefono": "68449859",
                   "correo": "jackeline.luizaga@endecorani.bo",
                   "codigo_externo": "jackeline.luizaga"
                 },
                 {
                   "id": "a963b2a3-223e-51fd-b653-be23d09a59ea",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4193375",
                   "complemento": null,
                   "nombres": "DELMIRA",
                   "primer_apellido": "APONTE",
                   "segundo_apellido": "MERCADO",
                   "fecha_nacimiento": "1980-10-23",
                   "telefono": "71729805",
                   "correo": "delmira.aponte@endecorani.bo",
                   "codigo_externo": "delmira.aponte"
                 },
                 {
                   "id": "ac13094b-46c5-5012-b315-9fa385b2fcd1",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5273615",
                   "complemento": null,
                   "nombres": "PAOLA ANDREA",
                   "primer_apellido": "RODRIGUEZ",
                   "segundo_apellido": "LINEO",
                   "fecha_nacimiento": "1982-04-28",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "paola.rodriguez"
                 },
                 {
                   "id": "4fbb6d0d-4978-5450-a631-64aaa81de8b1",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5010227",
                   "complemento": null,
                   "nombres": "MARIA FERNANDA",
                   "primer_apellido": "RODRIGUEZ",
                   "segundo_apellido": "SANCHEZ",
                   "fecha_nacimiento": "1996-07-18",
                   "telefono": "71742479",
                   "correo": "fernanda.rodriguez@endecorani.bo",
                   "codigo_externo": "fernanda.rodriguez"
                 },
                 {
                   "id": "81104872-9942-568d-805a-9c846d56244a",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4466050",
                   "complemento": null,
                   "nombres": "JACKELINE",
                   "primer_apellido": "GUZMAN",
                   "segundo_apellido": "CESPEDES",
                   "fecha_nacimiento": "1981-08-06",
                   "telefono": "71725182",
                   "correo": "jackeline.guzman@endecorani.bo",
                   "codigo_externo": "jackeline.guzman"
                 },
                 {
                   "id": "f75663bc-114c-5c31-81cd-eb315eeb42ca",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4452232",
                   "complemento": null,
                   "nombres": "CHRISTIAN",
                   "primer_apellido": "RICO",
                   "segundo_apellido": "IRIGOYEN",
                   "fecha_nacimiento": "1985-03-16",
                   "telefono": null,
                   "correo": "christian.rico@endecorani.bo",
                   "codigo_externo": "christian.rico"
                 },
                 {
                   "id": "14c3e8d0-899f-5b34-816c-545167b289e0",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5197332",
                   "complemento": null,
                   "nombres": "RIME",
                   "primer_apellido": "ROSALES",
                   "segundo_apellido": "REAL",
                   "fecha_nacimiento": "1981-10-29",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "rime.rosales"
                 },
                 {
                   "id": "ce135190-853e-5244-ba7f-96f977f830cf",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6676801",
                   "complemento": null,
                   "nombres": "NELSON",
                   "primer_apellido": "VARGAS",
                   "segundo_apellido": "CUELLAR",
                   "fecha_nacimiento": "1986-02-12",
                   "telefono": null,
                   "correo": "nelson.cuellar@endecorani.bo",
                   "codigo_externo": "nelson.vargas"
                 },
                 {
                   "id": "c5885544-67ba-5068-84ec-438172ae1eaa",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4148447",
                   "complemento": null,
                   "nombres": "MILTON",
                   "primer_apellido": "RODRIGUEZ",
                   "segundo_apellido": "MOGRO",
                   "fecha_nacimiento": "1976-12-29",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "milton.rodriguez"
                 },
                 {
                   "id": "857449bf-e377-5a7c-aa36-25bfe930fb6c",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "8835813",
                   "complemento": null,
                   "nombres": "DAVID RAFAEL",
                   "primer_apellido": "LEDEZMA",
                   "segundo_apellido": "OSINAGA",
                   "fecha_nacimiento": "2001-08-10",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "david.ledezma"
                 },
                 {
                   "id": "a9d4825a-dc85-5322-8d09-3bbf7a9a06fc",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3588563",
                   "complemento": null,
                   "nombres": "JULIO AUGUSTO",
                   "primer_apellido": "RODRIGUEZ",
                   "segundo_apellido": "HUMEREZ",
                   "fecha_nacimiento": "1968-08-18",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "julio.rodriguez"
                 },
                 {
                   "id": "c692762f-a263-5e71-81d4-221f1c8394c1",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "9352194",
                   "complemento": null,
                   "nombres": "SAUL ANDREZ",
                   "primer_apellido": "TORRICO",
                   "segundo_apellido": "SALAZAR",
                   "fecha_nacimiento": "2002-03-20",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "saul.torrico"
                 },
                 {
                   "id": "365a7cad-4d5a-5e4e-9fda-b6ac00412470",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "9320576",
                   "complemento": null,
                   "nombres": "ALBERT",
                   "primer_apellido": "RIOS",
                   "segundo_apellido": "PAREDES",
                   "fecha_nacimiento": "1994-08-13",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "albert.rios"
                 },
                 {
                   "id": "e6058800-9628-5212-83a0-6ce51b3a2550",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6404641",
                   "complemento": null,
                   "nombres": "MARIA FERNANDA",
                   "primer_apellido": "TORRICO",
                   "segundo_apellido": "NAVALLO",
                   "fecha_nacimiento": "1999-01-08",
                   "telefono": null,
                   "correo": "fernanda.torrico@endecorani.bo",
                   "codigo_externo": "maria.torrico"
                 },
                 {
                   "id": "c5fcd5ad-58df-534e-82a7-4deeb34ae8a7",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "12491007",
                   "complemento": null,
                   "nombres": "MOISES BRANDON",
                   "primer_apellido": "ILLANES",
                   "segundo_apellido": "MALDONADO",
                   "fecha_nacimiento": "1994-11-02",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "moises.illanes"
                 },
                 {
                   "id": "f21f0476-bd54-5b80-a7c9-92f960c1dce5",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "10017684",
                   "complemento": null,
                   "nombres": "IGNACIO MARTIN",
                   "primer_apellido": "BOBARYN",
                   "segundo_apellido": "LOPEZ",
                   "fecha_nacimiento": "2001-11-22",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "ignacio.bobaryn"
                 },
                 {
                   "id": "ff350913-b90f-5f0c-ac85-50660645566a",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5280393",
                   "complemento": null,
                   "nombres": "EDSON WILFREDO",
                   "primer_apellido": "ALMANZA",
                   "segundo_apellido": "CAMACHO",
                   "fecha_nacimiento": "1983-03-19",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "edson.almanza"
                 },
                 {
                   "id": "ae631dba-4b95-5b70-aca6-70db901c69d3",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4456352",
                   "complemento": null,
                   "nombres": "SILVIA MONICA",
                   "primer_apellido": "ALURRALDE",
                   "segundo_apellido": "MENGOZZI",
                   "fecha_nacimiento": "1980-08-27",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "silvia.alurralde"
                 },
                 {
                   "id": "a6d430f6-3df2-5ee0-a444-c9d77d57a3fc",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6454786",
                   "complemento": null,
                   "nombres": "ZUSSEL AMELY",
                   "primer_apellido": "ESCOBAR",
                   "segundo_apellido": "MENDEZ",
                   "fecha_nacimiento": "1987-05-11",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "zussel.escobar"
                 },
                 {
                   "id": "d2965004-36a9-5721-8ca2-1c8e844e0813",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6496758",
                   "complemento": null,
                   "nombres": "ALEXANDRA VANESSA",
                   "primer_apellido": "VALENCIA",
                   "segundo_apellido": "CUENCA",
                   "fecha_nacimiento": "1985-08-12",
                   "telefono": "74509241",
                   "correo": null,
                   "codigo_externo": "alexandra.valencia"
                 },
                 {
                   "id": "32393063-cc1c-5691-b5e1-612600a7c9cf",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "7922994",
                   "complemento": null,
                   "nombres": "GIMENA",
                   "primer_apellido": "GUEVARA",
                   "segundo_apellido": "JUAN",
                   "fecha_nacimiento": "1992-11-28",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "gimena.guevara"
                 },
                 {
                   "id": "919a745f-bc7e-51fe-8526-9888dd56e7a2",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6846566",
                   "complemento": null,
                   "nombres": "CESAR AUGUSTO",
                   "primer_apellido": "SANCHEZ",
                   "segundo_apellido": "SAINZ",
                   "fecha_nacimiento": "1990-11-08",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "cesar.sanchez"
                 },
                 {
                   "id": "2e4d21ad-93d1-5bc8-a2c2-eb9128014a18",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5271643",
                   "complemento": null,
                   "nombres": "MARIA ANTONIETA",
                   "primer_apellido": "ANEIVA",
                   "segundo_apellido": "REJAS",
                   "fecha_nacimiento": "1983-04-22",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "maria.aneiva"
                 },
                 {
                   "id": "89f9cb41-e8dc-5028-ba70-16315b6aa566",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6449069",
                   "complemento": null,
                   "nombres": "DIEGO",
                   "primer_apellido": "MORALES",
                   "segundo_apellido": "MERCADO",
                   "fecha_nacimiento": "1991-01-16",
                   "telefono": "72208176",
                   "correo": null,
                   "codigo_externo": "diego.morales"
                 },
                 {
                   "id": "5e435ac3-df27-5c1c-a9e3-37f1cbbaf11b",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6425664",
                   "complemento": null,
                   "nombres": "WILLBERTH",
                   "primer_apellido": "RICALDES",
                   "segundo_apellido": "GALINDO",
                   "fecha_nacimiento": "1986-09-07",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "willberth.ricaldes"
                 },
                 {
                   "id": "e777fb69-7dc9-5058-af19-85b910d62897",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "3006584",
                   "complemento": null,
                   "nombres": "MARIA FATIMA",
                   "primer_apellido": "TERAN",
                   "segundo_apellido": "VEIZAGA",
                   "fecha_nacimiento": "1967-05-12",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "maria.teran"
                 },
                 {
                   "id": "ab3062b8-b69e-59fd-83a5-764b4e377011",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "5819056",
                   "complemento": null,
                   "nombres": "LORGIO ANDRE",
                   "primer_apellido": "VILAR",
                   "segundo_apellido": "GONZALES",
                   "fecha_nacimiento": "1986-07-27",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "lorgio.vilar"
                 },
                 {
                   "id": "51d16db3-c46d-54ea-9a7b-8191ea037b89",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6485299",
                   "complemento": null,
                   "nombres": "TIAGO",
                   "primer_apellido": "PASTOR",
                   "segundo_apellido": "MALDONADO",
                   "fecha_nacimiento": "2002-10-15",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "tiago.pastor"
                 },
                 {
                   "id": "0e4fda5b-603c-59b0-b002-91814b94887b",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "10902539",
                   "complemento": null,
                   "nombres": "RONALDO JAIME",
                   "primer_apellido": "ALIAGA",
                   "segundo_apellido": "MAMANI",
                   "fecha_nacimiento": "1998-08-07",
                   "telefono": null,
                   "correo": "ronaldo.aliaga@endecorani.bo",
                   "codigo_externo": "ronaldo.aliaga"
                 },
                 {
                   "id": "3b79524c-4e0d-5aee-b691-ca525f7e46b1",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "9534692",
                   "complemento": null,
                   "nombres": "JOSUE CARLOS",
                   "primer_apellido": "SANGUINO",
                   "segundo_apellido": "RIOS",
                   "fecha_nacimiento": "2001-12-03",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "josue.sanguino"
                 },
                 {
                   "id": "9e278741-1ee2-5c5d-a843-8d205d8fc439",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6425039",
                   "complemento": null,
                   "nombres": "LUIS ALBERTO",
                   "primer_apellido": "CHOQUE",
                   "segundo_apellido": "HEREDIA",
                   "fecha_nacimiento": "1985-03-03",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "luis.choque"
                 },
                 {
                   "id": "4e74c269-9d14-51e2-9f10-16b7937d9031",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4433712",
                   "complemento": null,
                   "nombres": "RAFAEL",
                   "primer_apellido": "PEREZ",
                   "segundo_apellido": "ROJAS",
                   "fecha_nacimiento": "1978-09-19",
                   "telefono": "68515877",
                   "correo": null,
                   "codigo_externo": "rafael.perez"
                 },
                 {
                   "id": "69f7d783-0908-5802-9046-cdc1f9d62add",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6519258",
                   "complemento": null,
                   "nombres": "JHOMALY",
                   "primer_apellido": "CABRERA",
                   "segundo_apellido": "MONTAÑO",
                   "fecha_nacimiento": "2000-01-27",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "jhomaly.cabrera"
                 },
                 {
                   "id": "3eaccad2-5f48-5632-8da6-3e4cbc94c62c",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "2370271",
                   "complemento": null,
                   "nombres": "MIGUEL JOAQUIN",
                   "primer_apellido": "PEISER",
                   "segundo_apellido": "DORNBUSCH",
                   "fecha_nacimiento": "1976-09-03",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "miguel.peiser"
                 },
                 {
                   "id": "817fd8b1-7944-54eb-8838-a36bd613bdc7",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "4139419",
                   "complemento": null,
                   "nombres": "JHADYWEE LORENA",
                   "primer_apellido": "VARGAS",
                   "segundo_apellido": "CHUQUIMIA",
                   "fecha_nacimiento": "1976-02-01",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "jhadywee.vargas"
                 },
                 {
                   "id": "7cd35a8d-ed8c-584d-82cf-78d42dc0c144",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "6542904",
                   "complemento": null,
                   "nombres": "PABLO HUMBERTO",
                   "primer_apellido": "IPORRE",
                   "segundo_apellido": "TERAN",
                   "fecha_nacimiento": "1992-11-11",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "pablo.iporre"
                 },
                 {
                   "id": "9c566809-1012-577d-a667-7d223a48988c",
                   "tipo_documento": "cedula_identidad",
                   "numero_documento": "9070038",
                   "complemento": null,
                   "nombres": "REYNALDO",
                   "primer_apellido": "VARGAS",
                   "segundo_apellido": "QUISPE",
                   "fecha_nacimiento": "1992-04-21",
                   "telefono": null,
                   "correo": null,
                   "codigo_externo": "reynaldo.vargas"
                 }
               ]$json$::jsonb)
                        AS x(id uuid, tipo_documento varchar(20), numero_documento varchar(50),
                             complemento varchar(100), nombres varchar(100), primer_apellido varchar(100),
                             segundo_apellido varchar(100), fecha_nacimiento date, telefono varchar(30),
                             correo varchar(150), codigo_externo varchar(100)))
INSERT
INTO organizacion.personas (id, tipo_documento, numero_documento, complemento, nombres, primer_apellido, segundo_apellido,
                            fecha_nacimiento, telefono, correo, sistema_origen, codigo_externo, activo, created_at, updated_at,
                            created_by, updated_by)
SELECT id,
       tipo_documento,
       numero_documento,
       complemento,
       nombres,
       primer_apellido,
       segundo_apellido,
       fecha_nacimiento,
       telefono,
       correo,
       'Result_2.xlsx',
       codigo_externo,
       TRUE,
       NOW(),
       NULL,
       'migracion_excel',
       NULL
FROM datos;

-- ============================================================================
-- 4. EMPLEADOS (organizacion.empleados)
-- ============================================================================
WITH datos AS (SELECT *
               FROM jsonb_to_recordset($json$[
                 {
                   "id": "70080653-5a34-5652-bfe2-07a5af4fc87b",
                   "persona_id": "f27c1e09-4d0e-56a6-a80a-2bcabdf60b8b",
                   "area_id": "2c35db81-c91c-5d56-b179-767fecfd3e7f",
                   "cargo_id": "3eefaac0-b178-5c25-b4d9-b12117ffdb79",
                   "codigo": "FC582",
                   "codigo_externo": 1021
                 },
                 {
                   "id": "7e7db7f9-5e8c-5721-9f79-e1e666d699e0",
                   "persona_id": "c8f55168-9b3a-5438-8371-55180934118b",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "5f35ea47-38d8-5a15-ae8b-3112138c6fa5",
                   "codigo": "FC1117",
                   "codigo_externo": 1024
                 },
                 {
                   "id": "a7f7cfe5-c751-5cbc-b547-c97632a29f3b",
                   "persona_id": "de411c75-391b-53ab-9752-9e53e4b8c9ef",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "b8741500-7744-5d56-8990-1e5feaf0d495",
                   "codigo": "FC1185",
                   "codigo_externo": 1025
                 },
                 {
                   "id": "3157630f-f9b1-5395-8c03-36310af3b0bb",
                   "persona_id": "465be4d0-aadf-5b25-9ab8-abe665f84749",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "67d01745-f50d-5833-a897-e700f4ecefdb",
                   "codigo": "FC1194",
                   "codigo_externo": 1026
                 },
                 {
                   "id": "2e966bbf-572b-5960-9762-802242113725",
                   "persona_id": "7f68e10a-32c0-5bd1-938a-2ce9faa5a12c",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "6a126c6a-bf02-5aec-988e-752c31746fbd",
                   "codigo": "FC1245",
                   "codigo_externo": 1028
                 },
                 {
                   "id": "419b1b53-5f7b-59ac-a217-d9d6b5f84db0",
                   "persona_id": "53d793dd-9988-5f25-bfb8-d41208a338ca",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "2e489bed-a737-5ccb-be6f-07d2942050d8",
                   "codigo": "FC1295",
                   "codigo_externo": 1030
                 },
                 {
                   "id": "171f2fea-cc8b-5b09-b000-43fa375fc46e",
                   "persona_id": "0c90781a-ae81-5b26-bd38-3203835b793f",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "722334cb-b526-57a4-91b7-79bd88758332",
                   "codigo": "FC1315",
                   "codigo_externo": 1032
                 },
                 {
                   "id": "47f8e563-2e4d-500b-b4e2-01bda339fff0",
                   "persona_id": "838ee682-9d97-5a65-b337-48cb536a6be5",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "c7176e92-ceea-53b3-a6fb-47371be40872",
                   "codigo": "FC1364",
                   "codigo_externo": 1033
                 },
                 {
                   "id": "ae8eb5b4-69e8-5b37-ac59-1d2add5ad18b",
                   "persona_id": "e2ead22c-6a36-58f7-ab6f-0b87ac4a9575",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "cf68645e-db23-5bb4-b081-f0b5e044167e",
                   "codigo": "FC1481",
                   "codigo_externo": 1035
                 },
                 {
                   "id": "97ef40e5-7528-5169-bf77-6af5d19c630c",
                   "persona_id": "19d07071-0ca5-5310-9a2f-2dc76e3932f3",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "76665567-bb01-5fab-b118-ab50a803603d",
                   "codigo": "FC1483",
                   "codigo_externo": 1036
                 },
                 {
                   "id": "23846ac5-50a0-5221-9843-e8fb6d9d0553",
                   "persona_id": "2390bcc1-af43-510d-b3c5-c82f95c14941",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "a3c5ba56-1ef3-59af-a6a3-a2743b9468b8",
                   "codigo": "FC1554",
                   "codigo_externo": 1040
                 },
                 {
                   "id": "810d6a5b-b4ea-56ba-96cd-7e2e9dcf5b0d",
                   "persona_id": "7984b706-bbb0-5c09-bd37-ed009beb2a9d",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "6713dc10-1aa5-5e16-8feb-9e7b41b89b9a",
                   "codigo": "FC1557",
                   "codigo_externo": 1041
                 },
                 {
                   "id": "a336f5a5-44ba-5ae4-8722-e52ace161fd1",
                   "persona_id": "cbc8c6eb-72f5-577a-ad70-9ba3defc6e55",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "01e8a881-d66f-525e-80ba-4f4dc03bab6f",
                   "codigo": "FC1562",
                   "codigo_externo": 1042
                 },
                 {
                   "id": "052a2979-ac01-5011-88ba-ae86dab152e4",
                   "persona_id": "45d4907f-a95e-5d02-b1c3-4b6dde9954c3",
                   "area_id": "2c35db81-c91c-5d56-b179-767fecfd3e7f",
                   "cargo_id": "4480fbc4-95b7-59ea-99d3-b3a75817e6e0",
                   "codigo": "FC1703",
                   "codigo_externo": 1043
                 },
                 {
                   "id": "df0c1109-880c-5f7c-b70b-6e6f292b078e",
                   "persona_id": "7278b5f1-1299-57a2-972e-634c1b9e75b2",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "421c3be1-9ebd-5676-8d9e-887671a71a56",
                   "codigo": "FC1704",
                   "codigo_externo": 1044
                 },
                 {
                   "id": "b30d46a1-ef6c-59cd-b5c6-e9de8021d436",
                   "persona_id": "cca31714-79bb-576a-9964-9e0c8bda8478",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "928c413b-a773-5929-9e0f-599d5cb973d2",
                   "codigo": "FC1705",
                   "codigo_externo": 1045
                 },
                 {
                   "id": "882ed50d-a33d-5e9d-a5a0-c3f8c3d7e951",
                   "persona_id": "8e0d8391-f9b7-5cea-b562-00d5365b8ede",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "722334cb-b526-57a4-91b7-79bd88758332",
                   "codigo": "FC1706",
                   "codigo_externo": 1046
                 },
                 {
                   "id": "49eabc48-6eb1-5fc9-bd26-4aa7589977c2",
                   "persona_id": "ea4fe33f-f1bb-58cd-bae1-60d9f2d742f8",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "02e6f3c8-1bf8-57dd-ab73-ce3d9907290d",
                   "codigo": "FC1711",
                   "codigo_externo": 1049
                 },
                 {
                   "id": "b0467a1f-635f-52c5-9574-e99b2a73fc7e",
                   "persona_id": "824c6f57-3eef-5d07-9509-f325a934fd86",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "92b3edc5-5c69-5416-b81c-2e71511cd23d",
                   "codigo": "FC1713",
                   "codigo_externo": 1050
                 },
                 {
                   "id": "a2c8e92c-0f88-5d1f-8c7b-54871d68e30d",
                   "persona_id": "f24197b2-27fb-55c0-831c-5ddc445e6dc0",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "ead369f8-1224-5152-81fb-d39362f9b8a3",
                   "codigo": "FC1717",
                   "codigo_externo": 1051
                 },
                 {
                   "id": "9282ba9b-b1c1-581b-b03b-bbd823f50e99",
                   "persona_id": "7808fc4e-4668-560d-97fa-b17297c8cb05",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "d2914f38-ab99-5714-b930-ee75c1341d36",
                   "codigo": "FC1718",
                   "codigo_externo": 1052
                 },
                 {
                   "id": "02fbe2dd-531c-548a-b1c9-d5c0d390af1e",
                   "persona_id": "8f8bfdb9-1a44-5ecd-8143-b88efad65505",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "e2f5bef9-492e-5651-b4c8-cc6589b40ab8",
                   "codigo": "FC1721",
                   "codigo_externo": 1053
                 },
                 {
                   "id": "d8b54f8b-eb4a-5ec0-a058-ac1b2471b1f6",
                   "persona_id": "08b7a1c0-63dd-51b1-a530-488677138c68",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "fc499a5d-ff5e-5a21-b33d-95d6672c488c",
                   "codigo": "FC1722",
                   "codigo_externo": 1054
                 },
                 {
                   "id": "425495b6-4950-55e2-93d0-8db53b255e50",
                   "persona_id": "c9fafa76-3b46-5c62-8f3f-f0afeea0ee68",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "753d2240-e243-575b-b190-ed930ef82a92",
                   "codigo": "FC1723",
                   "codigo_externo": 1055
                 },
                 {
                   "id": "5673347d-fe94-56ec-a813-a2cc7929919d",
                   "persona_id": "717000fa-cbe7-5786-8589-f7d43d8ea87a",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "50496122-80a2-558a-beab-2fc7b3ed9489",
                   "codigo": "FC1725",
                   "codigo_externo": 1057
                 },
                 {
                   "id": "366d6826-7360-5caf-aec8-9c173c22e42b",
                   "persona_id": "9793ccb4-23a0-5569-ad64-ba8330879032",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "659855c6-1459-535b-8309-077730cd1326",
                   "codigo": "FC1736",
                   "codigo_externo": 1059
                 },
                 {
                   "id": "7cca27d8-275c-5ef7-b283-3a8ef253872d",
                   "persona_id": "4e1c732d-29da-5426-90fe-dccbef170407",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "608a3733-3202-58f5-9ba9-0767266afda1",
                   "codigo": "FC1739",
                   "codigo_externo": 1061
                 },
                 {
                   "id": "dfd55ceb-8919-5825-b17c-d101bf78416f",
                   "persona_id": "e43c9c9b-3846-5544-8cc1-b0e8f61e2091",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "39646356-677b-5b91-8782-fbb016ddbeb0",
                   "codigo": "FC1740",
                   "codigo_externo": 1062
                 },
                 {
                   "id": "ae33c7e5-8d2d-53bd-9c6e-edfa068861a2",
                   "persona_id": "b34c20ff-6452-5e0b-8515-f2d97172e1e8",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "090113f3-a6e6-5bd2-89c3-6173bb918378",
                   "codigo": "FC1741",
                   "codigo_externo": 1063
                 },
                 {
                   "id": "abfd4f53-348b-536a-9acf-fc35ab0c76c8",
                   "persona_id": "377326f9-7c71-501d-b7fa-40a46fba7f61",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "227faa99-dc82-5011-8462-cf54dbd3cbbd",
                   "codigo": "FC1747",
                   "codigo_externo": 1064
                 },
                 {
                   "id": "f0718621-a49c-5368-af6c-f69d8d6e5e7d",
                   "persona_id": "828ad265-c2db-5555-b824-269e0665e1c6",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "507f3a4c-452c-5100-be21-fbb336fc2223",
                   "codigo": "FC1750",
                   "codigo_externo": 1065
                 },
                 {
                   "id": "b5bf72bf-07f4-5bbc-bd38-d67e7f743a78",
                   "persona_id": "552330fa-1ee2-5d3f-8375-90ec500ae468",
                   "area_id": "2c35db81-c91c-5d56-b179-767fecfd3e7f",
                   "cargo_id": "6e5abf40-093d-5bb3-b324-b48288015bef",
                   "codigo": "FC1751",
                   "codigo_externo": 1066
                 },
                 {
                   "id": "cc878796-d993-51b0-8636-e4a31ba512ae",
                   "persona_id": "1f3fb831-45e1-553b-a5aa-085515aec0ef",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "2859936b-a54f-53e3-a733-87d45a1587ae",
                   "codigo": "FC1752",
                   "codigo_externo": 1067
                 },
                 {
                   "id": "df88cd8a-f5d3-55b0-a44e-3ea2721716fb",
                   "persona_id": "f553e24a-a935-52f5-b160-e72f15ee15f5",
                   "area_id": "2c35db81-c91c-5d56-b179-767fecfd3e7f",
                   "cargo_id": "d810432e-fb79-520d-91da-7560d6e07742",
                   "codigo": "FC1757",
                   "codigo_externo": 1068
                 },
                 {
                   "id": "a7796b77-6531-574b-9ac9-cdaaa1a1c986",
                   "persona_id": "3be679af-bb1c-55de-8676-77cc6bae9a35",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "b44b74b2-bf0d-53a7-901e-505c734cc350",
                   "codigo": "FC1769",
                   "codigo_externo": 1074
                 },
                 {
                   "id": "3937305a-f2dd-523b-80d7-6b52da685074",
                   "persona_id": "f6ea4767-7284-5e80-a5df-cf89bde8d024",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "0de7ad22-dc2a-5927-9a4c-21cbe9a7fce5",
                   "codigo": "FC1774",
                   "codigo_externo": 1076
                 },
                 {
                   "id": "59698dee-b0d0-5b36-8f07-be7f924a1a6d",
                   "persona_id": "caca14d0-6486-5a0f-abfd-cacb60dab2d1",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "b005ed37-ab15-5d46-aa52-cd5fe2f45185",
                   "codigo": "FC1775",
                   "codigo_externo": 1077
                 },
                 {
                   "id": "0d488f75-dce9-5238-b208-e2dafa5502b4",
                   "persona_id": "1fec8ca0-947d-5fc4-8187-b1cca5f84940",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "4e36b2d5-3d33-5a1b-bf58-6fbe5ce81db0",
                   "codigo": "FC2128",
                   "codigo_externo": 1079
                 },
                 {
                   "id": "183e92e0-ea2c-598f-bef8-5a6bce29fe85",
                   "persona_id": "6c65027e-e0bb-5c84-a0cd-8efbd7cdd746",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "b6024e2c-0149-5500-9064-28775218017b",
                   "codigo": "FC2119",
                   "codigo_externo": 1084
                 },
                 {
                   "id": "a8d02ee5-987d-5b7c-bad8-e9c8bde3a3c3",
                   "persona_id": "7c66ec46-8eb6-59e0-bd9d-4d6933596a94",
                   "area_id": "2c35db81-c91c-5d56-b179-767fecfd3e7f",
                   "cargo_id": "49585089-a65e-56b4-8c00-2951ee87711d",
                   "codigo": "FC1795",
                   "codigo_externo": 1085
                 },
                 {
                   "id": "f38d5adb-61d0-5bf8-a3ec-151bd251defc",
                   "persona_id": "4fb93007-5ae0-57e7-a8d6-b407166dc49c",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "c74b969c-b122-5b37-a375-0e3c88c18e0b",
                   "codigo": "FC1798",
                   "codigo_externo": 1086
                 },
                 {
                   "id": "342b2653-da7c-52a0-95db-c1803187be79",
                   "persona_id": "59d6e134-f004-5196-b633-d29f9d82669f",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "ffa220c1-78f6-5ef3-b765-af9bda6f3190",
                   "codigo": "FC1800",
                   "codigo_externo": 1087
                 },
                 {
                   "id": "ad9704d3-ab1f-5272-b335-7ad9b6ebca62",
                   "persona_id": "d61eea73-4624-5288-a643-c2e9410f1f81",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "0f9c8672-74b3-540e-9d5a-92fb9f68c9ba",
                   "codigo": "FC2017",
                   "codigo_externo": 1088
                 },
                 {
                   "id": "0e40d316-571e-5638-9c39-8928dec9e211",
                   "persona_id": "3045bb81-5b8d-57cb-87f1-75fbf3f0149a",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "6c3058c5-f671-5f88-a9df-ce34b51bd2f2",
                   "codigo": "FC2121",
                   "codigo_externo": 1089
                 },
                 {
                   "id": "c0d9e0cd-b4aa-524b-b85d-b1e551ff4a3f",
                   "persona_id": "6fab4359-194f-545b-994a-cfeed3f22424",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "4c6c00d5-5db7-524f-b20a-c6864e9dbc54",
                   "codigo": "FC2018",
                   "codigo_externo": 1091
                 },
                 {
                   "id": "a378438f-3ddb-518e-a30c-a1fe817392c9",
                   "persona_id": "086926eb-955c-527f-8080-ff90a10f81f3",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "722334cb-b526-57a4-91b7-79bd88758332",
                   "codigo": "FC1812",
                   "codigo_externo": 1093
                 },
                 {
                   "id": "fe145a83-7042-5d96-9e6e-76cbb42d7b1a",
                   "persona_id": "1b88e1e0-8173-5d9c-8f23-7e4a683d3c7c",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "7168cffb-00b1-5de1-bb78-6f76094efd03",
                   "codigo": "FC1813",
                   "codigo_externo": 1094
                 },
                 {
                   "id": "24eb682c-ce15-5cb2-8639-81476b3ee574",
                   "persona_id": "78dd374c-08bb-55ca-b4da-73c826d1a585",
                   "area_id": "2c35db81-c91c-5d56-b179-767fecfd3e7f",
                   "cargo_id": "7f7931b6-857f-5651-9278-d527931f1733",
                   "codigo": "FC1814",
                   "codigo_externo": 1095
                 },
                 {
                   "id": "2140103d-7f85-53aa-9f95-1ec44d5d55cd",
                   "persona_id": "08a5eb93-d4a0-57ac-947d-5e71e28af7b2",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "9a1f17f0-9ccc-54df-9ef2-20b3acefe6cc",
                   "codigo": "FC1815",
                   "codigo_externo": 1096
                 },
                 {
                   "id": "bfc49f64-622f-5c96-81d6-cb085e882e01",
                   "persona_id": "30e8f5ea-fcd3-50f7-a4b3-a0077ac0aed8",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "9db4b17e-25a0-5fc6-8404-b8f307ed2160",
                   "codigo": "FC2184",
                   "codigo_externo": 1099
                 },
                 {
                   "id": "ec7e7587-8c59-588e-8c8a-fb55ee0e582d",
                   "persona_id": "bad1a214-5592-5458-b06c-371e83af247a",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "7da6ff34-5eaf-5001-b036-cd4ea50aeb02",
                   "codigo": "FC1827",
                   "codigo_externo": 1101
                 },
                 {
                   "id": "86caced3-3ed5-5973-bfa4-8459402e9586",
                   "persona_id": "8b61f212-0b48-5f33-9a92-53fb3f0afae0",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "f9ef0b10-07e9-52ed-a5e3-ae07a2285fef",
                   "codigo": "FC2251",
                   "codigo_externo": 1102
                 },
                 {
                   "id": "c406852f-fb87-50bd-b0d4-62069fc8991d",
                   "persona_id": "50fe80ef-2782-5a00-bfa1-8d4a92aad606",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "0174e9fd-124c-5539-b6aa-c46711f4d8da",
                   "codigo": "FC1835",
                   "codigo_externo": 1103
                 },
                 {
                   "id": "deff0b67-15de-515b-9a65-9c6b7828b32f",
                   "persona_id": "5997b360-7f3d-5a8a-9873-fc1ad9a8149c",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "7575afc2-380d-5350-9543-8e962a936784",
                   "codigo": "FC1851",
                   "codigo_externo": 1104
                 },
                 {
                   "id": "ab3212ed-594a-5175-8c2f-8e8715628c43",
                   "persona_id": "ef14bf48-1226-5dd6-97e2-ddde724f6014",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "4eab3308-f0c9-5e35-8dee-6d62e575ca63",
                   "codigo": "FC1852",
                   "codigo_externo": 1105
                 },
                 {
                   "id": "5b672afe-110b-51f4-a916-42f7a49d7600",
                   "persona_id": "aca3e7eb-cf5d-5410-ba83-8d93a6f1d031",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "01562a5f-722a-58d2-b893-d65a6eb1b009",
                   "codigo": "FC1862",
                   "codigo_externo": 1108
                 },
                 {
                   "id": "4db9e681-a8db-5532-847a-fec06f308889",
                   "persona_id": "e876e94e-ac3d-53b3-8f18-e4526612c175",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "5e060199-689d-5e53-b022-a72a91ebb4cb",
                   "codigo": "FC2039",
                   "codigo_externo": 1113
                 },
                 {
                   "id": "be681b79-a811-5168-9ce1-4b5c0a023432",
                   "persona_id": "b9a76900-14d9-5f2c-a932-c718265d6c4b",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "a8121400-82ca-5b13-8ffd-6140eac35960",
                   "codigo": "FC2037",
                   "codigo_externo": 1115
                 },
                 {
                   "id": "e2d5c8ed-80f0-5360-9ed0-5007eba074f0",
                   "persona_id": "c4bf4ab2-db49-5428-b7d4-cdcf1cd91fd2",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "b292ab38-fbde-52ca-9e3f-c79066c717ed",
                   "codigo": "FC1875",
                   "codigo_externo": 1117
                 },
                 {
                   "id": "88991e26-7a74-5d20-b4a2-69bba7f686b0",
                   "persona_id": "b0e00e34-42ac-5955-9beb-001e15f8cadc",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "7e3ed480-fbf1-5c1b-82b8-c32655c9911f",
                   "codigo": "FC2322",
                   "codigo_externo": 1122
                 },
                 {
                   "id": "d006cc31-2cab-5d0f-863c-3e42aa811ba4",
                   "persona_id": "ddbff004-85f0-5b94-8c6d-d84bc3f4af40",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "d3aa0206-56e0-5eba-beb5-a866e15a76b9",
                   "codigo": "FC1900",
                   "codigo_externo": 1134
                 },
                 {
                   "id": "bb98713e-340c-556d-bb40-cc476b2fb7e2",
                   "persona_id": "e25a9578-a721-5b44-9fdc-4745d5aef405",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "b292ab38-fbde-52ca-9e3f-c79066c717ed",
                   "codigo": "FC1901",
                   "codigo_externo": 1135
                 },
                 {
                   "id": "429f24d1-ab90-5c38-b2ed-33452275f3ea",
                   "persona_id": "150ed9dd-d627-5b08-b376-06733038154a",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "45d63620-12c9-5a49-83c5-49072d5a28c9",
                   "codigo": "FC2125",
                   "codigo_externo": 1138
                 },
                 {
                   "id": "c1067003-e362-514d-a6ce-50ad411f6ad8",
                   "persona_id": "0ad83c57-cc79-5889-a596-4b4c8592c2a6",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "997b7236-10e6-555f-b604-094744f1e67d",
                   "codigo": "FC2109",
                   "codigo_externo": 1140
                 },
                 {
                   "id": "c0b58b36-0fd0-5642-ae06-faa1c1676fc2",
                   "persona_id": "63e47ea7-1188-545a-8d8e-e1daa37b07b5",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "71b664b4-01e8-5b7c-9387-bfe118880622",
                   "codigo": "FC1913",
                   "codigo_externo": 1146
                 },
                 {
                   "id": "b58aa627-8426-59ea-a977-71aef7d56dce",
                   "persona_id": "3b337ff2-8511-5924-91b2-3fa604e86da8",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "54cd0dbb-f1df-5cdd-9965-8fe6b08a4b8f",
                   "codigo": "FC2212",
                   "codigo_externo": 1147
                 },
                 {
                   "id": "3b4db547-352f-5d2b-845a-849eb08dce06",
                   "persona_id": "601ed26e-d01a-5cde-b4c4-5555e09562b3",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "83660d31-95a1-5b67-995c-a16a93707eee",
                   "codigo": "FC2305",
                   "codigo_externo": 1150
                 },
                 {
                   "id": "de6a00b2-3166-5920-957a-08b5e49b663e",
                   "persona_id": "526b4bcb-8fa1-577c-8660-d9f27ed069ae",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "7c3b696b-fa7e-5d42-9a03-3ec752ddce1f",
                   "codigo": "FC1918",
                   "codigo_externo": 1151
                 },
                 {
                   "id": "0dfb43ec-e51b-5b47-a2f1-7cddb2b4494b",
                   "persona_id": "10bbe984-6e12-5b23-9526-a988e60c8f3b",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "373a9e70-c551-5edd-b1ab-41d19c0791de",
                   "codigo": "FC1921",
                   "codigo_externo": 1154
                 },
                 {
                   "id": "87657dd9-6d0a-512a-9f92-b9b41bb7b3cb",
                   "persona_id": "eb715158-bfcf-5927-a9b3-5a09848b68db",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "3a223c8d-abd9-59c7-b5dd-8ca372418097",
                   "codigo": "FC2194",
                   "codigo_externo": 1156
                 },
                 {
                   "id": "64aeb21e-9cfe-540e-be9f-2b900b95c4c5",
                   "persona_id": "618c9e0d-6412-5662-bca3-f1742494d1ad",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "990c5b4e-647f-57f4-b2d3-da0609e068c4",
                   "codigo": "FC2189",
                   "codigo_externo": 1157
                 },
                 {
                   "id": "f49eae40-4a10-5f6f-9ec5-5879c8cc1588",
                   "persona_id": "a593b789-4c6b-521a-96b9-9c31639e8efa",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "9ae79e4e-16aa-5d56-b557-e49f7655c8b8",
                   "codigo": "FC1930",
                   "codigo_externo": 1162
                 },
                 {
                   "id": "64f012dc-2962-59f3-a5ee-736083067963",
                   "persona_id": "e41e9987-801e-5421-a823-84460b7dec4a",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "377b7681-14b4-5f46-a3b7-c6c8e45c101b",
                   "codigo": "FC1932",
                   "codigo_externo": 1164
                 },
                 {
                   "id": "7c8d9b2e-2599-5db3-bc8a-cf9b92c6b2d0",
                   "persona_id": "64736679-5117-5092-a4e6-152ef68567dd",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "96f86ce0-7c9a-5695-a44b-f74c27b5e0ad",
                   "codigo": "FC2384",
                   "codigo_externo": 1170
                 },
                 {
                   "id": "d306789f-c438-52d4-acb7-a872e7010866",
                   "persona_id": "009a1891-e849-52d4-a0c8-d18dcbf13266",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "4dd93e01-f2ea-5ad2-946b-6484f2ed9920",
                   "codigo": "FC1942",
                   "codigo_externo": 1174
                 },
                 {
                   "id": "ad4e6c8a-2666-5409-8cf8-ac81c3d29ee3",
                   "persona_id": "bbe06073-6078-53f3-b474-a376e2c5159a",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "82945ed5-d903-5437-a303-7776dc914ad3",
                   "codigo": "FC1953",
                   "codigo_externo": 1184
                 },
                 {
                   "id": "642faa38-ba43-5263-a20d-18b0bced3d21",
                   "persona_id": "df5eb0f2-f756-5129-8656-fdef89916411",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "41e67432-c10e-52c0-96a0-0e1a8cdf6bdc",
                   "codigo": "FC1955",
                   "codigo_externo": 1186
                 },
                 {
                   "id": "d6694762-33a7-5211-a2f8-383174eb8a87",
                   "persona_id": "66869c52-0367-54f1-be4f-6abacdbfbe37",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "277a9f62-bd34-51d4-8d19-c4be61c73e9b",
                   "codigo": "FC1956",
                   "codigo_externo": 1187
                 },
                 {
                   "id": "990401e3-e4d5-5094-b2e0-ef0ec07824d9",
                   "persona_id": "8a0244c6-fcb1-51bd-9af3-b344230ff065",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "6561c21a-e043-58ff-830f-62f47a2875a0",
                   "codigo": "FC1957",
                   "codigo_externo": 1188
                 },
                 {
                   "id": "6f997588-c86e-52d6-bf12-e40957a87e3b",
                   "persona_id": "fed4f6b9-dba2-5257-9538-cb9f511c457c",
                   "area_id": "2c35db81-c91c-5d56-b179-767fecfd3e7f",
                   "cargo_id": "8e860da8-a57d-56d8-a2db-6aff075691d5",
                   "codigo": "FC2010",
                   "codigo_externo": 1200
                 },
                 {
                   "id": "658a6c61-4a8e-5def-a69e-4dd23b683631",
                   "persona_id": "4de99836-6bdb-54e1-9636-a3bc204518f3",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "1fd99ea0-70df-5f29-ba52-532faaf856a9",
                   "codigo": "FC1970",
                   "codigo_externo": 1202
                 },
                 {
                   "id": "f1b049a4-b649-5b12-9d5c-b8b9b51eb0e8",
                   "persona_id": "7c120b2a-271d-5a1c-ad10-9d51339b12b1",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "ba774698-db76-5fa3-8d1c-a3006c111b62",
                   "codigo": "FC1969",
                   "codigo_externo": 1203
                 },
                 {
                   "id": "ae253105-e1a5-5e87-9663-f366c8e3e5fa",
                   "persona_id": "db59fde2-29e1-5ca1-a5f3-1289e3dd3130",
                   "area_id": "2c35db81-c91c-5d56-b179-767fecfd3e7f",
                   "cargo_id": "820b21f1-927d-5cfd-80e4-daa1d5f565a3",
                   "codigo": "FC1974",
                   "codigo_externo": 1204
                 },
                 {
                   "id": "1a2e5ed0-508e-5d0a-ac9d-8c063df34a9f",
                   "persona_id": "5357c8ca-8d60-53a4-a06f-8b475c579e4c",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "73265965-fbf9-5464-9b09-ecd96d59ba11",
                   "codigo": "FC2012",
                   "codigo_externo": 1205
                 },
                 {
                   "id": "5c00766a-844a-5001-b7fe-2923ab5fd392",
                   "persona_id": "d211a223-1069-50bc-9604-2918bc032a9e",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "53fd0db7-1965-53d8-a2cf-63091aa3aacd",
                   "codigo": "FC2044",
                   "codigo_externo": 1206
                 },
                 {
                   "id": "61871ded-3c00-5c84-abef-16ea69dcffba",
                   "persona_id": "81ed7a15-b40d-5607-9dfd-d11ae36d5250",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "f2f1deee-9e90-5aeb-b80f-7aa9c010d304",
                   "codigo": "FC2036",
                   "codigo_externo": 1207
                 },
                 {
                   "id": "97ad6445-14fc-56a1-a0b1-0b4810655478",
                   "persona_id": "b6e5d4ea-9c28-56b7-9278-869d0371b6c8",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "c180c13f-338b-5c2d-9207-1228f52b93d1",
                   "codigo": "FC2011",
                   "codigo_externo": 1209
                 },
                 {
                   "id": "a9fc0310-a97c-5f66-8064-3903953f6e58",
                   "persona_id": "ad6be814-0f75-562a-982d-ce85ee2982be",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "dfafde50-92ae-58ce-ae47-a0c33d1a9ad9",
                   "codigo": "FC1982",
                   "codigo_externo": 1211
                 },
                 {
                   "id": "d842d5e1-65f5-5b30-aec2-a722f2c05b1d",
                   "persona_id": "09e9d8d8-01ea-59ba-86ab-b23f0d668c34",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "5bae5a65-d0c2-59fb-8019-e226c9326bb8",
                   "codigo": "FC2002",
                   "codigo_externo": 1214
                 },
                 {
                   "id": "a392da4d-0ca3-5b0e-a9b3-38fa8be5dfb0",
                   "persona_id": "3faed279-dec0-53d8-8cdf-0a0fa1ab0a25",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "5bae5a65-d0c2-59fb-8019-e226c9326bb8",
                   "codigo": "FC2003",
                   "codigo_externo": 1215
                 },
                 {
                   "id": "924aa0da-7f4b-5c86-928f-cff4e2a186ee",
                   "persona_id": "8b2dffe5-9202-5aef-8142-f16f56af4912",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "7c48179c-b87f-5e61-b868-c419c8836863",
                   "codigo": "FC1983",
                   "codigo_externo": 1216
                 },
                 {
                   "id": "eedb4dc4-f8b4-54b3-b201-7203e3d5be77",
                   "persona_id": "ee81e577-3c04-5cee-8c26-39229491029f",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "7c48179c-b87f-5e61-b868-c419c8836863",
                   "codigo": "FC1991",
                   "codigo_externo": 1218
                 },
                 {
                   "id": "d2761002-8c26-56ed-a6bc-932667351731",
                   "persona_id": "2d65620f-5532-5b72-b619-5c81de98f412",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "0c9fc719-45fd-5aa3-a584-b68c91e75851",
                   "codigo": "FC1981",
                   "codigo_externo": 1219
                 },
                 {
                   "id": "9d572716-a2c1-5586-852f-9ff2e92f7b62",
                   "persona_id": "5b12dc59-fe5e-51a9-ae27-f6f128ad3bbc",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "7c48179c-b87f-5e61-b868-c419c8836863",
                   "codigo": "FC1990",
                   "codigo_externo": 1220
                 },
                 {
                   "id": "bb5b5925-e047-530c-a520-65dd93e4257c",
                   "persona_id": "201dacf2-40d6-5cf4-a040-5e74d77a6fa4",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "7c48179c-b87f-5e61-b868-c419c8836863",
                   "codigo": "FC1984",
                   "codigo_externo": 1222
                 },
                 {
                   "id": "704548be-82f7-57f3-9915-44cea1316916",
                   "persona_id": "22f943d3-4fd4-5140-8ef0-d430d46f1742",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "7c48179c-b87f-5e61-b868-c419c8836863",
                   "codigo": "FC1989",
                   "codigo_externo": 1223
                 },
                 {
                   "id": "d598e326-8266-550a-a687-2429add4bb77",
                   "persona_id": "37b788cc-0f87-54c4-b0cf-5670a2388d01",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "7c48179c-b87f-5e61-b868-c419c8836863",
                   "codigo": "FC1988",
                   "codigo_externo": 1225
                 },
                 {
                   "id": "78a3fe17-6ddd-5b66-8991-9ef4ed0b3a8b",
                   "persona_id": "f5dc307b-39ce-5a39-b148-7f0df6c732e4",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "7c48179c-b87f-5e61-b868-c419c8836863",
                   "codigo": "FC1992",
                   "codigo_externo": 1226
                 },
                 {
                   "id": "fc101ab8-c14e-5a06-ab9b-411a03b95124",
                   "persona_id": "12af9b2c-e56c-5255-a1f5-9737e91670fe",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "95ec9cd9-da6a-5219-b74e-74a164fa5da5",
                   "codigo": "FC1966",
                   "codigo_externo": 1231
                 },
                 {
                   "id": "317df745-da8c-533a-af7e-5b13ded5d6a5",
                   "persona_id": "7f1a29b9-b5c3-54be-a60c-9123743c4235",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "c1338ef6-c5e4-549d-822d-93f200788810",
                   "codigo": "FC2051",
                   "codigo_externo": 1235
                 },
                 {
                   "id": "edb70c52-a15d-5f67-bbed-ab76c0856e54",
                   "persona_id": "815cd764-b7af-502e-8571-c8ff14ed2e58",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "4ad3fd6d-9ea7-58af-9d3f-bb92de688775",
                   "codigo": "FC2272",
                   "codigo_externo": 1248
                 },
                 {
                   "id": "33d52c35-dce6-5e65-b914-310a9d257571",
                   "persona_id": "d3b7557c-2b96-5eb7-b240-5ff3d61537e5",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "816294b8-cf6a-55e7-b081-c7bb4f0227ab",
                   "codigo": "FC2282",
                   "codigo_externo": 1250
                 },
                 {
                   "id": "3d07bbb9-e2a7-5fe4-83cd-ee2059f1605e",
                   "persona_id": "46a1d1f4-7f08-5857-9686-1ad618cf3ce9",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "e60002bb-557b-5d2a-84a4-13ba74995415",
                   "codigo": "FC2321",
                   "codigo_externo": 1253
                 },
                 {
                   "id": "f3ecd8c8-eee5-520c-a7ec-e60aa2e53488",
                   "persona_id": "8acc2d12-7d87-5eac-9b12-45be6009efec",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "7801b9ea-408d-5108-988a-af065d717e3e",
                   "codigo": "FC2031",
                   "codigo_externo": 1261
                 },
                 {
                   "id": "314b656b-1531-5e04-a4d8-076ba7c4a22f",
                   "persona_id": "96e1d528-7885-59b7-b9b1-7c08826384a2",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "cce7f2fb-91fc-5518-b29c-79380263f11d",
                   "codigo": "FC2451",
                   "codigo_externo": 1263
                 },
                 {
                   "id": "465b023c-90c3-5138-b7fa-8a5518516e0b",
                   "persona_id": "b8d58599-d597-52d7-93e3-f80b0fbfa45e",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "77dd3205-4a3d-56bd-9b01-ad0cedb992ff",
                   "codigo": "FC1998",
                   "codigo_externo": 1266
                 },
                 {
                   "id": "fd9aec5e-ee4b-57b0-9ae7-aadd09cba453",
                   "persona_id": "441c5e99-7465-5b02-a63d-43e592e36ea9",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "204dc2c9-4333-54e8-b5a8-4d4ebb780027",
                   "codigo": "FC1986",
                   "codigo_externo": 1270
                 },
                 {
                   "id": "10bf73d1-9431-5f71-826e-c287da294617",
                   "persona_id": "2a4875dd-c8e2-5d38-a8ae-65b310adc3c0",
                   "area_id": "2c35db81-c91c-5d56-b179-767fecfd3e7f",
                   "cargo_id": "d4bfb288-b2d9-5c90-9f24-dc815c84119e",
                   "codigo": "FC1967",
                   "codigo_externo": 1271
                 },
                 {
                   "id": "d591238f-499b-5d2c-aadf-f34b8f78efb2",
                   "persona_id": "0029a12a-86ae-5466-bbff-f6361a2150d3",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "877e7f4d-0f5c-5d6e-ad8c-65b0dd12bae1",
                   "codigo": "FC2071",
                   "codigo_externo": 1288
                 },
                 {
                   "id": "099d48fd-d3a4-5552-a236-93078c25caa0",
                   "persona_id": "140487f0-64a7-54b7-b248-9b4d46318cd6",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "19aeb877-443e-5a70-ba49-ac15cf899b65",
                   "codigo": "FC2074",
                   "codigo_externo": 1297
                 },
                 {
                   "id": "538d60cb-687f-5438-a3c5-42e1266d7429",
                   "persona_id": "fc2a4395-5fd2-5353-81bf-05424a4bd224",
                   "area_id": "2c35db81-c91c-5d56-b179-767fecfd3e7f",
                   "cargo_id": "ccdc8626-2222-5732-8caa-ae5ac6dde092",
                   "codigo": "FC2073",
                   "codigo_externo": 1298
                 },
                 {
                   "id": "6468f6d5-ee9f-57e1-a54e-effcd5b17ec3",
                   "persona_id": "61d7da2a-004d-52d0-9d41-b8626eab1daf",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "124bfd10-c913-54f6-a279-626ef7830363",
                   "codigo": "FC2082",
                   "codigo_externo": 1303
                 },
                 {
                   "id": "0e2047ba-fa79-5aa0-af44-ac4c65d096fd",
                   "persona_id": "f746a385-fb3b-50e9-b372-54e64db6d7c8",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "65c91681-cd95-5b2a-a230-e0d62c2750bf",
                   "codigo": "FC2083",
                   "codigo_externo": 1304
                 },
                 {
                   "id": "5de31270-6616-52b6-b8cb-a1431d572c16",
                   "persona_id": "42eee50a-98c6-56b8-a5e8-109daa44bd16",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "83a4e198-b270-57ee-b9b5-0086cbb46412",
                   "codigo": "FC2259",
                   "codigo_externo": 1305
                 },
                 {
                   "id": "0332083e-83bf-5d8b-b57c-da58f0842894",
                   "persona_id": "7882da5e-c7a7-54eb-a7f6-0ee047e78319",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "d3bd94d7-a633-5e25-87aa-b8c0afa28e3c",
                   "codigo": "FC2085",
                   "codigo_externo": 1306
                 },
                 {
                   "id": "90877eb2-86e3-54ee-808a-30e14eab3697",
                   "persona_id": "a34ca94f-f862-54f9-a88c-f3fd68e006eb",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "522addf4-b90c-59bb-aeb5-42a0bb37fe75",
                   "codigo": "FC2086",
                   "codigo_externo": 1307
                 },
                 {
                   "id": "6b591c94-dced-5da0-abe5-69e0248ae4dc",
                   "persona_id": "f69efda4-e95c-5c0f-9b39-370164410bde",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "f5c50415-84d1-5258-9028-5df5a334ed85",
                   "codigo": "FC2088",
                   "codigo_externo": 1309
                 },
                 {
                   "id": "9b882567-21c1-5f5c-a79b-c917fb4e3d96",
                   "persona_id": "6bcb1311-2f5b-58e4-88b5-291af50aa3b7",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "a6559195-16bb-5bec-be4c-37164a5febb1",
                   "codigo": "FC2649",
                   "codigo_externo": 1310
                 },
                 {
                   "id": "c85721a7-ab6d-56b6-a8e8-6b9df6ad81a7",
                   "persona_id": "a654fda8-3cbf-5f4d-8ef7-96a6afc73fa5",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "1683a8a8-cdae-5896-9fa8-db4b52568e8a",
                   "codigo": "FC2091",
                   "codigo_externo": 1312
                 },
                 {
                   "id": "c34de979-0dd7-5cb6-ae50-69d2de96a365",
                   "persona_id": "30b520b2-ad30-53fb-b388-85c923de933c",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "174df67f-bd75-5e30-9c0f-fa41f45f6cc4",
                   "codigo": "FC2094",
                   "codigo_externo": 1315
                 },
                 {
                   "id": "a160d505-bcf5-5ec8-a04b-9d9f830401e6",
                   "persona_id": "8338a739-c28f-57e1-93db-d8207634c7d1",
                   "area_id": "2c35db81-c91c-5d56-b179-767fecfd3e7f",
                   "cargo_id": "8a8e93e3-4553-50f9-82a2-1542aed3be98",
                   "codigo": "FC2252",
                   "codigo_externo": 1330
                 },
                 {
                   "id": "7dc5aa72-00bb-59ee-9e50-9edd87fef5e2",
                   "persona_id": "a125c4a7-d43b-5ee1-ae51-9dfec269e04b",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "166dd0b0-48c9-5ac7-bcd9-e5610ba8165b",
                   "codigo": "FC2126",
                   "codigo_externo": 1333
                 },
                 {
                   "id": "8668a8a2-2bed-5820-aa0b-afceb392a7c8",
                   "persona_id": "e0dcf2e2-ddc0-52b8-a1b9-795130e95c6b",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "3fbd090b-a061-5b99-bf0e-a838808b1d11",
                   "codigo": "FC2149",
                   "codigo_externo": 1346
                 },
                 {
                   "id": "66e60b13-9808-57c3-9702-e39568f3586a",
                   "persona_id": "3269c709-9eb1-57d5-9e8d-977ed1c4b90c",
                   "area_id": "2c35db81-c91c-5d56-b179-767fecfd3e7f",
                   "cargo_id": "e5e2cb4f-5ee2-599d-9ff7-34ac6c7fbbd0",
                   "codigo": "FC2162",
                   "codigo_externo": 1359
                 },
                 {
                   "id": "705a3aab-f73f-5dc1-bb3e-1941cf3fbf6b",
                   "persona_id": "fdfc7d75-b0cf-5bf2-807d-808ad788e75a",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "0443cc12-07b0-55d4-a0c0-a3ced85b345a",
                   "codigo": "FC2290",
                   "codigo_externo": 1381
                 },
                 {
                   "id": "0785cd04-e191-5eaf-85da-70e17a471cfd",
                   "persona_id": "7d09517c-958f-5beb-a033-222942636ef8",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "0bb6eb69-84b1-5c61-9751-99f3f2378601",
                   "codigo": "FC2206",
                   "codigo_externo": 1393
                 },
                 {
                   "id": "d47154ce-364b-508d-a362-d1010bc46a45",
                   "persona_id": "87303de9-f439-52e8-9b58-8d364d7b84e5",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "f91f67d7-dfec-5fa9-8ddd-34107902d993",
                   "codigo": "FC2214",
                   "codigo_externo": 1397
                 },
                 {
                   "id": "c4f5407f-99b3-5859-afe7-9d3c7db51562",
                   "persona_id": "aa4790eb-6ff3-561c-9619-e2c2d4848d3e",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "d8eec784-3e1a-54aa-9238-459d7c397a12",
                   "codigo": "FC2427",
                   "codigo_externo": 1399
                 },
                 {
                   "id": "32d9e594-6948-5571-9db8-2b315fb9de75",
                   "persona_id": "a649af5c-7893-502b-b3cf-5bf20ac8e70d",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "cf47dee9-ebd6-5b1d-97b3-d0fd5f4bfcad",
                   "codigo": "FC2215",
                   "codigo_externo": 1400
                 },
                 {
                   "id": "89ac9ad6-4b89-5d75-83e0-eec089012ad7",
                   "persona_id": "1c28ea94-56af-554d-b674-157a601862a1",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "e0b2b1c9-46ee-5da2-8688-edcd8fcfb6e8",
                   "codigo": "FC2674",
                   "codigo_externo": 1405
                 },
                 {
                   "id": "90314d15-9b36-5ff9-a5a1-ffee24cff1c0",
                   "persona_id": "0d0ad089-e179-5d55-b57b-93f71e2a34fb",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "aefef5be-aa76-5e3e-ade0-70b2ce5437af",
                   "codigo": "FC2227",
                   "codigo_externo": 1408
                 },
                 {
                   "id": "11ffc849-dc1b-523e-8d34-23cece63f2d4",
                   "persona_id": "cbc934bd-2f2f-5ad3-89ae-6cf4331b48c0",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "97e9cc73-394d-50d6-94b7-2a61e085ba4e",
                   "codigo": "FC2233",
                   "codigo_externo": 1415
                 },
                 {
                   "id": "59741d10-b456-5851-8436-8feb00e46787",
                   "persona_id": "200eb9bd-eda5-58c0-9ba9-a06726756f46",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "5abcb0e6-f05e-5e6a-9a45-df748a7a1320",
                   "codigo": "FC2673",
                   "codigo_externo": 1416
                 },
                 {
                   "id": "e794e306-f3da-5fc5-b751-ae1d5434e3cf",
                   "persona_id": "2ef90b8e-6ec6-59d3-9509-f5676e7cbac0",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "c01511bb-bd80-594f-8a3a-9a056a7c8ba9",
                   "codigo": "FC2570",
                   "codigo_externo": 1421
                 },
                 {
                   "id": "b260639a-0696-5cf9-909d-adc694f056a2",
                   "persona_id": "718fea85-77d0-5acc-a7a2-540b1aa802ed",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "c01511bb-bd80-594f-8a3a-9a056a7c8ba9",
                   "codigo": "FC2571",
                   "codigo_externo": 1424
                 },
                 {
                   "id": "f3296639-2ebd-5fed-968b-8c2c05972e4b",
                   "persona_id": "31d32815-91dd-593f-90d9-1b22c424e05b",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "fb5767bc-ba6c-5d28-8f57-14af7041074e",
                   "codigo": "FC2496",
                   "codigo_externo": 1437
                 },
                 {
                   "id": "6e3aa560-90cd-5b07-a8fb-bc89ad6c2e52",
                   "persona_id": "8c43bb0e-f351-5a62-9356-cea49a028d1d",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "caa306e4-b257-5e05-9ef3-5197accf0b7c",
                   "codigo": "FC2266",
                   "codigo_externo": 1445
                 },
                 {
                   "id": "6dbd4fc6-1969-5266-9bd3-b39d9f996ac3",
                   "persona_id": "ac3f6a85-c1e4-5ef4-9893-947998b44d16",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "3013ac6d-6d78-51b7-ba77-909b7600f919",
                   "codigo": "FC2267",
                   "codigo_externo": 1446
                 },
                 {
                   "id": "602e3317-94c9-5310-b172-cd156afa9c87",
                   "persona_id": "10de9944-5470-5ac8-9644-95d9d908fd55",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "c1e58158-c98d-5b46-9359-8e342361e0d7",
                   "codigo": "FC2268",
                   "codigo_externo": 1447
                 },
                 {
                   "id": "5bf78f6b-bf97-5a03-b589-cf19141f4b02",
                   "persona_id": "8898914a-79cd-5381-875b-efb8c7880e91",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "cb03ab59-89d1-5075-a05b-b709e2bbb2a8",
                   "codigo": "FC2258",
                   "codigo_externo": 1449
                 },
                 {
                   "id": "a0bc0a0f-2c69-55b7-aa89-72f2476db672",
                   "persona_id": "c68f3fd5-851a-532c-bf54-34b403d7bb95",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "92a36808-b873-5d8d-81c3-7786de64cb92",
                   "codigo": "FC2230",
                   "codigo_externo": 1451
                 },
                 {
                   "id": "cc9bd066-483d-5ba2-965d-9ccec0e8a829",
                   "persona_id": "234ccb9b-1862-53c0-80b3-6047bd6e5cad",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "95f6f771-9301-5304-a186-21ed8e2f40b6",
                   "codigo": "FC2276",
                   "codigo_externo": 1456
                 },
                 {
                   "id": "6b508588-ef52-5ad3-a5ec-847bce96c7ac",
                   "persona_id": "3a1aec62-4101-5e53-ace4-e80be557c26e",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "b506898d-3116-5e51-892a-d36a716b1996",
                   "codigo": "FC2284",
                   "codigo_externo": 1462
                 },
                 {
                   "id": "7c2ea7a7-7df4-5249-98cb-055833c8efe8",
                   "persona_id": "980c6a8b-8b32-5fdc-afd4-157a8b54f757",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "1725c4b4-ac78-5ec6-9736-b0c829842ba7",
                   "codigo": "FC2541",
                   "codigo_externo": 1466
                 },
                 {
                   "id": "675b86de-70ff-5109-8d4c-52a6ecf74354",
                   "persona_id": "fec3e3ee-eaef-515f-a8e7-84617eb7df4c",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "7d1311a3-2244-5636-8a15-5df0deeed8b5",
                   "codigo": "FC2315",
                   "codigo_externo": 1486
                 },
                 {
                   "id": "2ea67d69-5015-5ec8-8880-42f4b76a5890",
                   "persona_id": "27b924f7-c3f4-5381-a502-7f9a4ec54805",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "7a4c09ea-e20a-559f-a488-854a9d2e4158",
                   "codigo": "FC2317",
                   "codigo_externo": 1488
                 },
                 {
                   "id": "3058b04e-2a58-5d2a-bbdd-321bdc1d2597",
                   "persona_id": "a50ba660-968d-516d-bac6-15770b2e17f1",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "68bed6e1-630a-5e31-bd62-a6f05e6d6ede",
                   "codigo": "FC2318",
                   "codigo_externo": 1489
                 },
                 {
                   "id": "4da901ed-6753-5ba0-b771-70d629c69750",
                   "persona_id": "c414e096-f36d-5637-beb5-25b046af37d8",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "5ba1c4b3-be25-55f9-bccb-0f2810d5c814",
                   "codigo": "FC2319",
                   "codigo_externo": 1490
                 },
                 {
                   "id": "9fa30092-47ce-500d-b675-831493971a1b",
                   "persona_id": "a34c438a-47c2-575e-bf5f-490551234b25",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "0bf41751-085b-5866-8a9b-78f600382ca4",
                   "codigo": "FC2333",
                   "codigo_externo": 1496
                 },
                 {
                   "id": "f0819696-ce4d-5b4c-8e89-7c0f8076b1a9",
                   "persona_id": "ddb28903-f646-5027-8a54-890a18cb9348",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "2ac276b2-b3d7-521e-9c2b-d1b731f8885e",
                   "codigo": "FC2334",
                   "codigo_externo": 1498
                 },
                 {
                   "id": "a8a9b20f-7884-5dd3-a51d-a293875c834e",
                   "persona_id": "bb4b7bf8-377a-5a8b-997c-833f91bd82d5",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "6c647bdc-b29e-54b0-bbe2-51854f3b3a0d",
                   "codigo": "FC2353",
                   "codigo_externo": 1527
                 },
                 {
                   "id": "97fe23cc-e11a-57c4-aece-2adb6205e43b",
                   "persona_id": "0708b4a8-f4f1-51fb-bc84-7d6ac784b468",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "a48ea988-ca60-5a76-946f-e0f86a9111d7",
                   "codigo": "FC2461",
                   "codigo_externo": 1550
                 },
                 {
                   "id": "d635e25d-ecb9-51e6-9c79-93d658827179",
                   "persona_id": "10fd55ff-e250-5e7a-bf43-674923923607",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "56ab8007-22df-5d36-aed9-9a8852bef657",
                   "codigo": "FC2501",
                   "codigo_externo": 1581
                 },
                 {
                   "id": "81209852-5d9b-5b37-aca9-76c77c97c249",
                   "persona_id": "8e663167-0f50-573d-ab67-5ed3063c5415",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "dfafde50-92ae-58ce-ae47-a0c33d1a9ad9",
                   "codigo": "FC2464",
                   "codigo_externo": 1584
                 },
                 {
                   "id": "d29b6f60-33ba-51c8-80ae-d74b3431282f",
                   "persona_id": "754f3118-61c7-54df-bf23-81432051cb42",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "67ef8381-b23e-506d-9ee8-7934132f7a5f",
                   "codigo": "FC2467",
                   "codigo_externo": 1586
                 },
                 {
                   "id": "1d248243-1722-5e89-a337-3af2d4e76ad3",
                   "persona_id": "1c4d4b50-dc0d-5378-8370-157f8748962e",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "10622059-dc48-50f7-9e0a-b5b0315305c3",
                   "codigo": "FC2486",
                   "codigo_externo": 1600
                 },
                 {
                   "id": "00717f15-fe09-567e-b373-7b1ace444512",
                   "persona_id": "bb5ccbba-18c9-5c82-a847-a420d9dee2c8",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "912e3818-a932-578e-8f16-b59fbebcc14b",
                   "codigo": "FC2569",
                   "codigo_externo": 1601
                 },
                 {
                   "id": "0af1d6d7-ef3c-5dce-8935-dca9c35472b3",
                   "persona_id": "9332fd33-5856-5501-b10b-53f4f9e5816d",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "be3104b5-7640-55e1-b91f-42058972acba",
                   "codigo": "FC2490",
                   "codigo_externo": 1602
                 },
                 {
                   "id": "d5b9625a-bd22-5a8b-b48d-1ca0850e82fe",
                   "persona_id": "e83a3fbf-2250-55cc-8f64-4d0474f81f25",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "aab9e59b-72d6-5683-9c2f-c6b26d4c6145",
                   "codigo": "FC2499",
                   "codigo_externo": 1606
                 },
                 {
                   "id": "33415209-dd81-542a-a8fd-f15a88ca1023",
                   "persona_id": "bfe3f407-1cc9-556b-ad45-13346e0d798a",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "1b46ef77-5a0c-51a5-81d0-c964cc24ee4e",
                   "codigo": "FC2532",
                   "codigo_externo": 1621
                 },
                 {
                   "id": "f9a91ca9-7bf0-58ea-bb02-61411e4389f6",
                   "persona_id": "e1021d57-7696-5989-a651-c9a24fdeeff2",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "7dc68b72-334a-511f-bdd5-32797c0923fa",
                   "codigo": "FC2537",
                   "codigo_externo": 1623
                 },
                 {
                   "id": "00bae6e7-523d-5f79-85ef-766d8591d080",
                   "persona_id": "429cff14-53b0-52dc-8edb-719a99266366",
                   "area_id": "2c35db81-c91c-5d56-b179-767fecfd3e7f",
                   "cargo_id": "ab0f8ef5-d8ad-5c37-89c5-c2f3ad549adf",
                   "codigo": "FC2579",
                   "codigo_externo": 1625
                 },
                 {
                   "id": "16c88970-9a24-5227-918d-502cf4c1893e",
                   "persona_id": "2ea4a149-83db-54e7-9c30-0c8b40dc1cce",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "1725c4b4-ac78-5ec6-9736-b0c829842ba7",
                   "codigo": "FC2542",
                   "codigo_externo": 1627
                 },
                 {
                   "id": "b28c4037-7089-5412-a030-56833853a10d",
                   "persona_id": "504cc0be-4e31-5c10-957f-c0fee2f68147",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "8311ef4d-973d-5561-a32d-e0f6cd270ca3",
                   "codigo": "FC2545",
                   "codigo_externo": 1629
                 },
                 {
                   "id": "80c2e887-0f7e-5d9c-aa0d-6e6eca8ad47c",
                   "persona_id": "cbaad4a3-c589-5bfa-b50d-cafa11b56a03",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "d1767bf2-64ea-5ccc-bf43-9ef377d86d49",
                   "codigo": "FC2550",
                   "codigo_externo": 1634
                 },
                 {
                   "id": "b5f9d2e1-abe9-5ce6-aec9-07fca1f658eb",
                   "persona_id": "0fecda8a-4a34-5ac5-a569-e6a47e611b0f",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "40bc5d16-b2c0-5386-a5a9-498c29cc5ef2",
                   "codigo": "FC2563",
                   "codigo_externo": 1645
                 },
                 {
                   "id": "0025950f-0eaf-5a64-8a27-cffd6fefd84f",
                   "persona_id": "3db79e81-04a9-542a-8bc4-8273e669e51d",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "1989ff59-72c2-526a-8bf4-a39e40951334",
                   "codigo": "FC2564",
                   "codigo_externo": 1646
                 },
                 {
                   "id": "cad4ff09-78f6-5968-b9ba-57522bc8574a",
                   "persona_id": "f1ae9f15-322d-5ab3-b4b4-121622c70f8b",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "68fbd23e-939a-5e39-843f-d4e6f587c387",
                   "codigo": "FC2575",
                   "codigo_externo": 1652
                 },
                 {
                   "id": "a3112c11-2935-5937-aba2-a3492118d12c",
                   "persona_id": "8313f574-3606-538e-8aa1-7db728a64ceb",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "f71b744e-a9a8-5f84-b51c-d0bc52e6f539",
                   "codigo": "FC2627",
                   "codigo_externo": 1655
                 },
                 {
                   "id": "2e5ab596-2fad-5b6b-8e16-6ae07b53f711",
                   "persona_id": "02950bb0-fbcb-5dd6-9dea-8670de3443a2",
                   "area_id": "2c35db81-c91c-5d56-b179-767fecfd3e7f",
                   "cargo_id": "64946d9d-1362-5903-a5c2-9fff54e9e8e3",
                   "codigo": "FC2632",
                   "codigo_externo": 1658
                 },
                 {
                   "id": "1c29128d-a33d-501f-b091-984d200e41d9",
                   "persona_id": "50758cfc-5c27-5cfd-99a0-934ac1ae266d",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "a90559ac-610b-5c80-80a0-cf82534b90d5",
                   "codigo": "FC2635",
                   "codigo_externo": 1661
                 },
                 {
                   "id": "17563cae-2da0-5209-bafa-49720b78b96c",
                   "persona_id": "7922cb90-69b4-53ec-8cfc-4fdbd61f6cf5",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "c7080d5a-4d01-5519-8b90-ad4e7e5f11fc",
                   "codigo": "FC2637",
                   "codigo_externo": 1663
                 },
                 {
                   "id": "8f1b8fdd-2a2b-5b05-bc2f-8b1227b58bce",
                   "persona_id": "5e98a821-7859-5468-aa9e-022892c51053",
                   "area_id": "2c35db81-c91c-5d56-b179-767fecfd3e7f",
                   "cargo_id": "01b78100-4db3-5675-a843-95e26e6c905e",
                   "codigo": "FC2639",
                   "codigo_externo": 1665
                 },
                 {
                   "id": "32989b7b-4036-5f1b-9191-f336bb45b31e",
                   "persona_id": "47e13a77-847a-55fb-a47e-4113f04237d7",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "5f9d06b8-81ed-5e07-9cdf-67b872fad955",
                   "codigo": "FC2645",
                   "codigo_externo": 1667
                 },
                 {
                   "id": "bd92f4a7-1ce6-57c6-92df-7773f58760a7",
                   "persona_id": "06b2ee4b-4cb4-57ed-ad16-93a0b33feaac",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "af320cf0-bca5-5096-b5b9-31791610f352",
                   "codigo": "FC2642",
                   "codigo_externo": 1668
                 },
                 {
                   "id": "7aaecb2a-c1d8-5e29-b6e5-868b2dd2fa7c",
                   "persona_id": "a963b2a3-223e-51fd-b653-be23d09a59ea",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "23d7bca1-0b3a-5c44-ae3d-5e459eb3b462",
                   "codigo": "FC2643",
                   "codigo_externo": 1669
                 },
                 {
                   "id": "c0b46411-76fe-572f-8990-60ae2dbce5d8",
                   "persona_id": "ac13094b-46c5-5012-b315-9fa385b2fcd1",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "ed0062ea-a3f9-5489-ac66-4a704c163ca8",
                   "codigo": "FC2644",
                   "codigo_externo": 1670
                 },
                 {
                   "id": "6050b310-d7cc-531e-b2dd-8e0bcf5f157a",
                   "persona_id": "4fbb6d0d-4978-5450-a631-64aaa81de8b1",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "aa42168c-a519-589c-bd8b-f54cff9b79a9",
                   "codigo": "FC2640",
                   "codigo_externo": 1671
                 },
                 {
                   "id": "f07a1173-2e10-5056-bc04-d917297b6de2",
                   "persona_id": "81104872-9942-568d-805a-9c846d56244a",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "2046fa90-e255-5785-813c-d4da1aacd317",
                   "codigo": "FC2646",
                   "codigo_externo": 1672
                 },
                 {
                   "id": "b9b71043-7a30-5483-8159-e676ea427413",
                   "persona_id": "f75663bc-114c-5c31-81cd-eb315eeb42ca",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "cfea459a-b5f9-5f52-ab4d-9e5e7fd8dc88",
                   "codigo": "FC2647",
                   "codigo_externo": 1673
                 },
                 {
                   "id": "5092a31d-f88c-5b50-81db-d36c33b9099a",
                   "persona_id": "14c3e8d0-899f-5b34-816c-545167b289e0",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "52810cbb-8a29-5b5b-b9d4-886b72734ec4",
                   "codigo": "FC2651",
                   "codigo_externo": 1675
                 },
                 {
                   "id": "d4ee6474-0c2f-52e6-b675-9298c762393d",
                   "persona_id": "ce135190-853e-5244-ba7f-96f977f830cf",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "8eaa4840-adfa-5e85-a0e5-9b9fb8d6e76e",
                   "codigo": "FC2652",
                   "codigo_externo": 1678
                 },
                 {
                   "id": "7e07cea2-05f9-5422-86ee-d9440b12aa4c",
                   "persona_id": "c5885544-67ba-5068-84ec-438172ae1eaa",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "822a4e16-7bac-5924-9b7c-ab59f7e7b6b0",
                   "codigo": "FC2654",
                   "codigo_externo": 1679
                 },
                 {
                   "id": "05f068da-6369-5293-a239-51bdeb48374b",
                   "persona_id": "857449bf-e377-5a7c-aa36-25bfe930fb6c",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "78b6fdc6-7247-5d98-9353-753996951023",
                   "codigo": "FC2655",
                   "codigo_externo": 1680
                 },
                 {
                   "id": "328c0001-957e-5d8d-b2a8-5c97aab5bff1",
                   "persona_id": "a9d4825a-dc85-5322-8d09-3bbf7a9a06fc",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "9c9188a6-6395-55db-84be-4f4310bb83af",
                   "codigo": "FC2657",
                   "codigo_externo": 1682
                 },
                 {
                   "id": "4f1f62c6-646c-5bc0-8143-24c130355867",
                   "persona_id": "c692762f-a263-5e71-81d4-221f1c8394c1",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "9778de2d-4ba2-5095-a534-75d1413c57c1",
                   "codigo": "FC2659",
                   "codigo_externo": 1683
                 },
                 {
                   "id": "72bc60aa-b127-5553-b97b-2b15bfeca652",
                   "persona_id": "365a7cad-4d5a-5e4e-9fda-b6ac00412470",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "8eaa4840-adfa-5e85-a0e5-9b9fb8d6e76e",
                   "codigo": "FC2658",
                   "codigo_externo": 1684
                 },
                 {
                   "id": "65fee593-ee9f-5ee3-8e4e-354b17239817",
                   "persona_id": "e6058800-9628-5212-83a0-6ce51b3a2550",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "7cf801a9-398b-5b36-bc6e-e6d776184f07",
                   "codigo": "FC2661",
                   "codigo_externo": 1686
                 },
                 {
                   "id": "6512da12-cac4-5986-9b51-0b4f6a193803",
                   "persona_id": "c5fcd5ad-58df-534e-82a7-4deeb34ae8a7",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "85bc50e4-18e7-5b6c-b6db-27ba0a6e68a5",
                   "codigo": "FC2662",
                   "codigo_externo": 1687
                 },
                 {
                   "id": "03acb9d0-9c9a-57ae-829b-05ce53ee12d6",
                   "persona_id": "f21f0476-bd54-5b80-a7c9-92f960c1dce5",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "0565ce34-826c-580b-8527-8eb3bde2b164",
                   "codigo": "FC2664",
                   "codigo_externo": 1689
                 },
                 {
                   "id": "c3442650-91e1-5552-8feb-246b4de5d667",
                   "persona_id": "ff350913-b90f-5f0c-ac85-50660645566a",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "e0f23e49-e128-57c3-8ad3-fcc3f9b7f69a",
                   "codigo": "FC2665",
                   "codigo_externo": 1690
                 },
                 {
                   "id": "c6d323d0-4cbe-5577-923b-6ce8f34ae0e9",
                   "persona_id": "ae631dba-4b95-5b70-aca6-70db901c69d3",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "78bb3d73-d2b0-5576-9552-8dbedaa02a3c",
                   "codigo": "FC2666",
                   "codigo_externo": 1691
                 },
                 {
                   "id": "2e9e7a61-2ce0-5c62-b828-930bfbb4e647",
                   "persona_id": "a6d430f6-3df2-5ee0-a444-c9d77d57a3fc",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "cc98fea1-2e80-53aa-b67d-935ac7e23e51",
                   "codigo": "FC2667",
                   "codigo_externo": 1692
                 },
                 {
                   "id": "9a51a20f-4b65-570d-a8fd-90e66494f657",
                   "persona_id": "d2965004-36a9-5721-8ca2-1c8e844e0813",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "301bd535-20c0-5c74-aadc-ec15bd2a8956",
                   "codigo": "FC2670",
                   "codigo_externo": 1694
                 },
                 {
                   "id": "9b280263-ac84-5fac-b20b-cbdc8f5c6684",
                   "persona_id": "32393063-cc1c-5691-b5e1-612600a7c9cf",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "bb0c8298-a4da-5908-8be2-8d3afc46bc06",
                   "codigo": "FC2672",
                   "codigo_externo": 1696
                 },
                 {
                   "id": "10646938-c0df-50b4-85bc-8909e8a1d3a5",
                   "persona_id": "919a745f-bc7e-51fe-8526-9888dd56e7a2",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "3f8f9d9c-3fe9-520a-a10b-ab4c71720595",
                   "codigo": "FC2671",
                   "codigo_externo": 1697
                 },
                 {
                   "id": "9bb73bd1-b041-5de6-8e0a-a19aab780f33",
                   "persona_id": "2e4d21ad-93d1-5bc8-a2c2-eb9128014a18",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "700a34ad-d3a9-520b-8ff1-07a2676318f0",
                   "codigo": "FC2676",
                   "codigo_externo": 1700
                 },
                 {
                   "id": "9afce3a7-a0da-599b-9290-cd06e65198aa",
                   "persona_id": "89f9cb41-e8dc-5028-ba70-16315b6aa566",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "b364cf1a-05f7-5cff-9ae2-d11ba9409b33",
                   "codigo": "FC2675",
                   "codigo_externo": 1701
                 },
                 {
                   "id": "ed9d32ae-6ade-5b3b-a19b-9ca83a4f61d5",
                   "persona_id": "5e435ac3-df27-5c1c-a9e3-37f1cbbaf11b",
                   "area_id": "7a0ca126-2579-5c36-8096-a91da2c8c3ef",
                   "cargo_id": "f6eabdbf-9dfb-5989-b0e0-9d406128bae0",
                   "codigo": "FC2677",
                   "codigo_externo": 1702
                 },
                 {
                   "id": "de8035f8-e278-53f5-b91c-dc7ae039fb63",
                   "persona_id": "e777fb69-7dc9-5058-af19-85b910d62897",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "9d8b3788-0b50-5745-9e29-e544d9d3dc6e",
                   "codigo": "FC2683",
                   "codigo_externo": 1704
                 },
                 {
                   "id": "daa445ee-0ec5-5225-8077-dc80880e8012",
                   "persona_id": "ab3062b8-b69e-59fd-83a5-764b4e377011",
                   "area_id": "2c35db81-c91c-5d56-b179-767fecfd3e7f",
                   "cargo_id": "8acad1e1-bcba-5bc7-8f5e-47bebd77244c",
                   "codigo": "FC2686",
                   "codigo_externo": 1707
                 },
                 {
                   "id": "f364c176-01cc-57bb-80e7-cc22d7aebf71",
                   "persona_id": "51d16db3-c46d-54ea-9a7b-8191ea037b89",
                   "area_id": "2c35db81-c91c-5d56-b179-767fecfd3e7f",
                   "cargo_id": "1c1a30cb-3325-5e56-9294-11aa4bf479dc",
                   "codigo": "FC2687",
                   "codigo_externo": 1708
                 },
                 {
                   "id": "57f06921-0d9f-57d8-b521-a363c7dfb3f9",
                   "persona_id": "0e4fda5b-603c-59b0-b002-91814b94887b",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "f73ab325-3de6-526d-9346-4396dbd47d41",
                   "codigo": "FC2681",
                   "codigo_externo": 1711
                 },
                 {
                   "id": "9b3e7af0-c3a7-5d17-a6d0-3e2d96265c40",
                   "persona_id": "3b79524c-4e0d-5aee-b691-ca525f7e46b1",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "04ee6971-0735-598b-9c34-5aa09de56507",
                   "codigo": "FC2688",
                   "codigo_externo": 1713
                 },
                 {
                   "id": "52dc08ed-8035-50ce-aaf7-7c8be0d91947",
                   "persona_id": "9e278741-1ee2-5c5d-a843-8d205d8fc439",
                   "area_id": "2c35db81-c91c-5d56-b179-767fecfd3e7f",
                   "cargo_id": "4e36b2d5-3d33-5a1b-bf58-6fbe5ce81db0",
                   "codigo": "FC2689",
                   "codigo_externo": 1714
                 },
                 {
                   "id": "80e05d8c-3627-511f-9cca-fc4785086f5f",
                   "persona_id": "4e74c269-9d14-51e2-9f10-16b7937d9031",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "59c2ec9c-ad14-5185-8f63-e362a879bc73",
                   "codigo": "FC2690",
                   "codigo_externo": 1715
                 },
                 {
                   "id": "8ed06837-8e5d-515c-8af2-810e96401638",
                   "persona_id": "69f7d783-0908-5802-9046-cdc1f9d62add",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "eeb440b0-bbdc-5b6f-acc4-27eba66804d2",
                   "codigo": "FC2691",
                   "codigo_externo": 1716
                 },
                 {
                   "id": "2aef9413-113d-5156-8ceb-bb4034b11b7c",
                   "persona_id": "3eaccad2-5f48-5632-8da6-3e4cbc94c62c",
                   "area_id": "e5640af1-54c1-5269-9887-0503522bbd26",
                   "cargo_id": "adf576a8-ef9d-59a1-9d6e-8262b5ced224",
                   "codigo": "FC2692",
                   "codigo_externo": 1717
                 },
                 {
                   "id": "12bde49b-5f75-5ae7-a180-3e2907bcae4d",
                   "persona_id": "817fd8b1-7944-54eb-8838-a36bd613bdc7",
                   "area_id": "6d0ee358-db0d-543e-87cf-88790efe3ea6",
                   "cargo_id": "f66ed77d-5e12-56e7-a281-fee9e5a2f37a",
                   "codigo": "FC2693",
                   "codigo_externo": 1718
                 },
                 {
                   "id": "90b7b49a-5149-50b3-8a0b-05da1ebc1d50",
                   "persona_id": "7cd35a8d-ed8c-584d-82cf-78d42dc0c144",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "349907f0-88f3-583d-8e22-19c7d847f354",
                   "codigo": "FC2694",
                   "codigo_externo": 1719
                 },
                 {
                   "id": "ef4210bf-aed7-57bf-8b32-d36940718af9",
                   "persona_id": "9c566809-1012-577d-a667-7d223a48988c",
                   "area_id": "b78877eb-0356-57ee-b233-0826d6d01cd3",
                   "cargo_id": "7ad7dfd6-413b-5a85-a37f-93c133772c19",
                   "codigo": "FC2695",
                   "codigo_externo": 1720
                 }
               ]$json$::jsonb)
                        AS x(id uuid, persona_id uuid, area_id uuid, cargo_id uuid, codigo varchar(50),
                             codigo_externo varchar(100)))
INSERT
INTO organizacion.empleados (id, persona_id, area_id, cargo_id, codigo, fecha_inicio, fecha_fin, sistema_origen, codigo_externo,
                             activo, created_at, updated_at, created_by, updated_by)
SELECT id,
       persona_id,
       area_id,
       cargo_id,
       codigo,
       NULL,
       NULL,
       'Result_2.xlsx',
       codigo_externo,
       TRUE,
       NOW(),
       NULL,
       'migracion_excel',
       NULL
FROM datos;
