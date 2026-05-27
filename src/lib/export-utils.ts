import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Generates a styled PDF report.
 */
export function exportToPDF(data: any[], title: string, filename: string) {
  if (!data || data.length === 0) return;

  const doc = new jsPDF('landscape');
  
  // Title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Subtitle/Date
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => {
    if (typeof row[h] === 'number') {
      return `Rs. ${row[h].toLocaleString('en-IN')}`;
    }
    return String(row[h] || '');
  }));

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 36,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [5, 150, 105] } // Emerald 600
  });

  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Generates a true Excel (.xlsx) report.
 */
export function exportToExcel(data: any[], filename: string) {
  if (!data || data.length === 0) return;

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  // Auto-size columns loosely
  const colWidths = Object.keys(data[0]).map(() => ({ wch: 20 }));
  ws['!cols'] = colWidths;

  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
}
