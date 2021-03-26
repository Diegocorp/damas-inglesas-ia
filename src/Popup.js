import React, { Component } from 'react';

var Popup = React.createClass({
  render: function() {
    if (this.props.shown) {
      return(
        <div className="pop" onClick={this.props.close} >
          <div className="internal" >
            {this.props.copy}
            <button onClick={this.props.close} className="close">x</button>
          </div>
        </div>
      )
    }
    else {
      return(
        <div style={{display: 'none'}}></div>
      )
    }
  }
});

export default Popup;