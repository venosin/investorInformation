import React from 'react';
import FormSection from './FormSection';

/**
 * @fileoverview Componente para la sección de monto a invertir
 * Incluye el monto de inversión y comentarios adicionales.
 */

function InvestmentSection({ register, errors }) {

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
        {/* Eliminada la sección de proyección de retorno estimado a petición del cliente */}
        
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
      </div>
    </FormSection>
  );
}

export default InvestmentSection;
