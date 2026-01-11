import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, X } from 'lucide-react';

const ReceiptCapture = ({ onCapture, existingImage }) => {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (existingImage) {
      setPreview(existingImage);
    }
  }, [existingImage]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onCapture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    onCapture(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      {preview ? (
        <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 aspect-video bg-gray-100 flex items-center justify-center">
          <img src={preview} alt="Receipt preview" className="max-h-full object-contain" />
          <button
            onClick={clearPreview}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <Camera className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-2" />
            <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600">Camera</span>
          </button>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-2" />
            <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600">Upload</span>
          </button>
        </div>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
    </div>
  );
};

export default ReceiptCapture;
