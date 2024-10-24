import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Button, Card, Divider, Header, Icon, Label, Modal, Segment } from 'semantic-ui-react';
import * as XLSX from 'xlsx';
import { FILE_UPLOAD_URL } from '../../routes';
import './style.css';

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [headerFormatModalOpen, setHeaderFormatModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const email = localStorage.getItem('token') || '';

  // Prevent scrolling when the component mounts
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const isValidFileType = (file: File): boolean => {
    const validExtensions = ['.xls', '.xlsx', '.xltx', '.xlsm', '.csv'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return fileExtension ? validExtensions.includes(`.${fileExtension}`) : false;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (selectedFile && isValidFileType(selectedFile)) {
      setFile(selectedFile);
      setProgress(0);
      setError(null);
    } else {
      setError('Please upload a valid Excel or CSV file.');
      setFile(null);
    }
  };

  // Combined function to read files and validate headers
  const readFileAndValidate = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        let csvData: string;

        const fileType = file.type;
        const fileName = file.name;

        try {
          if (fileType.includes('sheet') || fileType.includes('excel') || 
              fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
            // Read Excel file
            const data = new Uint8Array(event.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            csvData = XLSX.utils.sheet_to_csv(worksheet);
          } else if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
            // Read CSV file
            csvData = event.target?.result as string;
          } else {
            reject(new Error('Unsupported file type. Please upload a CSV or Excel file.'));
            return;
          }

          // Validate headers
          const validationResult = validateRequiredHeaders(csvData);
          if (validationResult.isValid) {
            resolve(csvData); 
          } else {
            setModalOpen(true); 
            setHeaderFormatModalOpen(true);
            reject(new Error('Header validation failed.'));
          }
        } catch (error) {
          reject(new Error('Error processing file: ' + error.message));
        }
      };

      reader.onerror = () => reject(new Error('File reading error.'));
      reader.readAsArrayBuffer(file); // Read as ArrayBuffer to handle both formats
    });
  };

  // Function to validate required headers
  const validateRequiredHeaders = (csvString: string): { isValid: boolean; errors: string[] } => {
    const lines = csvString.trim().split('\n');
    const requiredHeaders = ['First Name', 'Last Name', 'CKYC ID', 'Middle Name'];
    const errors: string[] = [];
    const foundHeaders: Set<string> = new Set();

    const headers = lines[0]?.split(',').map(header => header.trim()) || [];
    requiredHeaders.forEach(header => {
      if (!headers.includes(header)) {
        foundHeaders.add(header);
      }
    });

    if (foundHeaders.size > 0) {
      errors.push(`Missing required columns: ${Array.from(foundHeaders).join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleUpload = async () => {
    if (!file) {
      setError('No file selected. Please choose a file to upload.');
      setModalOpen(true); // Open modal on error
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const csvData = await readFileAndValidate(file); // Get csvData for further processing
      console.log(csvData);

      // Proceed with file upload
      const formData = new FormData();
      formData.append('email', email);
      formData.append('file', file);

      const response = await axios.post(FILE_UPLOAD_URL, formData, {
        onUploadProgress: ({ loaded, total }) => {
          const percent = Math.round((loaded * 100) / (total || 1));
          setProgress(percent);
        },
        timeout: 60000,
      });

      setProgress(100);
      console.log('Upload successful:', response.data);
      resetForm(); // Reset the form after a successful upload
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error: any) => {
    if (axios.isCancel(error)) {
      console.error('Upload canceled:', error?.message);
      setError('Upload was canceled.');
    } else if (error?.response) {
      console.error('Server error:', error?.response?.data);
      setError(`Error: ${error?.response?.data?.message || 'Upload failed.'}`);
    } else if (error?.code === 'ECONNABORTED') {
      console.error('Request timeout:', error?.message);
      setError('Error: The request timed out. Please try again.');
    } else {
      console.error('Network error:', error?.message);
      setError(`Error: ${error?.message}`);
    }
    setModalOpen(true); // Open modal on error
    resetForm()
  };

  const resetForm = () => {
    setFile(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className='file-upload-page' style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '20px' }}>
        <Card fluid style={{ transition: 'box-shadow 0.3s ease', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Segment placeholder style={{ padding: '2rem', flex: 1 }}>
            <Header as="h2" icon style={{ color: '#4CAF50', cursor: 'pointer', textAlign: 'center' }} onClick={handleIconClick}>
              <Icon name="upload" />
              Upload a file (Excel/CSV)
            </Header>
            <Divider />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xls,.xlsx,.csv"
              style={{ display: 'none' }}
            />
            {file && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                  {file.name} - {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <div style={{ marginBottom: '1.5rem', height: '100px', width: '100px', margin: '0 auto' }}>
                  <CircularProgressbar
                    value={progress}
                    text={`${progress}%`}
                    styles={buildStyles({
                      textSize: '16px',
                      pathColor: '#4CAF50',
                      textColor: '#4CAF50',
                      trailColor: '#d6d6d6',
                    })}
                  />
                </div>
                {loading && <Label style={{ display: 'block', marginBottom: '1rem' }}>Processing your file...</Label>}
                <br />
                <Button 
                  primary 
                  onClick={handleUpload} 
                  style={{ backgroundColor: '#4CAF50', borderRadius: '5px', width: '100%' }} 
                  loading={loading} 
                  disabled={loading}
                >
                  Upload
                </Button>
              </div>
            )}
          </Segment>
        </Card>

        {/* Error Modal */}
        <Modal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setError(null);
          }}
          size="tiny"
          closeIcon
        >
          <Modal.Header>Error</Modal.Header>
          <Modal.Content>
            <p>{error}</p>
            {headerFormatModalOpen && (
              <Button onClick={() => setHeaderFormatModalOpen(true)} primary>
                View Required Header Format
              </Button>
            )}
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={() => setModalOpen(false)} primary>
              Close
            </Button>
          </Modal.Actions>
        </Modal>

        {/* Header Format Modal */}
        <Modal
          open={headerFormatModalOpen}
          onClose={() => setHeaderFormatModalOpen(false)}
          size="tiny"
          closeIcon
        >
          <Modal.Header>Required Header Format</Modal.Header>
          <Modal.Content>
            <p>Please ensure your file contains the following headers:</p>
            <ul>
              <li>First Name</li>
              <li>Last Name</li>
              <li>CKYC ID</li>
              <li>Middle Name</li>
            </ul>
            <p>Ensure that these headers are present in the first row of your CSV or Excel file.</p>
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={() => setHeaderFormatModalOpen(false)} primary>
              Close
            </Button>
          </Modal.Actions>
        </Modal>
      </div>
    </div>
  );
};

export default FileUpload;