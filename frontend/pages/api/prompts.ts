import type { NextApiRequest, NextApiResponse } from 'next';
import { PalestinianPromptTemplates } from '../../utils/prompts';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  try {
    return res.status(200).json({
      templates: {
        factualExtraction: 'Extract key facts in bullet points (Arabic, Palestinian legal context).',
        legalBasisPS: 'Find Palestinian legal basis (law name, article no., brief summary).',
        pleadingSkeleton: 'Generate a Palestinian pleading skeleton ready to fill.'
      }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unexpected error';
    return res.status(500).json({ error: msg });
  }
}


