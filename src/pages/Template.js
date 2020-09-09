import React from 'react';
import {Link} from 'react-router-dom';

export default class Template extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false
    };
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  render() {
    console.log("USING TEMPLATE"); 
    return (
      <header id="header">
      <div className="container">
        <div id="logo" className="pull-left">
          <Link to='/home'>
            <img src={require('../Images/ELLE/ELLE-Background-Full.png')}
                 alt="ELLE Ultimate" title="Home" className="mainLogoStyle"/>
          </Link>
        </div>
        <nav id="nav-menu-container">
          <ul className="nav-menu">
            <li><Link to='/downloads'>Downloads</Link></li>
            <li><Link to='/profile'>Profile</Link></li>
            <li><Link to='/modules'>Modules</Link></li>
            <li><Link to='/sessions'>Sessions</Link></li>
            {localStorage.getItem('per') === "su" 
            ? 
              <>
                <li><Link to='/userlist'>User List</Link></li>
                <li><Link to='/stats'>Stats</Link></li>
              </>
            : null}
            {localStorage.getItem('per') === "pf" 
            ? 
              <>
                <li><Link to='/classroster'>Class Roster</Link></li>
              </>
            : null}
            <li><Link to='/logout'>Sign Out</Link></li>
						<li><a href="https://www.github.com/ItsNotRick/elle" className="github"><i className="fa fa-github fa-lg"></i></a></li>
          </ul>
        </nav>
      </div>
    </header>
    );
  }
}
