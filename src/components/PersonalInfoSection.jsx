/**
 * @fileoverview Componente para la sección de información personal del inversionista
 * Incluye campos para nombre, DUI, teléfono, correo y foto de DUI.
 */

import React, { useState, useEffect } from 'react';
import FormSection from './FormSection';

/**
 * Componente para la sección de información personal
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.register - Función de react-hook-form para registrar campos
 * @param {Object} props.errors - Objeto con errores de validación de los campos
 * @param {Function} props.setValue - Función de react-hook-form para establecer valores
 * @param {Function} props.watch - Función de react-hook-form para observar valores
 * @returns {JSX.Element} Sección de información personal
 */
function PersonalInfoSection({ register, errors, setValue }) {
  // Inicializar estados y verificar localStorage para ambas caras del DUI
  // Estados para el frente del DUI
  const [frontPreviewImage, setFrontPreviewImage] = useState(null);
  const [frontFileName, setFrontFileName] = useState('');
  
  // Estados para el reverso del DUI
  const [backPreviewImage, setBackPreviewImage] = useState(null);
  const [backFileName, setBackFileName] = useState('');
  
  // Efecto para cargar de localStorage al inicio
  useEffect(() => {
    try {
      // Cargar imagen del frente del DUI
      const savedFrontImage = localStorage.getItem('duiFrontPhotoPreview');
      const savedFrontFileName = localStorage.getItem('duiFrontPhotoName');
      
      if (savedFrontImage && savedFrontFileName) {
        console.log('Cargando imagen del frente del DUI desde localStorage');
        setFrontPreviewImage(savedFrontImage);
        setFrontFileName(savedFrontFileName);
        
        // Indicamos que tenemos la imagen del frente
        setValue('duiFrontPhotoLoaded', true);
      }
      
      // Cargar imagen del reverso del DUI
      const savedBackImage = localStorage.getItem('duiBackPhotoPreview');
      const savedBackFileName = localStorage.getItem('duiBackPhotoName');
      
      if (savedBackImage && savedBackFileName) {
        console.log('Cargando imagen del reverso del DUI desde localStorage');
        setBackPreviewImage(savedBackImage);
        setBackFileName(savedBackFileName);
        
        // Indicamos que tenemos la imagen del reverso
        setValue('duiBackPhotoLoaded', true);
      }
    } catch (e) {
      console.error('Error al leer de localStorage:', e);
    }
  }, [setValue, setFrontPreviewImage, setFrontFileName, setBackPreviewImage, setBackFileName]);
  
  // Función para manejar la carga de archivo del frente del DUI
  const handleFrontFileChange = (e) => {
    console.log('Seleccionando archivo para el frente del DUI...');
    
    const file = e.target.files[0];
    if (!file) {
      console.log('No se seleccionó ningún archivo');
      return;
    }
    
    try {
      console.log('Archivo seleccionado para el frente:', file.name);
      // Guardar el nombre del archivo
      setFrontFileName(file.name);
      
      // Crear URL para vista previa
      const reader = new FileReader();
      reader.onload = function(event) {
        console.log('Archivo del frente leído correctamente, generando vista previa');
        const imageUrl = event.target.result;
        setFrontPreviewImage(imageUrl);
        
        // Guardamos también en el localStorage para persistencia
        try {
          localStorage.setItem('duiFrontPhotoPreview', imageUrl);
          localStorage.setItem('duiFrontPhotoName', file.name);
          console.log('Vista previa del frente guardada en localStorage');
          
          // Verificación de que la imagen se guarda correctamente
          console.log('DUI Frontal guardado en localStorage. Primeros 50 caracteres:', 
                      localStorage.getItem('duiFrontPhotoPreview').substring(0, 50));
          console.log('Longitud total de la imagen DUI Frontal:', 
                      localStorage.getItem('duiFrontPhotoPreview').length);
        } catch (e) {
          console.error('Error al guardar en localStorage:', e);
        }
        
        // Usamos un campo virtual para indicar que tenemos un archivo
        setValue('duiFrontPhotoLoaded', true, { shouldValidate: true });
        setValue('duiFrontPhotoFile', file, { shouldValidate: false });
        console.log('Archivo del frente registrado en el formulario');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error al procesar el archivo del frente:', error);
    }
  };
  
  // Función para manejar la carga de archivo del reverso del DUI
  const handleBackFileChange = (e) => {
    console.log('Seleccionando archivo para el reverso del DUI...');
    
    const file = e.target.files[0];
    if (!file) {
      console.log('No se seleccionó ningún archivo');
      return;
    }
    
    try {
      console.log('Archivo seleccionado para el reverso:', file.name);
      // Guardar el nombre del archivo
      setBackFileName(file.name);
      
      // Crear URL para vista previa
      const reader = new FileReader();
      reader.onload = function(event) {
        console.log('Archivo del reverso leído correctamente, generando vista previa');
        const imageUrl = event.target.result;
        setBackPreviewImage(imageUrl);
        
        // Guardamos también en el localStorage para persistencia
        try {
          localStorage.setItem('duiBackPhotoPreview', imageUrl);
          localStorage.setItem('duiBackPhotoName', file.name);
          console.log('Vista previa del reverso guardada en localStorage');
          
          // Verificación de que la imagen se guarda correctamente
          console.log('DUI Reverso guardado en localStorage. Primeros 50 caracteres:', 
                      localStorage.getItem('duiBackPhotoPreview').substring(0, 50));
          console.log('Longitud total de la imagen DUI Reverso:', 
                      localStorage.getItem('duiBackPhotoPreview').length);
        } catch (e) {
          console.error('Error al guardar en localStorage:', e);
        }
        
        // Usamos un campo virtual para indicar que tenemos un archivo
        setValue('duiBackPhotoLoaded', true, { shouldValidate: true });
        setValue('duiBackPhotoFile', file, { shouldValidate: false });
        console.log('Archivo del reverso registrado en el formulario');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error al procesar el archivo del reverso:', error);
    }
  };
  
  // Función para eliminar la imagen del frente
  const handleRemoveFrontImage = () => {
    console.log('Eliminando imagen del frente...');
    setFrontPreviewImage(null);
    setFrontFileName('');
    
    // Establecer explícitamente que no hay archivo del frente
    setValue('duiFrontPhotoLoaded', false, { shouldValidate: true });
    setValue('duiFrontPhotoFile', null);
    
    // Limpiar localStorage
    try {
      localStorage.removeItem('duiFrontPhotoPreview');
      localStorage.removeItem('duiFrontPhotoName');
      console.log('Imagen del frente eliminada de localStorage');
    } catch (e) {
      console.error('Error al eliminar de localStorage:', e);
    }
    
    console.log('Imagen del frente eliminada completamente');
    
    // Resetear el input file
    const fileInput = document.getElementById('duiFrontPhoto');
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  // Función para eliminar la imagen del reverso
  const handleRemoveBackImage = () => {
    console.log('Eliminando imagen del reverso...');
    setBackPreviewImage(null);
    setBackFileName('');
    
    // Establecer explícitamente que no hay archivo del reverso
    setValue('duiBackPhotoLoaded', false, { shouldValidate: true });
    setValue('duiBackPhotoFile', null);
    
    // Limpiar localStorage
    try {
      localStorage.removeItem('duiBackPhotoPreview');
      localStorage.removeItem('duiBackPhotoName');
      console.log('Imagen del reverso eliminada de localStorage');
    } catch (e) {
      console.error('Error al eliminar de localStorage:', e);
    }
    
    console.log('Imagen del reverso eliminada completamente');
    
    // Resetear el input file
    const fileInput = document.getElementById('duiBackPhoto');
    if (fileInput) {
      fileInput.value = '';
    }
  };
  /**
   * Formatea automáticamente el número de teléfono (xxxx-xxxx)
   * @param {Event} e - Evento de cambio del input
   */
  const formatPhoneNumber = (value) => {
    // Elimina cualquier carácter que no sea número
    value = value.replace(/\D/g, '');
    
    // Limita a 8 dígitos máximo
    if (value.length > 8) value = value.slice(0, 8);
    
    // Formatea como xxxx-xxxx
    if (value.length > 4) {
      value = value.slice(0, 4) + '-' + value.slice(4);
    }
    
    return value;
  };
  
  /**
   * Formatea automáticamente el número de DUI (xxxxxxxx-x)
   * @param {Event} e - Evento de cambio del input
   */
  const formatDui = (value) => {
    // Elimina cualquier carácter que no sea número
    value = value.replace(/\D/g, '');
    
    // Limita a 9 dígitos máximo
    if (value.length > 9) value = value.slice(0, 9);
    
    // Formatea como xxxxxxxx-x
    if (value.length > 8) {
      value = value.slice(0, 8) + '-' + value.slice(8);
    }
    
    return value;
  };
  return (
    <FormSection title="Datos Personales">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo *
          </label>
          <input
            id="fullName"
            type="text"
            {...register("fullName", { 
              required: "El nombre completo es requerido" 
            })}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
              errors.fullName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Ingrese su nombre completo"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="duiNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Número de DUI <span className="text-red-500">*</span>
          </label>
          <input
            id="duiNumber"
            type="text"
            onInput={(e) => {
              // Formatea automáticamente mientras se escribe
              const value = e.target.value;
              const formatted = formatDui(value);
              e.target.value = formatted;
            }}
            {...register("duiNumber", { 
              required: "El número de DUI es requerido",
              // Cambiamos el patrón para que valide más flexible
              // Esto permitirá números parciales durante la escritura
              validate: value => {
                // Cuando el campo está vacío, no mostramos error (ya se maneja con required)
                if (!value) return true;
                
                // Si el campo está completo (tiene 10 caracteres con guión), validamos
                if (value.length === 10) {
                  return /^\d{8}-\d$/.test(value) || "Formato inválido. Debe ser 8 dígitos seguido de un guión y 1 dígito (ej: 12345678-9)";
                }
                
                // Mientras está escribiendo, no mostramos error
                return true;
              }
            })}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
              errors.duiNumber ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="12345678-9"
            aria-invalid={errors.duiNumber ? "true" : "false"}
            aria-describedby={errors.duiNumber ? "duiNumber-error" : undefined}
          />
          {errors.duiNumber && (
            <p id="duiNumber-error" className="mt-1 text-sm text-red-600" role="alert">{errors.duiNumber.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">8 dígitos seguido de un guión y 1 dígito (formato automático)</p>
        </div>
        
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Número de Teléfono <span className="text-red-500">*</span>
          </label>
          <input
            id="phoneNumber"
            type="tel"
            onInput={(e) => {
              // Formatea automáticamente mientras se escribe
              const value = e.target.value;
              const formatted = formatPhoneNumber(value);
              e.target.value = formatted;
            }}
            {...register("phoneNumber", { 
              required: "El número de teléfono es requerido",
              // Validación personalizada para permitir escritura parcial
              validate: value => {
                // Cuando el campo está vacío, no mostramos error (ya se maneja con required)
                if (!value) return true;
                
                // Si el campo está completo (tiene 9 caracteres con guión), validamos
                if (value.length === 9) {
                  return /^\d{4}-\d{4}$/.test(value) || "Formato inválido. Debe ser 8 dígitos en formato xxxx-xxxx";
                }
                
                // Mientras está escribiendo, no mostramos error
                return true;
              }
            })}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
              errors.phoneNumber ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="xxxx-xxxx"
            aria-invalid={errors.phoneNumber ? "true" : "false"}
            aria-describedby={errors.phoneNumber ? "phoneNumber-error" : undefined}
          />
          {errors.phoneNumber && (
            <p id="phoneNumber-error" className="mt-1 text-sm text-red-600" role="alert">{errors.phoneNumber.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">8 dígitos en formato xxxx-xxxx (formato automático)</p>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Correo Electrónico *
          </label>
          <input
            id="email"
            type="email"
            {...register("email", { 
              required: "El correo electrónico es requerido",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Dirección de correo electrónico inválida"
              }
            })}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="ejemplo@correo.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex items-center mb-2">
          <h3 className="text-xl font-bold text-gray-900" style={{color: '#000000'}}>
            Fotos de DUI *
          </h3>
          <div className="ml-3 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
            (Se requieren ambos lados)
          </div>
        </div>
        
        {/* Sección para la foto del frente del DUI */}
        <div className="mb-6">
          <label htmlFor="duiFrontPhoto" className="block text-sm font-bold text-gray-900 mb-1" style={{color: '#000000'}}>
            Frente del DUI *
          </label>
          <div className="mt-1 border-4 border-gray-700 rounded-lg overflow-hidden" style={{borderColor: '#000000'}}>
            {frontPreviewImage ? (
            <div className="relative">
              {/* Imagen cargada con feedback visual */}
              <div className="bg-green-100 p-4 border-b-4 border-green-500" style={{backgroundColor: '#dcfce7', borderColor: '#22c55e'}}>
                <div className="flex items-center mb-2">
                  <div className="flex-shrink-0 mr-2">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{color: '#059669'}}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="text-md font-bold text-green-800" style={{color: '#166534'}}>
                    ¡IMAGEN CARGADA EXITOSAMENTE!
                  </div>
                </div>
                <p className="text-sm text-black font-bold flex items-center" style={{color: '#000000'}}>
                  <svg className="h-5 w-5 mr-1 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{color: '#000000'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="font-bold">Archivo: {frontFileName}</span>
                </p>
              </div>
              
              {/* Vista previa ampliada */}
              <div className="bg-white p-6 flex justify-center" style={{backgroundColor: '#ffffff'}}>
                <img 
                  src={frontPreviewImage} 
                  alt="Vista previa del frente del DUI" 
                  className="max-w-full max-h-64 object-contain rounded-md border-4 border-black shadow-md"
                  style={{borderColor: '#000000'}}
                />
              </div>
              
              {/* Botones de acción */}
              <div className="bg-gray-100 p-4 grid grid-cols-1 gap-3 border-t-4 border-black" style={{backgroundColor: '#f5f5f5', borderColor: '#000000'}}>
                <button
                  type="button"
                  className="py-3 px-4 bg-red-600 text-white font-bold text-lg rounded-md hover:bg-red-700 transition-all shadow-lg w-full flex items-center justify-center"
                  style={{color: '#ffffff', backgroundColor: '#dc2626', borderColor: '#b91c1c'}}
                  onClick={handleRemoveFrontImage}
                >
                  <span className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    ELIMINAR IMAGEN
                  </span>
                </button>
                <label
                  htmlFor="duiFrontPhoto"
                  className="py-3 px-4 bg-blue-600 text-white font-bold text-lg rounded-md cursor-pointer hover:bg-blue-700 transition-all shadow-lg w-full flex items-center justify-center"
                  style={{color: '#ffffff', backgroundColor: '#2563eb'}}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                  </svg>
                  CAMBIAR IMAGEN
                  <input 
                    id="duiFrontPhoto" 
                    name="duiFrontPhoto" 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={handleFrontFileChange}
                    // Ya no usamos register para el input file, lo manejamos manualmente
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="p-6 flex flex-col items-center bg-white" style={{backgroundColor: '#ffffff'}}>
              <svg
                className="mx-auto h-20 w-20 text-black mb-4"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
                style={{color: '#000000'}}
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-xl font-bold text-black mb-2" style={{color: '#000000'}}>Selecciona una imagen del <strong>FRENTE</strong> de tu DUI</p>
              <p className="text-md text-black mb-6 text-center" style={{color: '#000000'}}>Formato aceptado: JPG, PNG o GIF (hasta 10MB)</p>
              <label
                htmlFor="duiFrontPhoto"
                className="inline-flex items-center py-3 px-6 bg-blue-700 text-white font-bold rounded-md cursor-pointer hover:bg-blue-800 transition-all border-2 border-blue-900 shadow-md"
                style={{color: '#ffffff', backgroundColor: '#1d4ed8'}}
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                </svg>
                Seleccionar imagen del frente
                <input 
                  id="duiFrontPhoto" 
                  name="duiFrontPhoto" 
                  type="file" 
                  accept="image/*"
                  className="hidden" 
                  onChange={handleFrontFileChange}
                  // Ya no usamos register para el input file, lo manejamos manualmente
                />
              </label>
              <p className="text-xs font-medium text-gray-700 mt-4" style={{color: '#374151'}}>PNG, JPG, GIF hasta 10MB</p>
            </div>
          )}
        </div>
          
        {/* Mensajes de error para el frente del DUI */}
        {errors.duiFrontPhotoLoaded && (
          <div className="mt-2 p-3 bg-red-100 border-2 border-red-500 rounded-lg" style={{backgroundColor: '#fee2e2', borderColor: '#ef4444'}}>
            <p className="font-bold text-red-700 flex items-center" style={{color: '#b91c1c'}}>
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              La foto del frente del DUI es requerida
            </p>
          </div>
        )}
        </div>
        
        {/* Sección para la foto del reverso del DUI */}
        <div className="mb-6">
          <label htmlFor="duiBackPhoto" className="block text-sm font-bold text-gray-900 mb-1" style={{color: '#000000'}}>
            Reverso del DUI *
          </label>
          <div className="mt-1 border-4 border-gray-700 rounded-lg overflow-hidden" style={{borderColor: '#000000'}}>
            {backPreviewImage ? (
              <div className="relative">
                {/* Imagen cargada con feedback visual */}
                <div className="bg-green-100 p-4 border-b-4 border-green-500" style={{backgroundColor: '#dcfce7', borderColor: '#22c55e'}}>
                  <div className="flex items-center mb-2">
                    <div className="flex-shrink-0 mr-2">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{color: '#059669'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-md font-bold text-green-800" style={{color: '#166534'}}>
                      ¡IMAGEN REVERSO CARGADA EXITOSAMENTE!
                    </div>
                  </div>
                  <p className="text-sm text-black font-bold flex items-center" style={{color: '#000000'}}>
                    <svg className="h-5 w-5 mr-1 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{color: '#000000'}}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="font-bold">Archivo: {backFileName}</span>
                  </p>
                </div>
                
                {/* Vista previa ampliada */}
                <div className="bg-white p-6 flex justify-center" style={{backgroundColor: '#ffffff'}}>
                  <img 
                    src={backPreviewImage} 
                    alt="Vista previa del reverso del DUI" 
                    className="max-w-full max-h-64 object-contain rounded-md border-4 border-black shadow-md"
                    style={{borderColor: '#000000'}}
                  />
                </div>
                
                {/* Botones de acción */}
                <div className="bg-gray-100 p-4 grid grid-cols-1 gap-3 border-t-4 border-black" style={{backgroundColor: '#f5f5f5', borderColor: '#000000'}}>
                  <button
                    type="button"
                    className="py-3 px-4 bg-red-600 text-white font-bold text-lg rounded-md hover:bg-red-700 transition-all shadow-lg w-full flex items-center justify-center"
                    style={{color: '#ffffff', backgroundColor: '#dc2626', borderColor: '#b91c1c'}}
                    onClick={handleRemoveBackImage}
                  >
                    <span className="flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      ELIMINAR IMAGEN
                    </span>
                  </button>
                  <label
                    htmlFor="duiBackPhoto"
                    className="py-3 px-4 bg-blue-600 text-white font-bold text-lg rounded-md cursor-pointer hover:bg-blue-700 transition-all shadow-lg w-full flex items-center justify-center"
                    style={{color: '#ffffff', backgroundColor: '#2563eb'}}
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                    </svg>
                    CAMBIAR IMAGEN
                    <input 
                      id="duiBackPhoto" 
                      name="duiBackPhoto" 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={handleBackFileChange}
                      // Ya no usamos register para el input file, lo manejamos manualmente
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="p-6 flex flex-col items-center bg-white" style={{backgroundColor: '#ffffff'}}>
                <svg
                  className="mx-auto h-20 w-20 text-black mb-4"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                  style={{color: '#000000'}}
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-xl font-bold text-black mb-2" style={{color: '#000000'}}>Selecciona una imagen del <strong>REVERSO</strong> de tu DUI</p>
                <p className="text-md text-black mb-6 text-center" style={{color: '#000000'}}>Formato aceptado: JPG, PNG o GIF (hasta 10MB)</p>
                <label
                  htmlFor="duiBackPhoto"
                  className="inline-flex items-center py-3 px-6 bg-blue-700 text-white font-bold rounded-md cursor-pointer hover:bg-blue-800 transition-all border-2 border-blue-900 shadow-md"
                  style={{color: '#ffffff', backgroundColor: '#1d4ed8'}}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                  </svg>
                  Seleccionar imagen del reverso
                  <input 
                    id="duiBackPhoto" 
                    name="duiBackPhoto" 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={handleBackFileChange}
                    // Ya no usamos register para el input file, lo manejamos manualmente
                  />
                </label>
                <p className="text-xs font-medium text-gray-700 mt-4" style={{color: '#374151'}}>PNG, JPG, GIF hasta 10MB</p>
              </div>
            )}
          </div>
          
          {/* Mensajes de error para el reverso del DUI */}
          {errors.duiBackPhotoLoaded && (
            <div className="mt-2 p-3 bg-red-100 border-2 border-red-500 rounded-lg" style={{backgroundColor: '#fee2e2', borderColor: '#ef4444'}}>
              <p className="font-bold text-red-700 flex items-center" style={{color: '#b91c1c'}}>
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                La foto del reverso del DUI es requerida
              </p>
            </div>
          )}
        </div>
        
        {/* Campos ocultos para la validación */}
        <input
          type="hidden"
          {...register("duiFrontPhotoLoaded", { 
            validate: value => value === true || "La foto del frente del DUI es requerida"
          })}
        />
        
        <input
          type="hidden"
          {...register("duiBackPhotoLoaded", { 
            validate: value => value === true || "La foto del reverso del DUI es requerida"
          })}
        />
      </div>
    </FormSection>
  );
}

export default PersonalInfoSection;
