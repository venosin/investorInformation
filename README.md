# Formulario de Registro de Inversionistas

## Descripción
Aplicación web para la captura, almacenamiento y gestión de información de inversionistas. Utiliza un formulario multi-paso con validación para recopilar datos completos de inversionistas potenciales.

## Características
- Formulario multi-paso con validación
- Secciones para información personal, bancaria, beneficiarios y detalles de inversión
- Envío de datos por correo electrónico utilizando EmailJS
- Almacenamiento automático en Google Sheets
- Diseño responsive con Tailwind CSS

## Tecnologías
- **Frontend**: React con Vite
- **Gestión de formularios**: react-hook-form
- **Estilos**: Tailwind CSS
- **Envío de correos**: EmailJS
- **Almacenamiento de datos**: Google Sheets + Google Apps Script

## Arquitectura

### Flujo de datos
1. El usuario completa el formulario multi-paso
2. Al enviar, los datos se procesan en dos vías:
   - Se envían por correo electrónico usando EmailJS
   - Se almacenan en Google Sheets mediante Google Apps Script

### Google Sheets + Apps Script
La aplicación utiliza Google Apps Script como un servicio backend sin servidor:
- Un script de Apps Script recibe los datos vía POST
- El script almacena los datos en una hoja de cálculo de Google Sheets
- No se requiere servidor backend tradicional

## Configuración

### EmailJS
La aplicación usa variables de entorno para la configuración de EmailJS:
```
VITE_APP_EMAILJS_SERVICE_ID=tu_service_id
VITE_APP_EMAILJS_TEMPLATE_ID=tu_template_id
VITE_APP_EMAILJS_USER_ID=tu_user_id
VITE_APP_EMAIL_TO=email_destino@ejemplo.com
```

### Google Sheets
La URL del script de Google Apps Script se configura en el componente `InvestorForm.jsx`.

## Ejecutar el proyecto

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```
