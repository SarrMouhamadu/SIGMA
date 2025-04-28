import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaSignOutAlt, FaClipboardList, FaTachometerAlt } from 'react-icons/fa';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header>
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>
              <strong>Pointage</strong>SaaS
            </Navbar.Brand>
          </LinkContainer>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {user ? (
                <>
                  <LinkContainer to="/dashboard">
                    <Nav.Link>
                      <FaTachometerAlt className="me-1" /> Tableau de bord
                    </Nav.Link>
                  </LinkContainer>
                  
                  <LinkContainer to="/attendance">
                    <Nav.Link>
                      <FaClipboardList className="me-1" /> Pointage
                    </Nav.Link>
                  </LinkContainer>
                  
                  <NavDropdown title={<><FaUserCircle className="me-1" /> {user.name}</>} id="username">
                    <LinkContainer to="/profile">
                      <NavDropdown.Item>Profil</NavDropdown.Item>
                    </LinkContainer>
                    <NavDropdown.Item onClick={handleLogout}>
                      <FaSignOutAlt className="me-1" /> Déconnexion
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <>
                  <LinkContainer to="/login">
                    <Nav.Link>Connexion</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/register">
                    <Nav.Link>Inscription</Nav.Link>
                  </LinkContainer>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
