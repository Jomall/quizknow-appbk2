import React from 'react';
import { Download, X } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Export Data</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => onExport('csv')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Download size={16} />
            Export as CSV
          </button>
          <button
            onClick={() => onExport('json')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <Download size={16} />
            Export as JSON
          </button>
          <button
            onClick={() => onExport('pdf')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            <Download size={16} />
            Export as PDF
          </button>
        </div>
      </div>
    </div>
  );
};
