import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';
import type { ExportPreferences } from './exportSettings';

export interface ExportStageItem {
  title: string;
  content: string;
  deadlines?: string[];
}

export interface ExportOptions {
  caseName: string;
  partyRole?: string;
  createdAt?: string;
}

function buildHeaderText(options: ExportOptions): string {
  const parts = [
    `القضية: ${options.caseName || 'غير مسمّاة'}`,
    options.partyRole ? `الصفة: ${options.partyRole}` : undefined,
    `التاريخ: ${new Date(options.createdAt || Date.now()).toLocaleDateString('ar-EG')}`,
  ].filter(Boolean);
  return parts.join(' | ');
}

export function exportResultsToPDF(stages: ExportStageItem[], options: ExportOptions, prefs?: ExportPreferences) {
  if (typeof window === 'undefined') return;
  const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
  const margin = Math.max(24, prefs?.marginPt || 48);
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  const headerTitle = prefs?.headerText || 'ملخص التحليل القانوني';
  doc.text(headerTitle, margin, margin + 16, { align: 'left' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(buildHeaderText(options), margin, margin + 36, { maxWidth });

  let y = margin + 72;
  if (prefs?.logoDataUrl) {
    try { doc.addImage(prefs.logoDataUrl, 'PNG', pageWidth - margin - 64, margin, 64, 64); } catch {}
  }
  stages.forEach((s, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const titleText = `${idx + 1}. ${s.title}`;
    if (prefs?.includeStages !== false) doc.text(titleText, margin, y);
    y += 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const bodyParts: string[] = [];
    if (prefs?.includeInputs) bodyParts.push(`النص: ${s.content}`);
    if (prefs?.includeOutputs !== false) bodyParts.push(`النتيجة: ${s.content}`);
    if (s.deadlines && s.deadlines.length) {
      bodyParts.push(`مواعيد قانونية:
${s.deadlines.map((d, i) => `- ${d}`).join('\n')}`);
    }
    const lines = doc.splitTextToSize((bodyParts.join('\n\n') || '-') as string, maxWidth);
    lines.forEach((line: string) => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 16;
    });

    y += 8;
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  });

  const safeCase = (options.caseName || 'case').replace(/[^\p{L}\p{N}_\- ]/gu, '').slice(0, 50).trim().replace(/\s+/g, '-');
  const dateStr = new Date(options.createdAt || Date.now()).toISOString().slice(0,10);
  const filename = `${safeCase || 'case'}-analysis-${dateStr}.pdf`;
  if (prefs?.footerText) {
    const ph = doc.internal.pageSize.getHeight();
    doc.setFontSize(9);
    doc.text(prefs.footerText, margin, ph - 12, { maxWidth });
  }
  doc.save(filename);

  // سجل تصدير محلي
  try {
    const logs = JSON.parse(localStorage.getItem('export_logs') || '[]');
    logs.push({ type: 'pdf', caseName: options.caseName, partyRole: options.partyRole, date: new Date().toISOString(), filename });
    if (logs.length > 100) logs.splice(0, logs.length - 100);
    localStorage.setItem('export_logs', JSON.stringify(logs));
  } catch {}
}

export async function exportResultsToDocx(stages: ExportStageItem[], options: ExportOptions, prefs?: ExportPreferences) {
  if (typeof window === 'undefined') return;
  const header = buildHeaderText(options);

  const children: Paragraph[] = [
    new Paragraph({
      text: prefs?.headerText || 'ملخص التحليل القانوني',
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({ text: header }),
  ];

  stages.forEach((s, idx) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${idx + 1}. ${s.title}`, bold: true }),
        ],
        spacing: { before: 200, after: 50 },
      }),
    );
    const parts: string[] = [];
    if (prefs?.includeInputs) parts.push(`النص: ${s.content}`);
    if (prefs?.includeOutputs !== false) parts.push(`النتيجة: ${s.content}`);
    if (s.deadlines && s.deadlines.length) {
      parts.push(`مواعيد قانونية:\n${s.deadlines.map((d, i) => `- ${d}`).join('\n')}`);
    }
    const contentLines = (parts.join('\n\n') || '-').split('\n');
    contentLines.forEach((line) => {
      children.push(new Paragraph({ text: line }));
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeCase = (options.caseName || 'case').replace(/[^\p{L}\p{N}_\- ]/gu, '').slice(0, 50).trim().replace(/\s+/g, '-');
  const dateStr = new Date(options.createdAt || Date.now()).toISOString().slice(0,10);
  a.download = `${safeCase || 'case'}-analysis-${dateStr}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  // سجل تصدير محلي
  try {
    const logs = JSON.parse(localStorage.getItem('export_logs') || '[]');
    logs.push({ type: 'docx', caseName: options.caseName, partyRole: options.partyRole, date: new Date().toISOString(), filename: a.download });
    if (logs.length > 100) logs.splice(0, logs.length - 100);
    localStorage.setItem('export_logs', JSON.stringify(logs));
  } catch {}
}


