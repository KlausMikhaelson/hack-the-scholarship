'use client';

import React from 'react';
import { PipelineResult } from '@/types';
import ScholarshipPersonality from './ScholarshipPersonality';
import WeightChart from './WeightChart';
import StrengthMappingTable from './StrengthMappingTable';
import TailoredEssay from './TailoredEssay';
import ExplainabilityTable from './ExplainabilityTable';
import EssayComparison from './EssayComparison';

interface PipelineOutputProps {
  result: PipelineResult;
  onRegenerate?: () => void;
}

export default function PipelineOutput({ result, onRegenerate }: PipelineOutputProps) {
  return (
    <div className="space-y-8">
      {/* Step 1: Scholarship Personality */}
      <ScholarshipPersonality personality={result.scholarshipPersonality} />

      {/* Step 2: Adaptive Weights */}
      <WeightChart data={result.adaptiveWeights} />

      {/* Step 3: Strength Mapping */}
      <StrengthMappingTable mappings={result.strengthMapping} />

      {/* Step 4: Tailored Essay */}
      <TailoredEssay essay={result.tailoredEssay} onRegenerate={onRegenerate} />

      {/* Step 5: Explainability */}
      <ExplainabilityTable rows={result.explainability} />

      {/* Step 6: Before/After Comparison */}
      <EssayComparison 
        originalSample={result.originalSample} 
        tailoredEssay={result.tailoredEssay} 
      />
    </div>
  );
}

