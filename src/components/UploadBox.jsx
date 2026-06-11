import { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, X } from 'lucide-react';

export default function UploadBox({ onFileSelect }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      alert('Please upload an Excel file (.xlsx or .xls)');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleBrowse}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${
            dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }`}
        >
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium">
            Drag & drop your attendance Excel file here
          </p>
          <p className="text-gray-400 text-sm mt-1">or click to browse</p>
          <p className="text-gray-400 text-xs mt-4">Supports .xlsx, .xls</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleInputChange}
            accept=".xlsx,.xls"
            className="hidden"
          />
        </div>
      ) : (
        <div className="border rounded-xl p-6 bg-green-50 border-green-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="text-green-600" size={28} />
            <div>
              <p className="font-medium text-gray-800">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            onClick={clearFile}
            className="p-2 hover:bg-green-200 rounded-full text-green-700"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}