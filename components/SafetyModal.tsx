import React from 'react';
import { Button } from './shared/Button';
import { Card } from './shared/Card';
import Icon from './shared/Icon';

interface SafetyModalProps {
  onClose: () => void;
}

const SafetyModal: React.FC<SafetyModalProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      aria-labelledby="safety-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <Card className="max-w-lg w-full">
        <div className="text-center">
            <Icon name="flag" className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 id="safety-modal-title" className="text-2xl font-bold text-slate-800">Your Safety is Our Priority</h2>
        </div>
        
        <div className="mt-4 text-slate-700 space-y-4">
            <p>
                AI HeartBridge is a tool for improving communication, but it is not a crisis service. 
                <strong> If you are in immediate danger, please call your local emergency services (e.g., 911, 112, 999).</strong>
            </p>
            <div className="p-3 bg-slate-50 rounded-md">
                <h3 className="font-semibold text-slate-800">Crisis & Support Hotlines</h3>
                <p className="text-sm mt-1">
                    For confidential support, you can contact resources like the National Domestic Violence Hotline:
                </p>
                <ul className="mt-2 text-sm space-y-1">
                    <li><strong>Phone:</strong> <a href="tel:1-800-799-7233" className="text-teal-600 hover:underline">1-800-799-7233</a></li>
                    <li><strong>Website:</strong> <a href="https://www.thehotline.org" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">thehotline.org</a> (includes a chat option)</li>
                </ul>
            </div>
             <p className="text-xs text-slate-500">
                Please be aware of your surroundings when accessing these resources. Consider using a private browser or clearing your history if you have safety concerns.
            </p>
        </div>

        <div className="mt-6 text-center">
            <Button onClick={onClose} variant="secondary">
                I Understand
            </Button>
        </div>
      </Card>
    </div>
  );
};

export default SafetyModal;