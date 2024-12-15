import React, { useState } from 'react';
import './App.css';
import { useCollapse } from 'react-collapsed';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isInsightsOpen, setInsightsOpen] = useState(false);
  const [isQuickAccessOpen, setQuickAccessOpen] = useState(false);
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleInsightsDropdown = () => {
    setInsightsOpen(!isInsightsOpen);
  };

  const toggleQuickAccessDropdown = () => {
    setQuickAccessOpen(!isQuickAccessOpen);
  };

//   const [isExpanded, setIsExpanded] = useState(false);

  // Function to toggle the expanded state
  const toggleExpand = () => {
    // setIsExpanded(!isExpanded);
  };

  console.log('process---', process.env)
  console.log('process---', process.env.REACT_APP_DOMAIN)

  return (
    <div className="collapsible">
        <div className="header" {...getToggleProps()}>
            {isExpanded ? 'Collapse' : 'Expand'}
            <header className="header">
      {/* Left-side with Logo and Navigation */}
      <div className="nav-left">
        {/* Logo */}
        <div className="logo">
          <img src="logo.png" alt="Logo" className="logo-img" /> {/* Replace with your logo */}
        </div>

        {/* Navigation Links */}
        <ul className="nav-list">
          <li><a href="#home">Home</a></li>
          <li><a href="#insights">Insights</a></li>
          <li><a href="#request-access">Request Access</a></li>
          <li className="more-btn">
            <a href="#more">More</a>
            <i className="down-arrow">↓</i>  {/* Down arrow */}
          </li>
          <li 
        style={{
          listStyleType: 'none', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '10px 15px', 
          backgroundColor: '#f4f4f4', 
          borderRadius: '15px'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f4f4f4'}
      >
        <a href="#home">Opened Insights</a>
        <span 
          className="mycircle" 
          style={{
            width: '25px', 
            height: '25px', 
            borderRadius: '50%', 
            backgroundColor: '#df0000', 
            color: 'white', 
            fontSize: '14px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            marginLeft: '10px'
          }}
        >
          7
        </span>
        <span 
          className="down-arrow" 
          style={{
            fontSize: '16px', 
            marginLeft: '5px'
          }}
        >
          &#9660;
        </span>
      </li>

      <li 
        style={{
          listStyleType: 'none', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '10px 15px', 
          backgroundColor: '#f4f4f4', 
          borderRadius: '15px'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f4f4f4'}
      >
        <a href="#more" onClick={toggleExpand} style={{ cursor: 'pointer' }}>Quick Access</a>
        <span 
          className="down-arrow" 
          style={{
            fontSize: '16px', 
            marginLeft: '5px'
          }}
        >
          &#9660;
        </span>
      </li>
      {/* Expandable Content */}
      
        </ul>
      </div>

      {/* Middle section with Insights and Quick Access */}
      <div className="nav-middle">
      <ul className="nav-list">
            <li  style={{
          listStyleType: 'none', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '10px 15px', 
          backgroundColor: '#f4f4f4', 
          borderRadius: '15px'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f4f4f4'}
   ><a href="#home">Opened Insights</a>
            <span className="mycircle">7</span>
            <span class="down-arrow">&#9660;</span></li>
            <li>
                <a href="#more">Quick Access</a>
                <span class="down-arrow">&#9660;</span> 
            </li>
            </ul>
        {/* <div className="dropdown">
        <a href="#home">Opened Insights</a>
  <span className="circle">7</span>
  <span className="down-arrow">&#9660;</span>
          {isInsightsOpen && (
            <ul className="dropdown-menu">
              <li><a href="#insights-1">Insight 1</a></li>
              <li><a href="#insights-2">Insight 2</a></li>
            </ul>
          )}
        </div>
        <div className="dropdown">
          <a href="#quick-access" className="middle-link" onClick={toggleQuickAccessDropdown}>
            Quick Access
            <i className={`down-arrow ${isQuickAccessOpen ? 'rotate' : ''}`}>↓</i>
          </a>
          {isQuickAccessOpen && (
            <ul className="dropdown-menu">
              <li><a href="#access-1">Quick Access 1</a></li>
              <li><a href="#access-2">Quick Access 2</a></li>
            </ul>
          )}
        </div> */}
      </div>

      {/* Right-side Profile & Search */}
      <div className="nav-right">
        <input 
          type="text" 
          className="search-bar" 
          placeholder="Search..." 
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <a href="#profile" className="profile-link">Profile</a>
      </div>
    </header>
        </div>
    
    <div {...getCollapseProps()}>
            <div className="content">
                Now you can see the hidden content. <br/><br/>
                Click again to hide...
            </div>
        </div>
    </div>
  );
};

export default Header;
