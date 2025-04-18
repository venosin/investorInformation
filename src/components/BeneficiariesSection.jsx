/**
 * @fileoverview Componente para la sección de beneficiarios del inversionista
 * Incluye campos para registrar información de dos beneficiarios en caso de emergencia.
 */

import React, { useState, useEffect } from 'react';
import FormSection from './FormSection';

/**
 * Componente para la sección de beneficiarios
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.register - Función de react-hook-form para registrar campos
 * @param {Object} props.errors - Objeto con errores de validación de los campos
 * @returns {JSX.Element} Sección de beneficiarios
 */
function BeneficiariesSection({ register, errors, setValue, watch }) {
  // Estado para controlar si el usuario tiene beneficiarios
  const [noBeneficiaries, setNoBeneficiaries] = useState(false);
  
  // Observar el valor del campo noBeneficiaries
  const noBeneficiariesValue = watch("noBeneficiaries");
  
  // Efecto para actualizar el estado cuando cambia el valor en el formulario
  useEffect(() => {
    setNoBeneficiaries(noBeneficiariesValue === "true");
  }, [noBeneficiariesValue]);
  
  // Efecto para limpiar los campos de beneficiarios cuando se selecciona "No poseo beneficiarios"
  useEffect(() => {
    if (noBeneficiaries) {
      // Limpiar campos de beneficiarios
      setValue("beneficiary1Name", "");
      setValue("beneficiary1Phone", "");
      setValue("beneficiary1Instagram", "");
      setValue("beneficiary2Name", "");
      setValue("beneficiary2Phone", "");
      setValue("beneficiary2Instagram", "");
    }
  }, [noBeneficiaries, setValue]);
  
  /**
   * Formatea automáticamente el número de teléfono (xxxx-xxxx)
   * @param {string} value - Valor actual del campo
   * @returns {string} Valor formateado
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
  return (
    <FormSection title="Beneficiarios">
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-6">
        <p className="text-blue-700 text-sm">
          Por favor proporcione información de 2 beneficiarios en caso de emergencia.
        </p>
      </div>
      
      {/* Opción para indicar que no tiene beneficiarios */}
      <div className="mb-6">
        <div className="flex items-center space-x-6 mb-4">
          <div className="flex items-center">
            <input
              id="has-beneficiaries"
              type="radio"
              value="false"
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              {...register("noBeneficiaries")}
              defaultChecked
            />
            <label htmlFor="has-beneficiaries" className="ml-2 block text-gray-700">
              Sí, deseo registrar beneficiarios
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="no-beneficiaries"
              type="radio"
              value="true"
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              {...register("noBeneficiaries")}
            />
            <label htmlFor="no-beneficiaries" className="ml-2 block text-gray-700">
              No poseo beneficiarios
            </label>
          </div>
        </div>
      </div>
      
      {/* Sección de beneficiarios que se oculta si selecciona "No poseo beneficiarios" */}
      {!noBeneficiaries && (
        <>
          {/* Beneficiario 1 */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Beneficiario 1</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="beneficiary1Name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo *
            </label>
            <input
              id="beneficiary1Name"
              type="text"
              {...register("beneficiary1Name", { 
                required: !noBeneficiaries ? "El nombre del beneficiario 1 es requerido" : false
              })}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                errors.beneficiary1Name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Nombre del beneficiario"
            />
            {errors.beneficiary1Name && (
              <p className="mt-1 text-sm text-red-600">{errors.beneficiary1Name.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="beneficiary1Phone" className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
            </label>
            <input
              id="beneficiary1Phone"
              type="tel"
              onInput={(e) => {
                // Formatea automáticamente mientras se escribe
                const value = e.target.value;
                const formatted = formatPhoneNumber(value);
                e.target.value = formatted;
              }}
              {...register("beneficiary1Phone", { 
                required: !noBeneficiaries ? "El teléfono del beneficiario 1 es requerido" : false,
                // Validación personalizada para permitir escritura parcial
                validate: value => {
                  // Si no hay beneficiarios, no validamos
                  if (noBeneficiaries) return true;
                  
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
                errors.beneficiary1Phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="xxxx-xxxx"
              aria-invalid={errors.beneficiary1Phone ? "true" : "false"}
              aria-describedby={errors.beneficiary1Phone ? "beneficiary1Phone-error" : undefined}
            />
            {errors.beneficiary1Phone && (
              <p className="mt-1 text-sm text-red-600">{errors.beneficiary1Phone.message}</p>
            )}
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="beneficiary1Instagram" className="block text-sm font-medium text-gray-700 mb-1">
              Usuario de Instagram
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">@</span>
              </div>
              <input
                id="beneficiary1Instagram"
                type="text"
                {...register("beneficiary1Instagram")}
                className="w-full p-3 pl-8 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all border-gray-300"
                placeholder="usuario_instagram"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Para contacto en caso de emergencia</p>
          </div>
        </div>
      </div>
      
      {/* Beneficiario 2 */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Beneficiario 2</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="beneficiary2Name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo *
            </label>
            <input
              id="beneficiary2Name"
              type="text"
              {...register("beneficiary2Name", { 
                required: !noBeneficiaries ? "El nombre del beneficiario 2 es requerido" : false
              })}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                errors.beneficiary2Name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Nombre del beneficiario"
            />
            {errors.beneficiary2Name && (
              <p className="mt-1 text-sm text-red-600">{errors.beneficiary2Name.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="beneficiary2Phone" className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
            </label>
            <input
              id="beneficiary2Phone"
              type="tel"
              onInput={(e) => {
                // Formatea automáticamente mientras se escribe
                const value = e.target.value;
                const formatted = formatPhoneNumber(value);
                e.target.value = formatted;
              }}
              {...register("beneficiary2Phone", { 
                required: !noBeneficiaries ? "El teléfono del beneficiario 2 es requerido" : false,
                // Validación personalizada para permitir escritura parcial
                validate: value => {
                  // Si no hay beneficiarios, no validamos
                  if (noBeneficiaries) return true;
                  
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
                errors.beneficiary2Phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="xxxx-xxxx"
              aria-invalid={errors.beneficiary2Phone ? "true" : "false"}
              aria-describedby={errors.beneficiary2Phone ? "beneficiary2Phone-error" : undefined}
            />
            {errors.beneficiary2Phone && (
              <p className="mt-1 text-sm text-red-600">{errors.beneficiary2Phone.message}</p>
            )}
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="beneficiary2Instagram" className="block text-sm font-medium text-gray-700 mb-1">
              Usuario de Instagram
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">@</span>
              </div>
              <input
                id="beneficiary2Instagram"
                type="text"
                {...register("beneficiary2Instagram")}
                className="w-full p-3 pl-8 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all border-gray-300"
                placeholder="usuario_instagram"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Para contacto en caso de emergencia</p>
          </div>
        </div>
      </div>
        </>
      )}
    </FormSection>
  );
}

export default BeneficiariesSection;
