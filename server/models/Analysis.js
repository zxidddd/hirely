
import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    candidateName: {
      type: String,
      default: '',
    },

    targetRole: {
      type: String,
      default: '',
    },

    jobDescription: {
      type: String,
      default: '',
    },

    overallScore: {
      type: Number,
      default: 0,
    },

    atsCompatibility: {
      type: Number,
      default: 0,
    },

    experienceMatch: {
      type: Number,
      default: 0,
    },

    skillsMatch: {
      type: Number,
      default: 0,
    },

    strengths: {
      type: [String],
      default: [],
    },

    skillGaps: {
      type: [String],
      default: [],
    },

    recommendations: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Analysis = mongoose.model('Analysis', analysisSchema);

export default Analysis;
