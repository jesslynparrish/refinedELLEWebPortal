import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import {Button, Input} from 'reactstrap'



//TODO: make it so that when you press enter on the input field, it adds an item to the component
//that called it. Also need to make it so that when it renders an "Add new" button, it enables the
//user to add a new thing

class Autocomplete extends Component {
  static propTypes = {
    suggestions: PropTypes.instanceOf(Array)
  };

  static defaultProps = {
    suggestions: []
  };

  constructor(props) {
    super(props);

    console.log("this.props.suggesions: ", this.props.suggesions);

    this.state = {
      // The active selection's index
      activeSuggestion: 0,
      // The suggestions that match the user's input
      filteredSuggestions: [],
      // Whether or not the suggestion list is shown
      showSuggestions: false,
      // What the user has entered
      userInput: "",
      // id for the field being autocompleted
      id: this.props.id,
      // name for the field being autocompleted
      name: this.props.name,
      // placeholder for the field being autocompleted
      placeholder: this.props.placeholder
    };
  }

  handleCreateTag = () => {

    console.log("Got into handleCreateTag!");

    this.props.createTag(this.state.userInput);
    this.setState({
      activeSuggestion: 0,
      showSuggestions: false,
      userInput: ""
    })
  }

  // Event fired when the input value is changed
  onChange = e => {
    const { suggestions } = this.props;
    const userInput = e.currentTarget.value;

    // Filter our suggestions that don't contain the user's input
    const filteredSuggestions = suggestions.filter(
      suggestion =>
        suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
    );

    // Update the user input and filtered suggestions, reset the active
    // suggestion and make sure the suggestions are shown
    this.setState({
      activeSuggestion: 0,
      filteredSuggestions,
      showSuggestions: true,
      userInput: e.currentTarget.value
    });
  };

  // Event fired when the user clicks on a suggestion
  onClick = e => {
    // Update the user input and reset the rest of the state
    this.setState({
      activeSuggestion: 0,
      filteredSuggestions: [],
      showSuggestions: false,
      userInput: ""
    });

    this.props.handleAddTag({tag: e.currentTarget.innerText});
  };

  // Event fired when the user presses a key down
  onKeyDown = e => {
    const { activeSuggestion, filteredSuggestions, userInput} = this.state;
    const {suggestions} = this.props;

    // User pressed the enter key, update the input and close the
    // suggestions
    if (e.keyCode === 13) {

      if(filteredSuggestions.length == 1){
        this.setState({
          activeSuggestion: 0,
          showSuggestions: false,
          userInput: ""
        });

        this.props.handleAddTag({tag: filteredSuggestions[0]});
      
      } else if(filteredSuggestions.length > 1) {
        
        let tempUserInput = filteredSuggestions[activeSuggestion];

        let tempFilteredSuggestions = suggestions.filter(
            (suggestion) => {return suggestion.toLowerCase().indexOf(tempUserInput.toLowerCase()) > -1}
          );

        console.log("in Audocomplete, tempUserInput: ", tempUserInput, "tempFilteredSuggestions: ", tempFilteredSuggestions);

        this.setState({
          activeSuggstion: 0,
          showSuggestions: true,
          userInput: tempUserInput,
          filteredSuggestions: tempFilteredSuggestions
        })
      }

    }
    // User pressed the up arrow, decrement the index
    else if (e.keyCode === 38) {
      if (activeSuggestion === 0) {
        return;
      }

      this.setState({ activeSuggestion: activeSuggestion - 1 });
    }
    // User pressed the down arrow, increment the index
    else if (e.keyCode === 40) {
      if (activeSuggestion - 1 === filteredSuggestions.length) {
        return;
      }

      this.setState({ activeSuggestion: activeSuggestion + 1 });
    }
  };

  render() {
    const {
      onChange,
      onClick,
      onKeyDown,
      state: {
        activeSuggestion,
        filteredSuggestions,
        showSuggestions,
        userInput
      }
    } = this;

    let suggestionsListComponent;

    if (showSuggestions && userInput) {
      if (filteredSuggestions.length) {
        suggestionsListComponent = (
          <ul className="suggestions">
            {filteredSuggestions.map((suggestion, index) => {
              let className;

              // Flag the active suggestion with a class
              if (index === activeSuggestion) {
                className = "suggestion-active";
              }

              return (
                <li
                  className={className}
                  key={suggestion}
                  onClick={onClick}
                >
                  {suggestion}
                </li>
              );
            })}
          </ul>
        );
      } else {
        suggestionsListComponent = (
          <div className="no-suggestions">
            <Button style={{backgroundColor: '#004085'}} onClick={() => this.handleCreateTag()}>
              Add new {this.props.placeholder} 
            </Button>
          </div>
        );
      }
    }

    return (
      <Fragment>
        <Input
          type="text"
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={userInput}
          style={{borderWidth: '0px', borderStyle: "none", width: "40%"}}
          name={this.state.name}
          id={this.state.id}
          placeholder={this.state.placeholder}
          autoComplete="off"
        />
        {suggestionsListComponent}
      </Fragment>
    );
  }
}

export default Autocomplete;