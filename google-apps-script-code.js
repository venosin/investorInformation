/**
 * @fileoverview Script seguro para recibir datos de formulario y guardarlos en Google Sheets
 * Implementa múltiples capas de seguridad para proteger contra accesos no autorizados
 */

// Configuraciones - Ajustar según necesidades
const CONFIG = {
  // ID de tu hoja de Google Sheets - REEMPLAZAR con tu ID real
  SPREADSHEET_ID: '',
  
  // Nombre de la hoja dentro del documento
  SHEET_NAME: 'Inversionistas',
  
  // Dominios autorizados para hacer peticiones (añade tu dominio real en producción)
  ALLOWED_ORIGINS: [
    'https://tu-sitio-en-produccion.com',
    'https://www.tu-sitio-en-produccion.com',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  
  // Token secreto que debe coincidir con el enviado desde tu aplicación
  // IMPORTANTE: Este debe ser EXACTAMENTE el mismo valor que VITE_APP_SECRET_TOKEN en tu .env
  SECRET_TOKEN: '',
  
  // Límite de peticiones por IP en un periodo (1 hora)
  RATE_LIMIT: {
    MAX_REQUESTS: 10,       // Número máximo de solicitudes
    WINDOW_SECONDS: 3600,   // Periodo de tiempo en segundos (1 hora)
  },
  
  // Configuración para logs
  LOGGING: {
    ENABLED: true,          // Activar/desactivar logs
    SHEET_NAME: 'Logs',     // Nombre de la hoja para logs
  }
};

/**
 * Manejador para solicitudes OPTIONS (preflight CORS)
 * Esto es necesario para responder correctamente a las verificaciones CORS
 */
function doOptions(e) {
  // Obtener el origen de la solicitud
  var origin = e.parameter.origin || (e.headers && e.headers['Origin']);
  
  // Si el origen no está entre los permitidos, usar un valor genérico
  // Esto previene revelar dominios permitidos a orígenes no autorizados
  if (!CONFIG.ALLOWED_ORIGINS.includes(origin)) {
    origin = 'https://example.com';
  }
  
  // Configurar los encabezados CORS
  var headers = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true'
  };
  
  // Devolver respuesta vacía con los encabezados correctos
  return ContentService.createTextOutput()
    .setMimeType(ContentService.MimeType.JSON)
    .setContent(JSON.stringify({"status": "success"}))
    .setHeaders(headers);
}

/**
 * Función principal para manejar solicitudes POST
 * Recibe los datos del formulario y los guarda en la hoja de cálculo
 */
function doPost(e) {
  // Adquirir un bloqueo para evitar ejecuciones concurrentes (protección contra ataques DoS)
  var lock = LockService.getScriptLock();
  var success = lock.tryLock(10000); // Intenta adquirir bloqueo por 10 segundos
  
  if (!success) {
    return createErrorResponse("Demasiadas solicitudes simultáneas. Inténtalo de nuevo en unos momentos.");
  }
  
  // Variables para rastreo
  var logSheet;
  var requestId = Utilities.getUuid();
  
  try {
    // 1. Obtener y preparar hoja de logs si está habilitado
    if (CONFIG.LOGGING.ENABLED) {
      var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      logSheet = ss.getSheetByName(CONFIG.LOGGING.SHEET_NAME);
      
      if (!logSheet) {
        logSheet = ss.insertSheet(CONFIG.LOGGING.SHEET_NAME);
        logSheet.appendRow(['Timestamp', 'RequestID', 'IP', 'Origen', 'Evento', 'Detalles']);
      }
      
      // Registrar inicio de solicitud
      logEvent(logSheet, requestId, e, 'Solicitud recibida', 'Inicio procesamiento');
    }
    
    // 2. Validar origen (CORS)
    var origin = e.parameter.origin || (e.headers && e.headers['Origin']);
    if (!CONFIG.ALLOWED_ORIGINS.includes(origin)) {
      logEvent(logSheet, requestId, e, 'Acceso denegado', 'Origen no permitido: ' + origin);
      return createErrorResponse("Origen no autorizado", origin);
    }
    
    // 3. Verificar límite de tasa de peticiones
    var cache = CacheService.getScriptCache();
    var clientId = getClientIdentifier(e);
    var requestCount = cache.get(clientId);
    
    if (requestCount !== null && parseInt(requestCount) >= CONFIG.RATE_LIMIT.MAX_REQUESTS) {
      logEvent(logSheet, requestId, e, 'Límite excedido', 'Cliente: ' + clientId + ', Solicitudes: ' + requestCount);
      return createErrorResponse("Límite de solicitudes excedido. Inténtalo más tarde.");
    }
    
    // Incrementar contador de peticiones
    cache.put(clientId, requestCount === null ? 1 : parseInt(requestCount) + 1, CONFIG.RATE_LIMIT.WINDOW_SECONDS);
    
    // 4. Obtener y validar los datos enviados
    var jsonData;
    var rawData = '';
    
    if (e.parameter.formData) {
      rawData = e.parameter.formData;
      jsonData = JSON.parse(e.parameter.formData);
      logEvent(logSheet, requestId, e, 'Datos recibidos', 'Vía parameter.formData');
    } else if (e.postData && e.postData.contents) {
      rawData = e.postData.contents;
      jsonData = JSON.parse(e.postData.contents);
      logEvent(logSheet, requestId, e, 'Datos recibidos', 'Vía postData.contents');
    } else {
      logEvent(logSheet, requestId, e, 'ERROR', 'No se recibieron datos');
      return createErrorResponse("No se recibieron datos");
    }
    
    // 5. Verificar token secreto
    if (jsonData.secretToken !== CONFIG.SECRET_TOKEN) {
      logEvent(logSheet, requestId, e, 'Acceso denegado', 'Token inválido');
      return createErrorResponse("Token inválido, acceso denegado");
    }
    
    // Eliminar el token secreto antes de procesar los datos (por seguridad)
    delete jsonData.secretToken;
    
    // 6. Abrir la hoja de cálculo y verificar/crear la hoja si es necesario
    var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    
    if (!sheet) {
      logEvent(logSheet, requestId, e, 'Creando hoja', 'La hoja ' + CONFIG.SHEET_NAME + ' no existía');
      sheet = ss.insertSheet(CONFIG.SHEET_NAME);
      
      // Agregar encabezados
      sheet.appendRow([
        'Fecha', 'Nombre Completo', 'DUI', 'Teléfono', 'Email', 'Banco', 
        'Número de Cuenta', 'Tipo de Cuenta', 'Beneficiario 1', 
        'Teléfono Beneficiario 1', 'Instagram Beneficiario 1', 
        'Beneficiario 2', 'Teléfono Beneficiario 2', 'Instagram Beneficiario 2', 
        'Monto de Inversión', 'Comentarios'
      ]);
    }
    
    // 7. Preparar y validar los datos
    // Sanitizar datos y evitar posibles inyecciones
    var sanitizedData = sanitizeFormData(jsonData);
    
    // Preparar el banco para el registro
    var bankName = sanitizedData.bankName === 'Otro' ? sanitizedData.customBank : sanitizedData.bankName;
    
    // Preparar la fila de datos para insertar
    var rowData = [
      new Date().toLocaleString(),          // Fecha
      sanitizedData.fullName || '',         // Nombre Completo
      sanitizedData.duiNumber || '',        // DUI
      sanitizedData.phoneNumber || '',      // Teléfono
      sanitizedData.email || '',            // Email
      bankName || '',                       // Banco
      sanitizedData.accountNumber || '',    // Número de Cuenta
      sanitizedData.accountType || '',      // Tipo de Cuenta
      sanitizedData.beneficiary1Name || '', // Beneficiario 1
      sanitizedData.beneficiary1Phone || '',// Teléfono Beneficiario 1
      sanitizedData.beneficiary1Instagram || '', // Instagram Beneficiario 1
      sanitizedData.beneficiary2Name || '', // Beneficiario 2
      sanitizedData.beneficiary2Phone || '',// Teléfono Beneficiario 2
      sanitizedData.beneficiary2Instagram || '', // Instagram Beneficiario 2
      sanitizedData.investmentAmount || '', // Monto de Inversión
      sanitizedData.comments || ''          // Comentarios
    ];
    
    // 8. Agregar datos a la hoja
    logEvent(logSheet, requestId, e, 'Agregando datos', 'Intentando appendRow');
    sheet.appendRow(rowData);
    logEvent(logSheet, requestId, e, 'ÉXITO', 'Datos guardados correctamente');
    
    // 9. Retornar respuesta exitosa
    var successHtml = '<html><head><title>Datos recibidos</title></head><body>' +
      '<h1 style="color: green; font-family: Arial;">¡Datos guardados exitosamente!</h1>' +
      '<p>Los datos han sido guardados en Google Sheets. Puedes cerrar esta ventana.</p>' +
      '</body></html>';
    
    return HtmlService.createHtmlOutput(successHtml);
    
  } catch (error) {
    // Registrar el error
    if (CONFIG.LOGGING.ENABLED && logSheet) {
      logEvent(logSheet, requestId, e, 'ERROR', error.message);
    }
    
    // HTML para mostrar un error
    var errorHtml = '<html><head><title>Error</title></head><body>' +
      '<h1 style="color: red; font-family: Arial;">Error al guardar datos</h1>' +
      '<p>Error: ' + error.message + '</p>' +
      '</body></html>';
    
    return HtmlService.createHtmlOutput(errorHtml);
    
  } finally {
    // Siempre liberar el bloqueo
    lock.releaseLock();
  }
}

/**
 * Registra un evento en la hoja de logs
 */
function logEvent(logSheet, requestId, e, event, details) {
  if (!CONFIG.LOGGING.ENABLED || !logSheet) return;
  
  try {
    var clientInfo = getClientIdentifier(e);
    var origin = e.parameter.origin || (e.headers && e.headers['Origin']) || 'unknown';
    
    logSheet.appendRow([
      new Date().toLocaleString(),
      requestId,
      clientInfo,
      origin,
      event,
      details
    ]);
  } catch (err) {
    // Silenciar errores de logging para evitar interrupciones
    console.error('Error al registrar evento:', err);
  }
}

/**
 * Obtiene un identificador único para el cliente
 */
function getClientIdentifier(e) {
  // Intenta obtener algún identificador del cliente
  var ip = e.parameter.userIP || 'unknown';
  var userAgent = (e.headers && e.headers['User-Agent']) || 'unknown';
  
  // Combina información para un identificador más robusto
  // pero evita guardar información personal completa
  return Utilities.computeDigest(
    Utilities.DigestAlgorithm.MD5,
    ip + '_' + userAgent.substring(0, 20)
  ).toString();
}

/**
 * Sanitiza los datos del formulario para prevenir inyecciones
 */
function sanitizeFormData(formData) {
  var sanitized = {};
  
  // Función para sanitizar un string
  function sanitizeString(str) {
    if (typeof str !== 'string') return str;
    // Eliminar caracteres potencialmente peligrosos
    return str.replace(/[<>]/g, '');
  }
  
  // Sanitizar cada campo
  Object.keys(formData).forEach(key => {
    if (typeof formData[key] === 'string') {
      sanitized[key] = sanitizeString(formData[key]);
    } else {
      sanitized[key] = formData[key];
    }
  });
  
  return sanitized;
}

/**
 * Crea una respuesta de error estándar
 */
function createErrorResponse(message, origin) {
  var response = ContentService.createTextOutput(JSON.stringify({
    success: false,
    message: message
  })).setMimeType(ContentService.MimeType.JSON);
  
  // Agregar encabezados CORS si se especifica un origen
  if (origin && CONFIG.ALLOWED_ORIGINS.includes(origin)) {
    response.setHeaders({
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
  }
  
  return response;
}
