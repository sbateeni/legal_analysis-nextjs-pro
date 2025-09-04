import { NextApiRequest, NextApiResponse } from 'next';
import { intelligentStageAnalysisService } from '../../../utils/intelligent-stages';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { caseDescription, caseType, documents, parties, jurisdiction, stageId } = req.body;

    if (!caseDescription) {
      return res.status(400).json({ error: 'Case description is required' });
    }

    let result;
    const request = {
      caseDescription,
      caseType,
      documents,
      parties,
      jurisdiction
    };

    switch (stageId) {
      case 'stage1':
        result = await intelligentStageAnalysisService.analyzeStage1_InformationGathering(request);
        break;
      case 'stage2':
        result = await intelligentStageAnalysisService.analyzeStage2_LegalContextAnalysis(request);
        break;
      case 'stage3':
        result = await intelligentStageAnalysisService.analyzeStage3_RiskAnalysis(request);
        break;
      case 'stage4':
        result = await intelligentStageAnalysisService.analyzeStage4_DefenseStrategies(request);
        break;
      case 'stage5':
        result = await intelligentStageAnalysisService.analyzeStage5_SentimentTrendAnalysis(request);
        break;
      case 'stage6':
        result = await intelligentStageAnalysisService.analyzeStage6_FinalRecommendations(request);
        break;
      default:
        return res.status(400).json({ error: 'Invalid stage ID' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in intelligent stage analysis:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
