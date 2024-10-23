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
  const [processedNames, setProcessedNames] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [noInsertedModalOpen, setNoInsertedModalOpen] = useState(false);
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

  const readFile = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        try {
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const text = XLSX.utils.sheet_to_csv(worksheet);
          resolve(text);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          reject(new Error('Error reading file. Please ensure it is a valid Excel file.'));
        }
      };
      reader.onerror = () => reject(new Error('File reading error.'));
      reader.readAsArrayBuffer(file);
    });
  };

  const validateRequiredHeaders = (csvString: string): string[] => {
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

    return errors;
  };

const handleUpload = async () => {
  if (!file) {
    setError('No file selected. Please choose a file to upload.');
    return;
  }

  setLoading(true);
  setError(null);
  setProgress(0);
  setProcessedNames([]);

  const source = axios.CancelToken.source();

  try {
    const fileContent = await readFile(file);
    const validationErrors = validateRequiredHeaders(fileContent);
    if (validationErrors.length > 0) {
      setError(`Errors found: ${validationErrors.join('. ')}`);
      setModalOpen(true);
      resetForm();
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('file', file);
    formData.append('text', fileContent);

    const response = await axios.post(FILE_UPLOAD_URL, formData, {
      cancelToken: source.token,
      onUploadProgress: ({ loaded, total }) => {
        const percent = Math.round((loaded * 100) / (total || 1));
        setProgress(percent);
      },
    });

    setProgress(100);
    if(response?.data){
      const validUsers = response.data
        .filter((item: any) => Array.isArray(item) && item.length > 0)
        .map((item: any) => item[0])
        .filter((user: any) => user && user.first_name && user.last_name)
        .map((user: any) => ({
          fullName: `${capitalizeFirstLetter(user.first_name)} ${capitalizeFirstLetter(user.middle_name || '')} ${capitalizeFirstLetter(user.last_name)}`.trim(),
          firstName: capitalizeFirstLetter(user.first_name),
          lastName: capitalizeFirstLetter(user.last_name),
          middleName: capitalizeFirstLetter(user.middle_name || ''),
        }));
  
      setProcessedNames(validUsers);
  
      if (validUsers.length === 0) {
        setNoInsertedModalOpen(true);
      }
    }

    resetForm();
  } catch (error) {
    console.error('Error occurred during file upload:', error); // Log the error

    const status = error?.response?.status || 0;
    if (status === 400) {
      setError('Please minimize the number of rows or remove some data from the rows.');
    } else {
      setError('An unexpected error has occurred. Please try again.');
      //setError(error?.response?.data?.message || error?.message || 'An unexpected error occurred.');
    }

    setModalOpen(true);
    resetForm();
  } finally {
    setLoading(false);
  }
};

  const capitalizeFirstLetter = (string: string | null) => {
    return string ? string.charAt(0).toUpperCase() + string.slice(1).toLowerCase() : '';
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
      {/* Successfully Inserted Container */}
      {processedNames.length > 0 && (
        <Segment 
          style={{
            position: 'fixed', 
            top: '20px', 
            right: '20px', 
            width: '300px', 
            zIndex: 1,
            backgroundColor: '#e7f3fe',
            border: '1px solid #b3d4fc',
            padding: '10px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            overflow: 'hidden', // Prevent overflow in this segment
          }}
        >
          <Header as="h4">Successfully Inserted:</Header>
          <ul style={{ listStyleType: 'none', padding: 0, overflow: 'hidden' }}>
            {processedNames.map((name, index) => (
              <li key={index}>{name?.fullName}</li>
            ))}
          </ul>
        </Segment>
      )}

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

        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          size="tiny"
          closeIcon
        >
          <Modal.Header>Error</Modal.Header>
          <Modal.Content>
            <p>{error}</p>
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={() => setModalOpen(false)} primary>
              Close
            </Button>
          </Modal.Actions>
        </Modal>

        {/* Modal for No Inserted Names */}
        <Modal
          open={noInsertedModalOpen}
          onClose={() => setNoInsertedModalOpen(false)}
          size="tiny"
          closeIcon
        >
          <Modal.Header>No Inserted Data</Modal.Header>
          <Modal.Content>
            <p>No inserted data is available from Dow Jones.</p>
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={() => setNoInsertedModalOpen(false)} primary>
              Close
            </Button>
          </Modal.Actions>
        </Modal>
      </div>
    </div>
  );
};

export default FileUpload;