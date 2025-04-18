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
    'https://investor-information.vercel.app',
    // 'https://www.tu-sitio-en-produccion.com',
  ],

  // Token secreto que debe coincidir con el enviado desde tu aplicación
  SECRET_TOKEN: 'a5f9e2c7d3b8h6j4k1m0p9r2s5t7v3x6z8',

  // Límite de peticiones por IP en un periodo (1 hora) - Aumentado para pruebas
  RATE_LIMIT: {
    MAX_REQUESTS: 1000,       // Número máximo de solicitudes - Aumentado temporalmente para pruebas - luego dejar en 10
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
    .setContent(JSON.stringify({ "status": "success" }))
    .setHeaders(headers);
}

/**
 * Manejador para solicitudes GET (cuando se accede directamente a la URL)
 * Esta función es necesaria para que el script funcione cuando se accede a través del navegador
 */
function doGet(e) {
  // HTML simple para mostrar cuando se accede directamente al script
  var htmlOutput = '<html><head><title>API de Inversionistas</title>' +
    '<style>body{font-family:Arial,sans-serif; line-height:1.6; max-width:600px; margin:20px auto; padding:20px; text-align:center}' +
    'h1{color:#2563eb;} p{margin:15px 0;} .note{background:#f0f9ff; padding:15px; border-radius:5px; margin:20px 0; text-align:left;}' +
    '</style></head><body>' +
    '<h1>API de Formulario de Inversionistas</h1>' +
    '<p>Este es un endpoint de API para el formulario de registro de inversionistas.</p>' +
    '<div class="note">' +
    '<p><strong>Nota:</strong> Esta URL es para ser utilizada por la aplicación web y no está destinada a ser accedida directamente.</p>' +
    '<p>Si estás viendo este mensaje, significa que el script está funcionando correctamente.</p>' +
    '</div>' +
    '</body></html>';
  
  return HtmlService.createHtmlOutput(htmlOutput);
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

      // Agregar encabezados según los datos que realmente envía el frontend
      sheet.appendRow([
        'Fecha', 'ID Inversionista', 'Nombre Completo', 'DUI', 'Teléfono', 'Email', 'Banco',
        'Número de Cuenta', 'Tipo de Cuenta', 'Beneficiarios',
        'Beneficiario 1', 'Teléfono Beneficiario 1', 'Instagram Beneficiario 1',
        'Beneficiario 2', 'Teléfono Beneficiario 2', 'Instagram Beneficiario 2',
        'Monto de Inversión', 'Comentarios', 'Es PEP', 'Posición PEP', 'Recibo Servicios', 'Firma',
        'DUI Frontal', 'DUI Reverso', 'Comprobante'
      ]);
    }

    // DIAGNÓSTICO ADICIONAL: Registrar todas las claves recibidas
    logEvent(logSheet, requestId, e, 'DIAGNÓSTICO', 'Claves recibidas en el formulario: ' + Object.keys(jsonData).join(', '));

    // 7. Preparar y validar los datos
    // Sanitizar datos y evitar posibles inyecciones
    var sanitizedData = sanitizeFormData(jsonData);

    // LOG DETALLADO: Verificar si las imágenes están llegando
    logEvent(logSheet, requestId, e, 'DEBUG', 'DUI Frontal presente: ' + (sanitizedData.duiFrontPhotoPreview ? 'SÍ' : 'NO'));
    logEvent(logSheet, requestId, e, 'DEBUG', 'DUI Reverso presente: ' + (sanitizedData.duiBackPhotoPreview ? 'SÍ' : 'NO'));
    logEvent(logSheet, requestId, e, 'DEBUG', 'Comprobante presente: ' + (sanitizedData.paymentReceiptPhotoPreview ? 'SÍ' : 'NO'));

    // Inspección profunda: Registrar los primeros 50 caracteres y la longitud de cada imagen si están presentes
    if (sanitizedData.duiFrontPhotoPreview) {
      logEvent(logSheet, requestId, e, 'DEBUG-CONTENIDO', 'DUI Frontal primeros 50 caracteres: ' + sanitizedData.duiFrontPhotoPreview.substring(0, 50));
      logEvent(logSheet, requestId, e, 'DEBUG-CONTENIDO', 'DUI Frontal longitud: ' + sanitizedData.duiFrontPhotoPreview.length + ' caracteres');
      logEvent(logSheet, requestId, e, 'DEBUG-CONTENIDO', 'DUI Frontal es base64 válido: ' + (sanitizedData.duiFrontPhotoPreview.startsWith('data:image') ? 'SÍ' : 'NO'));
    } else {
      logEvent(logSheet, requestId, e, 'ERROR', 'DUI Frontal falta completamente o es undefined/null');
    }

    if (sanitizedData.duiBackPhotoPreview) {
      logEvent(logSheet, requestId, e, 'DEBUG-CONTENIDO', 'DUI Reverso primeros 50 caracteres: ' + sanitizedData.duiBackPhotoPreview.substring(0, 50));
      logEvent(logSheet, requestId, e, 'DEBUG-CONTENIDO', 'DUI Reverso longitud: ' + sanitizedData.duiBackPhotoPreview.length + ' caracteres');
      logEvent(logSheet, requestId, e, 'DEBUG-CONTENIDO', 'DUI Reverso es base64 válido: ' + (sanitizedData.duiBackPhotoPreview.startsWith('data:image') ? 'SÍ' : 'NO'));
    } else {
      logEvent(logSheet, requestId, e, 'ERROR', 'DUI Reverso falta completamente o es undefined/null');
    }

    if (sanitizedData.paymentReceiptPhotoPreview) {
      logEvent(logSheet, requestId, e, 'DEBUG-CONTENIDO', 'Comprobante primeros 50 caracteres: ' + sanitizedData.paymentReceiptPhotoPreview.substring(0, 50));
      logEvent(logSheet, requestId, e, 'DEBUG-CONTENIDO', 'Comprobante longitud: ' + sanitizedData.paymentReceiptPhotoPreview.length + ' caracteres');
      logEvent(logSheet, requestId, e, 'DEBUG-CONTENIDO', 'Comprobante es base64 válido: ' + (sanitizedData.paymentReceiptPhotoPreview.startsWith('data:image') ? 'SÍ' : 'NO'));
    } else {
      logEvent(logSheet, requestId, e, 'ERROR', 'Comprobante falta completamente o es undefined/null');
    }

    // Preparar el banco para el registro
    var bankName = sanitizedData.bankName === 'Otro' ? sanitizedData.customBank : sanitizedData.bankName;
    
    // Verificar si el frontend envió los flags de validación para recibo y firma
    logEvent(logSheet, requestId, e, 'DEBUG-VALIDACION', 'Flag de recibo de servicios (serviceReceiptLoaded): ' + (sanitizedData.serviceReceiptLoaded ? 'SÍ' : 'NO'));
    logEvent(logSheet, requestId, e, 'DEBUG-VALIDACION', 'Flag de firma (signaturePhotoLoaded): ' + (sanitizedData.signaturePhotoLoaded ? 'SÍ' : 'NO'));
    
    // Buscar las imágenes en los campos recibidos (sin localStorage - solo disponible en navegador)
    const serviceReceiptImage = sanitizedData.serviceReceiptPreview || 
                              jsonData.serviceReceiptPreview || 
                              (jsonData.serviceReceiptImage || sanitizedData.serviceReceiptImage);
    const signatureImage = sanitizedData.signaturePhotoPreview || 
                         sanitizedData.signaturePreview || 
                         jsonData.signaturePhotoPreview || 
                         (jsonData.signatureImage || sanitizedData.signatureImage);
    
    if (serviceReceiptImage) {
      logEvent(logSheet, requestId, e, 'DEBUG-CONTENIDO', 'Recibo de Servicios primeros 50 caracteres: ' + serviceReceiptImage.substring(0, 50));
      logEvent(logSheet, requestId, e, 'DEBUG-CONTENIDO', 'Recibo de Servicios longitud: ' + serviceReceiptImage.length + ' caracteres');
      logEvent(logSheet, requestId, e, 'DEBUG-CONTENIDO', 'Recibo de Servicios es base64 válido: ' + (serviceReceiptImage.startsWith('data:image') ? 'SÍ' : 'NO'));
    } else {
      logEvent(logSheet, requestId, e, 'DEBUG-CONTENIDO', 'Recibo de Servicios: No se encontró ninguna imagen en los campos disponibles');
    }

    if (signatureImage) {
      logEvent(logSheet, requestId, e, 'DEBUG-CONTENIDO', 'Foto de Firma primeros 50 caracteres: ' + signatureImage.substring(0, 50));
      logEvent(logSheet, requestId, e, 'DEBUG-CONTENIDO', 'Foto de Firma longitud: ' + signatureImage.length + ' caracteres');
      logEvent(logSheet, requestId, e, 'DEBUG-CONTENIDO', 'Foto de Firma es base64 válido: ' + (signatureImage.startsWith('data:image') ? 'SÍ' : 'NO'));
    } else {
      logEvent(logSheet, requestId, e, 'DEBUG-CONTENIDO', 'Foto de Firma: No se encontró ninguna imagen en los campos disponibles');
    }

    // Preparar el banco para el registro
    var bankName = sanitizedData.bankName === 'Otro' ? sanitizedData.customBank : sanitizedData.bankName;

    // Generar ID único para este inversionista
    var investorId = Utilities.getUuid();

    // Extraer y procesar las imágenes si están presentes
    let duiFrontalUrl = '';
    let duiReversoUrl = '';
    let comprobanteUrl = '';
    let reciboServiciosUrl = '';
    let firmaUrl = '';

    try {
      // DIAGNÓSTICO CRÍTICO: Verificar datos de imágenes antes de procesarlas
      if (sanitizedData.duiFrontPhotoPreview) {
        logEvent(logSheet, requestId, e, 'DIAGNÓSTICO-IMAGEN', 'DUI Frontal ENCONTRADO de longitud: ' + sanitizedData.duiFrontPhotoPreview.length);
        // Verificar si comienza con data:image
        logEvent(logSheet, requestId, e, 'DIAGNÓSTICO-IMAGEN', 'DUI Frontal comienza correctamente: ' + (sanitizedData.duiFrontPhotoPreview.startsWith('data:image') ? 'SÍ' : 'NO'));
      } else {
        logEvent(logSheet, requestId, e, 'ERROR-CRÍTICO', 'DUI Frontal NO ENCONTRADO o es NULL');
      }
      
      // Procesar las imágenes en base64 si existen
      if (sanitizedData.duiFrontPhotoPreview) {
        try {
          const result = saveImageToDrive(sanitizedData.duiFrontPhotoPreview, 'dui_frontal.jpg', investorId, sanitizedData.fullName || 'Inversionista');
          duiFrontalUrl = result.url;
          // Registrar evento de seguridad
          logSecurityEvent('UPLOAD', investorId, result.fileId, 'DUI Frontal');
        } catch (imgError) {
          console.error('Error al guardar imagen frontal del DUI:', imgError);
          logEvent(logSheet, requestId, e, 'ERROR_IMAGEN', `Error guardando imagen DUI frontal: ${imgError.message}`);
        }
      }

      if (sanitizedData.duiBackPhotoPreview) {
        try {
          const result = saveImageToDrive(sanitizedData.duiBackPhotoPreview, 'dui_reverso.jpg', investorId, sanitizedData.fullName || 'Inversionista');
          duiReversoUrl = result.url;
          // Registrar evento de seguridad
          logSecurityEvent('UPLOAD', investorId, result.fileId, 'DUI Reverso');
        } catch (imgError) {
          console.error('Error al guardar imagen reverso del DUI:', imgError);
          logEvent(logSheet, requestId, e, 'ERROR_IMAGEN', `Error guardando imagen DUI reverso: ${imgError.message}`);
        }
      }

      if (sanitizedData.paymentReceiptPhotoPreview) {
        try {
          const result = saveImageToDrive(sanitizedData.paymentReceiptPhotoPreview, 'comprobante_pago.jpg', investorId, sanitizedData.fullName || 'Inversionista');
          comprobanteUrl = result.url;
          // Registrar evento de seguridad
          logSecurityEvent('UPLOAD', investorId, result.fileId, 'Comprobante de Pago');
        } catch (imgError) {
          console.error('Error al guardar imagen de comprobante:', imgError);
          logEvent(logSheet, requestId, e, 'ERROR_IMAGEN', `Error guardando imagen de comprobante: ${imgError.message}`);
        }
      }
      
      // Procesar la imagen del recibo de servicios si existe
      // Nota: Verificamos por serviceReceiptLoaded (flag booleano) y buscamos la imagen en múltiples campos
      if (sanitizedData.serviceReceiptLoaded) {
        try {
          // Buscar la imagen en varios campos posibles (en orden de probabilidad)
          const serviceReceiptImage = sanitizedData.serviceReceiptPreview || 
                                     jsonData.serviceReceiptPreview || 
                                     sanitizedData.serviceReceiptImage || 
                                     jsonData.serviceReceiptImage;

          if (serviceReceiptImage) {
            logEvent(logSheet, requestId, e, 'DEBUG-PROCESAMIENTO', 'Imagen de recibo de servicios encontrada');
            const result = saveImageToDrive(serviceReceiptImage, 'recibo_servicios.jpg', investorId, sanitizedData.fullName || 'Inversionista');
            reciboServiciosUrl = result.url;
            // Registrar evento de seguridad
            logSecurityEvent('UPLOAD', investorId, result.fileId, 'Recibo de Servicios');
          } else {
            logEvent(logSheet, requestId, e, 'ADVERTENCIA', 'No se pudo encontrar la imagen del recibo de servicios aunque serviceReceiptLoaded es true');
          }
        } catch (imgError) {
          console.error('Error al guardar imagen del recibo de servicios:', imgError);
          logEvent(logSheet, requestId, e, 'ERROR_IMAGEN', `Error guardando imagen del recibo de servicios: ${imgError.message}`);
        }
      }
      
      // Procesar la imagen de la firma si existe
      // Nota: Verificamos por signaturePhotoLoaded (flag booleano) y buscamos la imagen en múltiples campos
      if (sanitizedData.signaturePhotoLoaded) {
        try {
          // Buscar la imagen en varios campos posibles (en orden de probabilidad)
          const signatureImage = sanitizedData.signaturePhotoPreview ||
                               sanitizedData.signaturePreview ||
                               jsonData.signaturePhotoPreview ||
                               sanitizedData.signatureImage ||
                               jsonData.signatureImage;

          if (signatureImage) {
            logEvent(logSheet, requestId, e, 'DEBUG-PROCESAMIENTO', 'Imagen de firma encontrada');
            const result = saveImageToDrive(signatureImage, 'firma.jpg', investorId, sanitizedData.fullName || 'Inversionista');
            firmaUrl = result.url;
            // Registrar evento de seguridad
            logSecurityEvent('UPLOAD', investorId, result.fileId, 'Foto de Firma');
          } else {
            logEvent(logSheet, requestId, e, 'ADVERTENCIA', 'No se pudo encontrar la imagen de la firma aunque signaturePhotoLoaded es true');
          }
        } catch (imgError) {
          console.error('Error al guardar imagen de la firma:', imgError);
          logEvent(logSheet, requestId, e, 'ERROR_IMAGEN', `Error guardando imagen de la firma: ${imgError.message}`);
        }
      }
    } catch (error) {
      console.error('Error al procesar imágenes:', error);
      logEvent(logSheet, requestId, e, 'ERROR-PROCESAMIENTO', `Error al procesar imágenes: ${error.message}`);
    }

    try {
      // Usar 'sheet' en lugar de 'dataSheet' ya que esa es la variable definida arriba
      // Agregar datos a la hoja de cálculo
      sheet.appendRow([
        new Date(), // Fecha de registro
        investorId, // ID único generado
        sanitizedData.fullName || '', // Nombre completo (campo corregido)
        sanitizedData.duiNumber || '', // Número de DUI (campo corregido)
        sanitizedData.phoneNumber || '', // Teléfono (campo corregido)
        sanitizedData.email || '', // Email (campo corregido)
        
        // Datos bancarios
        bankName || '', // Nombre del banco
        sanitizedData.accountNumber || '', // Número de cuenta (campo corregido)
        sanitizedData.accountType || '', // Tipo de cuenta (campo corregido)
        
        // Información sobre si posee beneficiarios
        sanitizedData.noBeneficiaries === true ? "NO POSEE BENEFICIARIOS" : "SÍ POSEE BENEFICIARIOS",
        
        // Beneficiarios
        sanitizedData.beneficiary1Name || '',
        sanitizedData.beneficiary1Phone || '',
        sanitizedData.beneficiary1Instagram || '',
        
        sanitizedData.beneficiary2Name || '',
        sanitizedData.beneficiary2Phone || '',
        sanitizedData.beneficiary2Instagram || '',
        
        // Datos de inversión
        sanitizedData.investmentAmount || '', // Monto de inversión (campo corregido)
        sanitizedData.comments || '', // Comentarios (campo corregido)
        
        // Datos de cumplimiento normativo
        sanitizedData.isPEP || 'no',
        sanitizedData.isPEP === 'si' ? (sanitizedData.pepPosition || '') : '',
        
        // Imágenes de cumplimiento
        reciboServiciosUrl,
        firmaUrl,
        
        // URLs de las imágenes (DUI y comprobante)
        duiFrontalUrl,
        duiReversoUrl,
        comprobanteUrl,
        
        // No hay más campos adicionales
      ]);
      
      logEvent(logSheet, requestId, e, 'ÉXITO', 'Datos guardados correctamente');
    } catch (error) {
      console.error('Error al guardar en la hoja de cálculo:', error);
      logEvent(logSheet, requestId, e, 'ERROR-GUARDADO', `Error al guardar en hoja: ${error.message}`);
      throw error; // Re-lanzar para que se maneje en el bloque catch principal
    }

    // 9. Retornar respuesta exitosa
    // Crear HTML simplificado y profesional para el usuario
    var successHtml = '<html><head><title>Datos recibidos</title>' +
      '<style>body{font-family:Arial,sans-serif; line-height:1.6; max-width:800px; margin:0 auto; padding:20px; text-align:center}' +
      'h1{color:#28a745; margin-top:30px} .message{font-size:18px; margin:30px 0;}' +
      '.close{margin-top:40px; color:#6c757d; font-size:16px;}' +
      '</style></head><body>' +
      '<h1>¡Datos guardados exitosamente!</h1>' +
      '<p class="message">Los datos han sido guardados correctamente.</p>' +
      '<p class="close">Puedes cerrar esta ventana.</p>' +
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
      'Access-Control-Allow-Origin': origin, // Permitir cualquier para desarrollo *, en produccion dejar origen 
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
function validateImageContent(base64Image) {
  // Log para depuración
  console.log('Validando imagen, longitud:', base64Image ? base64Image.length : 0);

  // Verificamos que la cadena comience con el prefijo de data URL
  if (!base64Image || typeof base64Image !== 'string') {
    console.error('Validación fallida: La imagen no es válida o está vacía');
    return { valid: false, message: 'La imagen no es válida o está vacía' };
  }

  // Log de los primeros caracteres para depuración
  console.log('Primeros 50 caracteres de la imagen:', base64Image.substring(0, 50));

  // Comprobamos que sea una imagen en formato data URL (siendo más flexible)
  if (!base64Image.includes('data:image')) {
    console.error('Validación fallida: No es formato data URL, primeros caracteres:', base64Image.substring(0, 30));
    return { valid: false, message: 'La cadena no es una imagen en formato data URL' };
  }

  // Intentamos diferentes patrones de expresión regular para ser más flexibles
  let matches = base64Image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);

  // Si el patrón estándar no coincide, intentamos un patrón más flexible
  if (!matches || matches.length !== 3) {
    console.log('Patrón estándar no coincide, intentando patrón alternativo');
    // Patrón más flexible que solo busca la parte crucial
    matches = base64Image.match(/data:([A-Za-z-+/]+);base64,([^\s]+)/);

    if (!matches || matches.length !== 3) {
      console.error('Validación fallida: No se pudo extraer mime type y datos base64');
      return { valid: false, message: 'Formato de datos incorrecto' };
    }
  }

  // Verificamos que sea una imagen JPEG, PNG o GIF
  const mimeType = matches[1];
  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/webp'];

  if (!validImageTypes.includes(mimeType)) {
    // Siendo más flexible, aceptamos cualquier tipo de imagen como válido
    console.log('Tipo de imagen no reconocido oficialmente, pero continuando: ' + mimeType);
  }

  // Los datos base64 son el segundo grupo de coincidencia
  const base64Data = matches[2];

  // Verificamos que los datos base64 sean válidos
  try {
    console.log('Intentando decodificar datos base64, longitud:', base64Data.length);
    const decoded = Utilities.base64Decode(base64Data);

    // Verificamos que los datos tengan un tamaño razonable (siendo más flexible)
    console.log('Datos decodificados correctamente, tamaño:', decoded.length, 'bytes');

    if (decoded.length < 100) { // Más flexible: 100 bytes mínimo (podría ser un icono pequeño)
      console.error('Validación fallida: Imagen demasiado pequeña', decoded.length, 'bytes');
      return { valid: false, message: 'Imagen demasiado pequeña (menos de 100 bytes)' };
    }

    if (decoded.length > 20 * 1024 * 1024) { // Más flexible: hasta 20MB
      console.error('Validación fallida: Imagen demasiado grande', decoded.length, 'bytes');
      return { valid: false, message: 'Imagen demasiado grande (máximo 20MB)' };
    }

    console.log('Validación exitosa para imagen', mimeType, 'de', decoded.length, 'bytes');
    return { valid: true, mimeType: mimeType, data: decoded };
  } catch (e) {
    console.error('Error al decodificar datos base64:', e.message, 'para longitud', base64Data ? base64Data.length : 0);
    return { valid: false, message: 'Error al decodificar datos base64: ' + e.message };
  }
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
/**
 * Función simplificada para guardar imágenes en Drive
 * Esta versión es más directa y con menos complejidad para identificar problemas mejor
 * @param {string} base64Image - Imagen en formato base64
 * @param {string} fileName - Nombre del archivo
 * @param {string} investorId - ID del inversionista
 * @param {string} investorName - Nombre del inversionista
 * @return {object} Información del archivo creado
 */
/**
 * Extrae datos base64 de una cadena que podría contener metadata (como data:image/jpeg;base64,)
 * @param {string} base64String - La cadena que contiene datos base64
 * @return {string} Los datos base64 extraídos
 */
function extractBase64Data(base64String) {
  if (!base64String) return '';

  // Si es una cadena data:URL (contiene la cabecera)
  if (base64String.indexOf('data:') === 0) {
    const parts = base64String.split(',');
    if (parts.length > 1) {
      return parts[1]; // Devuelve solo la parte después de la coma
    } else {
      // Intento alternativo si no hay coma
      const base64Index = base64String.indexOf('base64,');
      if (base64Index >= 0) {
        return base64String.substring(base64Index + 7);
      }
    }
  }

  // Ya es base64 sin prefijo o no pudimos extraer correctamente
  return base64String;
}

/**
 * Guarda una imagen en formato base64 en Google Drive y devuelve la información del archivo
 * @param {string} base64Image - Imagen en formato base64
 * @param {string} fileName - Nombre del archivo a guardar
 * @param {string} investorId - ID del inversionista (para la carpeta)
 * @param {string} investorName - Nombre del inversionista (para la carpeta)
 * @return {object} Objeto con url y fileId del archivo guardado
 */
function saveImageToDrive(base64Image, fileName, investorId, investorName) {
  try {
    // Log para depuración
    console.log('DEBUG-IMG', 'Comenzando procesamiento de imágenes...');
    console.log('PRUEBA-DRIVE', 'Intentando acceder a DriveApp...');
    
    // Acceder a Drive y verificar permisos
    const drive = DriveApp;
    console.log('PRUEBA-DRIVE', 'Acceso a Drive obtenido correctamente');
    
    // Verificar o crear la carpeta principal de inversionistas
    let mainFolder;
    if (CONFIG.ROOT_FOLDER_ID) {
      // Si hay un ID de carpeta raíz configurado, usarlo
      try {
        mainFolder = drive.getFolderById(CONFIG.ROOT_FOLDER_ID);
      } catch (e) {
        // Si hay error, crear la carpeta en la raíz
        mainFolder = drive.createFolder('Inversionistas');
      }
    } else {
      // Buscar si existe una carpeta llamada Inversionistas en la raíz
      const folderIterator = drive.getFoldersByName('Inversionistas');
      if (folderIterator.hasNext()) {
        mainFolder = folderIterator.next();
      } else {
        // Si no existe, crearla
        mainFolder = drive.createFolder('Inversionistas');
      }
    }
    
    console.log('PRUEBA-DRIVE', 'Carpeta principal "Inversionistas" encontrada: ' + mainFolder.getId());
    
    // Crear carpeta para este inversionista
    const investorFolderName = `Inversionista_${investorId}`;
    console.log('PRUEBA-DRIVE', 'Intentando crear carpeta: ' + investorFolderName + ' en Inversionistas');
    
    // Verificar si ya existe la carpeta del inversionista
    let investorFolder;
    const investorFolderIterator = mainFolder.getFoldersByName(investorFolderName);
    if (investorFolderIterator.hasNext()) {
      investorFolder = investorFolderIterator.next();
    } else {
      // Crear carpeta del inversionista
      investorFolder = mainFolder.createFolder(investorFolderName);
    }
    
    console.log('PRUEBA-DRIVE', 'Carpeta creada exitosamente para inversionista: ' + investorFolderName + ' | ID: ' + investorFolder.getId());
    
    // Extraer solo los datos base64 (eliminar prefijo data:image/jpeg;base64,)
    const base64Data = extractBase64Data(base64Image);
    if (!base64Data) {
      throw new Error('Datos base64 no válidos');
    }
    
    // Determinar el tipo MIME
    const mimeType = getMimeType(base64Image);
    
    // Decodificar los datos base64
    const decodedData = Utilities.base64Decode(base64Data);
    
    // Crear el archivo en la carpeta del inversionista
    const file = investorFolder.createFile(Utilities.newBlob(decodedData, mimeType, fileName));
    
    // Generar la URL del archivo
    const url = file.getUrl();
    
    // Registrar éxito
    console.log('INFO', `${fileName} guardado correctamente: ${url}`);
    
    // Devolver información del archivo
    return {
      url: url,
      fileId: file.getId()
    };
  } catch (error) {
    console.error('DEBUG-IMG', '#ERROR!');
    console.error('ERROR-DRIVE', `Error al guardar imagen: ${error.message}`);
    throw error; // Re-lanzar para manejo superior
  }
}

/**
 * Función anterior de almacenamiento seguro de imágenes (mantenida por compatibilidad)
 * @deprecated Use saveImageToDrive instead
 */
function secureImageStorage(base64Image, fileName, investorId, investorName) {
  return saveImageToDrive(base64Image, fileName, investorId, investorName);
}
