import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useRef, useState } from 'react';

export function usePDFExport(filename = 'smartmoney-export') {
  const ref = useRef(null);
  const [exporting, setExporting] = useState(false);

  async function exportPDF() {
    if (!ref.current) return;
    setExporting(true);

    try {
      const canvas = await html2canvas(ref.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0A0A0F',
        scrollY: -window.scrollY,
        windowWidth: ref.current.scrollWidth,
        windowHeight: ref.current.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();

      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${filename}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  return { ref, exportPDF, exporting };
}