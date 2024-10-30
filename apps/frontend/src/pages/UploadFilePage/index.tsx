import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Button, Card, Divider, Header, Icon, Label, Modal, Segment } from 'semantic-ui-react';
import * as XLSX from 'xlsx';
import { ButtonCustomized } from '../../components/Button';
import { FILE_UPLOAD_URL } from '../../routes';
import './style.css';

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setModalStatus] = useState<string | null>(null);
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (selectedFile && isValidFileType(selectedFile)) {
      setFile(selectedFile);
      setProgress(0);
      setModalStatus(null);
    } else {
      setModalStatus('Please upload a valid Excel or CSV file.');
      setFile(null);
    }
  };

// Combined function to read files and validate headers
const readFileAndValidate = (file: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader(); // Create a new FileReader instance

    reader.onload = (event) => {
      let csvData: string; // Variable to hold the CSV data

      const fileType = file.type; // Get the MIME type of the file
      const fileName = file.name; // Get the name of the file

      try {
        // Check if the file is an Excel file
        if (fileType.includes('sheet') || fileType.includes('excel') || 
            fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
          // Read Excel file using XLSX library
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0]; // Get the first sheet name
          const worksheet = workbook.Sheets[firstSheetName]; // Get the first sheet
          csvData = XLSX.utils.sheet_to_csv(worksheet); // Convert the sheet to CSV format
        } 
        else if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
          csvData = event.target?.result as string; // Read CSV file as string
        } 
        else {
          reject(new Error('Unsupported file type. Please upload a CSV or Excel file.'));
          return;
        }
        const rows = csvData.trim().split('\n');
        const validRows = rows.filter(row => {
          const trimmedRow = row.trim();
          // Regex to exclude empty rows or rows with only commas
          return trimmedRow !== '' && !/^,+$/.test(trimmedRow); // Exclude if only commas
        });

        const validRowCount = validRows.length-1; // Count valid rows
        const ROWS_NUMBER = 1000;
        console.log(validRowCount)
        if (validRowCount > ROWS_NUMBER) {
          setModalOpen(true)
          setModalStatus(`The file exceeds the limit of ${ROWS_NUMBER} valid rows with data.`)
          reject(new Error(`The file exceeds the limit of ${ROWS_NUMBER} valid rows with data.`));
          return; // Exit if the limit is exceeded
        }

        // Validate headers using a custom validation function
        const validationResult = validateRequiredHeaders(csvData);
        if (validationResult.isValid) {
          resolve(csvData); // Resolve the promise with the valid CSV data
        } else {
          // Open modal for header format errors
          setModalOpen(true); 
          setHeaderFormatModalOpen(true);
          reject(new Error('Header validation failed.')); // Reject if headers are invalid
        }
      } catch (error) {
        // Catch any errors during file processing
        reject(new Error('Error processing file: ' + error.message));
      }
    };

    reader.onerror = () => reject(new Error('File reading error.')); // Handle file reading errors
    reader.readAsArrayBuffer(file); // Read the file as ArrayBuffer to handle both formats
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
      setModalStatus('No file selected. Please choose a file to upload.');
      setModalOpen(true); // Open modal on error
      return;
    }

    setLoading(true);
    setModalStatus(null);
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
      setModalOpen(true);
      setModalStatus('Process Completed.');
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
      setModalStatus('Upload was canceled.');
    } else if (error?.response) {
      console.error('Server error:', error?.response?.data);
      setModalStatus(`Error: ${error?.response?.data?.message +".Please close the file before you upload and if error still exists again later."}`);
    } else if (error?.code === 'ECONNABORTED') {
      console.error('Request timeout:', error?.message);
      setModalStatus('Error: The request timed out. Please try again.');
    } else {
      console.error('Network error:', error?.message);
      setModalStatus(`Error: ${error?.message}`);
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
    <div className='file-upload-page' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',}}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '20px' }}>
        <Card fluid style={{ transition: 'box-shadow 0.3s ease', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
            setModalStatus(null);
          }}
          size="tiny"
          closeIcon
        >
          <Modal.Header>Status</Modal.Header>
          <Modal.Content>
            <p>{status}</p>
            {headerFormatModalOpen && (
              <ButtonCustomized onClick={() => setHeaderFormatModalOpen(true)} primary>
                 View Required Header Format
              </ButtonCustomized>
            )}
          </Modal.Content>
          <Modal.Actions>
              <ButtonCustomized onClick={() => setModalOpen(false)} primary>
                 Close
              </ButtonCustomized>
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
            <ButtonCustomized onClick={() => setHeaderFormatModalOpen(false)} primary>
              Close
            </ButtonCustomized>
          </Modal.Actions>
        </Modal>
      </div>
    </div>
  );
};

export default FileUpload;