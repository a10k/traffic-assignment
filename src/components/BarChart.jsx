import React from 'react';

export default class BarChart extends React.Component {
  render() {
    return (
      <div id="bar-chart-container">
        <div className="Label">Distribution of cars by color.</div>
        <canvas id="chart-area" style={{"width": "300px","height": "200px"}}></canvas>
      </div>
    )
  }
}