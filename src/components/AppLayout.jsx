/**
 * @fileoverview Componente para el layout principal de la aplicación
 * Este componente proporciona la estructura general de la aplicación,
 * incluyendo encabezado, pie de página y área principal para el contenido.
 */

import React from 'react';

/**
 * Componente de layout principal que envuelve toda la aplicación
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido que se renderizará en el área principal
 * @returns {JSX.Element} Layout completo de la aplicación
 */
function AppLayout({ children }) {
  // Año actual para el pie de página
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* ===== ENCABEZADO ===== */}
      <header className="bg-white shadow" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Logo y nombre del portal */}
            <div className="flex items-center">
              <svg 
                className="h-10 w-10 text-blue-600" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h1 className="ml-3 text-2xl font-bold text-gray-800">Investor Portal</h1>
            </div>
            
            {/* Enlace de ayuda */}
            <div>
              <a 
                href="#" 
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                aria-label="Contactar soporte"
              >
                ¿Necesitas ayuda?
              </a>
            </div>
          </div>
        </div>
      </header>
      
      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" role="main" id="main-content">
        {children}
      </main>
      
      {/* ===== PIE DE PÁGINA ===== */}
      <footer className="bg-white border-t border-gray-200" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Sección única: Acerca de Nosotros */}
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Acerca de Nosotros</h3>
            <p className="text-gray-500">
              Somos una plataforma líder en inversiones, comprometidos con el crecimiento financiero de nuestros inversionistas.
            </p>
          </div>
          
          {/* Copyright */}
          <div className="border-t border-gray-200 mt-8 pt-8">
            <p className="text-gray-500 text-center">
              &copy; {currentYear} Investor Portal. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AppLayout;
