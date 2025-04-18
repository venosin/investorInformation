/**
 * @fileoverview Componente para la sección de cumplimiento normativo
 * Incluye campos para PEP (Persona Políticamente Expuesta), recibo de servicios y foto de firma.
 */

import React, { useState, useEffect } from 'react';
import FormSection from './FormSection';

/**
 * Componente para la sección de cumplimiento normativo
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.register - Función de react-hook-form para registrar campos
 * @param {Object} props.errors - Objeto con errores de validación de los campos
 * @param {Function} props.setValue - Función de react-hook-form para establecer valores
 * @param {Function} props.watch - Función de react-hook-form para observar valores
 * @returns {JSX.Element} Sección de cumplimiento normativo
 */
function ComplianceSection({ register, errors, setValue, watch }) {
  // Estados para el recibo de servicios
  const [serviceReceiptPreview, setServiceReceiptPreview] = useState(null);
  const [serviceReceiptFileName, setServiceReceiptFileName] = useState('');
  
  // Estados para la foto de firma
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [signatureFileName, setSignatureFileName] = useState('');
  
  // Observar el valor de isPEP para mostrar/ocultar campo de cargo
  const isPEP = watch("isPEP");
  
  // Efecto para cargar de localStorage al inicio
  useEffect(() => {
    try {
      // Cargar imagen del recibo de servicios
      const savedServiceReceipt = localStorage.getItem('serviceReceiptPreview');
      const savedServiceReceiptName = localStorage.getItem('serviceReceiptName');
      
      if (savedServiceReceipt && savedServiceReceiptName) {
        console.log('Cargando imagen del recibo de servicios desde localStorage');
        setServiceReceiptPreview(savedServiceReceipt);
        setServiceReceiptFileName(savedServiceReceiptName);
        
        // Indicamos que tenemos la imagen del recibo
        setValue('serviceReceiptLoaded', true);
      }
      
      // Cargar imagen de la firma
      const savedSignature = localStorage.getItem('signaturePhotoPreview');
      const savedSignatureName = localStorage.getItem('signaturePhotoName');
      
      if (savedSignature && savedSignatureName) {
        console.log('Cargando imagen de la firma desde localStorage');
        setSignaturePreview(savedSignature);
        setSignatureFileName(savedSignatureName);
        
        // Indicamos que tenemos la imagen de la firma
        setValue('signaturePhotoLoaded', true);
      }
    } catch (e) {
      console.error('Error al leer de localStorage:', e);
    }
  }, [setValue]);
  
  // Función para manejar la carga del recibo de servicios
  const handleServiceReceiptChange = (e) => {
    console.log('Seleccionando archivo para el recibo de servicios...');
    
    const file = e.target.files[0];
    if (!file) {
      console.log('No se seleccionó ningún archivo');
      return;
    }
    
    try {
      console.log('Archivo seleccionado para el recibo:', file.name);
      // Guardar el nombre del archivo
      setServiceReceiptFileName(file.name);
      
      // Crear URL para vista previa y comprimir la imagen
      const reader = new FileReader();
      reader.onload = function(event) {
        console.log('Archivo del recibo leído correctamente, generando vista previa');
        const img = new Image();
        img.onload = function() {
          // Comprimir la imagen antes de almacenarla
          const compressedImageUrl = compressImage(img, 800, 0.7);
          setServiceReceiptPreview(compressedImageUrl);
          
          // Guardamos la versión comprimida en localStorage
          try {
            localStorage.setItem('serviceReceiptPreview', compressedImageUrl);
            localStorage.setItem('serviceReceiptName', file.name);
            console.log('Vista previa comprimida del recibo guardada en localStorage');
            
            // Indicamos que tenemos la imagen del recibo
            setValue('serviceReceiptLoaded', true, { shouldValidate: true });
            
            // Guardar el archivo original para el envío
            setValue('serviceReceiptFile', file);
          } catch (e) {
            console.error('Error al guardar en localStorage:', e);
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error('Error al procesar el archivo:', e);
    }
  };
  
  // Función para manejar la carga de la foto de firma
  const handleSignaturePhotoChange = (e) => {
    console.log('Seleccionando archivo para la firma...');
    
    const file = e.target.files[0];
    if (!file) {
      console.log('No se seleccionó ningún archivo');
      return;
    }
    
    try {
      console.log('Archivo seleccionado para la firma:', file.name);
      // Guardar el nombre del archivo
      setSignatureFileName(file.name);
      
      // Crear URL para vista previa y comprimir la imagen
      const reader = new FileReader();
      reader.onload = function(event) {
        console.log('Archivo de la firma leído correctamente, generando vista previa');
        const img = new Image();
        img.onload = function() {
          // Comprimir la imagen antes de almacenarla
          const compressedImageUrl = compressImage(img, 800, 0.7);
          setSignaturePreview(compressedImageUrl);
          
          // Guardamos la versión comprimida en localStorage
          try {
            localStorage.setItem('signaturePhotoPreview', compressedImageUrl);
            localStorage.setItem('signaturePhotoName', file.name);
            console.log('Vista previa comprimida de la firma guardada en localStorage');
            
            // Indicamos que tenemos la imagen de la firma
            setValue('signaturePhotoLoaded', true, { shouldValidate: true });
            
            // Guardar el archivo original para el envío
            setValue('signaturePhotoFile', file);
          } catch (e) {
            console.error('Error al guardar en localStorage:', e);
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error('Error al procesar el archivo:', e);
    }
  };
  
  // Función para eliminar la imagen del recibo
  const handleRemoveServiceReceipt = () => {
    console.log('Eliminando imagen del recibo de servicios');
    setServiceReceiptPreview(null);
    setServiceReceiptFileName('');
    
    // Eliminamos del localStorage
    localStorage.removeItem('serviceReceiptPreview');
    localStorage.removeItem('serviceReceiptName');
    
    // Actualizamos los campos del formulario
    setValue('serviceReceiptLoaded', false, { shouldValidate: true });
    setValue('serviceReceiptFile', null);
    
    // Limpiamos el input file
    const fileInput = document.getElementById('serviceReceiptPhoto');
    if (fileInput) fileInput.value = '';
  };
  
  // Función para eliminar la imagen de la firma
  const handleRemoveSignature = () => {
    console.log('Eliminando imagen de la firma');
    setSignaturePreview(null);
    setSignatureFileName('');
    
    // Eliminamos del localStorage
    localStorage.removeItem('signaturePhotoPreview');
    localStorage.removeItem('signaturePhotoName');
    
    // Actualizamos los campos del formulario
    setValue('signaturePhotoLoaded', false, { shouldValidate: true });
    setValue('signaturePhotoFile', null);
    
    // Limpiamos el input file
    const fileInput = document.getElementById('signaturePhoto');
    if (fileInput) fileInput.value = '';
  };
  
  // Función para comprimir imágenes
  const compressImage = (img, maxWidth, quality = 0.7) => {
    const canvas = document.createElement('canvas');
    
    // Calcular las dimensiones proporcionales
    let width = img.width;
    let height = img.height;
    
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }
    
    // Configurar canvas y dibujar imagen
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    
    // Devolver URL de datos comprimida
    return canvas.toDataURL('image/jpeg', quality);
  };
  
  return (
    <FormSection title="Cumplimiento Normativo" description="Información requerida para cumplimiento regulatorio">
      <div className="space-y-8">
        {/* Campo de PEP (Persona Políticamente Expuesta) */}
        <div className="mb-6">
          <label className="font-semibold text-lg text-gray-900 block mb-2">
            ¿Es usted una Persona Políticamente Expuesta?
            <span className="text-sm font-normal ml-2">(Tiene un cargo en el gobierno o es funcionario público)</span>
          </label>
          
          <div className="flex items-center gap-6 mt-2">
            <div className="flex items-center">
              <input
                id="pep-yes"
                type="radio"
                value="si"
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                {...register("isPEP", { required: "Debe seleccionar una opción" })}
              />
              <label htmlFor="pep-yes" className="ml-2 block text-gray-900">
                Sí
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="pep-no"
                type="radio"
                value="no"
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                {...register("isPEP", { required: "Debe seleccionar una opción" })}
              />
              <label htmlFor="pep-no" className="ml-2 block text-gray-900">
                No
              </label>
            </div>
          </div>
          
          {errors.isPEP && (
            <div className="mt-2 p-3 bg-red-100 border-2 border-red-500 rounded-lg">
              <p className="font-bold text-red-700 flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.isPEP.message}
              </p>
            </div>
          )}
        </div>
        
        {/* Campo condicional de cargo (solo si es PEP) */}
        {isPEP === "si" && (
          <div className="mb-6">
            <label htmlFor="pepPosition" className="font-semibold text-lg text-gray-900 block mb-2">
              ¿Qué cargo ostenta?
            </label>
            <input
              id="pepPosition"
              type="text"
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej. Diputado, Ministro, etc."
              {...register("pepPosition", {
                required: isPEP === "si" ? "Debe especificar el cargo que ostenta" : false
              })}
            />
            
            {errors.pepPosition && (
              <div className="mt-2 p-3 bg-red-100 border-2 border-red-500 rounded-lg">
                <p className="font-bold text-red-700 flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {errors.pepPosition.message}
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Sección de Recibo de Servicios */}
        <div className="mb-6">
          <label className="font-semibold text-lg text-gray-900 block mb-2">
            Recibo de Servicios (agua, luz, teléfono)
          </label>
          
          <div className="mt-2 border-2 border-gray-200 rounded-md overflow-hidden">
            {serviceReceiptPreview ? (
              <div className="p-4 flex flex-col items-center bg-white">
                <div className="relative">
                  <img
                    src={serviceReceiptPreview}
                    alt="Vista previa del recibo de servicios"
                    className="max-h-80 max-w-full mx-auto rounded-md object-contain"
                  />
                  
                  <button
                    type="button"
                    onClick={handleRemoveServiceReceipt}
                    className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full p-1 shadow-lg hover:bg-red-700 transition-all"
                    title="Eliminar imagen"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <p className="text-sm font-medium text-gray-900 mt-2">
                  {serviceReceiptFileName}
                </p>
                
                <div className="mt-4">
                  <label
                    htmlFor="serviceReceiptPhoto"
                    className="inline-flex items-center py-2 px-4 bg-blue-600 text-white font-medium rounded-md cursor-pointer hover:bg-blue-700 transition-all border border-blue-700 shadow-sm"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                    </svg>
                    Cambiar imagen
                    <input 
                      id="serviceReceiptPhoto" 
                      name="serviceReceiptPhoto" 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={handleServiceReceiptChange}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="p-6 flex flex-col items-center bg-white">
                <svg
                  className="mx-auto h-20 w-20 text-black mb-4"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-xl font-bold text-black mb-2">Selecciona una imagen de tu recibo de servicios</p>
                <p className="text-md text-black mb-6 text-center">Formato aceptado: JPG, PNG o GIF (hasta 10MB)</p>
                <label
                  htmlFor="serviceReceiptPhoto"
                  className="inline-flex items-center py-3 px-6 bg-blue-700 text-white font-bold rounded-md cursor-pointer hover:bg-blue-800 transition-all border-2 border-blue-900 shadow-md"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                  </svg>
                  Seleccionar imagen del recibo
                  <input 
                    id="serviceReceiptPhoto" 
                    name="serviceReceiptPhoto" 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={handleServiceReceiptChange}
                  />
                </label>
                <p className="text-xs font-medium text-gray-700 mt-4">PNG, JPG, GIF hasta 10MB</p>
              </div>
            )}
          </div>
          
          {errors.serviceReceiptLoaded && (
            <div className="mt-2 p-3 bg-red-100 border-2 border-red-500 rounded-lg">
              <p className="font-bold text-red-700 flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.serviceReceiptLoaded.message}
              </p>
            </div>
          )}
        </div>
        
        {/* Sección de Foto de Firma */}
        <div className="mb-6">
          <label className="font-semibold text-lg text-gray-900 block mb-2">
            Foto de Firma
            <span className="text-sm font-normal ml-2">(en papel en blanco y lapicero azul)</span>
          </label>
          
          <div className="mt-2 border-2 border-gray-200 rounded-md overflow-hidden">
            {signaturePreview ? (
              <div className="p-4 flex flex-col items-center bg-white">
                <div className="relative">
                  <img
                    src={signaturePreview}
                    alt="Vista previa de la firma"
                    className="max-h-80 max-w-full mx-auto rounded-md object-contain"
                  />
                  
                  <button
                    type="button"
                    onClick={handleRemoveSignature}
                    className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full p-1 shadow-lg hover:bg-red-700 transition-all"
                    title="Eliminar imagen"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <p className="text-sm font-medium text-gray-900 mt-2">
                  {signatureFileName}
                </p>
                
                <div className="mt-4">
                  <label
                    htmlFor="signaturePhoto"
                    className="inline-flex items-center py-2 px-4 bg-blue-600 text-white font-medium rounded-md cursor-pointer hover:bg-blue-700 transition-all border border-blue-700 shadow-sm"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                    </svg>
                    Cambiar imagen
                    <input 
                      id="signaturePhoto" 
                      name="signaturePhoto" 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={handleSignaturePhotoChange}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="p-6 flex flex-col items-center bg-white">
                <svg
                  className="mx-auto h-20 w-20 text-black mb-4"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-xl font-bold text-black mb-2">Selecciona una imagen de tu firma</p>
                <p className="text-md text-black mb-6 text-center">En papel blanco con lapicero azul</p>
                <label
                  htmlFor="signaturePhoto"
                  className="inline-flex items-center py-3 px-6 bg-blue-700 text-white font-bold rounded-md cursor-pointer hover:bg-blue-800 transition-all border-2 border-blue-900 shadow-md"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                  </svg>
                  Seleccionar imagen de firma
                  <input 
                    id="signaturePhoto" 
                    name="signaturePhoto" 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={handleSignaturePhotoChange}
                  />
                </label>
                <p className="text-xs font-medium text-gray-700 mt-4">PNG, JPG, GIF hasta 10MB</p>
              </div>
            )}
          </div>
          
          {errors.signaturePhotoLoaded && (
            <div className="mt-2 p-3 bg-red-100 border-2 border-red-500 rounded-lg">
              <p className="font-bold text-red-700 flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.signaturePhotoLoaded.message}
              </p>
            </div>
          )}
        </div>
        
        {/* Campos ocultos para la validación */}
        <input
          type="hidden"
          {...register("serviceReceiptLoaded", { 
            validate: value => value === true || "El recibo de servicios es requerido"
          })}
        />
        
        <input
          type="hidden"
          {...register("signaturePhotoLoaded", { 
            validate: value => value === true || "La foto de firma es requerida"
          })}
        />
      </div>
    </FormSection>
  );
}

export default ComplianceSection;
