import React, { Component } from 'react';
import { Container, Table, Row, Col, Input, Button, InputGroup, InputGroupAddon, Modal, ModalHeader, ModalBody } from 'reactstrap';
import ListGroup from 'react-bootstrap/ListGroup'
import Tab from 'react-bootstrap/Tab'
import Select from 'react-select';
import axios from 'axios';
import '../stylesheets/style.css';

import User from '../components/UserList/User';
import Template from './Template';

class UserList extends Component {

  constructor(props) {
    super(props)
    this.state = {
      permission: this.props.user.permission,
      currentGroup: "su",
      selectedUser: '',
      users: [], 
      superAdmins: [],
      professors: [],
      students: [],
      search: "", 
      elevateModalOpen: false, 
    }
  }

  componentDidMount() {
    this.verifyPermission();
    this.getUsers(); 
  }

  verifyPermission = () => {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
      this.props.history.push('/home');
    }
    else {
      var jwtDecode = require('jwt-decode');

      var decoded = jwtDecode(jwt);
      console.log("JWT DECODED: ", decoded);

      this.setState({ permission: decoded.user_claims }); 
    }
  }

  change(e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  updateSearch(e) {
    this.setState({ search: e.target.value.substr(0,20) });
  }

  getUsers = () => {
    axios.get(this.props.serviceIP + '/users', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('jwt') }
    }).then(res => {
      console.log(res.data);

      let su = res.data.filter((user) => user.permissionGroup === "su"); 
      let pf = res.data.filter((user) => user.permissionGroup === "pf"); 
      let st = res.data.filter((user) => user.permissionGroup === "st"); 

      this.setState({
         users : res.data,
         superAdmins: su, 
         professors: pf, 
         students: st 
      });
    }).catch(function (error) {
      console.log(error);
    });
  }

  elevateUser = (group) => {
    var data = {
      userID: this.state.selectedUser.value,
      accessLevel: group
    }
    console.log(data);
    var headers = {
      'Authorization': 'Bearer ' + localStorage.getItem('jwt')
    }

    axios.post(this.props.serviceIP + '/elevateaccess', data, {headers:headers})
    .then(res => {
      console.log(res.data);
      this.toggleElevateModal(); 
      this.getUsers(); 
    }).catch(function (error) {
      console.log(error);
    });
  }

  renderUserTable = (group) => {
    let userList = []; 
    let nonAdminList = []; 
    let searchLength = 11; 
    let addButton = (     
      <Col sm={1} style={{paddingLeft: "5px"}}>
        <Button style={{borderRadius: "30px"}} onClick={() => this.toggleElevateModal()}>
          <img 
            src={require('../Images/plus.png')} 
            alt="Icon made by srip from www.flaticon.com"
            style={{width:"15px", height:"15px"}}
          />
        </Button>
      </Col>
    );
    if (group === "su") {
      userList = this.state.superAdmins;
    }
    else if (group === "pf") {
      userList = this.state.professors; 
    }
    else {
      userList = this.state.students;
      searchLength = 12; 
      addButton = null; 
    }

    if (this.state.currentGroup === "su") {
      let list = this.state.students.concat(this.state.professors); 
      nonAdminList = list.map((user) => {return( {value: user.userID, label: user.username} )});
    }
    else if (this.state.currentGroup === "pf") {
      nonAdminList = this.state.students.map((user) => {return( {value: user.userID, label: user.username})}); 
    }

    let filteredUsers = userList.filter(
      (user) => { 
        if (user) 
          return (user.username.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1);
        else 
          return null; 
      }
    );

    return (
      <>
      <Row>
        <Col sm={searchLength}>
          <InputGroup style={{borderRadius: "8px"}}>
            <InputGroupAddon addonType="prepend" style={{margin: "10px"}}>
              <img 
                src={require('../Images/search.png')} 
                alt="Icon made by Freepik from www.flaticon.com" 
                style={{width: '20px', height: '20px'}}
              />
            </InputGroupAddon>
            <Input style={{border: "none"}}
              type="text" 
              placeholder="Search" 
              value={this.state.search} 
              onChange={this.updateSearch.bind(this)}
            />
          </InputGroup>
        </Col>
        {addButton}
      </Row>
      <br />
      <Table hover className="userListTable">
        <thead>
          <tr>
            <th style={{borderTopLeftRadius: "8px"}}>ID</th>
            <th>Username</th>
            <th style={{borderTopRightRadius: group !== "pf" ? "8px" : "0px"}}>Permission</th>
            {group === "pf" ? <th style={{borderTopRightRadius: "8px"}}></th> : null}
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => {
            return (
              <User key={user.userID} user={user} type="su" group={group} serviceIP={this.props.serviceIP} getUsers={this.getUsers}/>
            )
          })}
        </tbody>
      </Table>
      <Modal isOpen={this.state.elevateModalOpen} toggle={() => this.toggleElevateModal()} backdrop={true}>
        <ModalHeader toggle={() => this.toggleElevateModal()}>Modify Permission</ModalHeader>
        <ModalBody>
          Select a user to promote them to {this.state.currentGroup === "su" ? "super admin" : "professor"} privileges: 
          <Select
            name="nonAdminList"
            options={nonAdminList}
            className="basic-single"
            classNamePrefix="select"
            isClearable={true}
            value={this.state.selectedUser}
            onChange={this.updateSelectedUser}
          />
          <br />
          <Button block onClick={() => this.elevateUser(this.state.currentGroup)}>Elevate</Button>
        </ModalBody>
      </Modal>
      </>
    )
  }

  resetVal = (k) => {
    let group = ""; 
    if (k === "#superAdmins") {
      group = "su"; 
    }
    else if (k === "#professors") {
      group = "pf"; 
    }
    else {
      group = "st"; 
    }

    this.setState({
      search: "", 
      currentGroup: group
    })
  }

  toggleElevateModal = () => {
    this.setState({
      elevateModalOpen: !this.state.elevateModalOpen,
    })
  }

  updateSelectedUser = (value) => {
    this.setState({
      selectedUser: value
    })
  }

  render() {
    return (
      <Container className="user-list">
        <Template permission={this.state.permission}/>
        <br></br><br></br>			
        <div>
        <h3>List of Users</h3>
          <Tab.Container id="userList" defaultActiveKey="#superAdmins" onSelect={(k) => this.resetVal(k)}>
            <Row>
              <Col sm={4}>
                <ListGroup className="userListTabs">
                  <ListGroup.Item action href="#superAdmins">
                    Super Admins
                  </ListGroup.Item>
                  <ListGroup.Item action href="#professors">
                    Professors
                  </ListGroup.Item>
                  <ListGroup.Item action href="#students">
                    Students
                  </ListGroup.Item>
                </ListGroup>
              </Col>
              <Col sm={8}>
                <Tab.Content>
                  <Tab.Pane eventKey="#superAdmins">
                    {this.renderUserTable("su")}
                  </Tab.Pane>
                  <Tab.Pane eventKey="#professors">
                    {this.renderUserTable("pf")}
                  </Tab.Pane>
                  <Tab.Pane eventKey="#students">
                    {this.renderUserTable("st")}
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        </div>
      </Container>
    )
  }
}

export default UserList
