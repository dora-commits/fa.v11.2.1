import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Modal, TouchableOpacity, LogBox, Dimensions } from 'react-native';
import ModalPicker from '../components/ModalPicker';
import Animated, { diff } from 'react-native-reanimated';
import { SimpleLineIcons } from '@expo/vector-icons';
import Chart from '../components/Chart';
import MQTTManager from '../connections/MQTTManager';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

const defaultTemp = {
    max: { value: '-', time: '--:--:--', date: '--/--/----' },
    min: { value: '-', time: '--:--:--', date: '--/--/----' },
    avg: '-'
}

const FullchartScreen = ({ route, navigation }) => {
    const { cluster, param } = route.params;
    const mqttManager = new MQTTManager();
    const handlerId1 = useRef(-1);
    const handlerId2 = useRef(-1);
    const interval = useRef();

    const [currLPG, setCurrLPG] = useState('');
    const [currTemp, setCurrTemp] = useState('-');
    const [diffTemp, setDiffTemp] = useState({ value: '-', percent: '-' });
    const [currentLPGTime, setCurrentLPGTime] = useState('');
    const [currentTempTime, setCurrentTempTime] = useState('');
    const [choosePeriod, setChoosePeriod] = useState('Present');
    const periodInMinutes = useRef(5);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [yScroll, setYScroll] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [maxDate, setMaxDate] = useState(new Date());

    const changeModalVisibility = (bool) => {
        setIsModalVisible(bool)
    }

    const setPeriod = (option) => {
        switch (option) {
            case "Present":
                periodInMinutes.current = 5;
                break;
            case "30 min":
                periodInMinutes.current = 30;
                break;
            case "1 hour":
                periodInMinutes.current = 60;
                break;
            case "6 hours":
                periodInMinutes.current = 6 * 60;
                break;
            case "12 hours":
                periodInMinutes.current = 12 * 60;
                break;
            case "1 day":
                periodInMinutes.current = 24 * 60;
                break;
            case "3 days":
                periodInMinutes.current = 3 * 24 * 60;
                break;
            case "7 days":
                periodInMinutes.current = 7 * 24 * 60;
                break;
        }
        setChoosePeriod(option)
    }

    const [parameter, setParameter] = useState({ id: cluster, name: "", status: true, data: {}, calData: {} });

    const [maxTemp, setMaxTemp] = useState(defaultTemp.max);
    const [minTemp, setMinTemp] = useState(defaultTemp.min);
    const [avgTemp, setAvgTemp] = useState(defaultTemp.avg);

    const messageArrivedHandler = (message) => {
        console.log("Message arrived !!!");
        console.log(message.payloadString);
        const object = JSON.parse(message.payloadString);
        let value = object.data;
        value = value.split('-');
        if (object.name == "TEMP-HUMID") {
            setCurrTemp(value[0]);
            var currTime = new Date();
            updateTime("Temp", currTime);
            updateData(object.id, value[0], currTime, currTime);
        } else if (object.name == "GAS") {
            setCurrLPG(value[0]);
            var currTime = new Date();
            updateData(object.id, value[0], currTime, null);
            updateTime("LPG", currTime);
        }
    }

    useEffect(() => {
        setParameter(param);

        let device = Object.keys(param.data);
        var dht = param.calData[device[0]];
        var gas = param.calData[device[1]];

        setCurrTemp((dht.length > 0) ? dht[dht.length - 1].value : 0);
        setCurrLPG((gas.length > 0) ? gas[gas.length - 1].value : 0);

        updateDiffTemp(dht);
        updateTime("Temp", (dht.length > 0) ? dht[dht.length - 1].timestamp : new Date(null));
        updateTime("LPG", (dht.length > 0) ? gas[gas.length - 1].timestamp : new Date(null));

        setIsLoading(false);

        handlerId1.current = mqttManager.addMessageArrivedHandler("dht", messageArrivedHandler);
        handlerId2.current = mqttManager.addMessageArrivedHandler("gas_sensor", messageArrivedHandler);
     
        return () => {
            //Clean up function
            console.log("Clean up called !");
            mqttManager.removeMessageArrivedHandler("dht", handlerId1.current);
            mqttManager.removeMessageArrivedHandler("gas_sensor", handlerId2.current);
        }
    }, []);

    useEffect(() => {
        let par = Object.keys(parameter.calData);
        var dht = parameter.calData[par[0]];
        calculateStatistics(dht, periodInMinutes.current);
    }, [parameter, periodInMinutes.current, yScroll, isModalVisible]);

    useEffect(() => {
        interval.current = setInterval(() => {
            setMaxDate(new Date());
        }, 10000);

        return () => {
            clearInterval(interval.current);
        }
    }, []);

    const updateDiffTemp = (temp) => {
        if (temp.length <= 1) {
            setDiffTemp({ value: 0, percent: 0 });
        } else {
            var diffVal = temp[temp.length - 1].value - temp[temp.length - 2].value;
            var diffPer = (Math.abs(diffVal) / temp[temp.length - 2].value) * 100;
            setDiffTemp({ value: diffVal, percent: diffPer.toFixed(2) });
        }
    }
    const convertTimestampFormat = (timestamp) => {
        if (!timestamp) return ['--:--:--', '--/--/----'];
        var ts = (timestamp instanceof Date) ? new Date(timestamp) : new Date(timestamp.toDate());
        var day = ts.getDate();
        var month = ts.getMonth() + 1;
        var year = ts.getFullYear();
        var hours = ts.getHours();
        var min = ts.getMinutes();
        var sec = ts.getSeconds();

        var date = day + '/' + month + '/' + year;
        var time = hours + ':' + min + ':' + sec;
        return [time, date];
    }
    const calculateStatistics = (tempData, range) => {
        if (typeof tempData == 'undefined') return;
        if (tempData.length == 0) return;
        var value = [];
        var ts = [];
        // var maxDate = tempData[tempData.length - 1].timestamp;
        // var minDate = (maxDate instanceof Date) ? new Date(maxDate) : new Date(maxDate.toDate());
        var maxDate = new Date();
        var minDate = maxDate;
        
        minDate.setMinutes(minDate.getMinutes() - range);
        var i = tempData.length - 1;
        while (i >= 0) {
            var temp = (tempData[i].timestamp instanceof Date) ? new Date(tempData[i].timestamp) : new Date(tempData[i].timestamp.toDate());      
            if (temp < minDate) break;
            value.push(parseFloat(tempData[i].value));
            ts.push(tempData[i].timestamp);
            i--;
        }
        if (value.length === 0) {
            setMaxTemp(defaultTemp.max);
            setMinTemp(defaultTemp.min);
            setAvgTemp(defaultTemp.avg);
        } else {
            var maxTemp = value[0], posMaxTemp = 0, minTemp = value[0], posMinTemp = 0, avgTemp = 0;
            for (i = 0; i < value.length; i++) {
                if (maxTemp <= value[i]) {
                    maxTemp = value[i];
                    posMaxTemp = i;
                }
                if (minTemp >= value[i]) {
                    minTemp = value[i];
                    posMinTemp = i;
                }
                avgTemp += value[i];
            }
            var maxTempTime = convertTimestampFormat(ts[posMaxTemp]);
            var minTempTime = convertTimestampFormat(ts[posMinTemp]);
            avgTemp /= value.length;
            setMaxTemp({ value: maxTemp, time: maxTempTime[0], date: maxTempTime[1] });
            setMinTemp({ value: minTemp, time: minTempTime[0], date: minTempTime[1] });
            setAvgTemp(avgTemp.toFixed(1));
        }
    }
    const updateTime = (type, timestamp) => {
        var convert = convertTimestampFormat(timestamp);
        if (type == "LPG") {
            setCurrentLPGTime(convert[0] + ' ' + convert[1]);
        } else if (type == "Temp") {
            setCurrentTempTime(convert[0] + ' ' + convert[1]);
        }
    }
    const updateData = (deviceId, newValue, timestamp, tempTime) => {

        setParameter((oldParameter) => {
            let nP = { ...oldParameter };
            nP.data[deviceId].push({ x: timestamp, y: parseFloat(newValue) })
            if (tempTime != null) {
                nP.calData[deviceId].push({ value: newValue, timestamp: tempTime });
                updateDiffTemp(nP.calData[deviceId]);
            }
            return nP;
        })

    }

    return (
        <ScrollView 
            style={styles.container} 
            onScroll={(event) => {setYScroll(event.nativeEvent.contentOffset.y);}
        }>
        {isLoading 
            ?   <View style={{ height: Dimensions.get('window').height - 120, justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#ff8303"/> 
                </View>
            : <View>
                <View style={styles.current}>
                    <View style={styles.lpgCurrent}>
                        <View style={styles.currentLabelLPG}>
                            <Text style={styles.currentLabelText}>LPG Concentration</Text>
                        </View>
                        <View style={[styles.currentNumLPG, { flex: 0.5 }]}>
                            {currLPG == "0" &&
                                <View style={[styles.currentNumText, { flexDirection: 'row' }]}>
                                    <SimpleLineIcons name="arrow-down-circle" color="#00b050" size={40} style={{ flex: 0.32 }} />
                                    <Text style={styles.belowThreshold}>
                                        BELOW THE{'\n'}THRESHOLD
                                    </Text>
                                </View>
                            }
                            {currLPG == "1" &&
                                <View style={[styles.currentNumText, { flexDirection: 'row' }]}>
                                    <SimpleLineIcons name="arrow-up-circle" color="#ff0000" size={40} style={{ flex: 0.32 }} />
                                    <Text style={styles.overThreshold}>
                                        OVER THE{'\n'}THRESHOLD
                                    </Text>
                                </View>
                            }
                        </View>
                        <View style={styles.currentDiffLPG}>
                            <Text style={[styles.currentDiffTime, { marginTop: 0 }]}>At: {currentLPGTime}</Text>
                        </View>
                    </View>
                    <View style={styles.tempCurrent}>
                        <View style={styles.currentLabelTemp}>
                            <Text style={styles.currentLabelText}>Temperature</Text>
                        </View>
                        <View style={styles.currentNumTemp}>
                            <Text style={styles.currentNumText}>{currTemp}°C</Text>
                        </View>
                        <View style={styles.currentDiffTemp}>
                            {diffTemp.value > 0
                                ? <Text style={styles.currentDiffRedText}>+{diffTemp.value}°C ({diffTemp.percent}%)</Text>
                                : <Text style={styles.currentDiffGreenText}>{diffTemp.value}°C ({diffTemp.percent}%)</Text>
                            }
                            <Text style={styles.currentDiffTime}>At: {currentTempTime}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.chart}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.chartLabel}>Parameters Chart</Text>
                        <TouchableOpacity style={styles.touchableOpacity} onPress={() => changeModalVisibility(true)}>
                            <Text style={styles.period}>
                                {choosePeriod}&nbsp;&nbsp;
                                <SimpleLineIcons name="arrow-down" size={10}/>
                            </Text>
                        </TouchableOpacity>
                        <Modal
                            transparent={true}
                            animationType='fade'
                            visible={isModalVisible}
                            onRequestClose={() => changeModalVisibility(false)}
                        >
                            <ModalPicker
                                changeModalVisibility={changeModalVisibility}
                                setPeriod={setPeriod}
                                yScroll={yScroll}
                            />
                        </Modal>
                    </View>
                    <View style={styles.fullChart}>
                        <Chart index={parameter.id} name="" data={parameter.data} range={periodInMinutes.current} maxDate={maxDate} />
                    </View>
                </View>
                <View style={styles.statistics}>
                    <View style={styles.statHeader}>
                        <Text style={styles.chartLabel}>Statistics</Text>
                    </View>
                    <View style={styles.statBlock}>
                        <Text style={styles.statTempLabel}>Temperature</Text>
                        <View style={styles.statDisplay}>
                            <View style={styles.statSquare1}>
                                <View style={[styles.statMaxLabel, { backgroundColor: '#ff8303' }]}>
                                    <Text style={styles.statText}>MAX</Text>
                                </View>
                                <Text style={styles.statMaxNum}>{maxTemp.value}°C</Text>
                                <View style={styles.statTime}>
                                    <Text style={styles.statTimeText}>At {maxTemp.time}</Text>
                                    <Text style={styles.statTimeText}>{maxTemp.date}</Text>
                                </View>
                            </View>
                            <View style={styles.statSquare2}>
                                <View style={[styles.statMinLabel, { backgroundColor: '#ffa84f' }]}>
                                    <Text style={styles.statText}>MIN</Text>
                                </View>
                                <Text style={styles.statMaxNum}>{minTemp.value}°C</Text>
                                <View style={styles.statTime}>
                                    <Text style={styles.statTimeText}>At {minTemp.time}</Text>
                                    <Text style={styles.statTimeText}>{minTemp.date}</Text>
                                </View>
                            </View>
                            <View style={styles.statSquare3}>
                                <View style={[styles.statAvgLabel, { backgroundColor: '#ff9a31' }]}>
                                    <Text style={styles.statText}>AVG</Text>
                                </View>
                                <Text style={styles.statMaxNum}>{avgTemp}°C</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        }
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1B1A17',
    },
    current: {
        height: 125,
        flexDirection: 'row'
    },
    lpgCurrent: {
        flex: 0.5,
        backgroundColor: '#fff',
        borderRadius: 20,
        marginTop: 10,
        marginLeft: 10,
        marginRight: 5
    },
    tempCurrent: {
        flex: 0.5,
        backgroundColor: '#fff',
        borderRadius: 20,
        marginTop: 10,
        marginLeft: 5,
        marginRight: 10
    },
    currentLabelLPG: {
        flex: 0.25,
        justifyContent: 'center',
        marginLeft: 15,
    },
    currentLabelTemp: {
        flex: 0.25,
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginRight: 15
    },
    currentLabelText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 10
    },
    currentNumLPG: {
        flex: 0.4,
        justifyContent: 'center',
        marginLeft: 15
    },
    currentNumTemp: {
        flex: 0.4,
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginRight: 15,
    },
    currentNumText: {
        fontSize: 36,
        fontWeight: 'bold'
    },
    currentDiffLPG: {
        flex: 0.2,
        justifyContent: 'center',
        marginLeft: 15
    },
    currentDiffTemp: {
        flex: 0.25,
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginRight: 15
    },
    currentDiffRedText: {
        color: '#ff0000',
        fontSize: 11,
        fontWeight: 'bold'
    },
    currentDiffGreenText: {
        color: '#00b050',
        fontSize: 11,
        fontWeight: 'bold'
    },
    currentDiffTime: {
        color: '#828282',
        fontSize: 11,
        fontWeight: 'bold',
        marginTop: 2
    },
    chart: {
        height: 330,
        backgroundColor: '#fff',
        borderRadius: 20,
        margin: 10,
    },
    chartLabel: {
        flex: 0.8,
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 15
    },
    chartHeader: {
        flex: 0.2,
        flexDirection: 'row',
        alignItems: 'center'
    },
    touchableOpacity: {
        flex: 0.2,
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderRadius: 2,
        marginRight: 20,
        marginTop: 5
    },
    period: {
        fontSize: 12,
        width: 60,
        textAlign: 'center'
    },
    fullChart: {
        flex: 0.6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statistics: {
        //height: 350,
        height: 240,
        backgroundColor: '#fff',
        borderRadius: 20,
        margin: 10,
        marginTop: 0,
        marginBottom: 0
    },
    statHeader: {
        flex: 0.3,
        flexDirection: 'row',
        alignItems: 'center'
    },
    statBlock: {
        flex: 0.6,
        alignItems: 'center',
    },
    statLPGLabel: {
        flex: 0.12,
        fontSize: 12,
        fontWeight: 'bold',
        borderBottomWidth: 2,
    },
    statTempLabel: {
        flex: 0.12,
        fontSize: 12,
        fontWeight: 'bold',
        borderBottomWidth: 2,
        borderBottomColor: '#ff8303'
    },
    statDisplay: {
        flex: 0.75,
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10
    },
    statSquare1: {
        flex: 0.3,
        borderWidth: 1
    },
    statSquare2: {
        flex: 0.3,
        marginLeft: 15,
        marginRight: 15,
        borderWidth: 1
    },
    statSquare3: {
        flex: 0.3,
        borderWidth: 1
    },
    statMaxLabel: {
        flex: 0.2,
        backgroundColor: '#000',
        marginTop: 5,
        marginLeft: 5,
        marginBottom: 5,
        marginRight: 30,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center'
    },
    statMaxNum: {
        flex: 0.4,
        marginLeft: 5,
        fontSize: 24,
        fontWeight: 'bold'
    },
    statMinLabel: {
        flex: 0.2,
        backgroundColor: '#9b9b9b',
        marginTop: 5,
        marginLeft: 5,
        marginBottom: 5,
        marginRight: 30,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center'
    },
    statAvgLabel: {
        flex: 0.2,
        backgroundColor: '#454545',
        marginTop: 5,
        marginLeft: 5,
        marginBottom: 5,
        marginRight: 30,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center'
    },
    statText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff'
    },
    statTime: {
        flex: 0.3,
        marginLeft: 5
    },
    statTimeText: {
        fontSize: 10,
        color: '#828282'
    },
    belowThreshold: {
        flex: 0.68,
        alignSelf: 'center',
        fontWeight: 'bold',
        color: '#00b050',
    },
    overThreshold: {
        flex: 0.68,
        alignSelf: 'center',
        fontWeight: 'bold',
        color: '#ff0000',
    }
});


export default FullchartScreen;