import React from 'react';
import {select as d3select} from 'd3-selection';
import {selectAll as d3selectAll} from 'd3-selection';

class ButtonInterface extends React.Component {
  componentDidMount(){
    var spawnAndHighlight = this.props.spawnAndHighlight;

    d3select('.red').on('pointerdown', red)
    d3select('.green').on('pointerdown', green)
    d3select('.blue').on('pointerdown', blue)
    d3select('.yellow').on('pointerdown', yellow)

    function red(){
        d3selectAll('.red,.green,.blue,.yellow').classed('active',false)
        d3selectAll('.red').classed('active',true)
        spawnAndHighlight('red')
    }

    function green(){
        d3selectAll('.red,.green,.blue,.yellow').classed('active',false)
        d3selectAll('.green').classed('active',true)
        spawnAndHighlight('green')
    }

    function blue(){
        d3selectAll('.red,.green,.blue,.yellow').classed('active',false)
        d3selectAll('.blue').classed('active',true)
        spawnAndHighlight('blue')
    }

    function yellow(){
        d3selectAll('.red,.green,.blue,.yellow').classed('active',false)
        d3selectAll('.yellow').classed('active',true)
        spawnAndHighlight('yellow')
    }
  }
  
  render() {
    return (
        <div id="buttons-container">
          <div className="button red"></div>
          <div className="button green"></div>
          <div className="button blue"></div>
          <div className="button yellow"></div>
          <div className="Label">Click a color to spawn new car of that color on the map and also highlight all cars of that color.</div>
        </div>
    )
  }
}

export default ButtonInterface;