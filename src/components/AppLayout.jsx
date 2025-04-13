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
          {/* Secciones del pie de página en 3 columnas en pantallas medianas o más grandes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sección: Acerca de Nosotros */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Acerca de Nosotros</h3>
              <p className="text-gray-500">
                Somos una plataforma líder en inversiones, comprometidos con el crecimiento financiero de nuestros inversionistas.
              </p>
            </div>
            
            {/* Sección: Enlaces Rápidos */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Enlaces Rápidos</h3>
              <nav aria-label="Enlaces de pie de página">
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">Inicio</a>
                  </li>
                  <li>
                    <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">Proyectos</a>
                  </li>
                  <li>
                    <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">Testimonios</a>
                  </li>
                  <li>
                    <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">Preguntas Frecuentes</a>
                  </li>
                </ul>
              </nav>
            </div>
            
            {/* Sección: Contacto */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Contacto</h3>
              <ul className="space-y-2 text-gray-500">
                {/* Teléfono */}
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+503 XXXX-XXXX</span>
                </li>
                
                {/* Correo electrónico */}
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>info@investorportal.com</span>
                </li>
                
                {/* Dirección */}
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>San Salvador, El Salvador</span>
                </li>
              </ul>
            </div>
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
