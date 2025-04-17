/**
 * @fileoverview Componente principal del formulario de inversionistas
 * Este componente gestiona el formulario de múltiples pasos para recopilar
 * información de inversionistas, incluyendo datos personales, bancarios,
 * beneficiarios y montos de inversión. Los datos se envían por email y se
 * guardan en un archivo Excel.
 */

import { useState, useRef } from "react";
import { useForm } from "react-hook-form"; // Biblioteca para manejar formularios con validaciones
import emailjs from "emailjs-com"; // Servicio para enviar emails directamente desde el cliente

// Importamos los componentes de cada sección del formulario
import FormSection from "./FormSection";
import PersonalInfoSection from "./PersonalInfoSection";
import BankInfoSection from "./BankInfoSection";
import BeneficiariesSection from "./BeneficiariesSection";
import InvestmentSection from "./InvestmentSection";

/**
 * Componente de formulario multi-paso para inversionistas
 * @returns {JSX.Element} Formulario de registro de inversionistas
 */
function InvestorForm() {
  // Estado para controlar el paso actual del formulario (1-4)
  const [step, setStep] = useState(1);
  // Estado para mostrar indicador de carga durante el envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Estado para mostrar mensaje de éxito después del envío
  const [submitSuccess, setSubmitSuccess] = useState(false);
  // Referencia al formulario DOM para acceder desde emailjs
  const formRef = useRef();

  // Configuración del hook useForm para validaciones y manejo del formulario
  const {
    register, // Función para registrar campos en el formulario
    handleSubmit, // Manejador de envío del formulario
    formState: { errors }, // Objeto que contiene errores de validación
    watch, // Función para observar valores de campos
    reset, // Función para resetear el formulario
    trigger, // Función para activar validaciones manualmente
    setValue, // Función para establecer valores manualmente
  } = useForm({
    mode: "onChange", // Validar al cambiar los valores (más reactivo)
  });

  /**
   * Avanza al siguiente paso del formulario, verificando validaciones primero
   * @async
   */
  const nextStep = async () => {
    // Verificar que todos los campos del paso actual sean válidos
    const isValid = await trigger();
    if (isValid) setStep(step + 1);
  };

  /**
   * Retrocede al paso anterior del formulario
   */
  const prevStep = () => {
    setStep(step - 1);
  };

  /**
   * Guarda los datos del formulario en Google Sheets mediante Google Apps Script.
   * @param {Object} formData - Datos completos del formulario
   * @returns {Promise} Promesa que resuelve cuando se completa la operación
   */
  const saveToGoogleSheets = async (formData) => {
    try {
      // URL del endpoint de Google Apps Script desde variables de entorno
      const googleScriptUrl = import.meta.env.VITE_APP_GOOGLE_SCRIPT_URL;

      console.log("Enviando datos a Google Sheets:", formData);

      // Para evitar problemas de CORS, usaremos un enfoque alternativo: una redirección por form
      const form = document.createElement("form");
      form.method = "POST";
      form.action = googleScriptUrl;
      form.target = "_blank"; // Esto abrirá una nueva pestaña para la respuesta
      form.style.display = "none";

      // Convertir el objeto formData a un único campo JSON e incluir el token secreto
      const inputJSON = document.createElement("input");
      inputJSON.type = "hidden";
      inputJSON.name = "formData";
      
      // Obtener las imágenes de localStorage
      const duiFrontPhotoPreview = localStorage.getItem('duiFrontPhotoPreview');
      const duiBackPhotoPreview = localStorage.getItem('duiBackPhotoPreview');
      const paymentReceiptPhotoPreview = localStorage.getItem('paymentReceiptPhotoPreview');
      
      console.log("=== VERIFICACIÓN DE IMÁGENES ANTES DE ENVÍO ====");
      console.log("Imágenes disponibles: ", {
        "DUI Frontal": duiFrontPhotoPreview ? "SÍ (" + duiFrontPhotoPreview.length + " caracteres)" : "NO",
        "DUI Reverso": duiBackPhotoPreview ? "SÍ (" + duiBackPhotoPreview.length + " caracteres)" : "NO",
        "Comprobante": paymentReceiptPhotoPreview ? "SÍ (" + paymentReceiptPhotoPreview.length + " caracteres)" : "NO"
      });
      
      // Verificar formato correcto (debe comenzar con data:image)
      if (duiFrontPhotoPreview && !duiFrontPhotoPreview.startsWith('data:image')) {
        console.error("FORMATO INCORRECTO - DUI Frontal no tiene formato data:image. Primeros 50 caracteres:", duiFrontPhotoPreview.substring(0, 50));
      }
      if (duiBackPhotoPreview && !duiBackPhotoPreview.startsWith('data:image')) {
        console.error("FORMATO INCORRECTO - DUI Reverso no tiene formato data:image. Primeros 50 caracteres:", duiBackPhotoPreview.substring(0, 50));
      }
      if (paymentReceiptPhotoPreview && !paymentReceiptPhotoPreview.startsWith('data:image')) {
        console.error("FORMATO INCORRECTO - Comprobante no tiene formato data:image. Primeros 50 caracteres:", paymentReceiptPhotoPreview.substring(0, 50));
      }
      
        // Imprimir el token para depuración
      console.log("TOKEN ACTUAL EN VARIABLE DE ENTORNO:", import.meta.env.VITE_APP_SECRET_TOKEN || "INDEFINIDO");
      
      // Añadir el token secreto y las imágenes a los datos antes de enviar
      const dataToSend = {
        ...formData,
        secretToken: "a5f9e2c7d3b8h6j4k1m0p9r2s5t7v3x6z8", // Token hardcodeado temporalmente
        duiFrontPhotoPreview: duiFrontPhotoPreview,
        duiBackPhotoPreview: duiBackPhotoPreview,
        paymentReceiptPhotoPreview: paymentReceiptPhotoPreview
      };
      
      console.log("TOKEN ENVIADO (HARDCODEADO):", "a5f9e2c7d3b8h6j4k1m0p9r2s5t7v3x6z8");
      
      console.log("Enviando objeto completo con imágenes");
      inputJSON.value = JSON.stringify(dataToSend);
      form.appendChild(inputJSON);

      // AÑADIR ESTA PARTE - Enviando el origen explícitamente
      const inputOrigin = document.createElement("input");
      inputOrigin.type = "hidden";
      inputOrigin.name = "origin";
      inputOrigin.value = window.location.origin; // Esto capturará http://localhost:5173
      form.appendChild(inputOrigin);

      // Añadir el formulario al DOM, enviarlo y luego eliminarlo
      document.body.appendChild(form);
      form.submit();

      // Mostrar información útil
      console.log("Formulario enviado a Google Sheets mediante redirección");
      console.log(
        "Nota: se abrirá una pestaña de confirmación. Puédela cerrar después de verificar"
      );

      // Eliminar el formulario del DOM después de un corto tiempo
      setTimeout(() => {
        document.body.removeChild(form);
      }, 1000);

      return {
        success: true,
        message: "Datos enviados a Google Sheets mediante redirección",
      };
    } catch (error) {
      console.error("Error al enviar datos a Google Sheets:", error);
      alert(
        `Error al enviar datos a Google Sheets: ${error.message}. Verifica la consola para más detalles.`
      );
      return { success: false, message: error.message };
    }
  };

  /**
   * Maneja el envío del formulario cuando está completo
   * @async
   * @param {Object} formData - Datos completos del formulario
   */
  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      // Preparar el banco para el email (si es "Otro", usar el valor personalizado)
      const bankName =
        formData.bankName === "Otro" ? formData.customBank : formData.bankName;

      // Crear un elemento HTML oculto para almacenar el email de destino
      const templateParams = {
        to_email:
          import.meta.env.VITE_APP_EMAIL_TO ||
          "wilfredopalacios@sierra-investments.net",
        from_name: formData.fullName || "Inversionista Potencial",
        subject: "Nuevo formulario de inversión recibido",
        message: `
          Datos del Inversionista:
          
          Información Personal:
          - Nombre: ${formData.fullName || "No especificado"}
          - DUI: ${formData.duiNumber || "No especificado"}
          - Teléfono: ${formData.phoneNumber || "No especificado"}
          - Email: ${formData.email || "No especificado"}
          
          Datos Bancarios:
          - Banco: ${bankName || "No especificado"}
          - Número de cuenta: ${formData.accountNumber || "No especificado"}
          - Tipo de cuenta: ${formData.accountType || "No especificado"}
          
          Beneficiarios:
          - Beneficiario 1: ${formData.beneficiary1Name || "No especificado"}
          - Teléfono: ${formData.beneficiary1Phone || "No especificado"}
          - Instagram: ${formData.beneficiary1Instagram || "No especificado"}
          
          - Beneficiario 2: ${formData.beneficiary2Name || "No especificado"}
          - Teléfono: ${formData.beneficiary2Phone || "No especificado"}
          - Instagram: ${formData.beneficiary2Instagram || "No especificado"}
          
          Inversión:
          - Monto a invertir: $${formData.investmentAmount || "No especificado"}
          - Comentarios adicionales: ${formData.comments || "Ninguno"}
        `,
      };

      // Para debug: mostrar los datos en consola (remover en producción)
      console.log("Datos del formulario:", formData);
      console.log("Enviando email a:", templateParams.to_email);

      // Guardar los datos en Google Sheets (esta función ya maneja sus propios errores)
      const sheetsResult = await saveToGoogleSheets(formData);
      if (sheetsResult.success) {
        console.log("Datos guardados correctamente en Google Sheets");
      }

      // Esto enviará el formulario por correo electrónico usando EmailJS
      // NOTA: Para que funcione completamente, necesitas crear una plantilla y obtener el ID de usuario.
      await emailjs.send(
        import.meta.env.VITE_APP_EMAILJS_SERVICE_ID || "", // ID del servicio EmailJS
        import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID || "", // ID de la plantilla
        templateParams, // Parámetros con datos del formulario
        import.meta.env.VITE_APP_EMAILJS_USER_ID || "" // Public Key de EmailJS
      );

      // Mostrar mensaje de éxito y resetear formulario
      setSubmitSuccess(true);
      reset();
    } catch (error) {
      console.error("Error sending email:", error);
      alert(
        "Hubo un error al enviar el formulario. Por favor intente de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Pantalla de éxito que se muestra después de enviar el formulario */}
      {submitSuccess ? (
        <div className="p-12 text-center animate-fade-in">
          {/* Icono de verificación circular */}
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          {/* Mensaje de confirmación */}
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            ¡Información enviada con éxito!
          </h2>
          <p className="text-gray-600 mb-8">
            Nos pondremos en contacto contigo pronto.
          </p>
          {/* Botón para reiniciar el formulario */}
          <button
            onClick={() => {
              setSubmitSuccess(false);
              setStep(1);
              // Limpiar localStorage para evitar problemas en el nuevo formulario
              localStorage.removeItem('paymentReceiptPhotoPreview');
              localStorage.removeItem('paymentReceiptPhotoName');
              localStorage.removeItem('duiFrontPhotoPreview');
              localStorage.removeItem('duiFrontPhotoName');
              localStorage.removeItem('duiBackPhotoPreview');
              localStorage.removeItem('duiBackPhotoName');
            }} // Resetea el formulario al estado inicial
            className="px-6 py-3 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors border-2 border-blue-900 shadow-md"
            style={{color: '#ffffff', backgroundColor: '#1d4ed8'}}
            aria-label="Enviar otra solicitud"
          >
            Enviar otra solicitud
          </button>
        </div>
      ) : (
        // Formulario multi-paso
        <>
          {/* Encabezado del formulario con indicador de progreso */}
          <div className="px-8 pt-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">
                Información de Inversionista
              </h1>
              {/* Indicador numérico del paso actual */}
              <div
                className="text-sm font-medium text-gray-500"
                aria-live="polite"
              >
                Paso {step} de 4
              </div>
            </div>

            {/* Barra de progreso visual */}
            <div
              className="w-full bg-gray-200 rounded-full h-2.5 mb-8"
              role="progressbar"
              aria-valuenow={(step / 4) * 100}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }} // Calcula el porcentaje de progreso
              ></div>
            </div>
          </div>

          {/* Formulario principal con referencia para EmailJS */}
          <form
            ref={formRef}
            onSubmit={handleSubmit(onSubmit)}
            className="p-8"
            noValidate
          >
            {/* Renderiza condicionalmente la sección correspondiente al paso actual */}
            {step === 1 && (
              <PersonalInfoSection
                register={register}
                errors={errors}
                setValue={setValue}
                watch={watch}
              />
            )}

            {step === 2 && (
              <BankInfoSection
                register={register}
                errors={errors}
                setValue={setValue}
                watch={watch}
              />
            )}

            {step === 3 && (
              <BeneficiariesSection register={register} errors={errors} />
            )}

            {step === 4 && (
              <InvestmentSection
                register={register}
                errors={errors}
                setValue={setValue}
                watch={watch}
              />
            )}

            {/* Botones de navegación y envío */}
            <div className="flex justify-between mt-10">
              {/* Botón 'Anterior' (visible a partir del paso 2) */}
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors border-2 border-black shadow-md" style={{color: '#000000', backgroundColor: '#ffffff'}}
                  aria-label="Ir al paso anterior"
                >
                  Anterior
                </button>
              )}

              {/* Botón 'Siguiente' o 'Enviar' dependiendo del paso */}
              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto px-6 py-3 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors border-2 border-blue-900 shadow-md" style={{color: '#ffffff', backgroundColor: '#1d4ed8'}}
                  aria-label="Ir al siguiente paso"
                >
                  Siguiente
                </button>
              ) : (
                // Botón de envío final con indicador de carga
                <button
                  type="submit"
                  disabled={isSubmitting} // Deshabilita durante el envío
                  className="ml-auto px-6 py-3 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800 transition-colors disabled:bg-green-400 border-2 border-green-900 shadow-md" style={{color: '#ffffff', backgroundColor: '#15803d'}}
                  aria-busy={isSubmitting}
                  aria-label="Enviar formulario"
                >
                  {isSubmitting ? (
                    // Indicador visual de carga durante el envío
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        ></path>
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    "Enviar Información"
                  )}
                </button>
              )}
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default InvestorForm;
