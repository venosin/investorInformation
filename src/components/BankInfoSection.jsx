/**
 * @fileoverview Componente para recopilar información bancaria del inversionista
 * Este componente maneja la recopilación de datos sobre la cuenta bancaria
 * donde se depositarán las utilidades generadas por la inversión.
 */

import React, { useState, useEffect } from 'react';
import FormSection from './FormSection';

/**
 * Componente para la sección de información bancaria del formulario
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.register - Función de react-hook-form para registrar campos
 * @param {Object} props.errors - Objeto con errores de validación de los campos
 * @param {Function} props.setValue - Función para establecer valores de campos en el formulario
 * @param {Function} props.watch - Función para observar valores de campos en el formulario
 * @returns {JSX.Element} Sección del formulario con campos bancarios
 */
function BankInfoSection({ register, errors, setValue, watch }) {
  // Estado para controlar si se muestra el campo de texto para otro banco
  const [showOtherBankField, setShowOtherBankField] = useState(false);
  
  // Observar el valor seleccionado en el campo bankName
  const selectedBank = watch("bankName");
  
  // Efecto para mostrar/ocultar campo de texto según la selección
  useEffect(() => {
    setShowOtherBankField(selectedBank === "Otro");
    
    // Si cambia a una opción diferente de "Otro", limpiar el campo customBank
    if (selectedBank !== "Otro") {
      setValue("customBank", "");
    }
  }, [selectedBank, setValue]);
  
  // Lista de bancos disponibles para selección
  const bancosSalvador = [
    'Banco Agrícola',
    'Banco Cuscatlán',
    'Banco Davivienda',
    'Banco Atlántida',
    'Banco Azul',
    'Banco Industrial',
    'Banco Promérica',
    'Banco de América Central',
    'Banco Hipotecario',
    'Banco G&T Continental',
    'Banco de Fomento Agropecuario'
  ];
  
  return (
    <FormSection title="Datos de Cuenta Bancaria para Depositar Utilidades">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campo de selección de banco */}
        <div>
          <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Banco <span className="text-red-500">*</span>
          </label>
          <select
            id="bankName"
            aria-required="true"
            aria-invalid={errors.bankName ? "true" : "false"}
            aria-describedby={errors.bankName ? "bankName-error" : undefined}
            {...register("bankName", { 
              required: "El nombre del banco es requerido" 
            })}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
              errors.bankName ? "border-red-500" : "border-gray-300"
            }`}
          >
            {/* Opción predeterminada */}
            <option value="">Seleccione un banco</option>
            
            {/* Opciones generadas dinámicamente a partir del array */}
            {bancosSalvador.map((banco) => (
              <option key={banco} value={banco}>{banco}</option>
            ))}
            
            {/* Opción adicional para cualquier otro banco */}
            <option value="Otro">Otro</option>
          </select>
          
          {/* Mensaje de error para validación */}
          {errors.bankName && (
            <p id="bankName-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.bankName.message}
            </p>
          )}
          
          {/* Campo para ingresar un banco personalizado si se selecciona 'Otro' */}
          {showOtherBankField && (
            <div className="mt-3">
              <label htmlFor="customBank" className="block text-sm font-medium text-gray-700 mb-1">
                Especifique el banco <span className="text-red-500">*</span>
              </label>
              <input
                id="customBank"
                type="text"
                aria-required="true"
                aria-invalid={errors.customBank ? "true" : "false"}
                aria-describedby={errors.customBank ? "customBank-error" : undefined}
                {...register("customBank", { 
                  required: "Por favor especifique el nombre del banco" 
                })}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                  errors.customBank ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Ingrese el nombre del banco"
              />
              
              {/* Mensaje de error para validación */}
              {errors.customBank && (
                <p id="customBank-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.customBank.message}
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Campo de número de cuenta */}
        <div>
          <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Número de Cuenta Bancaria <span className="text-red-500">*</span>
          </label>
          <input
            id="accountNumber"
            type="text"
            aria-required="true"
            aria-invalid={errors.accountNumber ? "true" : "false"}
            aria-describedby={errors.accountNumber ? "accountNumber-error" : undefined}
            {...register("accountNumber", { 
              required: "El número de cuenta bancaria es requerido",
              // Podemos agregar más validaciones si conocemos el formato específico
              // pattern: { value: /^\d{16}$/, message: "El número debe tener 16 dígitos" }
            })}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
              errors.accountNumber ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Ingrese su número de cuenta"
          />
          
          {/* Mensaje de error para validación */}
          {errors.accountNumber && (
            <p id="accountNumber-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.accountNumber.message}
            </p>
          )}
        </div>
        
        {/* Selección de tipo de cuenta (radio buttons) */}
        <div className="md:col-span-2">
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Cuenta <span className="text-red-500">*</span>
            </legend>
            
            <div className="mt-2 flex space-x-6">
              {/* Opción: Cuenta de Ahorro */}
              <div className="flex items-center">
                <input
                  id="savings"
                  type="radio"
                  value="Ahorro"
                  aria-required="true"
                  aria-describedby={errors.accountType ? "accountType-error" : undefined}
                  {...register("accountType", { 
                    required: "El tipo de cuenta es requerido" 
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="savings" className="ml-2 block text-sm text-gray-700">
                  Ahorro
                </label>
              </div>
              
              {/* Opción: Cuenta Corriente */}
              <div className="flex items-center">
                <input
                  id="checking"
                  type="radio"
                  value="Corriente"
                  aria-required="true"
                  aria-describedby={errors.accountType ? "accountType-error" : undefined}
                  {...register("accountType", { 
                    required: "El tipo de cuenta es requerido" 
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="checking" className="ml-2 block text-sm text-gray-700">
                  Corriente
                </label>
              </div>
            </div>
            
            {/* Mensaje de error para validación */}
            {errors.accountType && (
              <p id="accountType-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.accountType.message}
              </p>
            )}
          </fieldset>
        </div>
      </div>
    </FormSection>
  );
}

export default BankInfoSection;
