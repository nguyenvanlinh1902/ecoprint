import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { FaCloudUploadAlt, FaFileAlt, FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { addProduct } from '../productSlice';
import '../styles/product-importer.scss';

/**
 * Component cho phép người dùng import sản phẩm từ file CSV
 */
const ProductImporter = ({ onComplete }) => {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Kiểm tra file có đúng định dạng CSV không
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Vui lòng chọn file CSV');
      setFile(null);
      return;
    }

    setError('');
    setFile(selectedFile);
    parseCSVPreview(selectedFile);
  };

  const parseCSVPreview = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n');
        
        // Lấy header và 5 dòng đầu tiên để xem trước
        if (lines.length > 1) {
          const headers = lines[0].split(',').map(h => h.trim());
          
          // Kiểm tra các trường bắt buộc
          const requiredFields = ['name', 'sku', 'price', 'category', 'status'];
          const missingFields = requiredFields.filter(field => !headers.includes(field));
          
          if (missingFields.length > 0) {
            setError(`File thiếu các trường bắt buộc: ${missingFields.join(', ')}`);
            setPreview([]);
            return;
          }

          const previewData = [];
          // Lấy tối đa 5 dòng để xem trước
          for (let i = 1; i < Math.min(lines.length, 6); i++) {
            if (lines[i].trim() === '') continue;
            
            const values = lines[i].split(',').map(v => v.trim());
            const row = {};
            
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            
            previewData.push(row);
          }
          
          setPreview(previewData);
        }
      } catch (err) {
        console.error('Lỗi xử lý file:', err);
        setError('Không thể xử lý file. Vui lòng kiểm tra định dạng CSV.');
      }
    };
    
    reader.readAsText(file);
  };

  const processCSV = async () => {
    if (!file) return;
    
    setImporting(true);
    setResults(null);
    setError('');
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const text = event.target.result;
          const lines = text.split('\n');
          
          if (lines.length <= 1) {
            throw new Error('File không chứa dữ liệu');
          }
          
          const headers = lines[0].split(',').map(h => h.trim());
          const results = {
            total: 0,
            success: 0,
            failed: 0,
            errors: []
          };
          
          // Xử lý từng dòng từ dòng thứ 2 (bỏ qua header)
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '') continue;
            
            results.total++;
            
            try {
              const values = line.split(',').map(v => v.trim());
              const productData = {};
              
              headers.forEach((header, index) => {
                // Xử lý các trường đặc biệt
                if (header === 'price' || header === 'stockQuantity') {
                  productData[header] = parseFloat(values[index]) || 0;
                } else if (header === 'attributes') {
                  try {
                    productData[header] = JSON.parse(values[index] || '[]');
                  } catch {
                    productData[header] = [];
                  }
                } else {
                  productData[header] = values[index] || '';
                }
              });
              
              // Thêm sản phẩm vào database
              await dispatch(addProduct({ productData })).unwrap();
              results.success++;
            } catch (error) {
              results.failed++;
              results.errors.push({
                line: i,
                error: error.message || 'Lỗi không xác định'
              });
            }
          }
          
          setResults(results);
        } catch (error) {
          setError('Lỗi xử lý file: ' + error.message);
        } finally {
          setImporting(false);
        }
      };
      
      reader.onerror = () => {
        setError('Không thể đọc file');
        setImporting(false);
      };
      
      reader.readAsText(file);
    } catch (error) {
      setError('Lỗi: ' + error.message);
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const headers = ['name', 'sku', 'price', 'stockQuantity', 'description', 'category', 'status', 'attributes'];
    const csvContent = headers.join(',') + '\n';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'product_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleComplete = () => {
    setFile(null);
    setPreview([]);
    setResults(null);
    if (onComplete) onComplete(results);
  };

  return (
    <div className="product-importer">
      <div className="importer-header">
        <h2>Import sản phẩm</h2>
        <p>Tải lên file CSV chứa danh sách sản phẩm để nhập hàng loạt</p>
      </div>
      
      {!results && (
        <>
          <div className="template-section">
            <div className="template-info">
              <FaInfoCircle />
              <div>
                <h4>Định dạng file CSV</h4>
                <p>
                  File CSV cần có các cột: name, sku, price, category, status (bắt buộc) 
                  và stockQuantity, description, attributes (tùy chọn)
                </p>
              </div>
            </div>
            <button 
              className="btn btn-outline-primary"
              onClick={downloadTemplate}
            >
              <FaFileAlt /> Tải mẫu CSV
            </button>
          </div>
          
          <div className="upload-section">
            <div className="file-drop-area">
              <input
                type="file"
                id="csv-file"
                accept=".csv"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="csv-file" className="file-label">
                {file ? (
                  <div className="selected-file">
                    <FaFileAlt />
                    <span>{file.name}</span>
                  </div>
                ) : (
                  <div className="upload-message">
                    <FaCloudUploadAlt />
                    <span>Kéo thả file CSV hoặc click để chọn</span>
                  </div>
                )}
              </label>
            </div>
            
            {error && <div className="alert alert-danger mt-3">{error}</div>}
            
            {preview.length > 0 && (
              <div className="preview-section">
                <h4>Xem trước dữ liệu ({preview.length} sản phẩm)</h4>
                <div className="preview-table-wrapper">
                  <table className="preview-table">
                    <thead>
                      <tr>
                        {Object.keys(preview[0]).map(key => (
                          <th key={key}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value, i) => (
                            <td key={i}>{value}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="import-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={processCSV}
                    disabled={importing || preview.length === 0}
                  >
                    {importing ? 'Đang import...' : 'Import sản phẩm'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      
      {results && (
        <div className="results-section">
          <div className="import-summary">
            <h3>Kết quả import</h3>
            <div className="import-stats">
              <div className="stat-item">
                <span className="stat-label">Tổng sản phẩm:</span>
                <span className="stat-value">{results.total}</span>
              </div>
              <div className="stat-item success">
                <span className="stat-label">Thành công:</span>
                <span className="stat-value">{results.success}</span>
              </div>
              <div className="stat-item error">
                <span className="stat-label">Thất bại:</span>
                <span className="stat-value">{results.failed}</span>
              </div>
            </div>
          </div>
          
          {results.errors.length > 0 && (
            <div className="error-list">
              <h4>Danh sách lỗi</h4>
              <ul>
                {results.errors.map((error, index) => (
                  <li key={index}>
                    <FaTimes className="error-icon" />
                    <span>Dòng {error.line}: {error.error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="import-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleComplete}
            >
              <FaCheck /> Hoàn tất
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

ProductImporter.propTypes = {
  onComplete: PropTypes.func
};

export default ProductImporter; 