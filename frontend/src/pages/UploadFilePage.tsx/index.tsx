import axios from 'axios';
import React, { useRef, useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Button, Card, Divider, Header, Icon, Message, Modal, Segment } from 'semantic-ui-react';
import { fileUploadUrl } from '../../constant/api';
import './style.css';

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverResponse, setServerResponse] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      setServerResponse(null); // Reset server response on new file selection
    } else {
      setError('Please upload a valid Excel or CSV file.');
      setFile(null);
    }
  };

 const countValidRowsInFile = async (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;

      // Split by line breaks and map each row to an array of its cells
      const rows = text.split('\n').map(row => row.split(',')); // Assuming CSV format

      // Define the expected number of columns
      const expectedColumns = 3; // Change this to the number of columns you expect

      // Count rows that have data in all expected columns, but limit to 10 valid rows
      let validRowCount = 0;
      const validRowsData: string[][] = []; // Array to hold valid rows data

      for (const row of rows) {
        // Check if the row has data in all expected columns
        if (row.length === expectedColumns && row.some(cell => cell.trim() !== '')) {
          validRowCount++;
          validRowsData.push(row); // Store the valid row

          // Stop counting if we've reached the maximum of 10 valid rows
          if (validRowCount >= 10) {
            break;
          }
        }
      }

      console.log(`Number of valid rows: ${validRowCount}`); // Log the valid row count
      console.log('Data of valid rows:'); // Log the data of valid rows
      validRowsData.forEach((validRow, index) => {
        console.log(`Row ${index + 1}:`, validRow); // Log each valid row's data
      });

      resolve(validRowCount); // Return the count of valid rows
    };
    reader.onerror = reject;
    reader.readAsText(file); // Adjust this if you need to handle binary formats
  });
};

  const handleUpload = async () => {
    if (!file) {
      setError('No file selected. Please choose a file to upload.');
      return;
    }

    const rowCount = await countValidRowsInFile(file);
    if (rowCount > 10) {
      setIsModalOpen(true);
      return; // Stop the upload if row count exceeds 10
    }

    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    setError(null);
    setProgress(0); // Reset progress on new upload

    try {
      const response = await axios.post(fileUploadUrl, formData, {
        onUploadProgress: ({ loaded, total }) => {
          const percent = Math.round((loaded * 100) / (total || 1));
          setProgress(percent);
        },
      });
      
      setProgress(100);
      console.log('File uploaded successfully:', response.data);
      setServerResponse(response.data.message); // Capture server response
      resetForm(); // Reset all fields after a successful upload
    } catch (error) {
      console.error('Error uploading file:', error);
      if (axios.isAxiosError(error) && error.response) {
        setError(`Failed to upload the file: ${error.response.data.message || 'Server error.'}`);
      } else {
        setError('Failed to upload the file. Please try again later.');
      }
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setProgress(0);
    setServerResponse(null); // Clear server response
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input
    }
  };

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f7f9fc' }}>
      <Card
        fluid
        style={{ width: '400px', transition: 'box-shadow 0.3s ease' }}
      >
        <Segment placeholder style={{ padding: '3rem' }}>
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
                {file.name} - {file.size} bytes
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
              {error && <Message negative style={{ marginTop: '1rem' }}>{error}</Message>}
              {serverResponse && <Message positive style={{ marginTop: '1rem' }}>{serverResponse}</Message>}
            </div>
          )}
        </Segment>
      </Card>

      {/* Modal for row limit warning */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} size='tiny'>
        <Modal.Header>Row Limit Exceeded</Modal.Header>
        <Modal.Content>
          <p>Max limit of rows must be 10. Please reduce the number of rows in the file.</p>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setIsModalOpen(false)} primary>
            OK
          </Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
};

export default FileUpload;