import React, { Component } from 'react';

import Cell from './Cell';

//row is passed a single row from the board, returns a container and a Cell for each item in the array
var Row = React.createClass({
  render: function() {
    return (
      <div className="row">
        {
          this.props.rowArr.map(function(cell, index) {
            return (
              <Cell rowIndex={this.props.rowIndex} index={index} cell={cell} handlePieceClick={this.props.handlePieceClick} />
            )
          }, this)
        }
      </div>
    )
  }
});

export default Row;