/**
 * @fileoverview Componente base para cada sección del formulario de inversionistas
 * Este componente proporciona una estructura consistente para todas las secciones
 * del formulario, incluyendo un título y un contenedor para los campos.
 */

import React from 'react';

/**
 * Componente de sección de formulario reutilizable
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título de la sección
 * @param {React.ReactNode} props.children - Contenido de la sección (campos del formulario)
 * @returns {JSX.Element} Sección del formulario con estilo unificado
 */
function FormSection({ title, children }) {
  return (
    <section className="mb-8" aria-labelledby={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      {/* Título de la sección */}
      <h2 
        id={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className="text-xl font-bold text-gray-700 mb-4"
      >
        {title}
      </h2>
      
      {/* Contenedor para los campos del formulario con espaciado vertical uniforme */}
      <div className="space-y-6">
        {children}
      </div>
    </section>
  );
}

export default FormSection;
