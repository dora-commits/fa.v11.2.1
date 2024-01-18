import React, { useState } from 'react';

import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { VictoryChart, VictoryLine, VictoryScatter, VictoryTheme, VictoryAxis, VictoryLabel } from "victory-native";

const xOffsets = [50, 250];
const tickPadding = [0, -25];
const anchors = ["end", "start"];
const colors = ["black", "red"];
const lineColors = {7: "#ff8303",23:'blue'}
const orientation = ["left", "right"]
const unit = ["(°C)", ""]
const label = ["Temperature", "LPG"]
const MAX_NUM_LABEL = 30
const NUM_TICKS = 5

const Chart = props => {

    // const maxima = props.data.map(
    //     (dataset) => Math.ceil(Math.max(...dataset.map((d) => d.y)))
    // );

    //min date value on chart
    let minDate;
    //max date value on chart
    let maxDate;

    if ('maxDate' in props) {
        maxDate = props.maxDate;
    } else {
        // maxDate = new Date(Math.max(...Object.keys(props.data).map((key, index) => {
        //     return Math.max(...props.data[key].map((datum) => datum.x));
        // })))
        // if (isNaN(maxDate)) {
        //     maxDate = new Date();
        // }
        maxDate = new Date();
    }

    if ('minDate' in props) {
        minDate = props.minDate;
    } else if ('range' in props) { //range in minute
        if (props.range == -1) { //get all data
            minDate = new Date(Math.min(...Object.keys(props.data).map((key, index) => {
                return Math.min(...props.data[key].map((datum) => datum.x));
            })));

            if (isNaN(minDate)) {
                minDate = new Date(maxDate.getTime());
                minDate.setMinutes(minDate.getMinutes() - props.range);
            }
        } else {
            minDate = new Date(maxDate.getTime());
            minDate.setMinutes(minDate.getMinutes() - props.range);
        }
    } else {
        minDate = new Date(maxDate.getTime()); //default range is 5 minutes ago
        minDate.setMinutes(minDate.getMinutes() - 5);
    } 

    const timeRangeInSeconds = (maxDate - minDate)/1000;

    //Data for points
    let scatterData = {};

    //Sort, this is needed for choosing which data points to add label
    for (let key in props.data) {
        props.data[key].sort((a, b) => {
            return a.x - b.x;
        })
    }

    //Choose only some data points to add label
    Object.keys(props.data).map((key, index) => {
        scatterData[key] = [];
        let currentTime = new Date(minDate.getTime());
        let currentY = -100;
        props.data[key].map((datum, index, list) => {
            if (datum.x >= currentTime || index == list.length-1) { //Only push if the data points are not too closes, or it is the last datapoint
                scatterData[key].push(datum);
                currentTime = new Date(datum.x.getTime());
                currentTime.setSeconds(currentTime.getSeconds() + timeRangeInSeconds/(MAX_NUM_LABEL - 1));
            }
        })
    })

    let tickDates = [];
    tickDates.push(minDate);
    for (let i = 0; i < NUM_TICKS - 2; i++) {
        cur = new Date(tickDates[tickDates.length - 1]);
        cur.setSeconds(cur.getSeconds() + timeRangeInSeconds/(NUM_TICKS - 1));
        tickDates.push(cur);
    }
    tickDates.push(maxDate);



    const maxima = {
        "23": 1,
        "7": 100,
    };

    const dateLabel = (date) => {
        const seconds = ("0" + (date.getSeconds())).slice(-2);
        const minutes = ("0" + (date.getMinutes())).slice(-2);
        const hour = ("0" + (date.getHours())).slice(-2);

        const month = ("0" + (date.getMonth() + 1)).slice(-2);
        const day = ("0" + (date.getDate())).slice(-2);

        return `${day}/${month}\n${hour}:${minutes}:${seconds}`;
    }

    return (
        <View style={styles.header}>
            <Text style={styles.clustername}>{props.name}</Text>
            <View style={styles.chartContainer}>
                <VictoryChart
                    theme={VictoryTheme.material}
                    width={300}
                    height={220}
                    domain={{x:[minDate, maxDate], y: [0, 1] }}
                    
                >
                    <VictoryAxis
                        tickValues={tickDates}
                        style={{
                            axis: { stroke: '#fff' },
                            tickLabels: { fill: '#fff' },
                            ticks: {stroke: "#f2f2f2"},
                            grid: { stroke: '#fff', strokeWidth: 0.5, strokeDasharray: "5, 5" }
                        }}
                        tickFormat = {(date) => dateLabel(date)} 
                        />
                    {Object.keys(props.data).map((d, i) => (
                        <VictoryLabel 
                            key={i}
                            x={xOffsets[i]} 
                            y={30} 
                            style={{ 
                                fill: '#fff', 
                                textAnchor: anchors[i],
                                fontStyle: 'italic' 
                            }} 
                            text={props.name !== "Gas Sensor" ? unit[i] : unit[1-i]} 
                        />
                    ))}

                    {Object.keys(props.data).map((d, i) => (    
                        <VictoryLabel inline 
                            key={i}
                            x={props.name === "DHT11" ? 175 :
                            props.name === "Gas Sensor" ? 220 : 175 - i * 50} 
                            y={25} 
                            style={[                     
                                { fontSize: 11 },
                                { fill: '#fff', fontSize: 12},
                            ]} 
                            backgroundStyle={[{ 
                                                fill: props.name === "DHT11" 
                                                    ? '#ff8303' 
                                                    : props.name === "Gas Sensor" 
                                                        ? 'blue' 
                                                        : lineColors[d],
                                                stroke: 'white',
                                                strokeWidth: 0.5 
                                            }, 
                                            {}
                            ]}
                            backgroundPadding={[{ left: 5, right: 5 }, { left: 8 }]}
                            text={[
                                "",
                                props.name !== "Gas Sensor" ? label[i] : label[1-i],
                            ]} 
                           
                        />
                    ))}
                    
                    {Object.keys(props.data).map((d, i) => (
                        <VictoryAxis dependentAxis
                            key={i.toString()}
                            offsetX={50}
                            style={{
                                axis: { stroke: '#fff' },
                                tickLabels: { fill: '#fff', textAnchor: anchors[i] },
                                grid: { 
                                    stroke: i === 0 ? '#fff' : 'none', 
                                    strokeWidth: 0.5,
                                    strokeDasharray: "5, 5"
                                }
                            }}
                            tickValues={[0.2, 0.4, 0.6, 0.8, 1]}
                            tickFormat={(t) => t * maxima[d]}
                            orientation={orientation[i]}
                        />
                    ))}

                    {Object.keys(props.data).map((d, i) => (
                        <VictoryLine
                            key={i.toString()}
                            data={props.data[d]}
                            style={{ data: { stroke: lineColors[d] } }}
                            y={(datum) => datum.y / maxima[d]}
                        />
                    ))}

                    {Object.keys(scatterData).map((d, i) => (
                        <VictoryScatter
                            key={i.toString()}
                            data={scatterData[d]}
                            style={{ data: { fill: lineColors[d] }, labels: { fill: lineColors[d] } }}
                            size={1}
                            labels={({ datum }) => `${datum.y}`}
                            y={(datum) => datum.y / maxima[d]}
                        />
                    ))}
                </VictoryChart>
            </View>
        </View>
    )
}

export default Chart;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1B1A17',
    },

    header: {
        marginTop: 30,
        paddingHorizontal: 30
    },

    clustername: {
        color: '#f2f2f2',
        marginBottom: 5,
        fontSize: 17,
    },

    chartContainer: {
        backgroundColor: '#232323',
        borderWidth: 2,
        borderColor: '#cecece',
        borderRadius: 15,
        elevation: 3,
        shadowColor: 'white',
    },
});