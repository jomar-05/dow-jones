import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import React, { useCallback, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Card, Icon, Input, Loader, Message, Modal, Pagination, Popup, Radio, Segment, Table, TextArea } from 'semantic-ui-react';
import * as XLSX from 'xlsx';
import { ButtonCustomized } from '../../components/Button';
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
  const [users, setUsers] = useState<User[]>([]);
  const [paginatedUsers, setPaginatedUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalPersonRemarksOpen, setModalPersonRemarks] = useState<boolean>(false);
  const itemsPerPage = 100; // Fetch 10 users per page

  const handleDateChange = (setter: React.Dispatch<React.SetStateAction<Date | null>>) => (date: Date | null) => {
    setter(date);
  };

  const fetchRequestedData = useCallback(async () => {
    setIsRequesting(true);
    setDownloadError('');
    setDownloadSuccess('');

    if (isFullNameSelected && (!requestByFirstName || !requestByLastName)) {
      setDownloadError('Please provide both First Name and Last Name.');
      setIsRequesting(false);
      return;
    }

    try {
      const params: any = {};
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
        },
      });
      console.log(response.data)
const requestedUsers: User[] = response.data || [];

if (requestedUsers.length > 0) {
  setUsers(requestedUsers); // Combine uniqueUsers with prevUsers
  setTotalUsers(requestedUsers.length);
  setCurrentPage(1); // Reset to first page
  paginateUsers(requestedUsers, 1); // Paginate for the first page
  setDownloadSuccess('Data fetched successfully!');
} else {
  setUsers(requestedUsers); // Combine uniqueUsers with prevUsers
  setTotalUsers(requestedUsers.length);
  setCurrentPage(1); // Reset to first page
  paginateUsers(requestedUsers, 1); // Paginate for the first page
  setDownloadSuccess('No users found.');
}
    } catch (err) {
      console.error('Error requesting data:', err);
      const errorMessage = err?.response?.data?.message || 'Failed to fetch data. Please try again later.';
      setDownloadError(errorMessage);
    } finally {
      setIsRequesting(false);
    }
  }, [isFullNameSelected, requestByFirstName, requestByLastName, requestByMiddleName, requestByDate]);

const paginateUsers = (userList: User[], page: number) => {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  setPaginatedUsers(userList.slice(startIndex, endIndex));
};

  const handleRequestData = async () => {
    await fetchRequestedData();
    setTimeout(()=>{
      setDownloadSuccess('')
      setDownloadError('')
    },2000)
  };

  const handlePageChange = (e: React.MouseEvent, { activePage }: { activePage: number }) => {
    setCurrentPage(activePage);
    paginateUsers(users, activePage); // Paginate using the current users
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const title = "User Data";
    doc.setFontSize(22);
    doc.text(title, 14, 20);
    doc.setFontSize(12);

    const tableColumn = [
      DownloadLabel.Number,
      DownloadLabel.fullName,
      DownloadLabel.country,
      DownloadLabel.gender,
      DownloadLabel.birthDate,
      DownloadLabel.iconHints,
      DownloadLabel.snippets
    ];

    const tableRows = paginatedUsers.map((user, index) => [
      index + 1 + (currentPage - 1) * itemsPerPage, // Adjust index for pagination
      `${user.first_name} ${user.middle_name || ''} ${user.last_name}`,
      user.country_territory_name,
      user.gender,
      user.birth_date,
      user.icon_hints,
      user.remarks,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
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
    const worksheet = XLSX.utils.json_to_sheet(paginatedUsers.map(user => ({
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

useEffect(() => {
  paginateUsers(users, currentPage);
}, [users, currentPage]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#f7f9fc'}}>
      <div>
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
            style={{margin:'.5rem'}}
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
            />
          <ButtonCustomized primary onClick={handleRequestData} loading={isRequesting}>
            Search
          </ButtonCustomized>
          </div>
        )}
        {!isFullNameSelected && (
          <>
            <DatePicker
              selected={requestByDate}
              onChange={handleDateChange(setRequestByDate)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Request by Created Date"
              className="custom-datepicker"
              isClearable
            />
            <ButtonCustomized primary style={{marginLeft:"1rem"}} onClick={handleRequestData} loading={isRequesting}>
              Search
            </ButtonCustomized>
          </>
        )}
      </div>
        <div style={{ display: 'flex', justifyContent: 'flex-start', maxWidth: '100%', width:'100%' }}>
          <ButtonCustomized primary style={{ marginTop: '.2rem', width: 'auto' }} 
            onClick={() => setIsModalOpen(paginatedUsers.length > 0)} loading={isRequesting}>
               <Icon name="download" />
                 Download
          </ButtonCustomized>   
      </div>
      <Card fluid style={{ maxWidth: '2040px', width: '100%', marginTop: '1rem', heigt:'100vh'}}>
        <Segment>
          <div style={{ maxHeight: '410px', overflowY: 'auto', position: 'relative' }}>
            {isRequesting ? ( // Show loader when requesting data
              <Loader active inline="centered" />
            ) : (
              <>
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
                    {paginatedUsers.length ? (
                      paginatedUsers.map(user => (
                        <Popup
                        style={{color:'red'}}
                          key={user.dow_jones_id}
                          trigger={<Table.Row
                            className="person"
                            onClick={() => {
                              setSelectedUser(user); // Set the selected user
                              setModalPersonRemarks(true); // Open the modal
                            } }
                          >
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
                          </Table.Row>}
                          content={`Show this person's remarks.`} // Tooltip content
                          position="top left" // Position of the tooltip
                        />

                      ))
                    )
                      : (
                        <Table.Row>
                          <Table.Cell colSpan="12" textAlign="center">No users found.</Table.Cell>
                        </Table.Row>
                      )}
                  </Table.Body>
                </Table><Modal open={isModalPersonRemarksOpen} onClose={() => setModalPersonRemarks(false)} size="small" style={{ height: '400px' }}>
                 <Modal.Header>{`${selectedUser?.first_name} ${selectedUser?.last_name} - Remarks`}</Modal.Header>
                  <Modal.Content style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {selectedUser && (
                          selectedUser.remarks ? (
                            <TextArea
                              value={selectedUser.remarks}
                              readOnly
                              style={{ width: '100%', height: '100%', fontSize:'large', resize: 'none', flexGrow: 1 }}
                            />
                          ) : (
                            <div style={{ textAlign: 'center', padding: '20px', fontSize:'large'}}>Unavailable</div>
                          )
                        )}
                  </Modal.Content>
                  <Modal.Actions>
                    <ButtonCustomized onClick={() => setModalPersonRemarks(false)}>
                        Close
                    </ButtonCustomized>
                  </Modal.Actions>
                </Modal></>
            )}
          </div>
        </Segment>
      </Card>
      {/* Fixed Pagination at the bottom */}
      <div style={{ 
          position: 'fixed', 
          bottom: '0', 
          left: '0', 
          right: '0', 
          backgroundColor: 'white', 
          textAlign: 'center', 
          padding: '1rem',
          boxShadow: '0 -2px 5px rgba(0,0,0,0.1)', // Optional: Add shadow for better visibility
      }}>
        <div> {/* Adjust padding based on the height of the footer */}
          <div style={{textAlign: 'center', paddingBottom: '.1rem' }}>
              Showing {paginatedUsers.length}/{totalUsers} entries 
          </div>
          {downloadError && <Message negative={true} style={{ marginTop: '.1rem' }}>{downloadError}</Message>}
          {downloadSuccess && <Message positive={true} style={{ marginTop: '.1rem' }}>{downloadSuccess}</Message>}
          {`Page: ${currentPage}` }
      </div>
          <Pagination
              activePage={currentPage}
              totalPages={Math.ceil(totalUsers / itemsPerPage)}
              onPageChange={handlePageChange}
          />
      </div>
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
          <ButtonCustomized onClick={() => setIsModalOpen(false)}>
              Cancel
          </ButtonCustomized>
          <ButtonCustomized primary onClick={handleDownload}>
              Download
          </ButtonCustomized>
        </Modal.Actions>
      </Modal>
    </div>
  );
};

export default DownloadFilePage;