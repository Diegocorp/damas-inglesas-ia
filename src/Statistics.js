import React, { Component } from 'react';

var Statistics = React.createClass({
  render: function() {
    return(
      <div  className="stats" >
        <div className="half" style={{color: '#e26b6b'}}>
          Rojo(Jugador):<br/>
          Soldados: { (this.props.board.map( function(row){return(row.join(''))} ).join('').match(/r/g) || []).length}<br/>
          Reyes: { (this.props.board.map( function(row){return(row.join(''))} ).join('').match(/r\sk/g) || []).length}
        </div>
        <div className="half">
          Negro(IA):<br/>
          Soldados: { (this.props.board.map( function(row){return(row.join(''))} ).join('').match(/b/g) || []).length}<br/>
          Reyes:{ (this.props.board.map( function(row){return(row.join(''))} ).join('').match(/b\sk/g) || []).length}
        </div>
      </div>
    )
  }
});

export default Statistics;