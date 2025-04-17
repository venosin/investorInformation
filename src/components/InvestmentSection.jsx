import React, { useState, useEffect } from 'react';
import FormSection from './FormSection';

/**
 * @fileoverview Componente para la sección de monto a invertir
 * Incluye el monto de inversión y comentarios adicionales.
 */

function InvestmentSection({ register, errors, setValue }) {

  // Estado para manejar la foto del comprobante de pago
  const [paymentReceiptImage, setPaymentReceiptImage] = useState(null);
  const [paymentReceiptFileName, setPaymentReceiptFileName] = useState('');
  
  // Efecto para cargar la imagen del comprobante de pago desde localStorage al inicio
  useEffect(() => {
    try {
      // Cargar imagen del comprobante de pago
      const savedPaymentImage = localStorage.getItem('paymentReceiptPhotoPreview');
      const savedPaymentFileName = localStorage.getItem('paymentReceiptPhotoName');
      
      if (savedPaymentImage && savedPaymentFileName) {
        console.log('Cargando imagen del comprobante de pago desde localStorage');
        console.log('Longitud de la imagen cargada: ' + savedPaymentImage.length);
        setPaymentReceiptImage(savedPaymentImage);
        setPaymentReceiptFileName(savedPaymentFileName);
        
        // Esperar un momento para asegurarnos que el componente está completamente montado
        setTimeout(() => {
          // Indicamos que tenemos la imagen del comprobante y forzamos la validación
          setValue('paymentReceiptPhotoLoaded', true, { shouldValidate: false });
          
          // Guardar un valor simulado para el archivo
          setValue('paymentReceiptPhotoFile', new File([
            new Blob(['placeholder'])], savedPaymentFileName, { type: 'image/jpeg' }
          ), { shouldValidate: false });
          
          console.log('Valores de comprobante establecidos correctamente');  
        }, 100);
      }
    } catch (e) {
      console.error('Error al leer de localStorage:', e);
    }
  }, [setValue]);
  
  /**
   * Función para manejar la carga del archivo de comprobante de pago
   * @param {Event} e - Evento del input file
   */
  const handlePaymentReceiptFileChange = (e) => {
    console.log('Seleccionando archivo para el comprobante de pago...');
    
    const file = e.target.files[0];
    if (!file) {
      console.log('No se seleccionó ningún archivo');
      return;
    }
    
    try {
      console.log('Archivo seleccionado para el comprobante:', file.name);
      // Guardar el nombre del archivo
      setPaymentReceiptFileName(file.name);
      
      // Crear URL para vista previa
      const reader = new FileReader();
      reader.onload = function(event) {
        console.log('Archivo del comprobante leído correctamente, generando vista previa');
        const imageUrl = event.target.result;
        setPaymentReceiptImage(imageUrl);
        
        // Guardamos también en el localStorage para persistencia
        try {
          localStorage.setItem('paymentReceiptPhotoPreview', imageUrl);
          localStorage.setItem('paymentReceiptPhotoName', file.name);
          console.log('Vista previa del comprobante guardada en localStorage');
          
          // Verificación de que la imagen se guarda correctamente
          console.log('Comprobante de pago guardado en localStorage. Primeros 50 caracteres:', 
                    imageUrl.substring(0, 50));
          console.log('Longitud total de la imagen del comprobante:', imageUrl.length);
        } catch (e) {
          console.error('Error al guardar en localStorage:', e);
        }
        
        // Desactivar temporalmente la validación
        setValue('paymentReceiptPhotoLoaded', true, { shouldValidate: false });
        setValue('paymentReceiptPhotoFile', file, { shouldValidate: false });
        
        // Un pequeño retraso para asegurar que los valores se establecen correctamente
        setTimeout(() => {
          // Confirmar que el valor está establecido
          console.log('Confirmando valor establecido:', {
            paymentReceiptPhotoLoaded: true,
            fileName: file.name
          });
        }, 100);
      };
      
      reader.readAsDataURL(file);
    } catch (e) {
      console.error('Error al procesar archivo:', e);
    }
  };
  
  /**
   * Función para eliminar la imagen del comprobante de pago
   */
  const handleRemovePaymentReceiptImage = () => {
    console.log('Eliminando imagen del comprobante de pago...');
    setPaymentReceiptImage(null);
    setPaymentReceiptFileName('');
    
    // Limpiar de localStorage
    try {
      localStorage.removeItem('paymentReceiptPhotoPreview');
      localStorage.removeItem('paymentReceiptPhotoName');
      console.log('Imagen del comprobante eliminada de localStorage');
    } catch (e) {
      console.error('Error al eliminar de localStorage:', e);
    }
    
    // Actualizar el estado del formulario
    setValue('paymentReceiptPhotoLoaded', false, { shouldValidate: true });
    setValue('paymentReceiptPhotoFile', null, { shouldValidate: false });
  };

  return (
    <FormSection title="Monto a Invertir">
      <div className="bg-green-50 p-6 rounded-lg border border-green-100 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Información importante</h3>
            <div className="mt-2 text-sm text-green-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>El monto mínimo de inversión es de $1000</li>
                <li>Los rendimientos se calcularán en base a su monto invertido</li>
                <li>Los pagos de utilidades se realizarán según el plan establecido</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="investmentAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Monto a Invertir (USD) *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              id="investmentAmount"
              type="number"
              min="1000"
              step="100"
              {...register("investmentAmount", { 
                required: "El monto a invertir es requerido",
                min: {
                  value: 1000,
                  message: "El monto mínimo de inversión es $1000"
                },
                validate: value => Number(value) > 0 || "El monto debe ser mayor a 0"
              })}
              className={`w-full p-3 pl-8 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                errors.investmentAmount ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="0.00"
            />
          </div>
          {errors.investmentAmount && (
            <p className="mt-1 text-sm text-red-600">{errors.investmentAmount.message}</p>
          )}
        </div>
        
        {/* Campo para subir foto del comprobante de pago */}
        <div className="mt-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Comprobante de Pago *
          </label>
          
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            {paymentReceiptImage ? (
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">{paymentReceiptFileName}</span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleRemovePaymentReceiptImage}
                    className="inline-flex items-center p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    aria-label="Eliminar imagen"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                <div className="relative">
                  <img 
                    src={paymentReceiptImage} 
                    alt="Vista previa del comprobante de pago" 
                    className="w-full max-h-96 object-contain mx-auto border border-gray-200 rounded" 
                  />
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-30 rounded">
                    <label
                      htmlFor="paymentReceiptPhoto"
                      className="inline-flex items-center py-2 px-4 bg-white text-gray-700 font-medium rounded cursor-pointer hover:bg-gray-100 transition-all"
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                      </svg>
                      Cambiar imagen
                      <input 
                        id="paymentReceiptPhoto" 
                        name="paymentReceiptPhoto" 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={handlePaymentReceiptFileChange}
                      />
                    </label>
                  </div>
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
                <p className="text-xl font-bold text-black mb-2" style={{color: '#000000'}}>Selecciona una imagen del <strong>comprobante de pago</strong></p>
                <p className="text-md text-black mb-6 text-center" style={{color: '#000000'}}>Formato aceptado: JPG, PNG o GIF (hasta 10MB)</p>
                <label
                  htmlFor="paymentReceiptPhoto"
                  className="inline-flex items-center py-3 px-6 bg-blue-700 text-white font-bold rounded-md cursor-pointer hover:bg-blue-800 transition-all border-2 border-blue-900 shadow-md"
                  style={{color: '#ffffff', backgroundColor: '#1d4ed8'}}
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                  </svg>
                  Seleccionar imagen del comprobante
                  <input 
                    id="paymentReceiptPhoto" 
                    name="paymentReceiptPhoto" 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={handlePaymentReceiptFileChange}
                  />
                </label>
                <p className="text-xs font-medium text-gray-700 mt-4" style={{color: '#374151'}}>PNG, JPG, GIF hasta 10MB</p>
              </div>
            )}
          </div>
          
          {/* Mensajes de error para el comprobante de pago */}
          {errors.paymentReceiptPhotoLoaded && !paymentReceiptImage && (
            <div className="mt-2 p-3 bg-red-100 border-2 border-red-500 rounded-lg" style={{backgroundColor: '#fee2e2', borderColor: '#ef4444'}}>
              <p className="font-bold text-red-700 flex items-center" style={{color: '#b91c1c'}}>
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                La foto del comprobante de pago es requerida
              </p>
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
            Comentarios Adicionales
          </label>
          <textarea
            id="comments"
            rows={4}
            {...register("comments")}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Ingrese cualquier información adicional que considere relevante..."
          />
        </div>
        
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="termsAccepted"
              type="checkbox"
              {...register("termsAccepted", { 
                required: "Debe aceptar los términos y condiciones" 
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="termsAccepted" className="font-medium text-gray-700">
              Acepto los términos y condiciones *
            </label>
            <p className="text-gray-500">
              Al marcar esta casilla, confirmo que he leído y acepto los términos y condiciones, y autorizo el procesamiento de mis datos personales.
            </p>
            {errors.termsAccepted && (
              <p className="mt-1 text-sm text-red-600">{errors.termsAccepted.message}</p>
            )}
          </div>
        </div>
        
        {/* Campo oculto para la validación del comprobante de pago */}
        <input
          type="hidden"
          {...register("paymentReceiptPhotoLoaded", { 
            validate: value => {
              console.log("Validando comprobante, valor actual:", value);
              console.log("¿Imagen en localStorage?", localStorage.getItem('paymentReceiptPhotoPreview') !== null);
              console.log("¿Imagen en estado?", paymentReceiptImage !== null);
              
              // Si hay imagen en el estado local (visible) o en localStorage, consideramos válido
              const hasImage = value === true || 
                localStorage.getItem('paymentReceiptPhotoPreview') !== null || 
                paymentReceiptImage !== null;
              
              // Si ya se mostró la imagen, forzamos el valor a true
              if (paymentReceiptImage && value !== true) {
                setValue('paymentReceiptPhotoLoaded', true, { shouldValidate: false });
              }
              
              return hasImage || "La foto del comprobante de pago es requerida";
            }
          })}
        />
      </div>
    </FormSection>
  );
}

export default InvestmentSection;
