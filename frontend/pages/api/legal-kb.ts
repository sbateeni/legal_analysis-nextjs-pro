import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

type KBRecord = {
  id: string;
  topic: string;
  jurisdiction: string;
  strategy_title: string;
  strategy_steps: string[];
  legal_basis: Array<{ source: string; article?: string; note?: string }>;
  patterns: string[];
  risk_notes: string[];
  citations: Array<{ title?: string; url?: string; date?: string }>;
  tags: string[];
  reviewed: boolean;
  createdAt: string;
};

type KBFile = {
  version: number;
  jurisdiction: string;
  records: KBRecord[];
};

const KB_PATH = path.join(process.cwd(), 'frontend', 'data', 'legal_kb.json');

function readKB(): KBFile {
  const raw = fs.readFileSync(KB_PATH, 'utf8');
  return JSON.parse(raw) as KBFile;
}

function writeKB(kb: KBFile) {
  fs.writeFileSync(KB_PATH, JSON.stringify(kb, null, 2), 'utf8');
}

function removePII(text: string): string {
  // يزيل أسماء علمية/أرقام هواتف/إيميلات مبسطة
  return text
    .replace(/\b[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, '[email]')
    .replace(/\b\+?\d[\d\s\-()]{7,}\b/g, '[phone]')
    .replace(/\b(?:السيد|السيدة|Mr|Mrs|Ms|Dr)\.?\s+[\p{L}A-Za-z]{2,}(?:\s+[\p{L}A-Za-z]{2,})*/gu, '[name]');
}

function filterRecordPII(rec: KBRecord): KBRecord {
  return {
    ...rec,
    topic: removePII(rec.topic),
    strategy_title: removePII(rec.strategy_title),
    strategy_steps: rec.strategy_steps.map(removePII),
    legal_basis: rec.legal_basis.map(lb => ({ ...lb, note: lb.note ? removePII(lb.note) : lb.note })),
    patterns: rec.patterns.map(removePII),
    risk_notes: rec.risk_notes.map(removePII),
    citations: rec.citations.map(c => ({ ...c, title: c.title ? removePII(c.title) : c.title })),
    tags: rec.tags.map(removePII),
  };
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const q = String(req.query.q || '').toLowerCase();
      const kb = readKB();
      if (!q) return res.status(200).json(kb.records.slice(0, 20));
      const result = kb.records.filter(r =>
        r.topic.toLowerCase().includes(q) ||
        r.strategy_title.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q)) ||
        r.legal_basis.some(lb => (lb.source + (lb.article || '')).toLowerCase().includes(q))
      ).slice(0, 20);
      return res.status(200).json(result);
    }

    if (req.method === 'POST') {
      const adminKey = process.env.KB_ADMIN_KEY || '';
      const provided = (req.headers['x-admin-key'] as string) || (req.query.adminKey as string) || '';
      // إذا تم تعيين مفتاح إداري، يجب مطابقته. إن لم يتم تعيينه، نسمح بالكتابة (وضع التطوير).
      if (adminKey && provided !== adminKey) {
        return res.status(401).json({ error: 'unauthorized' });
      }
      const rec = req.body as KBRecord;
      if (!rec || !rec.id) {
        return res.status(400).json({ error: 'invalid body' });
      }
      const kb = readKB();
      const filtered = filterRecordPII(rec);
      const idx = kb.records.findIndex(r => r.id === rec.id);
      if (idx >= 0) kb.records[idx] = filtered; else kb.records.push(filtered);
      writeKB(kb);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'method not allowed' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unexpected error';
    return res.status(500).json({ error: msg });
  }
}



