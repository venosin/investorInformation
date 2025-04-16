/**
 * @fileoverview Script seguro para recibir datos de formulario y guardarlos en Google Sheets
 * Implementa múltiples capas de seguridad para proteger contra accesos no autorizados
 */

// Configuraciones - Ajustar según necesidades
const CONFIG = {
  // ID de tu hoja de Google Sheets - REEMPLAZAR con tu ID real
  SPREADSHEET_ID: '1UxKok04IsK1NaNCO5Ef16FJIn0KhGKgYmZ6AguZrTas',
  
  // ID de la carpeta raíz en Drive para almacenar imágenes - DEJAR EN BLANCO para crear automáticamente
  ROOT_FOLDER_ID: '', // Ejemplo: '1ABCdefGHIjkLMnopQRSTUvwxYZ12345'
  
  // Nombre de la hoja dentro del documento
  SHEET_NAME: 'Inversionistas',
  
  // Dominios autorizados para hacer peticiones
  ALLOWED_ORIGINS: [
    'http://localhost:5173', // Esta es tu URL local actual
    'http://127.0.0.1:5173', // Alias alternativo para localhost
    // Líneas comentadas hasta tener un dominio real
    // 'https://tu-sitio-en-produccion.com',
    // 'https://www.tu-sitio-en-produccion.com',
  ],
  
  // Token secreto que debe coincidir con el enviado desde tu aplicación
  SECRET_TOKEN: 'a5f9e2c7d3b8h6j4k1m0p9r2s5t7v3x6z8',
  
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
 * Función de diagnóstico para probar la funcionalidad de Drive
 * Esta función se puede ejecutar directamente desde el editor
 */
function testDrivePermissions() {
  try {
    // Intenta crear una carpeta de prueba
    var folder = DriveApp.createFolder("Prueba_Permisos_" + new Date().getTime());
    
    // Escribir un archivo de texto simple
    var file = folder.createFile('prueba.txt', 'Esto es una prueba', MimeType.PLAIN_TEXT);
    
    // Obtener la URL
    var url = file.getUrl();
    
    // Devuelve mensaje de éxito
    Logger.log("¡ÉXITO! Tienes permisos de Google Drive. URL del archivo: " + url);
    return "Permisos correctos. URL del archivo: " + url;
  } catch (e) {
    // Si falla, muestra el error
    Logger.log("ERROR: No tienes permisos suficientes: " + e.message);
    return "Error de permisos: " + e.message;
  }
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
    // Temporalmente desactivar verificación de origen para desarrollo
    var origin = e.parameter.origin || (e.headers && e.headers['Origin']) || 'unknown';
    logEvent(logSheet, requestId, e, 'Desarrollo', 'Verificación de origen desactivada. Origen detectado: ' + origin);
    // TEMP: Comentado para desarrollo
    // if (!CONFIG.ALLOWED_ORIGINS.includes(origin)) {
    //   logEvent(logSheet, requestId, e, 'Acceso denegado', 'Origen no permitido: ' + origin);
    //   return createErrorResponse("Origen no autorizado", origin);
    // }
    
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
    
    // LOG DETALLADO: Verificar si las imágenes están llegando
    logEvent(logSheet, requestId, e, 'DEBUG', 'DUI Frontal presente: ' + (sanitizedData.duiFrontPhotoPreview ? 'SÍ' : 'NO'));
    logEvent(logSheet, requestId, e, 'DEBUG', 'DUI Reverso presente: ' + (sanitizedData.duiBackPhotoPreview ? 'SÍ' : 'NO'));
    logEvent(logSheet, requestId, e, 'DEBUG', 'Comprobante presente: ' + (sanitizedData.paymentReceiptPhotoPreview ? 'SÍ' : 'NO'));
    
    // Preparar el banco para el registro
    var bankName = sanitizedData.bankName === 'Otro' ? sanitizedData.customBank : sanitizedData.bankName;
    
    // Generar ID único para este inversionista
    var investorId = Utilities.getUuid();
    
    // Procesar y guardar las imágenes en Drive y obtener URLs
    var duiFrontImageInfo = {};
    var duiBackImageInfo = {};
    var paymentReceiptImageInfo = {};
    
    try {
      // Log adicional para depuración
      logEvent(logSheet, requestId, e, 'DEBUG-IMG', 'Comenzando procesamiento de imágenes...');
      
      // Forzar creación de carpeta raíz para probar
      let testFolder = getOrCreateFolder('Inversionistas - Documentos Seguros');
      logEvent(logSheet, requestId, e, 'DEBUG-IMG', 'Carpeta raíz ID: ' + testFolder.getId());
      
      // Procesar imagen frontal del DUI
      if (sanitizedData.duiFrontPhotoPreview) {
        // Log para verificar contenido
        logEvent(logSheet, requestId, e, 'DEBUG-IMG', 'Longitud de datos DUI Frontal: ' + sanitizedData.duiFrontPhotoPreview.length);
        // Verificar si el formato es correcto
        logEvent(logSheet, requestId, e, 'DEBUG-IMG', 'Formato correcto DUI Frontal: ' + (sanitizedData.duiFrontPhotoPreview.indexOf('data:image/') === 0 ? 'SÍ' : 'NO'));
        duiFrontImageInfo = secureImageStorage(
          sanitizedData.duiFrontPhotoPreview,
          `DUI_Frontal_${sanitizedData.fullName || 'Inversionista'}.jpg`,
          investorId,
          sanitizedData.fullName || ''
        );
        logEvent(logSheet, requestId, e, 'Imagen guardada', 'DUI Frontal guardado en Drive: ' + duiFrontImageInfo.url);
      } else {
        logEvent(logSheet, requestId, e, 'DEBUG-IMG', 'No se encontró imagen frontal del DUI');
      }
      
      // Procesar imagen trasera del DUI
      if (sanitizedData.duiBackPhotoPreview) {
        duiBackImageInfo = secureImageStorage(
          sanitizedData.duiBackPhotoPreview,
          `DUI_Reverso_${sanitizedData.fullName || 'Inversionista'}.jpg`,
          investorId,
          sanitizedData.fullName || ''
        );
        logEvent(logSheet, requestId, e, 'Imagen guardada', 'DUI Reverso guardado en Drive');
      }
      
      // Procesar imagen del comprobante de pago
      if (sanitizedData.paymentReceiptPhotoPreview) {
        paymentReceiptImageInfo = secureImageStorage(
          sanitizedData.paymentReceiptPhotoPreview,
          `Comprobante_Pago_${sanitizedData.fullName || 'Inversionista'}.jpg`,
          investorId,
          sanitizedData.fullName || ''
        );
        logEvent(logSheet, requestId, e, 'Imagen guardada', 'Comprobante de pago guardado en Drive');
      }
    } catch (imgError) {
      logEvent(logSheet, requestId, e, 'ERROR', 'Error al procesar imágenes: ' + imgError.message);
      console.error('Error al procesar imágenes:', imgError);
    }
    
    // Crear fórmulas para mostrar las imágenes en las celdas
    var duiFrontImageFormula = duiFrontImageInfo.url ? 
      `=HYPERLINK("${duiFrontImageInfo.url}", "Ver DUI Frontal")` : '';
    
    var duiBackImageFormula = duiBackImageInfo.url ? 
      `=HYPERLINK("${duiBackImageInfo.url}", "Ver DUI Reverso")` : '';
    
    var paymentReceiptImageFormula = paymentReceiptImageInfo.url ? 
      `=HYPERLINK("${paymentReceiptImageInfo.url}", "Ver Comprobante")` : '';
    
    // Crear datos para la fila
    var rowData = [
      new Date().toLocaleString(),          // Fecha
      investorId,                           // ID Inversionista
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
      sanitizedData.comments || '',         // Comentarios
      duiFrontImageFormula,                 // Enlace a imagen DUI Frontal
      duiBackImageFormula,                  // Enlace a imagen DUI Reverso
      paymentReceiptImageFormula            // Enlace a imagen Comprobante de Pago
    ];
    
    // 8. Agregar datos a la hoja
    logEvent(logSheet, requestId, e, 'Agregando datos', 'Intentando appendRow');
    sheet.appendRow(rowData);
    logEvent(logSheet, requestId, e, 'ÉXITO', 'Datos guardados correctamente');
    
    // 9. Retornar respuesta exitosa
    // Crear HTML más informativo para el usuario
    var successHtml = '<html><head><title>Datos recibidos</title>' +
      '<style>body{font-family:Arial,sans-serif; line-height:1.6; max-width:800px; margin:0 auto; padding:20px}' +
      'h1{color:green} .info{background:#e9f7ef; padding:15px; border-radius:5px; margin:15px 0}' +
      '.path{color:#1a5276; font-family:monospace; background:#eaecee; padding:3px 6px; border-radius:3px}' +
      '</style></head><body>' +
      '<h1>¡Datos guardados exitosamente!</h1>' +
      '<p>Los datos han sido guardados en Google Sheets.</p>' +
      
      '<div class="info">' +
      '<h3>Información de depuración:</h3>' +
      '<p><strong>Imágenes guardadas:</strong></p>' +
      '<ul>' +
      (duiFrontImageInfo.url ? '<li>DUI Frontal: <a href="' + duiFrontImageInfo.url + '" target="_blank">Ver imagen</a></li>' : '<li>DUI Frontal: No guardado</li>') +
      (duiBackImageInfo.url ? '<li>DUI Reverso: <a href="' + duiBackImageInfo.url + '" target="_blank">Ver imagen</a></li>' : '<li>DUI Reverso: No guardado</li>') +
      (paymentReceiptImageInfo.url ? '<li>Comprobante: <a href="' + paymentReceiptImageInfo.url + '" target="_blank">Ver imagen</a></li>' : '<li>Comprobante: No guardado</li>') +
      '</ul>' +
      
      '<p><strong>Carpeta en Google Drive:</strong></p>' +
      '<p>Puedes encontrar las imágenes en tu Google Drive, en la siguiente ruta:</p>' +
      '<p class="path">Mi unidad → Inversionistas - Documentos Seguros</p>' +
      '</div>' +
      
      '<p>Puedes cerrar esta ventana.</p>' +
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
      'Access-Control-Allow-Origin': '*', // Permitir cualquier origen temporalmente luego dejar origin
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
  }
  
  return response;
}

/**
 * Valida si una cadena base64 contiene una imagen válida
 * @param {string} base64String - Cadena en formato base64 para validar
 * @return {boolean} True si es una imagen válida
 */
function validateImageContent(base64String) {
  if (!base64String) {
    console.error('validateImageContent: String es null o undefined');
    return false;
  }
  
  if (typeof base64String !== 'string') {
    console.error('validateImageContent: No es un string, es: ' + typeof base64String);
    return false;
  }
  
  // Verifica el formato básico de base64 de imágenes
  if (base64String.startsWith('data:image/')) {
    console.log('validateImageContent: Formato correcto con prefijo data:image/');
    return true;
  } else if (/^[A-Za-z0-9+/=]+$/.test(base64String)) {
    console.log('validateImageContent: Formato base64 sin prefijo');
    return true;
  }
  
  // Para depuración
  if (base64String.length > 50) {
    console.error('validateImageContent: Formato inválido, primeros 50 caracteres: ' + base64String.substring(0, 50));
  } else {
    console.error('validateImageContent: Formato inválido: ' + base64String);
  }
  
  return false;
}

/**
 * Obtiene o crea una carpeta en Drive
 * @param {string} folderName - Nombre de la carpeta a obtener o crear
 * @param {string} parentFolderId - ID de la carpeta padre (opcional)
 * @return {Folder} Objeto carpeta de Drive
 */
function getOrCreateFolder(folderName, parentFolderId) {
  let parent;
  
  // Si se proporciona un ID de carpeta padre, usarlo
  if (parentFolderId) {
    try {
      parent = DriveApp.getFolderById(parentFolderId);
    } catch (e) {
      parent = DriveApp.getRootFolder();
    }
  } else {
    parent = DriveApp.getRootFolder();
  }
  
  // Buscar si la carpeta ya existe
  let folderIterator = parent.getFoldersByName(folderName);
  if (folderIterator.hasNext()) {
    return folderIterator.next();
  }
  
  // Si no existe, crear nueva carpeta
  return parent.createFolder(folderName);
}

/**
 * Obtiene o crea una subcarpeta dentro de otra carpeta
 * @param {Folder} parentFolder - Carpeta padre
 * @param {string} folderName - Nombre de la subcarpeta
 * @return {Folder} Objeto subcarpeta de Drive
 */
function getOrCreateSubfolder(parentFolder, folderName) {
  // Buscar si la subcarpeta ya existe
  let folderIterator = parentFolder.getFoldersByName(folderName);
  if (folderIterator.hasNext()) {
    return folderIterator.next();
  }
  
  // Si no existe, crear nueva subcarpeta
  return parentFolder.createFolder(folderName);
}

/**
 * Determina el tipo MIME basado en la cadena Base64
 * @param {string} base64String - Cadena en formato Base64
 * @return {string} Tipo MIME
 */
function getMimeType(base64String) {
  // Extraer la información del tipo MIME si está presente
  if (base64String.indexOf('data:') === 0) {
    var matches = base64String.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    if (matches && matches.length > 1) {
      return matches[1];
    }
  }
  
  // Por defecto, asumir JPEG si no se puede determinar
  return 'image/jpeg';
}

/**
 * Registra un evento de seguridad
 * @param {string} action - Tipo de acción (UPLOAD, ACCESS, etc)
 * @param {string} investorId - ID del inversionista
 * @param {string} fileId - ID del archivo
 * @param {string} details - Detalles adicionales
 */
function logSecurityEvent(action, investorId, fileId, details) {
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    var securityLogSheet = ss.getSheetByName('SecurityLog');
    
    if (!securityLogSheet) {
      securityLogSheet = ss.insertSheet('SecurityLog');
      securityLogSheet.appendRow(['Timestamp', 'Action', 'InvestorId', 'FileId', 'Details']);
      securityLogSheet.setFrozenRows(1);
    }
    
    securityLogSheet.appendRow([new Date(), action, investorId, fileId, details]);
  } catch (e) {
    console.error('Error al registrar evento de seguridad:', e);
  }
}

/**
 * Guarda una imagen en Google Drive con seguridad mejorada
 * @param {string} base64Image - Imagen en formato Base64
 * @param {string} fileName - Nombre del archivo
 * @param {string} investorId - Identificador único del inversionista
 * @param {string} investorName - Nombre del inversionista para el nombre de la carpeta
 * @return {object} Información del archivo creado
 */
function secureImageStorage(base64Image, fileName, investorId, investorName) {
  // Log para depuración
  console.log('secureImageStorage: Iniciando guardado de ' + fileName);
  
  try {
    // Validar el contenido de la imagen
    if (!validateImageContent(base64Image)) {
      console.error('secureImageStorage: Imagen inválida: ' + fileName);
      throw new Error("Contenido de imagen no válido o potencialmente inseguro");
    }
    
    console.log('secureImageStorage: Imagen validada correctamente');
  
    // 1. Crear/obtener carpeta raíz para todos los documentos
    let rootFolder;
    if (CONFIG.ROOT_FOLDER_ID) {
      try {
        rootFolder = DriveApp.getFolderById(CONFIG.ROOT_FOLDER_ID);
      } catch (e) {
        rootFolder = getOrCreateFolder('Inversionistas - Documentos Seguros');
      }
    } else {
      rootFolder = getOrCreateFolder('Inversionistas - Documentos Seguros');
    }
    
    // 2. Crear/obtener carpeta específica del inversionista
    let folderName = `${investorName} (${investorId})`.trim();
    if (!folderName || folderName === '()') {
      folderName = `Inversionista_${investorId}`;
    }
    let investorFolder = getOrCreateSubfolder(rootFolder, folderName);
    
    // 3. Preparar la imagen
    let imageData = base64Image.split(',');
    let data = imageData.length > 1 ? imageData[1] : imageData[0];
    let mimeType = getMimeType(base64Image);
    
    // 4. Crear el archivo con metadatos de seguridad
    let blob = Utilities.newBlob(Utilities.base64Decode(data), mimeType, fileName);
    let file = investorFolder.createFile(blob);
    
    // 5. Configurar permisos para que cualquiera con el enlace pueda ver
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // 6. Añadir metadatos de auditoría
    file.setDescription(`Documento seguro para ${investorName} (${investorId}). Creado: ${new Date().toISOString()}`);
    
    // 7. Registrar en log de seguridad
    logSecurityEvent('UPLOAD', investorId, file.getId(), `Archivo ${fileName} cargado para ${investorName}`);
    
    // 8. Retornar información del archivo
    return {
      id: file.getId(),
      name: file.getName(),
      url: file.getUrl(),
      downloadUrl: file.getDownloadUrl(),
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.getId()}&sz=w200-h200`,
      folder: investorFolder.getName(),
      createdDate: new Date().toISOString()
    };
  } catch (error) {
    // Capturar cualquier error y registrarlo
    console.error('secureImageStorage ERROR: ' + error.message);
    // Devolver un objeto con información de error
    return {
      error: true,
      message: error.message
    };
  }
}
