import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import React, { useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button, Card, Header, Icon, Input, Message, Modal, Pagination, Segment, Table } from 'semantic-ui-react';
import * as XLSX from 'xlsx';
import { DownloadLabel } from '../../constant';
import { FILE_DOWNLOAD_URL } from '../../routes';
import './style.css'; // Custom CSS for datepicker styles

interface User {
  ckycId: number;
  firstName: string;
  lastName: string;
  middleName: string;
  primaryName: string;
  title: string;
  countryTerritoryName: string;
  gender: string;
  score: number;
  birthDate: string;
  createdDate: string;
  dowJonesId: string;
  iconHints: string;
}

const DownloadFilePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [activePage, setActivePage] = useState<number>(1);
  const itemsPerPage = 7;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloadError, setDownloadError] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState<string>('');
  const [downloadFormat, setDownloadFormat] = useState<string>('pdf');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('user_data');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(FILE_DOWNLOAD_URL);
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setDownloadError('Failed to fetch users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setActivePage(1);
  };

  const handleDateChange = (setter: React.Dispatch<React.SetStateAction<Date | null>>) => (date: Date | null) => {
    setter(date);
    setActivePage(1);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const title = "User Data";
    doc.setFontSize(22);
    doc.text(title, 14, 20);
    doc.setFontSize(12);

    const tableColumn = [
      DownloadLabel.fullName, DownloadLabel.country, DownloadLabel.gender, DownloadLabel.birthDate, DownloadLabel.iconHints,
    ];

    const tableRows = displayedUsers.map(user => [
      `${user.firstName}  ${user.middleName || ''} ${user.lastName}`,
      user.countryTerritoryName,
      user.gender,
      user.birthDate,
      user.iconHints,
    ]);

    doc.autoTable(tableColumn, tableRows, {
      startY: 40,
      styles: {
        cellPadding: 3,
        fontSize: 10,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'middle',
        lineWidth: 0.1,
        lineColor: [200, 200, 200],
      },
      headStyles: {
        fillColor: [0, 51, 102],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 11,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 10, bottom: 10, left: 10, right: 10 },
      theme: 'grid',
      autoWidth: true,
    });

    doc.save(`${fileName}.pdf`);
    setDownloadSuccess('PDF downloaded successfully!');
    setDownloadError('');
    setModalOpen(false);
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(displayedUsers.map(user => ({
      [DownloadLabel.fullName]: user.firstName + user.middleName || '' + user.lastName,
      [DownloadLabel.country]: user.countryTerritoryName,
      [DownloadLabel.gender]: user.gender,
      [DownloadLabel.birthDate]: user.birthDate,
      [DownloadLabel.iconHints]: user.iconHints,
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    setDownloadSuccess('Excel downloaded successfully!');
    setDownloadError('');
    setModalOpen(false);
  };

  const handleDownload = () => {
    if (downloadFormat === 'pdf') {
      handleDownloadPDF();
    } else if (downloadFormat === 'excel') {
      handleDownloadExcel();
    }
  };

  const handlePageChange = (event: React.MouseEvent<HTMLAnchorElement>, data: { activePage: number }) => {
    setActivePage(data.activePage);
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesName = `${user.firstName} ${user.lastName} ${user.middleName} ${user.primaryName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const userDate = new Date(user.createdDate);
      const matchesDateRange =
        (!startDate && !endDate) ||
        (startDate && endDate && userDate >= startDate && userDate <= endDate) ||
        (startDate && !endDate && userDate >= startDate) ||
        (!startDate && endDate && userDate <= endDate);
      return matchesName && matchesDateRange;
    }).sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
  }, [users, searchTerm, startDate, endDate]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const displayedUsers = useMemo(() => {
    return filteredUsers.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);
  }, [filteredUsers, activePage, itemsPerPage]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh', backgroundColor: '#f7f9fc', padding: '2rem' }}>
      <Header as="h2" textAlign="center" style={{ marginBottom: '1.5rem', color: '#333' }}>
        Download User Data
      </Header>
      <Input
        placeholder='Search by Full Name...'
        value={searchTerm}
        onChange={handleSearchChange}
        style={{ marginBottom: '1rem', width: '400px' }}
        fluid
      />
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <DatePicker
          selected={startDate}
          onChange={handleDateChange(setStartDate)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Start Date"
          className="custom-datepicker"
          isClearable
        />
        <DatePicker
          selected={endDate}
          onChange={handleDateChange(setEndDate)}
          dateFormat="yyyy-MM-dd"
          placeholderText="End Date"
          className="custom-datepicker"
          isClearable
        />
      </div>
      <Card fluid>
        <Segment>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Ckyc ID <Icon name="id badge" /></Table.HeaderCell>
                  <Table.HeaderCell>First Name <Icon name="user" /></Table.HeaderCell>
                  <Table.HeaderCell>Last Name <Icon name="user" /></Table.HeaderCell>
                  <Table.HeaderCell>Middle Name <Icon name="user" /></Table.HeaderCell>
                  <Table.HeaderCell>Primary Name <Icon name="user" /></Table.HeaderCell>
                  <Table.HeaderCell>Title <Icon name="tag" /></Table.HeaderCell>
                  <Table.HeaderCell>Country Territory <Icon name="globe" /></Table.HeaderCell>
                  <Table.HeaderCell>Gender <Icon name="transgender alternate" /></Table.HeaderCell>
                  <Table.HeaderCell>Score <Icon name="star" /></Table.HeaderCell>
                  <Table.HeaderCell>Birth Date <Icon name="calendar alternate" /></Table.HeaderCell>
                  <Table.HeaderCell>Dow Jones ID <Icon name="money bill alternate" /></Table.HeaderCell>
                  <Table.HeaderCell>Icon Hints <Icon name="info circle" /></Table.HeaderCell>
                  <Table.HeaderCell>Created Date <Icon name="clock" /></Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {loading ? (
                  <Table.Row>
                    <Table.Cell colSpan="12" textAlign="center">Loading...</Table.Cell>
                  </Table.Row>
                ) : displayedUsers.length ? (
                  displayedUsers.map(user => (
                    <Table.Row key={user.ckycId}>
                      <Table.Cell>{user.ckycId}</Table.Cell>
                      <Table.Cell>{user.firstName}</Table.Cell>
                      <Table.Cell>{user.lastName}</Table.Cell>
                      <Table.Cell>{user.middleName}</Table.Cell>
                      <Table.Cell>{user.primaryName}</Table.Cell>
                      <Table.Cell>{user.title}</Table.Cell>
                      <Table.Cell>{user.countryTerritoryName}</Table.Cell>
                      <Table.Cell>{user.gender}</Table.Cell>
                      <Table.Cell>{user.score}</Table.Cell>
                      <Table.Cell>{user.birthDate}</Table.Cell>
                      <Table.Cell>{user.dowJonesId}</Table.Cell>
                      <Table.Cell>{user.iconHints}</Table.Cell>
                      <Table.Cell>{new Date(user.createdDate).toLocaleDateString()}</Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan="12" textAlign="center">No users found.</Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        </Segment>
      </Card>
      {downloadError && <Message negative style={{ marginTop: '1rem' }}>{downloadError}</Message>}
      {downloadSuccess && <Message positive style={{ marginTop: '1rem' }}>{downloadSuccess}</Message>}
      <Pagination
        activePage={activePage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        style={{ marginTop: '1rem' }}
      />
      <Button 
        primary 
        style={{ marginTop: '1rem', width: '400px', position: 'relative' }}
        onClick={() => setModalOpen(true)} // Open modal on click
      >
        Download
      </Button>

      {/* Modal for downloading files */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Modal.Header>Select Download Options</Modal.Header>
        <Modal.Content>
          <Input
            label='File Name'
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder='Enter file name...'
            style={{ marginBottom: '1rem', width: '100%' }}
          />
          <select 
            value={downloadFormat} 
            onChange={(e) => setDownloadFormat(e.target.value)} 
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
          </select>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button primary onClick={handleDownload}>Download</Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
};

export default DownloadFilePage;