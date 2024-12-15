import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';
// import { TextField } from '@mui/material';
import { TextField, Button } from '@material-ui/core';


function App() {
  // console.log('he;l;;;;;')
  // Define state for input fields
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [input3, setInput3] = useState('');

  // State to track whether it's the first click
  const [isFirstClick, setIsFirstClick] = useState(true);

 // Function to handle save button click
 const handleSave = () => {
  // Check if it's the first click
  if (isFirstClick) {
    setIsFirstClick(false); // Set to false after the first click
    
    // Check if any field is empty
    if (!input1 || !input2 || !input3) {
      alert('Please fill all the fields!');
    }
  }

  // Disable the save button if all fields have values
  if (input1 && input2 && input3) {
    alert('Form saved successfully!');
  }
};

// Check if save button should be disabled
const isSaveDisabled = !(input1 && input2 && input3) && !isFirstClick;

const [description, setDescription] = useState('hello'); 

  const handleDescriptionChange = (event) => {
    // Update state on user input
    setDescription(event.target.value);
  };

  

return (
  <div>
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <TextField
        label="Enter some text"
        variant="outlined"
        value={description}
        onChange={handleDescriptionChange}  // Controlled input
        fullWidth
        margin="normal"
      />
      {/* <Button onClick={handleSubmit} variant="contained" color="primary" style={{ marginTop: '20px' }}>
        Submit
      </Button> */}
    </div>
     <div>
        <label>Fi 1:</label>
        <input
          type="text"
          value={input1}
          onChange={(e) => setInput1(e.target.value)} // Update state on change
          placeholder="Enter value for Field 1"
        />
      </div>
    <form>
      {/* Input Field 1 */}
     

      {/* Input Field 2 */}
      <div>
        <label>Field 2:</label>
        <input
          type="text"
          value={input2}
          onChange={(e) => setInput2(e.target.value)} // Update state on change
          placeholder="Enter value for Field 2"
        />
      </div>

      {/* Input Field 3 */}
      {/* <div  className="col-md-1" style={{ display: 'flex', flexDirection: 'column',height : 30 }}
    >
      <label for="broadcast-order">Order<span className="asterisk">*</span></label>
      <TextField
        type="text"
        label="Enter Order"
        readOnly={false}
        disabled={false}
        variant="outlined"
        name="description"
        value={description}          // Controlled input value
        onChange={handleDescriptionChange}      // Update state when user types
        sx={{
          height: 30,
          width: 150,
          '& .MuiInputBase-root': { height: '100%', paddingTop: 1, paddingBottom: 1 },
        }}
      />
      </div>  */}

      {/* Save Button */}
      <div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaveDisabled} // Disable button if fields are empty after first click
        >
          Save
        </button>
      </div>
    </form>
  </div>)
}

export default App;
