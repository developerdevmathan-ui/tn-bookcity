import { useState } from 'react';
import api from '../api/axios';

export default function BulkUpload() {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage(''); // Clear previous messages
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('⚠️ Please select a file first.');
            return;
        }

        // When sending files, we must use "FormData", not JSON
        const formData = new FormData();
        formData.append('file', file); 

        setIsUploading(true);
        setMessage('');

        try {
            // We need to tell the server this is a file upload
            // Override the default Content-Type header to allow multipart/form-data
            const response = await api.post('/books/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage('✅ Success! Books uploaded successfully.');
            setFile(null); // Reset file input
            
            // Reset the file input element
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';
        } catch (error) {
            console.error('Upload error:', error.response?.data);
            
            // Handle validation errors from Laravel
            let errorMsg = 'Upload failed. Check your Excel format.';
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                errorMsg = Object.values(errors).flat().join(', ');
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            }
            
            setMessage(`❌ ${errorMsg}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-4 text-gray-800">📂 Bulk Book Upload</h3>
            <p className="text-sm text-gray-500 mb-4">
                Upload your Excel (.xlsx) file here. Columns required: <br/>
                <code className="bg-gray-100 p-1 rounded text-xs">sku, price, stock, title_en, title_ta</code>
            </p>

            <form onSubmit={handleUpload} className="flex flex-col gap-4">
                <input 
                    type="file" 
                    accept=".xlsx, .csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                />
                
                <button 
                    disabled={isUploading}
                    className={`py-2 px-4 rounded text-white font-bold transition-all
                        ${isUploading ? 'bg-gray-400 cursor-wait' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    {isUploading ? 'Uploading...' : 'Upload Excel File'}
                </button>
            </form>

            {message && (
                <div className={`mt-4 p-3 rounded text-sm font-medium ${message.includes('Success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message}
                </div>
            )}
        </div>
    );
}