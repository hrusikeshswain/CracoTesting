import React, { useState } from 'react';
import { TextField, MenuItem, FormControl, InputLabel, Button } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Pagination } from '@mui/material';
import Select from './Select';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Alert } from 'react-bootstrap';
import './App.css';


// Sample data for the table
const rows = [
  { id: 1, name: 'John Doe', age: 28 },
  { id: 2, name: 'Jane Smith', age: 34 },
  { id: 3, name: 'Jack Johnson', age: 45 },
  { id: 4, name: 'Alice Brown', age: 23 },
  { id: 5, name: 'Bob White', age: 30 },
  { id: 6, name: 'Charlie Green', age: 37 },
  { id: 7, name: 'David Blue', age: 41 },
  { id: 8, name: 'Eva Black', age: 29 },
  { id: 9, name: 'Grace Grey', age: 33 },
  { id: 10, name: 'Henry Orange', age: 51 },
  { id: 11, name: 'Ivy Purple', age: 26 },
  { id: 12, name: 'Jake Yellow', age: 32 },
  // Add more rows as needed
];

const FormComponent = () => {
  const [formData, setFormData] = useState({
    input1: '',
    input2: '',
    input3: '',
    dropdown1: '',
    dropdown2: ''
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(formData);
  };

//   const [page, setPage] = useState(0);  // Current page
//   const [rowsPerPage, setRowsPerPage] = useState(5);  // Rows per page

//   // Handle page change
//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   // Handle rows per page change
//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);  // Reset to the first page when rows per page changes
//   };

//   // Paginate rows based on page and rowsPerPage
//   const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

const [page, setPage] = useState(1);  // Start from page 1
  const [rowsPerPage, setRowsPerPage] = useState(5);  // Rows per page

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Paginate rows based on page and rowsPerPage
  const paginatedRows = rows.slice((page - 1) * rowsPerPage, page * rowsPerPage);


  const [selectedValue, setSelectedValue] = useState(null);

  const handleOnChange = (value) => {
      setSelectedValue(value);
  };

  const options = [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
      { label: 'Option 3', value: '3' },
      { label: 'Option 4', value: '4' },
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
      { label: 'Option 3', value: '3' },
      { label: 'Option 4', value: '4' },
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
      { label: 'Option 3', value: '3' },
      { label: 'Option 4', value: '4' },
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
      { label: 'Option 3', value: '3' },
      { label: 'Option 4', value: '4' },
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
      { label: 'Option 3', value: '3' },
      { label: 'Option 4', value: '4' },
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
      { label: 'Option 3', value: '3' },
      { label: 'Option 4', value: '4' }
  ];



  return (
    <div>
       <Alert variant="success" dismissible>
      This is a success alert!
      {/* <button type="button" className="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button> */}
    </Alert>
      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'nowrap', // Prevent wrapping
          justifyContent: 'space-between', // Evenly space the fields in the row
        }}>
          {/* Input 1 */}
          <div style={{ flex: 1 }}>
            <label htmlFor="input3" style={{ marginBottom: '8px', display: 'block' }}>
              Input 1
            </label>
             {/* Input 2 */}
          <TextField
            variant="outlined"
            name="input1"
            value={formData.input1}
            onChange={handleChange}
            style={{ flex: 1 }} // Make the input take equal width space
          />
          </div>
        {/* Input 3 */}
        <div style={{ flex: 1 }}>
            <label htmlFor="input3" style={{ marginBottom: '8px', display: 'block' }}>
              Input 3
            </label>
             {/* Input 2 */}
          <TextField
            variant="outlined"
            name="input2"
            value={formData.input2}
            onChange={handleChange}
            style={{ flex: 1 }} // Make the input take equal width space
          />
          </div>
         
          <div style={{ flex: 1 }}>
          
            {/* <h1>React Select Component Demo</h1> */}
            <Select
                style="no-effect"
                label="Select an option"
                value={selectedValue}
                inputId="custom-select"
                option={options}
                isSearchable={true}
                placeholderValue="Search..."
                handleOnChange={handleOnChange}
            />

        </div>
          {/* Input 3 */}
          <div style={{ flex: 1 }}>
            <label htmlFor="input3" style={{ marginBottom: '8px', display: 'block' }}>
              Input 3
            </label>
            <TextField
              id="input3"  // Use id to link with label
              variant="outlined"
              name="input3"
              value={formData.input3}
              onChange={handleChange}
              style={{ width: '100%' }} // Make the input take the full width of its container
            />
          </div>

          {/* Dropdown 1 */}
          <FormControl style={{ flex: 1 }}>
            <InputLabel>Dropdown 1</InputLabel>
            <Select
              label="Dropdown 1"
              name="dropdown1"
              value={formData.dropdown1}
              onChange={handleChange}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="option1">Option 1</MenuItem>
              <MenuItem value="option2">Option 2</MenuItem>
              <MenuItem value="option3">Option 3</MenuItem>
            </Select>
          </FormControl>

          {/* Dropdown 2 */}
          <FormControl style={{ flex: 1 }}>
            <InputLabel>Dropdown 2</InputLabel>
            <Select
              label="Dropdown 2"
              name="dropdown2"
              value={formData.dropdown2}
              onChange={handleChange}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="optionA">Option A</MenuItem>
              <MenuItem value="optionB">Option B</MenuItem>
              <MenuItem value="optionC">Option C</MenuItem>
            </Select>
          </FormControl>
        </div>

        <Button type="submit" variant="contained" color="primary" style={{ marginTop: '20px' }}>
          Submit
        </Button>
      </form>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Age</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.age}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Custom Pagination */}
      <Pagination
        count={Math.ceil(rows.length / rowsPerPage)}  // Total number of pages
        page={page}  // Current page
        onChange={handleChangePage}  // Page change handler
        variant="outlined"
        shape="rounded"
        sx={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}  // Center pagination
      />
    </Paper>
    </div>
  );
};

export default FormComponent;
