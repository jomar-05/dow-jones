import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button, Card, Icon, Input, Message, Modal, Pagination, Radio, Segment, Table } from 'semantic-ui-react';
import * as XLSX from 'xlsx';
import { DownloadLabel } from '../../constant';
import { FILE_REQUEST_DATA_URL } from '../../routes';
import './style.css';

interface User {
  ckyc_id: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
  primary_name: string;
  title: string;
  country_territory_name: string;
  gender: string;
  score: number;
  birth_date: string;
  created_date: string;
  dow_jones_id: string;
  icon_hints: string;
  remarks: string;
}

const DownloadFilePage: React.FC = () => {
  const [activePage, setActivePage] = useState<number>(1);
  const itemsPerPage = 100;
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [downloadError, setDownloadError] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState<string>('');
  const [downloadFormat, setDownloadFormat] = useState<string>('pdf');
  const [fileName, setFileName] = useState<string>('user_data');
  const [requestByFirstName, setRequestByFirstName] = useState<string>('');
  const [requestByLastName, setRequestByLastName] = useState<string>('');
  const [requestByMiddleName, setRequestByMiddleName] = useState<string>('');
  const [requestByDate, setRequestByDate] = useState<Date | null>(null);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [isFullNameSelected, setIsFullNameSelected] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleDateChange = (setter: React.Dispatch<React.SetStateAction<Date | null>>) => (date: Date | null) => {
    setter(date);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const title = "User Data";
    doc.setFontSize(22);
    doc.text(title, 14, 20);
    doc.setFontSize(12);

    const tableColumn = [
      DownloadLabel.Number,
      DownloadLabel.fullName, DownloadLabel.country, DownloadLabel.gender, DownloadLabel.birthDate, DownloadLabel.iconHints,DownloadLabel.snippets
    ];
const tableRows = users.map((user, index) => [
  index + 1, // If you want to display a 1-based index
  `${user.first_name} ${user.middle_name || ''} ${user.last_name}`,
  user.country_territory_name,
  user.gender,
  user.birth_date,
  user.icon_hints,
  user.remarks,
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
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(users.map(user => ({
      [DownloadLabel.fullName]: `${user.first_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name}`,
      [DownloadLabel.country]: user.country_territory_name,
      [DownloadLabel.gender]: user.gender,
      [DownloadLabel.birthDate]: user.birth_date,
      [DownloadLabel.iconHints]: user.icon_hints,
      [DownloadLabel.snippets]: user.remarks
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    setDownloadSuccess('Excel downloaded successfully!');
    setDownloadError('');
  };

  const handleDownload = () => {
    if (downloadFormat === 'pdf') {
      handleDownloadPDF();
    } else if (downloadFormat === 'excel') {
      handleDownloadExcel();
    }
    setIsModalOpen(false);
  };

  const handlePageChange = (event: React.MouseEvent<HTMLAnchorElement>, data: { activePage: number }) => {
    setActivePage(data.activePage);
  };

  const fetchRequestedData = async () => {
    setIsRequesting(true);
    setDownloadError('');
    setDownloadSuccess('');

    if (isFullNameSelected && (!requestByFirstName || !requestByLastName)) {
      setDownloadError('Please provide both First Name and Last Name.');
      setIsRequesting(false);
      return;
    }
    
    try {
      const params: any = {
        limit: itemsPerPage,
      };

      let userRequest: any = null;
      if (isFullNameSelected) {
        userRequest = {
          userRequestName: {
            firstName: requestByFirstName,
            lastName: requestByLastName,
            middleName: requestByMiddleName,
          },
        };
      } else if (requestByDate) {
        params.createdDate = requestByDate.toISOString();
      }

      const response = await axios.get(FILE_REQUEST_DATA_URL, {
        params: {
          userRequest,
          createdDate: params.createdDate,
          limit: itemsPerPage,
        },
      });

      const requestedUsers = response.data || [];
      const total = response.data.total || 0;
      setUsers(requestedUsers);
      setTotalUsers(total);
      setActivePage(1);
      setDownloadSuccess('Data fetched successfully!');
    } catch (err) {
      console.error('Error requesting data:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch data. Please try again later.';
      setDownloadError(errorMessage);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleRequestData = async () => {
    await fetchRequestedData();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f7f9fc', padding: '2rem' }}>
      <div style={{ padding: '.5rem' }}>
        <Segment>
          <Radio
            label='Full Name'
            checked={isFullNameSelected}
            onChange={() => {
              setIsFullNameSelected(true);
              setRequestByFirstName('');
              setRequestByLastName('');
              setRequestByMiddleName('');
              setRequestByDate(null);
            }}
          />
          <Radio
            label='By Date'
            checked={!isFullNameSelected}
            onChange={() => {
              setIsFullNameSelected(false);
              setRequestByFirstName('');
              setRequestByLastName('');
              setRequestByMiddleName('');
            }}
          />
        </Segment>

        {isFullNameSelected && (
          <div style={{ display: 'flex', flexDirection: 'row', gap: '.5rem' }}>
  <Input
    label='First Name'
    value={requestByFirstName}
    onChange={(e) => setRequestByFirstName(e.target.value)}
    placeholder='Enter first name...'
  /> 
  <Input
    label='Last Name'
    value={requestByLastName}
    onChange={(e) => setRequestByLastName(e.target.value)}
    placeholder='Enter last name...'
  /> 
  <Input
    label='Middle Name (optional)'
    value={requestByMiddleName}
    onChange={(e) => setRequestByMiddleName(e.target.value)}
    placeholder='Enter middle name...'
  /> <span style={{marginLeft:"1rem"}}></span>
</div> 
        )}
        {!isFullNameSelected && (
          <DatePicker
            selected={requestByDate}
            onChange={handleDateChange(setRequestByDate)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Request by Created Date"
            className="custom-datepicker"
            isClearable
          />
        )}
         <Button primary onClick={handleRequestData} loading={isRequesting}>
          Search
        </Button>
      </div>

      <Card fluid style={{ maxWidth: '90%', width: '100%', marginTop: '1rem' }}>
        <Segment>
          <div style={{ maxHeight: '410px', overflowY: 'auto', position: 'relative' }}>
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
                {users.length ? (
                  users.map(user => (
                    <Table.Row key={user.dow_jones_id}>
                      <Table.Cell>{user.ckyc_id}</Table.Cell>
                      <Table.Cell>{user.first_name}</Table.Cell>
                      <Table.Cell>{user.last_name}</Table.Cell>
                      <Table.Cell>{user.middle_name}</Table.Cell>
                      <Table.Cell>{user.primary_name}</Table.Cell>
                      <Table.Cell>{user.title}</Table.Cell>
                      <Table.Cell>{user.country_territory_name}</Table.Cell>
                      <Table.Cell>{user.gender}</Table.Cell>
                      <Table.Cell>{user.score}</Table.Cell>
                      <Table.Cell>{user.birth_date}</Table.Cell>
                      <Table.Cell>{user.dow_jones_id}</Table.Cell>
                      <Table.Cell>{user.icon_hints}</Table.Cell>
                      <Table.Cell>{new Date(user.created_date).toLocaleDateString()}</Table.Cell>
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

      <div style={{ marginTop: '.1rem', textAlign: 'center', paddingBottom: '.1rem' }}>
        Showing {users.length} entries 
      </div>
      {downloadError && <Message negative style={{ marginTop: '.1rem' }}>{downloadError}</Message>}
      {downloadSuccess && <Message positive style={{ marginTop: '.1rem' }}>{downloadSuccess}</Message>}
      <Pagination
        activePage={activePage}
        totalPages={Math.ceil(totalUsers / itemsPerPage)}
        onPageChange={handlePageChange}
        style={{ marginTop: '.1rem' }}
      />
      <Button 
        primary 
        style={{ marginTop: '1rem', width: '400px' }}
        onClick={() => setIsModalOpen(true)}
      >
        Download
      </Button>

      {/* Modal for file name and format selection */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Modal.Header>Select Download Options</Modal.Header>
        <Modal.Content>
          <Input
            label='File Name'
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder='Enter file name...'
            style={{ marginBottom: '1rem' }}
          />
          <Segment>
            <Radio
              label='PDF'
              checked={downloadFormat === 'pdf'}
              onChange={() => setDownloadFormat('pdf')}
            />
            <Radio
              label='Excel'
              checked={downloadFormat === 'excel'}
              onChange={() => setDownloadFormat('excel')}
            />
          </Segment>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button primary onClick={handleDownload}>Download</Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
};

export default DownloadFilePage;