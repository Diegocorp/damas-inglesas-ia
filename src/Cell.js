import React, { Component } from 'react';

// a la celda se le pasa un solo elemento en una fila y lo muestra, también llama a la función de intercambio de sus abuelos al hacer clic
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