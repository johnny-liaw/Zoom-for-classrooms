import React from 'react';
import { Navbar, Nav, Icon, Dropdown, Button } from 'rsuite';

const headerStyle = {
    padding: '18px 20px',
    display: 'inline-block',
    fontWeight: 'bold',
    fontSize: '20px',
    transform: 'translateY(-10%)'
}

const NavBar = () => {
    return (
        <Navbar appearance="inverse">
        <Navbar.Header>
            <div style={headerStyle}>
                ZipChat
            </div>
        </Navbar.Header>
        <Navbar.Body>
          <Nav>
            <Nav.Item eventKey="1" icon={<Icon icon="home" />}>
              Home
            </Nav.Item>
            <Dropdown title="About">
              <Dropdown.Item eventKey="4">Company</Dropdown.Item>
              <Dropdown.Item eventKey="5">Team</Dropdown.Item>
              <Dropdown.Item eventKey="6">Contact</Dropdown.Item>
            </Dropdown>
          </Nav>
          <Nav pullRight>
            <Nav.Item icon={<Icon icon="cog" />}>Settings</Nav.Item>
          </Nav>
        </Navbar.Body>
      </Navbar>
    );
}

export default NavBar;