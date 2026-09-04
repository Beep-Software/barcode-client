const svg = {
  scannerIcon: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <!-- Scanner frame -->
      <rect x="6" y="6" width="52" height="52" rx="6"
            fill="none" stroke="black" stroke-width="2" />

      <!-- Barcode bars -->
      <rect x="18" y="18" width="3" height="28" />
      <rect x="23" y="18" width="2" height="28" />
      <rect x="27" y="18" width="4" height="28" />
      <rect x="33" y="18" width="2" height="28" />
      <rect x="37" y="18" width="3" height="28" />
      <rect x="42" y="18" width="2" height="28" />

      <!-- Scan line -->
      <line x1="14" y1="32" x2="50" y2="32"
            stroke="limegreen" stroke-width="3" />
    </svg>
    `
};

export default svg;