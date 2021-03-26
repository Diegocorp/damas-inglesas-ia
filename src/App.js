import React, { Component } from 'react';


import Popup from './Popup';
import Row from './Row';
import Statistics from './Statistics';


import './App.css';

// el tablero de juego llama a la fila para cada elemento de la matriz
var GameBoard = React.createClass({
  getInitialState: function() {
    return {
      board: [
        ['b','-','b','-','b','-','b','-'],
        ['-','b','-','b','-','b','-','b'],
        ['b','-','b','-','b','-','b','-'],
        ['-','-','-','-','-','-','-','-'],
        ['-','-','-','-','-','-','-','-'],
        ['-','r','-','r','-','r','-','r'],
        ['r','-','r','-','r','-','r','-'],
        ['-','r','-','r','-','r','-','r']
      ],
      activePlayer: 'r',
      aiDepthCutoff: 4,
      count: 0,
      popShown: false
    }
  },
  render: function() {
    var rowIndex;
    return (
      <div className="container">
        <div className={'board '+this.state.activePlayer}>
          {
            this.state.board.map(function(row, index) {
              return (<Row rowArr={row} handlePieceClick={this.handlePieceClick.bind(this)} rowIndex={index}/>)
            },this)
          }
        </div>
        <div className="clear"></div>
        <button onClick={this.reset}>Reset</button>
        <Statistics board={this.state.board}/>
      </div>
    );
  },
  aboutPopOpen: function(e) {
    this.setState({popShown: true});
  },
  aboutPopClose: function(e) {
    this.setState({popShown: false});
  },
  handlePieceClick: function(e) {
    var rowIndex = parseInt(e.target.attributes['data-row'].nodeValue);
    var cellIndex = parseInt(e.target.attributes['data-cell'].nodeValue);
    if (this.state.board[rowIndex][cellIndex].indexOf(this.state.activePlayer) > -1) {
      // esto se activa si la pieza en la que se hizo clic es una de las piezas del jugador, la activa y resalta posibles movimientos
      this.state.board = this.state.board.map(function(row){return row.map(function(cell){return cell.replace('a', '')});}); // desactiva las piezas previamente activadas
      this.state.board[rowIndex][cellIndex] = 'a'+this.state.board[rowIndex][cellIndex];
      this.highlightPossibleMoves(rowIndex, cellIndex);
    }
    else if(this.state.board[rowIndex][cellIndex].indexOf('h') > -1) {
      // esto se activa si la pieza en la que se hace clic es un cuadrado resaltado, mueve la pieza activa a ese lugar.
      this.state.board = this.executeMove(rowIndex, cellIndex, this.state.board, this.state.activePlayer);
      // ¿Se acabó el juego? si no, intercambia jugador activo
      this.setState(this.state);
      if (this.winDetection(this.state.board, this.state.activePlayer)) {
        console.log(this.state.activePlayer+ ' won the game!');
      }
      else {
        this.state.activePlayer = (this.state.activePlayer == 'r' ? 'b' : 'r');
        if (this.state.activePlayer == 'b') {
          setTimeout(function() {this.ai();}.bind(this), 50);
        }
      }
    }
    this.setState(this.state);
  },
  executeMove: function(rowIndex, cellIndex, board, activePlayer) {
    var activePiece;
    for (var i = 0; i < board.length; i++) {
      //por cada fila
      for (var j = 0; j < board[i].length; j++) {
        if (board[i][j].indexOf('a')>-1) {
          activePiece = board[i][j];
        }
      }
    }
    // realiza eliminaciones de salto
    var deletions = board[rowIndex][cellIndex].match(/d\d\d/g);
    if (typeof deletions !== undefined && deletions !== null && deletions.length > 0) {
      for (var k = 0; k < deletions.length; k++) {
        var deleteCoords = deletions[k].replace('d', '').split('');
        board[deleteCoords[0]][deleteCoords[1]] = '-';
      }
    }
    // quitar la pieza activa de su lugar
    board = board.map(function(row){return row.map(function(cell){return cell.replace(activePiece, '-')});});
    // resaltar
    board = board.map(function(row){return row.map(function(cell){return cell.replace('h', '-').replace(/d\d\d/g, '').trim()});}); 
    // coloca la pieza activa, ahora inactiva, en su nuevo lugar
    board[rowIndex][cellIndex] = activePiece.replace('a', '');
    if ( (activePlayer == 'b' && rowIndex == 7) || (activePlayer == 'r' && rowIndex == 0) ) {
      board[rowIndex][cellIndex]+= ' k';
    }   
    return board;
  },
  highlightPossibleMoves: function(rowIndex, cellIndex) {
    // quita el resaltado de las celdas previamente resaltadas
    this.state.board = this.state.board.map(function(row){return row.map(function(cell){return cell.replace('h', '-').replace(/d\d\d/g, '').trim()});}); 

    var possibleMoves = this.findAllPossibleMoves(rowIndex, cellIndex, this.state.board, this.state.activePlayer);

    // resalta los posibles movimientos en el tablero
    // el 'highlightTag' inserta la información en una celda que especifica
    for (var j = 0; j < possibleMoves.length; j++) {
      var buildHighlightTag = 'h ';
      for (var k = 0; k < possibleMoves[j].wouldDelete.length; k++) {
        buildHighlightTag += 'd'+String(possibleMoves[j].wouldDelete[k].targetRow) + String(possibleMoves[j].wouldDelete[k].targetCell)+' ';
      }
      this.state.board[possibleMoves[j].targetRow][possibleMoves[j].targetCell] = buildHighlightTag;
    }

    this.setState(this.state);
  },
  findAllPossibleMoves: function(rowIndex, cellIndex, board, activePlayer) {
    var possibleMoves = [];
    var directionOfMotion = [];
    var leftOrRight = [1,-1];
    var isKing = board[rowIndex][cellIndex].indexOf('k') > -1;
    if (activePlayer == 'b') {
      directionOfMotion.push(1);
    }
    else {
      directionOfMotion.push(-1);
    }

    // si es un rey, le permitimos ir hacia adelante y hacia atrás, de lo contrario, solo puede moverse en la dirección normal de su color
    // el bucle de movimiento a continuación corre a través de todas las direcciones de movimiento permitidas, por lo que si hay dos, las golpeará
    if (isKing) {
      directionOfMotion.push(directionOfMotion[0]*-1);
    }

    // la detección de movimiento normal ocurre aquí (es decir, sin saltos)
    // para cada dirección de movimiento permitida a la pieza gira (hacia adelante para piezas normales, ambas para reyes)
    // dentro de ese bucle, comprueba en esa dirección de movimiento tanto para la izquierda como para la derecha (las fichas se mueven en diagonal)
    // cualquier movimiento encontrado se inserta en la matriz de movimientos posibles
    for (var j = 0; j < directionOfMotion.length; j++) {
      for (var i = 0; i < leftOrRight.length; i++) {      
        if (
          typeof board[rowIndex+directionOfMotion[j]] !== 'undefined' &&
          typeof board[rowIndex+directionOfMotion[j]][cellIndex + leftOrRight[i]] !== 'undefined' &&
          board[rowIndex+directionOfMotion[j]][cellIndex + leftOrRight[i]] == '-'
        ){
          if (possibleMoves.map(function(move){return String(move.targetRow)+String(move.targetCell);}).indexOf(String(rowIndex+directionOfMotion[j])+String(cellIndex+leftOrRight[i])) < 0) {
            possibleMoves.push({targetRow: rowIndex+directionOfMotion[j], targetCell: cellIndex+leftOrRight[i], wouldDelete:[]});
          }
        }
      }
    }

    // obtener saltos
    var jumps = this.findAllJumps(rowIndex, cellIndex, board, directionOfMotion[0], [], [], isKing, activePlayer);
    
    // bucle y empuje todos los saltos a possibles movimientos
    for (var i = 0; i < jumps.length; i++) {
      possibleMoves.push(jumps[i]);
    }
    return possibleMoves;
  },
  findAllJumps: function(sourceRowIndex, sourceCellIndex, board, directionOfMotion, possibleJumps, wouldDelete, isKing, activePlayer) {
    // movimientos de salto
    var thisIterationDidSomething = false;
    var directions = [directionOfMotion];
    var leftOrRight = [1, -1];
    if (isKing) {
      // si es un rey, también veremos cómo retroceder
      directions.push(directions[0]*-1);
    }
    // aquí detectamos posibles movimientos de salto
    // para cada dirección disponible para la pieza (en función de si es un rey o no)
    // y para cada diag (izquierda o derecha) buscamos 2 espacios de diag para ver si está abierto y si saltaríamos a un enemigo para llegar allí.
    for (var k = 0; k < directions.length; k++) {
      for (var l = 0; l < leftOrRight.length; l++) {
        leftOrRight[l]
        if (
          typeof board[sourceRowIndex+directions[k]] !== 'undefined' &&
          typeof board[sourceRowIndex+directions[k]][sourceCellIndex+leftOrRight[l]] !== 'undefined' &&
          typeof board[sourceRowIndex+(directions[k]*2)] !== 'undefined' &&
          typeof board[sourceRowIndex+(directions[k]*2)][sourceCellIndex+(leftOrRight[l]*2)] !== 'undefined' &&
          board[sourceRowIndex+directions[k]][sourceCellIndex+leftOrRight[l]].indexOf((activePlayer == 'r' ? 'b' : 'r')) > -1 &&
          board[sourceRowIndex+(directions[k]*2)][sourceCellIndex+(leftOrRight[l]*2)] == '-'
        ){
          if (possibleJumps.map(function(move){return String(move.targetRow)+String(move.targetCell);}).indexOf(String(sourceRowIndex+(directions[k]*2))+String(sourceCellIndex+(leftOrRight[l]*2))) < 0) {
            // este eventual objetivo de salto no existía ya en la lista
            var tempJumpObject = {
              targetRow: sourceRowIndex+(directions[k]*2),
              targetCell: sourceCellIndex+(leftOrRight[l]*2),
              wouldDelete:[
                {
                  targetRow:sourceRowIndex+directions[k],
                  targetCell:sourceCellIndex+leftOrRight[l]
                }
              ]
            };
            for (var i = 0; i < wouldDelete.length; i++) {
              tempJumpObject.wouldDelete.push(wouldDelete[i]);
            }
            possibleJumps.push(tempJumpObject);
            thisIterationDidSomething = true;
          }
        }
      }
    }
    
    // si se encontró un salto, thisIterationDidSomething se establece en verdadero y esta función se llama a sí misma nuevamente desde ese punto de origen, así es como recurrimos para encontrar múltiples saltos
    if(thisIterationDidSomething) {
      for (var i = 0; i < possibleJumps.length; i++) {
        var coords = [possibleJumps[i].targetRow, possibleJumps[i].targetCell];
        var children = this.findAllJumps(coords[0], coords[1], board, directionOfMotion, possibleJumps, possibleJumps[i].wouldDelete, isKing, activePlayer);
        for (var j = 0; j < children.length; j++) {
          if (possibleJumps.indexOf(children[j]) < 0) {
            possibleJumps.push(children[j]);
          }
        }
      }
    }
    return possibleJumps;
  },
  reset: function() {
    this.setState({
      board: [
        ['b','-','b','-','b','-','b','-'],
        ['-','b','-','b','-','b','-','b'],
        ['b','-','b','-','b','-','b','-'],
        ['-','-','-','-','-','-','-','-'],
        ['-','-','-','-','-','-','-','-'],
        ['-','r','-','r','-','r','-','r'],
        ['r','-','r','-','r','-','r','-'],
        ['-','r','-','r','-','r','-','r']
      ],
      activePlayer: 'r'
    });
  },
  winDetection: function(board, activePlayer) {
    var enemyPlayer = (activePlayer == 'r' ? 'b' : 'r');
    var result = true;
    for (var i = 0; i < board.length; i++) {
      for (var j = 0; j < board[i].length; j++) {
        if (board[i][j].indexOf(enemyPlayer) > -1) {
          result = false;
        }
      }
    }
    return result;
  },
  cloneBoard : function(board) {
        var output = [];
        for (var i = 0; i < board.length; i++) output.push(board[i].slice(0));
        return output;
  },
  ai: function() {
    // preparar una predicción futura ramificada
    this.count = 0;
    console.time('decisionTree');
    var decisionTree = this.aiBranch(this.state.board, this.state.activePlayer, 1);
    console.timeEnd('decisionTree');
    console.log(this.count);
    // ejecutar el movimiento más favorable
    if (decisionTree.length > 0) {
      console.log(decisionTree[0]);
      setTimeout(function() {
        this.handlePieceClick({
          target:{
            attributes:{
              'data-row':{
                nodeValue:decisionTree[0].piece.targetRow
              },
              'data-cell':{
                nodeValue:decisionTree[0].piece.targetCell
              }
            }
          }
        });

        setTimeout(function() {
          this.handlePieceClick({
            target:{
              attributes:{
                'data-row':{
                  nodeValue:decisionTree[0].move.targetRow
                },
                'data-cell':{
                  nodeValue:decisionTree[0].move.targetCell
                }
              }
            }
          });
        }.bind(this), 1000);
      }.bind(this), 750);
    }
    else {
      alert('no moves, you win!');
    }
  },
  aiBranch: function(hypotheticalBoard, activePlayer, depth) {
    this.count++;
    var output = [];
    for (var i = 0; i < hypotheticalBoard.length; i++) {
      for (var j = 0; j < hypotheticalBoard[i].length; j++) {
        if (hypotheticalBoard[i][j].indexOf(activePlayer) > -1) {
          var possibleMoves = this.findAllPossibleMoves(i, j, hypotheticalBoard, activePlayer);
          for (var k = 0; k < possibleMoves.length; k++) {
            var tempBoard = this.cloneBoard(hypotheticalBoard);
                      tempBoard[i][j] = 'a'+tempBoard[i][j];

            var buildHighlightTag = 'h ';
            for (var m = 0; m < possibleMoves[k].wouldDelete.length; m++) {
              buildHighlightTag += 'd'+String(possibleMoves[k].wouldDelete[m].targetRow) + String(possibleMoves[k].wouldDelete[m].targetCell)+' ';
            }
            tempBoard[possibleMoves[k].targetRow][possibleMoves[k].targetCell] = buildHighlightTag;

            var buildingObject = {
              piece: {targetRow: i, targetCell: j},
              move:possibleMoves[k],
              board:this.executeMove(possibleMoves[k].targetRow, possibleMoves[k].targetCell, tempBoard, activePlayer),
              terminal: null,
              children:[],
              score:0,
              activePlayer: activePlayer,
              depth: depth,
            }
            // ¿Ese movimiento gana el juego?
            buildingObject.terminal = this.winDetection(buildingObject.board, activePlayer);            

            if (buildingObject.terminal) {
              //console.log('se encontró un movimiento de terminal ');
              // si es terminal, la puntuación es fácil, solo depende de quién ganó
              if (activePlayer == this.state.activePlayer) {
                buildingObject.score = 100-depth;
              }
              else {
                buildingObject.score = -100-depth;
              }
            }
            else if(depth > this.state.aiDepthCutoff) {
              //don't want to blow up the call stack boiiiiii
              buildingObject.score = 0;
            }
            else {  
              buildingObject.children = this.aiBranch(buildingObject.board, (activePlayer == 'r' ? 'b' : 'r'), depth+1);
              // si no es terminal, queremos la mejor puntuación de esta ruta (o la peor dependiendo de quién ganó)      
              var scoreHolder = [];

                  for (var l = 0; l < buildingObject.children.length; l++) {
                    if (typeof buildingObject.children[l].score !== 'undefined'){
                      scoreHolder.push(buildingObject.children[l].score);
                    }
                  }

                  scoreHolder.sort(function(a,b){ if (a > b) return -1; if (a < b) return 1; return 0; });

                  if (scoreHolder.length > 0) {
                    if (activePlayer == this.state.activePlayer) {
                  buildingObject.score = scoreHolder[scoreHolder.length-1];
                }
                else {
                  buildingObject.score = scoreHolder[0];
                }
              }
              else {
                if (activePlayer == this.state.activePlayer) {
                  buildingObject.score = 100-depth;
                }
                else {
                  buildingObject.score = -100-depth;
                }
              }
            }
            if (activePlayer == this.state.activePlayer) {
              for (var n = 0; n < buildingObject.move.wouldDelete.length; n++) {
                if (hypotheticalBoard[buildingObject.move.wouldDelete[n].targetRow][buildingObject.move.wouldDelete[n].targetCell].indexOf('k') > -1) {
                  buildingObject.score+=(25-depth);
                }
                else {
                  buildingObject.score+=(10-depth);
                }
              }
              if ((JSON.stringify(hypotheticalBoard).match(/k/g) || []).length < (JSON.stringify(buildingObject.board).match(/k/g) || []).length) {
                // nuevo rey hecho después de este movimiento
                buildingObject.score+=(15-depth);
              }
            }
            else {
              for (var n = 0; n < buildingObject.move.wouldDelete.length; n++) {
                if (hypotheticalBoard[buildingObject.move.wouldDelete[n].targetRow][buildingObject.move.wouldDelete[n].targetCell].indexOf('k') > -1) {
                  buildingObject.score-=(25-depth);
                }
                else {
                  buildingObject.score-=(10-depth);
                }
              }             
              if ((JSON.stringify(hypotheticalBoard).match(/k/g) || []).length < (JSON.stringify(buildingObject.board).match(/k/g) || []).length) {
                // nuevo rey hecho después de este movimiento
                buildingObject.score-=(15-depth);
              }
            }
            buildingObject.score+=buildingObject.move.wouldDelete.length;
            output.push(buildingObject);
          }
        }
      }
    }
    
    output = output.sort(function(a,b){ if (a.score > b.score) return -1; if (a.score < b.score) return 1; return 0; });
    return output;
  }
});

export default GameBoard;
