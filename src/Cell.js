import React, { Component } from 'react';

//cell is passed a single item in a row, and renders it out, it also calls it's grand-parent's swapper function on click 
var Cell = React.createClass({
  render: function() {
    return(
      <div  className={'cell cell-'+this.props.cell} >
        <div onClick={this.props.handlePieceClick} data-row={this.props.rowIndex} data-cell={this.props.index} className="gamePiece"></div>
      </div>
    )
  }
});

export default Cell;