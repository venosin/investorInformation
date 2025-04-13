/**
 * @fileoverview Componente principal de la aplicación de recopilación de información de inversionistas
 * Este archivo define el punto de entrada de la aplicación y estructura el contenido principal,
 * integrando el layout general y el formulario multi-paso para recopilar datos de inversionistas.
 */

// Estilos globales y componentes
import './App.css';
import AppLayout from './components/AppLayout';
import InvestorForm from './components/InvestorForm';

/**
 * Componente principal de la aplicación
 * Presenta el layout general y el formulario para registro de inversionistas
 * 
 * @returns {JSX.Element} Aplicación completa
 */
function App() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Encabezado y descripción del formulario */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Formulario de Información de Inversionista
          </h1>
          <p className="text-lg text-gray-600">
            Complete el siguiente formulario para registrarse como inversionista. 
            Sus datos serán procesados de forma segura y confidencial.
          </p>
        </div>
        
        {/* Formulario multi-paso para recopilar información del inversionista */}
        <InvestorForm />
      </div>
    </AppLayout>
  );
}

export default App;
