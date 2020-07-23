import React, {Fragment} from 'react'
import { Button, ButtonGroup, Modal, ModalHeader, ModalBody, ModalFooter, Collapse, Input, CustomInput, Tooltip } from 'reactstrap';
import axios from 'axios';

import TagList from './TagList';
import Autocomplete from './Autocomplete';

class Card extends React.Component {
  constructor(props){
    super(props);
    this.editCard = this.editCard.bind(this);
    this.handleDelete = this.handleDelete.bind(this); 
    this.deleteCard = this.deleteCard.bind(this);
    this.toggleCollapsedTags = this.toggleCollapsedTags.bind(this);

    this.toggleImgTooltipOpen = this.toggleImgTooltipOpen.bind(this); 
    this.toggleAudioTooltipOpen = this.toggleAudioTooltipOpen.bind(this); 

    this.submitEdit = this.submitEdit.bind(this);
    this.change = this.change.bind(this);

    console.log("This Card: ", this.props.card)

    this.state = {
      card: this.props.card, //contains all of the data in the card
      modal: false,
      imgTooltipOpen: false, 
      audioTooltipOpen: false, 

      editMode: false, //determines whether or not the editable version of the card is showing
      editedFront: this.props.card.front, //contains the English word that can be edited
      editedBack: this.props.card.back, //contains the foreign word that can be edited
      editedType: this.props.card.type, //contains the type of 
      editedGender: this.props.card.gender, //contains the gender of the card in question
      collapseTags: false, //determines whether or not the tags are displayed on the card
      
      selectedImgFile: this.props.card.imageLocation, //contains the location of the image for the card
      selectedAudioFile: this.props.card.audioLocation, //contains the location of the audio for the card
      changedImage: false, //determines whether or not the image file was changed
      changedAudio: false, //determines whether or not the audio file was changed

      //TODO: populate tags with API call instead of dummy data
      tags: [] //contains the list of tags
    }

  }

  componentDidMount() {
    this.getTermTags(this.props.card.termID)
  }

  //TODO: handleAddTag and createTag kinda do the same thing. Maybe they should be one thing?
  //function that adds a tag to list of tags on this card(only available when editmode is true)
  handleAddTag = (event) => {
    let list = this.props.addTag(this.state.tags, event.tag);

    this.setState({
      tags: list
    })
  }


  //function that adds a new tag from user input to list of tags on this card(only when editmode is true)
  createTag = (tag) => {

    let tempTags = this.state.tags;
    tempTags.push(tag);
    this.setState({
      tags: tempTags
    });
  }

  //function that gets called when the edit button is pushed. Sets editmode to true
  editCard = () => {
    this.setState({editMode: true,
                  collapseTags: true})
  }

  //function that changes the state of front, back, type, and gender based off of the name given to the input objects
  change(e) {
    this.setState({
        [e.target.name]: e.target.value
    })
  }

  //function that inputs image when user uploads a new image to the card
  imgFileSelectedHandler = (event) => {
    this.setState({ 
      selectedImgFile: event.target.files[0], 
      changedImage: true //remember to change it back to false later 
    }); 
  }

  //function that inputs audio when user uploads new audio to the card
  audioFileSelectedHandler = (event) => {
    this.setState({
      selectedAudioFile: event.target.files[0], 
      changedAudio: true //remember to change it back to false later 
    })
  }

  //function that submits all of the edited data put on a card 
  submitEdit = (event) => {
    console.log("Changed image?: ", this.state.changedImage); 
    console.log("selectedImg: ", this.state.selectedImgFile);

    console.log("FRONT: ", this.state.editedFront); 
    console.log("BACK: ", this.state.editedBack); 
    console.log("TYPE: ", this.state.editedType); 
    console.log("GENDER: ", this.state.editedGender); 

    this.setState({editMode: false});

    const data = new FormData(); 
    let header = {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('jwt') }
    };

    data.append('image', this.state.changedImage && this.state.selectedImgFile !== undefined ? this.state.selectedImgFile : null); 
    data.append('audio', this.state.changedAudio && this.state.selectedAudioFile !== undefined ? this.state.selectedAudioFile : null); 
    data.append('front', this.state.editedFront); 
    data.append('back', this.state.editedBack); 
    data.append('language', this.props.card.language); //not editable 

    //map through all the tags and make a tag field object for them 
    this.state.tags.map((label) => {
      return ( data.append('tag', label) )
    })

    data.append('type', this.state.editedType); //editable
    data.append('gender', this.state.editedGender); //editable  
    data.append('termID', this.props.card.termID); //not editable
    
    axios.post(this.props.serviceIP + '/term', data, header)
      .then(res => {
        this.setState({
          changedImage: false, 
          changedAudio: false
        });

        this.props.updateCurrentModule({ module: this.props.curModule });  
      })
      .catch(error => {
        console.log("submitEdit in Card.js error: ", error);
      });
  }

  //toggling delete modal, is not related to delete card API 
  handleDelete = () => {
    console.log(this.state.card); 
    this.toggleModal(); 
  }

  //function for deleting a card from the database
  deleteCard = (e) => {
    this.toggleModal(); 

    let header = { 
      data: { termID: this.state.card.termID },
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('jwt') }
    };

    axios.delete(this.props.serviceIP + '/term', header)
      .then( res => {
        this.props.updateCurrentModule({ module: this.props.curModule });  
      })
      .catch(error => {
        console.log("deleteCard in Card.js error: ", error);
      });
  }

  //function that toggles whether or not tags a visible
  toggleCollapsedTags = () => {
    this.setState({collapseTags: !this.state.collapseTags})
  }

  toggleModal = () => {
    this.setState({ modal: !this.state.modal })
  }

  toggleImgTooltipOpen = () => {
    this.setState({ imgTooltipOpen: !this.state.imgTooltipOpen }); 
  }

  toggleAudioTooltipOpen = () => {
    this.setState({ audioTooltipOpen: !this.state.audioTooltipOpen }); 
  }

  getTermTags = (id) => {
    let config = {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('jwt') },
      params: {
        termID: id
      }
    }

    axios.get(this.props.serviceIP + '/tags_in_term', config)
    .then( res => {
      this.setState({
        tags: res.data
      })
    })
    .catch(function (error) {
      console.log("getTermTags error: ", error);
    });

  }

  //function that deletes a tag from the list of tags
  handleDeleteTag = (event) => {
    var list = this.props.deleteTag(this.state.tags, event.tag);
    this.setState({
      tags: list
    })
  }

  //function that cancels the edit and sets everything back to what it was initially
  handleCancelEdit = (event) => {
    console.log("this")
    this.setState({
      card: this.props.card,
      modal: false,

      editMode: false,
      editedFront: this.props.card.front,
      editedBack: this.props.card.back,
      editedType: this.props.card.type, 
      editedGender: this.props.card.gender, 
      collapseTags: false,
      
      selectedImgFile: this.props.card.imageLocation, 
      selectedAudioFile: this.props.card.audioLocation, 
      changedImage: false, 
      changedAudio: false, 

    })
  }


  render() {
    console.log(this.state.tags); 
    let {editedFront, editedBack, editedType, editedGender, selectedImgFile, selectedAudioFile} = this.state;
    let imgLink = "http://34.239.123.94/Images/" + selectedImgFile;
    let audioLink = "http://34.239.123.94/Audios/" + selectedAudioFile;

    if (this.state.editMode === false){
      return (
        <Fragment>
        <tr onClick={this.toggleCollapsedTags}>
          <td>{editedFront}</td>
          <td>{editedBack}</td>
          <td>{editedType}</td>
          <td>{editedGender}</td>
          <td>
            {/* favicon is just a placeholder for now more testing needs to be done after deployment */}
            <Button 
              style={{backgroundColor: 'white', width: '100%'}} 
              href="http://localhost:3000/favicon.ico" 
              download
              >
              <img 
                src={"./../../../image.png"} 
                alt="frame icon" 
                style={{width: '25px', height: '25px'}}
                />
            </Button>
          </td>
          <td>
            {/* audio has to be in the same domain */}
            <Button 
              style={{backgroundColor: 'white', width: '100%'}} 
              href={audioLink} 
              download
              > 
              <img 
                src={"./../../../headphones.png"} 
                alt="headphones icon" 
                style={{width: '25px', height: '25px'}}
                />
            </Button>
          </td>
          <td>{this.state.card.termID}</td>
          <td>
            <ButtonGroup>
              <Button style={{backgroundColor: 'lightcyan'}} onClick={() => this.editCard()}>
                <img 
                  src={"./../../../tools.png"} 
                  alt="edit icon" 
                  style={{width: '25px', height: '25px'}}
                  />
              </Button>
              <Button style={{backgroundColor: 'lightcoral'}} onClick={this.handleDelete.bind()}>
                <img 
                  src={"./../../../delete.png"} 
                  alt="trash can icon" 
                  style={{width: '25px', height: '25px'}}
                  />
              </Button>
            </ButtonGroup>

            <Modal isOpen={this.state.modal} toggle={this.toggleModal}> 
              <ModalHeader toggle={this.toggleModal}>Delete</ModalHeader>
              
              <ModalBody>
                <p>Are you sure you want to delete the card: {editedFront}?</p>
              </ModalBody>

              <ModalFooter>
                <Button onClick={this.toggleModal}>Cancel</Button>
                <Button color="danger" onClick={this.deleteCard.bind()}>Delete</Button>
              </ModalFooter>
            </Modal>

          </td>
        </tr>

        <tr>
          <td style={{border:"none"}} colSpan="8">
            <Collapse isOpen={this.state.collapseTags}>
            <TagList 
              tags={this.state.tags} 
              handleDeleteTag={this.handleDeleteTag} 
              deletable={false}
              />
            </Collapse>
          </td>
        </tr>
        </Fragment>
      )
    } 
    else{
      return (
      <Fragment>

      <tr>
        <td>
        <Input 
          type="value" 
          name="editedFront"
          onChange={e => this.change(e)} 
          value={this.state.editedFront} 
          />
        </td>

        <td>
          <Input 
            type="value" 
            name="editedBack"
            onChange={e => this.change(e)} 
            value={this.state.editedBack} 
            />
        </td>

        <td>
          <CustomInput 
							type="select" 
							name="editedType" 
							id="selectType"
							value={this.state.editedType} 
							onChange={e => this.change(e)}>

							<option value="">Select</option>
							<option value="NN">NN (Noun)</option>
							<option value="VR">VR (Verb)</option>
							<option value="AJ">AJ (Adjective)+</option>
							<option value="AV">AV (Adverb)</option>
					</CustomInput>
        </td>

        <td>
          <CustomInput 
							type="select" 
							name="editedGender" 
							id="selectGender"
							value={this.state.editedGender} 
							onChange={e => this.change(e)}>

							<option value="">Select</option>
							<option value="MA">MA (Male)</option>
							<option value="FE">FE (Female)</option>
							<option value="NA">NA (Nongendered)</option>
					</CustomInput>
        </td>

        <td>
          <input 
            style={{display: 'none'}}
            type="file" onChange={this.imgFileSelectedHandler}  
            ref={imgInput => this.imgInput = imgInput}
          />
          <Button 
            style={{backgroundColor: 'lightseagreen', width: '100%'}} 
            id="uploadImage"
            onClick={() => this.imgInput.click()}
            >
            <img 
              src={"./../../../uploadImage.png"} 
              alt="Icon made by Pixel perfect from www.flaticon.com" 
              style={{width: '25px', height: '25px'}}
            />
          </Button>
          <Tooltip placement="top" isOpen={this.state.imgTooltipOpen} target="uploadImage" toggle={this.toggleImgTooltipOpen}>
            Upload Image
          </Tooltip>
        </td>

        <td>
          <input 
            style={{display: 'none'}} 
            type="file" onChange={this.audioFileSelectedHandler}
            ref={audioInput => this.audioInput = audioInput}
          />
          <Button 
            style={{backgroundColor: 'lightseagreen', width: '100%'}} 
            id="uploadAudio"
            onClick={() => this.audioInput.click()}
            >
            <img 
              src={"./../../../uploadAudio.png"} 
              alt="Icon made by Srip from www.flaticon.com" 
              style={{width: '25px', height: '25px'}}
            />
          </Button>
          <Tooltip placement="top" isOpen={this.state.audioTooltipOpen} target="uploadAudio" toggle={this.toggleAudioTooltipOpen}>
            Upload Audio
          </Tooltip>
        </td>

        <td>{this.state.card.termID}</td>

        <td>
          <ButtonGroup>
            <Button 
              style={{backgroundColor: 'lightcyan', width: '25%', height: '100%', color: 'black'}} 
              onClick = {this.submitEdit}
              > 
              <img 
                src={"./../../../submit.png"} 
                alt="Icon made by Becris from www.flaticon.com" 
                style={{width: '25px', height: '25px'}}
              />
            </Button>
            <Button 
              style={{backgroundColor: 'lightcyan', width: '25%', height: '100%', color: 'black'}} 
              onClick = {this.handleCancelEdit}
              > 
              <img 
                src={"./../../../cancel.png"} 
                alt="Icon made by Freepik from www.flaticon.com" 
                style={{width: '25px', height: '25px'}}
              />
            </Button>
          </ButtonGroup>
        </td>

      </tr>

      <tr>
        <td style={{border:"none"}} colSpan="8">
          <TagList 
            tags={this.state.tags} 
            handleDeleteTag={this.handleDeleteTag} 
            deletable={true}
            />
          Add Tag:
          <Autocomplete 
            name={"tags"}
            id={"tags"}
            placeholder={"Tag"}
            handleAddTag={this.handleAddTag}
            createTag={this.createTag}

            suggestions={this.props.allTags} 
            />
        </td>

      </tr>
      </Fragment>
      );
    }
    
  }
}

export default Card
