import React, { useState } from "react";
import axios from "axios";
import { X, Upload, CheckCircle, AlertTriangle, HelpCircle } from "lucide-react";

const ClaimModal = ({ postId, postTitle, questions = [], onClose, onSuccess }) => {
  // Separate states for Description and Answers
  const [description, setDescription] = useState("");
  const [answers, setAnswers] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage("⚠️ Image proof is mandatory.");
      return;
    }
    
    setStatus("loading");
    setErrorMessage("");

    // Combine Description and Answers for the backend
    const finalDescription = `User Description: ${description}\n\nSecurity Answers: ${answers}`;

    const formData = new FormData();
    formData.append("evidenceImage", file);
    formData.append("additionalDescription", finalDescription); // Sending combined text
    formData.append("serialNumber", serialNumber);

    try {
      await axios.post(
        `http://localhost:7777/api/verification/request/${postId}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setStatus("success");
      
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 2000);

    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.response?.data?.message || "Upload failed. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] backdrop-blur-sm">
        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center animate-bounce-in">
          <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="text-green-600 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Claim Sent!</h2>
          <p className="text-gray-500 mt-2">Check 'My Claims' for status updates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gray-900 p-5 flex justify-between items-center text-white shrink-0">
          <div>
            <h2 className="text-lg font-bold">Claiming Item</h2>
            <p className="text-xs text-gray-400 opacity-90 truncate max-w-[250px]">{postTitle}</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* 1. Image Upload (Mandatory) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Upload Proof <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                  previewUrl ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}>
                  {previewUrl ? (
                    <div className="relative">
                      <img src={previewUrl} alt="Preview" className="h-32 mx-auto object-contain rounded shadow-sm bg-white" />
                      <p className="text-xs text-blue-600 mt-2 font-medium">Click to change</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-gray-500">
                      <Upload size={20} className="text-gray-400 mb-1" />
                      <p className="font-medium text-sm">Upload Photo</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Description Box */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Description
              </label>
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                rows="2"
                placeholder="Describe unique features (scratches, stickers)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* 3. Security Questions Section (Mock Questions) */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-2">
                <HelpCircle size={16} /> Security Questions
              </h3>
              
              <ul className="list-disc list-inside text-xs text-blue-700 mb-3 space-y-1 pl-1">
                {questions.length > 0 ? questions.map((q, i) => (
                  <li key={i}>{q}</li>
                )) : (
                  <li>No specific questions provided. Please describe the item in detail.</li>
                )}
              </ul>

              <textarea 
                className="w-full border border-blue-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition text-sm bg-white"
                rows="3"
                placeholder="Answer the questions above here..."
                value={answers}
                onChange={(e) => setAnswers(e.target.value)}
                required
              />
            </div>

            {/* 4. Serial Number */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Serial Number <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="e.g. SN-123456"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
              />
            </div>

            {errorMessage && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
                <AlertTriangle size={16} />
                {errorMessage}
              </div>
            )}

            <button 
              type="submit" 
              disabled={status === "loading"}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition shadow-lg disabled:opacity-70"
            >
              {status === "loading" ? "Submitting..." : "Submit Claim"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClaimModal;