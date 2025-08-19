import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Navbar, 
  Button, 
  ListGroup,
  Dropdown,
  Offcanvas
} from 'react-bootstrap';
import { 
  HouseDoor,
  People,
  Gear,
  PersonCircle,
  BoxArrowRight,
  Lock,
  ChevronLeft,
  ChevronRight,
  ListCheck,
  CurrencyDollar,
  Envelope
} from 'react-bootstrap-icons';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './Base.css';

export const Base = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
      // Close sidebar by default on mobile
      if (window.innerWidth < 992) {
        setSidebarOpen(false);
      } else {
        // Restore desktop state
        const savedState = localStorage.getItem('sidebarOpen');
        setSidebarOpen(savedState ? JSON.parse(savedState) : true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem('sidebarOpen', JSON.stringify(newState));
  };

  const navItems = [
    { path: '/dashboard', icon: <HouseDoor />, label: 'Dashboard' },
    { 
      path: '/task-manager', 
      icon: <ListCheck />, 
      label: 'Task Manager'
      
    },
    { path: '/expense-tracker', icon: <Gear />, label: 'Expense Tracker' ,
       subItems: [
        { path: '/income-manager', label: 'Add Income' },
        { path: '/transaction-manager', label: 'Add Transaction' },
      ]
     },
     { 
      path: '/debt-manager', 
      icon: <CurrencyDollar />, 
      label: 'Debt Manager'
      
    },
    { 
      path: '/email-manager', 
      icon: <Envelope />, 
      label: 'Email Manager'
      
    },
  ];

  const isActive = (path) => {
    return location.pathname === path || 
           (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  return (
    <div className={`base-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Top Navbar */}
      <Navbar bg="light" variant="dark" expand="lg" fixed="top" className="main-navbar">
        <Container fluid>
          <Button 
            variant="outline-light" 
            onClick={toggleSidebar}
            className="sidebar-toggle me-2"
          >
            {sidebarOpen ? <ChevronLeft color='dark'/> : <ChevronRight color='dark' />}
          </Button>
          
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <span className="brand-text text-dark">Admin Dashboard</span>
          </Navbar.Brand>
          
          <Dropdown align="end" className="ms-auto">
            <Dropdown.Toggle as={Button} variant="outline-light" className="user-dropdown">
              <PersonCircle className="user-avatar me-2" color='dark' />
              <span className="user-name text-dark d-none d-md-inline">Admin</span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="dropdown-menu-custom">
              <Dropdown.Item as={Link} to="/change-password">
                <Lock className="me-2" color='dark' /> Change Password
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={logout}>
                <BoxArrowRight className="me-2" /> Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Container>
      </Navbar>

      {/* Sidebar */}
      {isMobile ? (
        <Offcanvas 
          show={sidebarOpen} 
          onHide={toggleSidebar}
          placement="start"
          className="sidebar-mobile"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <SidebarContent 
              navItems={navItems} 
              isActive={isActive} 
              isMobile={isMobile}
              toggleSidebar={toggleSidebar}
            />
          </Offcanvas.Body>
        </Offcanvas>
      ) : (
        <div className={`sidebar-desktop ${sidebarOpen ? 'open' : 'closed'} `}>
          <SidebarContent 
            navItems={navItems} 
            isActive={isActive} 
            isMobile={isMobile}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        <Container fluid>
          {children}
        </Container>
      </div>
    </div>
  );
};

const SidebarContent = ({ navItems, isActive, isMobile, toggleSidebar }) => {
  return (
    <ListGroup variant="flush" className="sidebar-menu">
      {navItems.map((item) => (
        <React.Fragment key={item.path}>
          <ListGroup.Item 
            as={Link}
            to={item.path}
            action
            active={isActive(item.path)}
            onClick={isMobile ? toggleSidebar : null}
            className="sidebar-item"
          >
            <div className="d-flex align-items-center">
              <span className="sidebar-icon">{item.icon}</span>
              {(!isMobile || (isMobile && isActive(item.path))) && (
                <span className="sidebar-text">{item.label}</span>
              )}
            </div>
          </ListGroup.Item>
          
          {item.subItems && isActive(item.path) && item.subItems.map(subItem => (
            <ListGroup.Item
              key={subItem.path}
              as={Link}
              to={subItem.path}
              action
              
              onClick={isMobile ? toggleSidebar : null}
              className="sidebar-subitem"
            >
              {subItem.label}
            </ListGroup.Item>
          ))}
        </React.Fragment>
      ))}
    </ListGroup>
  );
};