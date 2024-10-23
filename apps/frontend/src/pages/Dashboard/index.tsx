import React, { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useLoaderData, useNavigate } from "react-router-dom";
import 'semantic-ui-css/semantic.min.css'; // Import Semantic UI CSS
import { Button, Container, Header, Icon, Label, Menu } from "semantic-ui-react";
import DownloadFilePage from "../DownloadFilePage";
import UploadFilePage from "../UploadFilePage";
import './style.css';

const Dashboard: React.FC = () => {
  const userEmail = useLoaderData();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('Dashboard');

  const token = useMemo(() => localStorage.getItem('token'), []);  
  useEffect(() => {
    if (!token) {
      navigate('/auth');
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth');
  };

  const handleMenuClick = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <Container fluid style={{ display: 'flex', height: '100vh', background: '#f4f4f4', overflow: 'hidden' }}>
      <Menu
        vertical
        fixed="left"
        style={{
          width: '200px',
          height: '100%',
          background: '#2c3e50',
          color: '#ecf0f1',
          overflowY: 'auto',
          padding: '1rem 0',
        }}
      >
        <Menu.Item style={{ padding: '1rem', textAlign: 'center' }}>
          <Header as="h4" style={{ color: '#ecf0f1', marginBottom: '0.5rem' }}>
            Logged in as:
          </Header>
          <Label color="grey" size="large">
            {userEmail || ''}
          </Label>
        </Menu.Item>
        <br />
        <Menu.Item as={Link} to="/dashboard" onClick={() => handleMenuClick('Dashboard')} style={{ marginTop: '0.5rem', color: "white" }}>
          Home
        </Menu.Item>
        <Menu.Item as={Link} to="/dashboard/upload" onClick={() => handleMenuClick('Upload')} style={{ marginTop: '0.5rem', color: "white" }}>
          Upload
        </Menu.Item>
        <Menu.Item as={Link} to="/dashboard/download" onClick={() => handleMenuClick('Download')} style={{ marginTop: '0.5rem', color: "white" }}>
          Download
        </Menu.Item>
        <Menu.Item style={{ marginTop: 'auto', padding: '1rem', textAlign: 'center' }}>
          <Button
            circular
            icon
            style={{
              backgroundColor: '#fff',
              border: 'none',
              padding: '0.5rem',
              cursor: 'pointer',
              fontSize: '1.5em',
            }}
            onClick={handleLogout}
            aria-label="Logout"
          >
            <Icon className='icon-off' name="power off" style={{ color: '#e74c3c', fontSize: '1.5em' }} />
          </Button>
          <div style={{ color: '#ecf0f1', marginTop: '0.5rem' }}>
            Logout
          </div>
        </Menu.Item>
      </Menu>

      <div style={{ flex: 1, padding: '20px', marginLeft: '200px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Header as="h1" style={{ color: '#34495e' }}>{currentPage}</Header>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="upload" element={<UploadFilePage />} />
            <Route path="download" element={<DownloadFilePage />} />
            <Route path="/" element={
              <>
                <Header as="h2" style={{ color: '#34495e' }}>Welcome to the Dashboard</Header>
                <p>Select an option from the sidebar.</p>
              </>
            } />
            <Route path="*" element={
              <>
                <Header as="h2" style={{ color: '#e74c3c' }}>404 Not Found</Header>
                <p>Page not found. Please select a valid option from the sidebar.</p>
              </>
            } />
          </Routes>
        </div>
      </div>
    </Container>
  );
};

export default Dashboard;