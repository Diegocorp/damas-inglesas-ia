import React, { Component } from 'react';

import Cell from './Cell';

// fila se pasa una sola fila del tablero, devuelve un contenedor y una celda para cada elemento de la matriz
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