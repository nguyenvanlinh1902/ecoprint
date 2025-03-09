import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  LinearProgress,
  Paper,
  Switch,
  Typography,
  Alert,
  AlertTitle,
  Link
} from '@mui/material';
import { Upload, FileExcel, CheckCircle, AlertCircle } from 'tabler-icons-react';
import { useDropzone } from 'react-dropzone';
import { productService } from '../../services/productService';
import { useAuth } from '../../contexts/AuthContext';

const ProductImport = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [importId, setImportId] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [error, setError] = useState(null);
  const [templateUrl, setTemplateUrl] = useState('');

  // Dropzone setup
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
    }
  });

  // Lấy template URL khi component mount
  useEffect(() => {
    const getTemplate = async () => {
      try {
        const response = await productService.getImportTemplate();
        if (response.success) {
          setTemplateUrl(response.templateUrl);
        }
      } catch (error) {
        console.error('Error fetching template:', error);
      }
    };

    getTemplate();
  }, []);

  // Kiểm tra trạng thái import
  useEffect(() => {
    let intervalId;

    if (importId) {
      const checkStatus = async () => {
        try {
          const response = await productService.getImportStatus(importId);
          if (response.success) {
            setImportStatus(response.importStatus);

            // Dừng kiểm tra nếu đã hoàn thành hoặc thất bại
            if (
              response.importStatus.status === 'completed' ||
              response.importStatus.status === 'failed'
            ) {
              clearInterval(intervalId);
            }
          }
        } catch (error) {
          console.error('Error checking import status:', error);
          clearInterval(intervalId);
          setError('Lỗi khi kiểm tra trạng thái import');
        }
      };

      // Kiểm tra ngay lập tức
      checkStatus();

      // Sau đó kiểm tra mỗi 3 giây
      intervalId = setInterval(checkStatus, 3000);

      return () => clearInterval(intervalId);
    }
  }, [importId]);

  // Xử lý upload file
  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('updateExisting', updateExisting);

      const response = await productService.importProducts(formData);
      
      if (response.success) {
        setImportId(response.importId);
      } else {
        setError(response.message || 'Import thất bại');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Lỗi khi upload file: ' + (error.message || error));
    } finally {
      setIsUploading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFile(null);
    setImportId(null);
    setImportStatus(null);
    setError(null);
  };

  // Tính toán phần trăm tiến độ
  const calculateProgress = () => {
    if (!importStatus || importStatus.totalItems === 0) return 0;
    return Math.round((importStatus.processedItems / importStatus.totalItems) * 100);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Import Sản phẩm
        </Typography>
        <Typography variant="body1" paragraph>
          Upload file CSV chứa thông tin sản phẩm để import vào hệ thống.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Lỗi</AlertTitle>
            {error}
          </Alert>
        )}

        {!importId ? (
          // Hiển thị form upload
          <Box sx={{ mb: 3 }}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box
                  {...getRootProps()}
                  sx={{
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    mb: 2,
                    bgcolor: isDragActive
                      ? 'rgba(0, 0, 0, 0.04)'
                      : isDragReject
                      ? 'rgba(255, 0, 0, 0.04)'
                      : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                      cursor: 'pointer'
                    }
                  }}
                >
                  <input {...getInputProps()} />
                  <Upload size={48} strokeWidth={1} color="#999" style={{ marginBottom: 8 }} />
                  {isDragActive ? (
                    <Typography>Thả file vào đây...</Typography>
                  ) : (
                    <Typography>
                      Kéo và thả file CSV vào đây, hoặc click để chọn file
                    </Typography>
                  )}
                </Box>

                {file && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <FileExcel size={24} strokeWidth={1} color="#1E8E3E" />
                    <Typography sx={{ ml: 1 }}>{file.name}</Typography>
                  </Box>
                )}

                <FormControlLabel
                  control={
                    <Switch
                      checked={updateExisting}
                      onChange={(e) => setUpdateExisting(e.target.checked)}
                    />
                  }
                  label="Cập nhật sản phẩm đã tồn tại"
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                disabled={!file || isUploading}
                onClick={handleUpload}
                startIcon={isUploading ? <CircularProgress size={20} /> : null}
              >
                {isUploading ? 'Đang xử lý...' : 'Bắt đầu Import'}
              </Button>

              <Link href={templateUrl} target="_blank" rel="noopener">
                Tải template import
              </Link>
            </Box>
          </Box>
        ) : (
          // Hiển thị trạng thái import
          <Box>
            <Alert
              severity={
                importStatus?.status === 'completed'
                  ? 'success'
                  : importStatus?.status === 'failed'
                  ? 'error'
                  : 'info'
              }
              sx={{ mb: 3 }}
            >
              <AlertTitle>
                {importStatus?.status === 'completed'
                  ? 'Import thành công'
                  : importStatus?.status === 'failed'
                  ? 'Import thất bại'
                  : 'Đang xử lý'}
              </AlertTitle>
              {importStatus?.status === 'processing' && 'Đang xử lý import sản phẩm...'}
              {importStatus?.status === 'completed' &&
                `Đã import thành công ${importStatus.successItems}/${importStatus.totalItems} sản phẩm.`}
              {importStatus?.status === 'failed' && (importStatus.error || 'Import thất bại')}
            </Alert>

            {importStatus?.status === 'processing' && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Tiến độ: {calculateProgress()}% ({importStatus.processedItems}/{importStatus.totalItems})
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={calculateProgress()}
                  sx={{ height: 10, borderRadius: 1 }}
                />
              </Box>
            )}

            {importStatus?.errors && importStatus.errors.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1, color: 'error.main' }}>
                  Lỗi ({importStatus.errors.length})
                </Typography>
                <Paper sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
                  {importStatus.errors.map((error, index) => (
                    <Alert severity="error" key={index} sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        Dòng {error.row}: {error.message}
                      </Typography>
                    </Alert>
                  ))}
                </Paper>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={handleReset}>
                Import file khác
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/admin/products')}
              >
                Quản lý sản phẩm
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ProductImport; 