import mongoose, { Document, Schema } from 'mongoose';

export interface IDocumentAnalysis extends Document {
  user_id: mongoose.Types.ObjectId;
  analysis_id: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  document_text: string;
  analysis: {
    overall_score: number;
    document_type: string;
    strengths: string[];
    weaknesses: string[];
    legal_compliance_score: number;
    clarity_score: number;
    specific_improvements: string[];
    missing_clauses: string[];
    summary: string;
  };
  created_at: Date;
  updated_at: Date;
}

const DocumentAnalysisSchema: Schema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  analysis_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  original_filename: {
    type: String,
    required: true
  },
  file_size: {
    type: Number,
    required: true
  },
  file_type: {
    type: String,
    required: true
  },
  document_text: {
    type: String,
    required: true
  },
  analysis: {
    overall_score: { type: Number, required: true },
    document_type: { type: String, required: true },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    legal_compliance_score: { type: Number, required: true },
    clarity_score: { type: Number, required: true },
    specific_improvements: [{ type: String }],
    missing_clauses: [{ type: String }],
    summary: { type: String, required: true }
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for better query performance
DocumentAnalysisSchema.index({ user_id: 1, created_at: -1 });
DocumentAnalysisSchema.index({ 'analysis.document_type': 1 });
DocumentAnalysisSchema.index({ 'analysis.overall_score': 1 });

export default mongoose.model<IDocumentAnalysis>('DocumentAnalysis', DocumentAnalysisSchema);