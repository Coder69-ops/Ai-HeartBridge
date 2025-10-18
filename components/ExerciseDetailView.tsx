
import React from 'react';
import { Exercise } from '../types';
import { Button } from './shared/Button';
import { Card } from './shared/Card';
import Icon from './shared/Icon';

interface ExerciseDetailViewProps {
  exercise: Exercise;
  onNavigate: (view: string) => void;
}

const ExerciseDetailView: React.FC<ExerciseDetailViewProps> = ({ exercise, onNavigate }) => {
  return (
    <div className="max-w-2xl mx-auto">
       <div className="mb-8">
            <Button variant="secondary" onClick={() => onNavigate('exercises')}>
                <Icon name="arrow-left" className="w-5 h-5 mr-2"/>
                Back to All Exercises
            </Button>
       </div>
      <Card>
        <div className="flex flex-col items-center text-center">
            <div className="bg-teal-100 p-3 rounded-full mb-4">
                <Icon name={exercise.icon} className="w-10 h-10 text-teal-600" />
            </div>
            <p className="font-semibold text-teal-600">{exercise.category}</p>
            <h2 className="text-3xl font-bold text-slate-800 mt-1">{exercise.title}</h2>
            <p className="mt-2 text-slate-600 max-w-prose">{exercise.description}</p>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">How to Practice</h3>
            <ul className="space-y-4">
                {exercise.steps.map((step, index) => (
                    <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 mr-4 mt-1">
                            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-teal-600 text-white font-bold">{index + 1}</span>
                        </div>
                        <p className="text-slate-600">{step}</p>
                    </li>
                ))}
            </ul>
        </div>
      </Card>
    </div>
  );
};

export default ExerciseDetailView;
