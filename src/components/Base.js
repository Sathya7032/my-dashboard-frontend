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
  Envelope,
  Book,
  Bookmark
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
    { 
      path: '/expense-tracker', 
      icon: <Gear />, 
      label: 'Expense Tracker',
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
    { 
      path: '/notes-manager', 
      icon: <Book />, 
      label: 'Notes Manager',
      subItems: [
        { path: '/category-manager', label: 'Add Category' },
      ]
    },
    { 
      path: '/dairy-manager', 
      icon: <Bookmark />, 
      label: 'Diary Manager'
    },
  ];

  const isActive = (path) => {
    return location.pathname === path || 
           (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  return (
    <div className={`base-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Top Navbar */}
      <Navbar variant="dark" expand="lg" fixed="top" className="main-navbar">
        <Container fluid>
          <Button 
            variant="outline-light" 
            onClick={toggleSidebar}
            className="sidebar-toggle me-3"
          >
            {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </Button>
          
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <div className="brand-logo me-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 3H4C2.89543 3 2 3.89543 2 5V10C2 11.1046 2.89543 12 4 12H13C14.1046 12 15 11.1046 15 10V5C15 3.89543 14.1046 3 13 3Z" fill="white"/>
                <path d="M20 3H17C15.8954 3 15 3.89543 15 5V10C15 11.1046 15.8954 12 17 12H20C21.1046 12 22 11.1046 22 10V5C22 3.89543 21.1046 3 20 3Z" fill="white"/>
                <path d="M20 14H7C5.89543 14 5 14.8954 5 16V19C5 20.1046 5.89543 21 7 21H20C21.1046 21 22 20.1046 22 19V16C22 14.8954 21.1046 14 20 14Z" fill="white"/>
                <path d="M9 14H4C2.89543 14 2 14.8954 2 16V19C2 20.1046 2.89543 21 4 21H9C10.1046 21 11 20.1046 11 19V16C11 14.8954 10.1046 14 9 14Z" fill="white"/>
              </svg>
            </div>
            <span className="brand-text">Admin Suite</span>
          </Navbar.Brand>
          
          <div className="ms-auto d-flex align-items-center">
            <div className="user-info me-3 d-none d-md-block">
              <div className="user-name">Administrator</div>
              <div className="user-role">Super Admin</div>
            </div>
            <Dropdown align="end">
              <Dropdown.Toggle as={Button} variant="outline-light" className="user-dropdown">
                <PersonCircle className="user-avatar me-2" />
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown-menu-custom">
                <Dropdown.Header>Admin Account</Dropdown.Header>
                <Dropdown.Item as={Link} to="/profile">
                  <PersonCircle className="me-2" /> Profile
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/change-password">
                  <Lock className="me-2" /> Change Password
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={logout}>
                  <BoxArrowRight className="me-2" /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
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
          <Offcanvas.Header closeButton className="sidebar-header">
            <Offcanvas.Title>Navigation Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body className="p-0">
            <SidebarContent 
              navItems={navItems} 
              isActive={isActive} 
              isMobile={isMobile}
              toggleSidebar={toggleSidebar}
            />
          </Offcanvas.Body>
        </Offcanvas>
      ) : (
        <div className={`sidebar-desktop ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <h6>MAIN NAVIGATION</h6>
          </div>
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
              <span className="sidebar-text">{item.label}</span>
            </div>
            {item.subItems && (
              <span className="submenu-indicator">
                <ChevronRight />
              </span>
            )}
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
              <span className="subitem-bullet"></span>
              {subItem.label}
            </ListGroup.Item>
          ))}
        </React.Fragment>
      ))}
    </ListGroup>
  );
};