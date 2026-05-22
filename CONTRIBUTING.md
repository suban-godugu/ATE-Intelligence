# Contributing AI Models to ATE Intelligence

The architecture is designed for extreme extensibility. You can add a new AI model in exactly **3 steps** with zero changes to existing backend routes or frontend components.

## The 3-Step Extensibility Rule

### Step A: Create the Model
Create a new file in `ai-models/readers/newModel.model.ts` following the **Two-Phase Pattern**:
1.  **Phase 1 (Deterministic)**: A regex-based parser that handles standard formats without API costs.
2.  **Phase 2 (Enrichment)**: A Claude AI call to handle non-standard annotations or complex sections.

Ensure your model uses strictly typed input/output from `ai-models/types/modelTypes.ts`.

### Step B: Register the Export
Add your model to the central registry in `ai-models/index.ts`:
```typescript
export { readNewFormat } from './readers/newModel.model'
```

### Step C: Map the Type
In `backend/src/services/modelSelector.service.ts`, add your model to the `MODEL_MAP`:
```typescript
const MODEL_MAP: Record<FileType, Function> = {
  // ... existing mappings
  'NEW_FORMAT': readNewFormat
}
```

## Why this works
The upload route, database synchronization, and frontend visualization layers are built to be generic. They consume the output of the `modelSelector`, meaning as long as your new model follows the `modelTypes.ts` contract, the rest of the system "just works."

### Planned Future Models
-   `atpgDetailReader.model.ts`: Full TetraMAX/Modus fault list parsing.
-   `yieldPredictor.model.ts`: ML-based yield forecasting using historical lot data.
-   `equipmentHealthReader.model.ts`: Tester log analysis for preventative maintenance.
-   `failureAnalysis.model.ts`: Die-level failure mode classification.
