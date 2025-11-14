// src/components/Spinner.js
import React from 'react';

function Spinner() {
  return (
    <div className="spinner-overlay" role="status" aria-live="polite">
      <div className="spinner">
        <div className="spinner-circle"></div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default Spinner;