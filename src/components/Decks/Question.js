import React, {Fragment} from 'react'
import { Button, ButtonGroup, Modal, ModalHeader, ModalBody, ModalFooter, Collapse, Input, Tooltip } from 'reactstrap';
import axios from 'axios';

import AnswerButtonList from './AnswerButtonList';
import Autocomplete from './Autocomplete';
import AddAnswer from './AddAnswer'; 

class Question extends React.Component {
  constructor(props){
    super(props);
    this.toggleEditMode = this.toggleEditMode.bind(this);
    this.handleDelete = this.handleDelete.bind(this); 
    this.deleteQuestion = this.deleteQuestion.bind(this);
    this.toggleCollapsedAnswers = this.toggleCollapsedAnswers.bind(this);

    this.toggleImgTooltipOpen = this.toggleImgTooltipOpen.bind(this); 
    this.toggleAudioTooltipOpen = this.toggleAudioTooltipOpen.bind(this); 

    this.submitEdit = this.submitEdit.bind(this);
    this.change = this.change.bind(this);


    this.state = {
      question: this.props.question, //contains all of the data in the question
      modal: false,
      imgTooltipOpen: false, 
      audioTooltipOpen: false, 

      editMode: false, //determines whether or not the editable version of the question is showing
      editedQuestionText: this.props.question.questionText, //contains the English word that can be edited
      collapseAnswers: false, //determines whether or not the answers are displayed on the question
      
      selectedImgFile: this.props.question.imageLocation, //contains the location of the image for the question
      selectedAudioFile: this.props.question.audioLocation, //contains the location of the audio for the question
      changedImage: false, //determines whether or not the image file was changed
      changedAudio: false, //determines whether or not the audio file was changed

      //TODO: populate answers with API call instead of dummy data
      answers: this.props.question.answers.map((answer) => {return answer.front}), //contains the list of answers
      originalAnswers: this.props.question.answers.map((answer) => {return answer.front}),
      ids: this.props.question.answers.map((answer) => {return answer.termID}),

      newlyCreatedAnswers : [], //array of answers the user created via this form
      submittingAnswer: false, //determines whether or not the AddAnswer form will be shown
			userCreatedAnswer: "", //what the user put in the field when they clicked create answer
    }

  }


  //TODO: handleAddAnswer and createAnswer kinda do the same thing. Maybe they should be one thing?
  //function that adds a answer to list of answers on this question(only available when editmode is true)
  handleAddAnswer = (event) => {
  //  let list = this.props.addAnswer(this.state.answers, event.answer);

    console.log("EVENT being passed in: ", event); 
    let ansList = this.state.answers; 
    let idList = this.state.ids; 
    ansList.push(event.answer); 
    idList.push(event.answerID); 

    this.setState({
      answers: ansList, 
      ids: idList
    })
  }


  //function that adds a new answer from user input to list of answers on this question(only when editmode is true)
  createAnswer = (answer) => {
    console.log("CreateAnswer was pressed"); 
    // let tempAnswers = this.state.answers;
    // tempAnswers.push(answer);
    // this.setState({
    //   answers: tempAnswers
    // });

    this.setState({
			submittingAnswer: true,
			userCreatedAnswer: answer
		});
  }

	//function that adds a newly created answer to the list of answers on this question
  addNewAnswerToList = (answer) => {
		let tempNewlyCreatedAnswers = this.state.newlyCreatedAnswers;
    tempNewlyCreatedAnswers.push(answer);
    
    let allAnswers = this.state.answers; 
    allAnswers.push(answer.front); 

		console.log("NEWLY CREATED ANSWERS: ", answer); 
		this.setState({
      newlyCreatedAnswers: tempNewlyCreatedAnswers,
      answers: allAnswers, 
			submittingAnswer: false
		})
	}

  	//function that allows user to cancel AddAnswer form
	cancelCreateAnswer = () => {
		this.setState({
			submittingAnswer: false
		})
	}

  handleDeleteAnswer = (event) => {
    console.log("Got into handleDeleteAnswer, event.answer: ", event.answer)

    let tempAnswerButtonList = this.state.answers;
    let idList = this.state.ids; 
    
    let answerObject = this.state.answers.find((answer) => {
      if(answer === event.answer){
        return true;
      } else {
        return false;
      }
    });

    let answerIndex = tempAnswerButtonList.indexOf(answerObject);

    if(answerIndex !== -1){
      tempAnswerButtonList.splice(answerIndex, 1);
      idList.splice(answerIndex, 1); 
    }

    this.setState({
      answers: tempAnswerButtonList,
      ids: idList
    })

  }

  //function that gets called when the edit button is pushed. Sets editmode to true
  toggleEditMode = () => {
    this.setState({editMode: true,
                  collapseAnswers: true, 
                  answers: this.props.question.answers.map((answer) => {return answer.front}),
                  ids: this.props.question.answers.map((answer) => {return answer.termID})})
  }

  //function that changes the state of front, back, type, and gender based off of the name given to the input objects
  change(e) {
    this.setState({
        [e.target.name]: e.target.value
    })
  }

  //function that inputs image when user uploads a new image to the question
  imgFileSelectedHandler = (event) => {
    this.setState({ 
      selectedImgFile: event.target.files[0], 
      changedImage: true //remember to change it back to false later 
    }); 
  }

  //function that inputs audio when user uploads new audio to the question
  audioFileSelectedHandler = (event) => {
    this.setState({
      selectedAudioFile: event.target.files[0], 
      changedAudio: true //remember to change it back to false later 
    })
  }

  //function that submits all of the edited data put on a question 
  submitEdit = (event) => {

    console.log("QUESTIONTEXT: ", this.state.editedQuestionText)
    console.log("WUESTIONID: ", this.props.question.questionID)
    console.log("NEW ANSWERS IDS OF TERMS THAT EXIST IN THE DATABASE ALREADY: ", this.state.ids)
    console.log("NEWLY CREATED ANSWERS INSIDE OF SUBMITEDIT: ", this.state.newlyCreatedAnswers)

    this.setState({editMode: false});

    let NewlyCreatedAnswerJSONList = this.state.newlyCreatedAnswers.map((answer) => {
      return {
        "front": answer.front,
        "back": answer.back,
        "language": this.props.curModule.language,
        "tags": answer.tags
      }
    })

    console.log("JSON LIST: ", NewlyCreatedAnswerJSONList); 

    let stringyAnswerList = JSON.stringify(NewlyCreatedAnswerJSONList.map((entry) => {return entry})); 
    console.log("STRINGIFY: ", stringyAnswerList)

    let stringifyIDList = JSON.stringify(this.state.ids.map((entry) => {return entry})); 
    console.log("STRINGIFY ID: ", stringifyIDList);

    const data = new FormData(); 
    let header = {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('jwt') }
    };

    //data.append('image', this.state.changedImage && this.state.selectedImgFile !== undefined ? this.state.selectedImgFile : null); 
    //data.append('audio', this.state.changedAudio && this.state.selectedAudioFile !== undefined ? this.state.selectedAudioFile : null); 
    // data.append('imageID', 3); //optional
    // data.append('audioID', 3); //optional
    // data.append('type', "LONGFORM"); //optional

    data.append('questionText', this.state.editedQuestionText); 
    data.append('questionID', this.props.question.questionID); //not editable
    data.append('new_answers', stringifyIDList); 
    data.append('arr_of_terms', stringyAnswerList); 
    data.append('type', "LONGFORM");


    //map through all the answers and make a answer field object for them 
    /*
    this.state.answers.map((label) => {
      return ( data.append('answer', label) )
    })
    */
    
    axios.post(this.props.serviceIP + '/modifyquestion', data, header)
      .then(res => {

        console.log("res.data in submitEdit in Question.js: ", res.data);
        
        this.setState({
          changedImage: false, 
          changedAudio: false
        });

        this.props.updateCurrentModule({ module: this.props.curModule });  
      })
      .catch(error => {
        console.log("submitEdit in question.js error: ", error);
      });
  }

  //toggling delete modal, is not related to delete question API 
  handleDelete = () => {
    console.log(this.state.question); 
    this.toggleModal(); 
  }

  //function for deleting a question from the database
  deleteQuestion = (e) => {
    this.toggleModal(); 

    let header = { 
      data: { questionID: this.state.question.questionID },
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('jwt') }
    };

    axios.delete(this.props.serviceIP + '/deletequestion', header)
      .then( res => {
        console.log("res.data in deleteQuestion: ", res.data);
        this.props.updateCurrentModule({ module: this.props.curModule });  
      })
      .catch(error => {
        console.log("deleteQuestion in Question.js error: ", error);
      });
  }

  //function that toggles whether or not answers a visible
  toggleCollapsedAnswers = () => {
    this.setState({collapseAnswers: !this.state.collapseAnswers})
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



  //function that cancels the edit and sets everything back to what it was initially
  handleCancelEdit = (event) => {
    this.setState({
      question: this.props.question,
      modal: false,

      editMode: false,
      editedFront: this.props.question.front,
      collapseAnswers: false,
      
      selectedImgFile: this.props.question.imageLocation, 
      selectedAudioFile: this.props.question.audioLocation, 
      changedImage: false, 
      changedAudio: false, 

      answers: JSON.parse(JSON.stringify(this.state.originalAnswers)),
      ids: JSON.parse(JSON.stringify(this.props.question.answers.map((answer) => {return answer.termID}))), 
      newlyCreatedAnswers: [], 
      userCreatedAnswer: ""
    })
  }

  // arraysEqual = (array1, array2) => {
  //   if (array1 === array2) return true;
  //   if (array1 == null || array2 == null) return false;
  //   if (array1.length !== array2.length) return false;

  //   for (var i = 0; i < array2.length; ++i) {
  //     if (array1[i] !== array2[i]) return false;
  //   }
  //   return true;
  // }

  render() {
    let {selectedImgFile, selectedAudioFile, question, editedQuestionText} = this.state;
    let imgLink = "http://34.239.123.94/Images/" + selectedImgFile;
    let audioLink = "http://34.239.123.94/Audios/" + selectedAudioFile;

/*
    let newAnswers = this.props.question.answers;
    if(!this.arraysEqual(newAnswers,this.state.answser)){
      this.setState({
        answers: newAnswers
      })
    }
*/
    //console.log("this.state.answers: ", this.state.answers, " ANS: ", this.props.question.answers, " IDS: ", this.state.ids, " Original Answers: ", this.state.originalAnswers); 
    if (this.state.editMode === false){
      return (
        <Fragment>
        <tr onClick={this.toggleCollapsedAnswers}>
          <td>{question.questionText}</td>
          <td>
            {/* favicon is just a placeholder for now more testing needs to be done after deployment */}
            <Button 
              style={{backgroundColor: 'white', width: '100%'}} 
              href="http://localhost:3000/favicon.ico" 
              download
              >
              <img 
                src={require('../../Images/image.png')} 
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
                src={require('../../Images/headphones.png')} 
                alt="headphones icon" 
                style={{width: '25px', height: '25px'}}
                />
            </Button>
          </td>
          <td>{this.state.question.questionID}</td>
          <td>
            <ButtonGroup>
              <Button style={{backgroundColor: 'lightcyan'}} onClick={() => this.toggleEditMode()}>
                <img 
                  src={require('../../Images/tools.png')} 
                  alt="edit icon" 
                  style={{width: '25px', height: '25px'}}
                  />
              </Button>
              <Button style={{backgroundColor: 'lightcoral'}} onClick={this.handleDelete.bind()}>
                <img 
                  src={require('../../Images/delete.png')} 
                  alt="trash can icon" 
                  style={{width: '25px', height: '25px'}}
                  />
              </Button>
            </ButtonGroup>

            <Modal isOpen={this.state.modal} toggle={this.toggleModal}> 
              <ModalHeader toggle={this.toggleModal}>Delete</ModalHeader>
              
              <ModalBody>
                <p>Are you sure you want to delete the question: {editedQuestionText}?</p>
              </ModalBody>

              <ModalFooter>
                <Button onClick={this.toggleModal}>Cancel</Button>
                <Button color="danger" onClick={this.deleteQuestion.bind()}>Delete</Button>
              </ModalFooter>
            </Modal>

          </td>
        </tr>

        <tr>
          <td style={{border:"none"}} colSpan="8">
            <Collapse isOpen={this.state.collapseAnswers}>
            Answers: 
            <AnswerButtonList 
              answers={this.props.question.answers.map((answer) => {return answer.front})} 
              handleDeleteAnswer={this.handleDeleteAnswer} 
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
          name="editedQuestionText"
          onChange={e => this.change(e)} 
          value={this.state.editedQuestionText} 
          />
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
              src={require('../../Images/uploadImage.png')} 
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
              src={require('../../Images/uploadAudio.png')} 
              alt="Icon made by Srip from www.flaticon.com" 
              style={{width: '25px', height: '25px'}}
            />
          </Button>
          <Tooltip placement="top" isOpen={this.state.audioTooltipOpen} target="uploadAudio" toggle={this.toggleAudioTooltipOpen}>
            Upload Audio
          </Tooltip>
        </td>

        <td>{this.state.question.questionID}</td>

        <td>
          <ButtonGroup>
            <Button 
              style={{backgroundColor: 'lightcyan'}} 
              onClick = {this.submitEdit}
              > 
              <img 
                src={require('../../Images/submit.png')} 
                alt="Icon made by Becris from www.flaticon.com" 
                style={{width: '25px', height: '25px'}}
              />
            </Button>
            <Button 
              style={{backgroundColor: 'lightcyan'}} 
              onClick = {this.handleCancelEdit}
              > 
              <img 
                src={require('../../Images/cancel.png')} 
                alt="Icon made by Freepik from www.flaticon.com" 
                style={{width: '25px', height: '25px'}}
              />
            </Button>
          </ButtonGroup>
        </td>

      </tr>

      <tr>
        <td style={{border:"none"}} colSpan="8">
          Answers: 
          <AnswerButtonList 
            answers={this.state.answers} 
            handleDeleteAnswer={this.handleDeleteAnswer} 
            deletable={true}
            />
          Add Answer:
          <Autocomplete 
            name={"answers"}
            id={"answers"}
            placeholder={"Answer"}
            handleAddAnswer={this.handleAddAnswer}
            createAnswer={this.createAnswer}
            renderButton={true}
            needID={1}
            suggestions={this.props.allAnswers.map((answer) => {return answer.front})} 
            termIDs={this.props.allAnswers.map((answer) => {return answer.id})}
            />
        </td>

      </tr>

        <Modal isOpen={this.state.submittingAnswer}>
            
            <ModalHeader>
              Add Answer: 
            </ModalHeader>
            <ModalBody>
              <AddAnswer
                curModule={this.props.curModule} 
                updateCurrentModule={this.props.updateCurrentModule}
                serviceIP={this.props.serviceIP}
                deleteTag={this.props.deleteTag}
                addTag={this.props.addTag}
                allTags={this.props.allTags}
                front={this.state.userCreatedAnswer}
                initialFront={this.state.userCreatedAnswer}
    
                cancelCreateAnswer={this.cancelCreateAnswer}
                addNewAnswerToList={this.addNewAnswerToList}
              />
            </ModalBody>
                  
          </Modal>
      </Fragment>
      );
      
    }
    
  }
}

export default Question
