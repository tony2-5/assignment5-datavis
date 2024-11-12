import React, { Component } from "react";
import * as d3 from "d3";
import "./Child1.css"

class Child1 extends Component {
  state = { 
    company: "Apple", // Default Company
    selectedMonth: 'November' //Default Month
  };

  componentDidMount() {
    console.log(this.props.csv_data) // Use this data as default. When the user will upload data this props will provide you the updated data
    this.renderChart()
  }

  componentDidUpdate() {
    console.log(this.props.csv_data)
    this.renderChart()
  }

  renderChart() {
    let unfilteredData = this.props.csv_data
    let data = unfilteredData.filter(d=>
      d.Company===this.state.company && d.Date.toLocaleDateString('default',{month:'long'})===this.state.selectedMonth
    )

    const margin = { top: 20, right: 30, bottom: 40, left: 40 },
      width = 500,
      height = 300,
      innerWidth = 500 - margin.left - margin.right,
      innerHeight = 300 - margin.top - margin.bottom;

    const svg = d3.select('#mysvg').attr('width', width).attr('height', height).select('#g1')
    .attr('transform', `translate(${margin.left},${margin.top})`);
    const svg2 = d3.select('#mysvg').attr('width', width).attr('height', height).select('#g2')
    .attr('transform', `translate(${margin.left},${margin.top})`);

    // getting lower and upper bounds from combining the possible min and max y values from open and close
    let extentArr = [...d3.extent(data,d=>d.Open),...d3.extent(data,d=>d.Close)]

    let xScale = d3.scaleTime().domain(d3.extent(data, d => d.Date)).range([0, innerWidth]);
    let yScale = d3.scaleLinear().domain(d3.extent(extentArr)).range([innerHeight, 0]);

    let lineGenerator = d3.line()
    .x(d=> xScale(d.Date)) 
    .y(d=> yScale(d.Open))  
    .curve(d3.curveCardinal);

    let lineGenerator2 = d3.line()
    .x(d=> xScale(d.Date)) 
    .y(d=> yScale(d.Close))  
    .curve(d3.curveCardinal);

    // tool tip
    let tooltip = d3.select("body").selectAll(".tooltip").data([0]).join('div').attr("class", "tooltip").style("opacity", 0);

    // open line
    let pathData = lineGenerator(data)
    svg.selectAll("path").data([pathData]).join('path').attr('d',d=>d)
    .attr('fill','none').attr('stroke','#b2df8a')

    svg.selectAll('circle').data(data).join("circle")
    .attr("cx", d=>xScale(d.Date))
    .attr("cy", d=>yScale(d.Open))
    .attr("r",3)
    .attr("fill","#b2df8a")
    .on("mousemove",(event,d)=>{
      tooltip.style("opacity",.75)
      .html(`
      Date: ${d.Date.toLocaleDateString()}<br>
      Open: ${d.Open.toFixed(2)}<br>
      Close: ${d.Close.toFixed(2)}<br>
      Difference: ${(d.Close-d.Open).toFixed(2)}
      `)
      .style("left",(event.pageX)+"px")
      .style("top",(event.pageY)+"px")
    })
    .on("mouseout",()=>{
      tooltip.style("opacity",0)
    })

    // close line
    let pathData2 = lineGenerator2(data)
    svg2.selectAll("path").data([pathData2]).join('path').attr('d',d=>d)
    .attr('fill','none').attr('stroke','#e41a1c')

    svg2.selectAll('circle').data(data).join("circle")
    .attr("cx", d=>xScale(d.Date))
    .attr("cy", d=>yScale(d.Close))
    .attr("r",3)
    .attr("fill","#e41a1c")
    .on("mousemove",(event,d)=>{
      tooltip.style("opacity",.75)
      .html(`
      Date: ${d.Date.toLocaleDateString()}<br>
      Open: ${d.Open.toFixed(2)}<br>
      Close: ${d.Close.toFixed(2)}<br>
      Difference: ${(d.Close-d.Open).toFixed(2)}
      `)
      .style("left",(event.pageX)+"px")
      .style("top",(event.pageY)+"px")
    })
    .on("mouseout",()=>{
      tooltip.style("opacity",0)
    })

    // axis
    svg.selectAll('.x_axis').data([null]) .join('g').attr('class', 'x_axis').attr('transform', `translate(0,${innerHeight+3})`)
    .call(d3.axisBottom(xScale)).selectAll('text')
    .attr("transform", `rotate(-45)`).attr('text-anchor','end')

    svg.selectAll('.y_axis').data([null]).join('g').attr('class', 'y_axis').attr('transform', `translate(-5,0)`)
    .call(d3.axisLeft(yScale))

    // legend
    d3.select("#legend").selectAll("#open").data([0]).join('text').attr("id","open")
    .attr("x",25).attr("y",15).text("Open")
    d3.select("#legend").selectAll('#openrect').data([0]).join('rect').attr("id","openrect")
    .attr("x",0).attr("y",0).attr('width',20).attr('height',20).attr('fill','#b2df8a')
    d3.select("#legend").selectAll("#close").data([0]).join('text').attr("id","close")
    .attr("x",25).attr("y",40).text("Close")
    d3.select("#legend").selectAll('#closerect').data([0]).join('rect').attr("id","closerect")
    .attr("x",0).attr("y",25).attr('width',20).attr('height',20).attr('fill','#e41a1c')
  }

  render() {
    const options = ['Apple', 'Microsoft', 'Amazon', 'Google', 'Meta']; // Use this data to create radio button
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; // Use this data to create dropdown

    return (
      <div className="child1">
          <div>
            <label>Company: </label>
            {
              options.map((company)=> 
                <>
                  <input 
                    type="radio" 
                    checked={this.state.company===company}
                    onChange={()=>this.setState({company:company})}
                  />
                  <label>{company}</label>
                </>
              )
            }
          </div>
          <div>
            <label>Month:</label>
            <select 
              onChange={(e)=>this.setState({selectedMonth:e.target.value})}
            >
              {
                months.map((month)=>
                  <option 
                    value={month}
                    selected={this.state.selectedMonth===month}
                  >
                    {month}
                  </option>
                )
              }
            </select>
          </div>
          <div id="chart">
            <svg id="mysvg">
              <g id="g1"></g>
              <g id="g2"></g>
            </svg>
            <svg id="legend" width="100" height="100"></svg>
          </div>
      </div>
    );
  }
}

export default Child1;
