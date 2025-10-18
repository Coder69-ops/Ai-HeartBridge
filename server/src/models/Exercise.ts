import mongoose, { Document, Schema } from 'mongoose';

export interface IExercise extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  category: string;
  icon: string;
  description: string;
  steps: string[];
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  framework: 'Gottman' | 'NVC' | 'EFT' | 'General';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExerciseProgress extends Document {
  _id: mongoose.Types.ObjectId;
  coupleId: mongoose.Types.ObjectId;
  exerciseId: mongoose.Types.ObjectId;
  completedBy: mongoose.Types.ObjectId[];
  rating?: number; // 1-5 stars
  feedback?: string;
  dateCompleted: Date;
  timeSpent?: number; // in minutes
}

const exerciseSchema = new Schema<IExercise>({
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  category: {
    type: String,
    required: true,
    maxlength: 100
  },
  icon: {
    type: String,
    required: true,
    maxlength: 50
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  steps: [{
    type: String,
    maxlength: 500
  }],
  duration: {
    type: Number,
    min: 1,
    max: 120,
    default: 15
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  framework: {
    type: String,
    enum: ['Gottman', 'NVC', 'EFT', 'General'],
    default: 'General'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const exerciseProgressSchema = new Schema<IExerciseProgress>({
  coupleId: {
    type: Schema.Types.ObjectId,
    ref: 'Couple',
    required: true
  },
  exerciseId: {
    type: Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },
  completedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    maxlength: 1000
  },
  dateCompleted: {
    type: Date,
    default: Date.now
  },
  timeSpent: {
    type: Number,
    min: 1
  }
}, {
  timestamps: true
});

// Indexes
exerciseSchema.index({ category: 1, framework: 1 });
exerciseSchema.index({ difficulty: 1, isActive: 1 });
exerciseProgressSchema.index({ coupleId: 1, dateCompleted: -1 });

export const Exercise = mongoose.model<IExercise>('Exercise', exerciseSchema);
export const ExerciseProgress = mongoose.model<IExerciseProgress>('ExerciseProgress', exerciseProgressSchema);