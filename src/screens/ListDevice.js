import React ,{ useState, useEffect } from "react";
import { LogBox,Dimensions,Switch,ImageBackground,Modal,StatusBar,SafeAreaView,TouchableOpacity, StyleSheet, FlatList, Text, View} from "react-native";
import SegmentedControl from "rn-segmented-control";
import ProgressCircle from 'react-native-progress-circle'
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import ItemDevice from '../components/ItemDevice';
import { LinearGradient } from 'expo-linear-gradient';
import FirebaseConnection from '../connections/FirebaseConnection';

const ONFswitch = ({isOn, handler}) => {
    return (
        <View style={[styles.switchContainer, isOn ? styles.switchContainerOn : styles.switchContainerOff]}>
            <Text style={[styles.switchText, isOn ? styles.switchTextOn : styles.switchTextOff]}>{isOn ? 'ON ALL DEVICES' : 'NOT ON ALL DEVICES'}</Text>
            <Switch 
            value={isOn}
            onValueChange={handler}
            trackColor={{false: '#555555', true: '#A35709'}}
            thumbColor={isOn ? '#FF8303' : '#FAFAFA'}
            />
        </View>
    );
};

const PopUpModal = ({isShown, name, noHandler, yesHandler}) => {
  return (
        <Modal animationType = "fade" transparent = {true} visible = {true} visible= {isShown}>   
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalname}>{name}</Text>
                    <TouchableOpacity style={[styles.modalBtn, styles.modalBtnDefault]} onPress={noHandler}>
                        <Text style={[styles.modalBtnText, styles.modalBtnTextDefault]}>Quit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]}>
                        <Text style={[styles.modalBtnText, styles.modalBtnTextPrimary]} onPress={yesHandler}>Confirm</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const db = new FirebaseConnection().db;

async function fetchDataFromDatabase(clusterId) {
  const ldevices = [];
  
  const listdeviceid = await db.collection("buildings").doc("bd_1").collection("clusters").doc(clusterId).get();
  const listdevicesData = db.collection("devices");
  const querySnapshot = await listdevicesData.get();

  const docs = [];
  querySnapshot.forEach((doc) => {
      docs.push(doc);
  })

  await Promise.all(docs.map(
      async (doc) => {
        if (listdeviceid.data().devices.includes(doc.id)) {
            let device = {
                id: doc.id,
                name: doc.data().name,
                _status:doc.data()._status,
                _isOn: doc.data().isOn,
                type:doc.data().type,
                status: true,
                data: {
                },
            }
          ldevices.push(device);
        }
      }
  ))
  return ldevices;
}
const ListDevice = ({navigation, route}) => {

  const [listds, setlistds] = useState([]);
  
  //const clusterId = "1";
  const clusterId = route.params.cluster;
  useEffect(() => {
    fetchDataFromDatabase(clusterId).then((ldevices) => {
        setlistds(ldevices);    
    })
    

    return () => {
      console.log("Clean up called !");
    }
  }, []);

  const [on, setOn] = useState(false)
  
  const [isSwitchModalOn, showSwitchModal] = useState(false)

  const [tabIndex, setTabIndex] = React.useState(0);

  const [theme, setTheme] = React.useState("DARK");

  const data_check = listds.filter(device => device._status === 'OK'),numOfEOK = data_check.length;

  const switchHandler = (val) => {
    showSwitchModal(true);
  }

  const switchModalNoBtnHandler = () => {
    showSwitchModal(false);
  }

  const switchModalYesBtnHandler = () => {
    setOn(!on);
    showSwitchModal(false);
  }

  const handleTabsChange = (index) => {
    setTabIndex(index);
  };

  const navigateToDevice = (type, id) => {
    switch (type) {
      case "gas_sensor":
      case "dht":
        navigation.navigate("InputDevice", {deviceId:id});
        break;
      default :
        navigation.navigate("OutputDevice", {deviceId:id});
        break;
    }
  }

  return (
    <View style={[styles.container, {backgroundColor: theme === "LIGHT" ? "white" : "black" },]}>
       
        <View style={styles.chartContainer}>

            <ImageBackground 
                source={{uri: 'https://previews.123rf.com/images/tish11/tish112001/tish11200100136/139075925-vector-map-of-the-city-of-ho-chi-minh-city-vietnam.jpg'}}
                style={{ 
                    flex: 1,
                    width: '100%',
                    height: null,
                    marginLeft:50,
                    marginRight:50,
                    resizeMode: "cover",
                }}
            >

                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        
                    <ProgressCircle
                            percent={Number(((numOfEOK/listds.length)*100).toFixed(2))}
                            radius={100}
                            borderWidth={10}
                            color="#A35709"
                            shadowColor="#fff"
                            bgColor="#000"
                    >
                        <MaterialCommunityIcons name="devices" size={40} color="#A35709" /> 
                        <LinearGradient colors={['#000', '#000']}>
                            <Text style={{color:'#fff'}}>{Number(listds.length)} devices in building</Text>
                        </LinearGradient>
                    </ProgressCircle>

                </View>

            </ImageBackground >

        </View>
    
        <View style={styles.SCcontainer}>

            <SegmentedControl
                tabs={["GasSS", "Alarm", "WaterTap", "DHT"]}
                selectedIndex={tabIndex}
                onChange={() => {}}
                paddingVertical={20}
                containerStyle={{
                marginVertical: 20,
                }}
                currentIndex={tabIndex}
                onChange={handleTabsChange}
                theme={theme}
            />

            {tabIndex === 0 && (
                <SafeAreaView style={styles.Dcontainer}>
                {/* <ONFswitch isOn={on} handler={switchHandler}/> */}
                <FlatList
                    style={styles.listBlock}
                    keyExtractor={(item, index) => index.toString()}
                    data={listds.filter(device => device.type === 'gas_sensor')}
                    renderItem={itemData => (
                      <TouchableOpacity onPress={() => navigateToDevice(itemData.item.type, itemData.item.id)}>
                        <LinearGradient colors={['#000', '#fff']}>
                          <ItemDevice name={itemData.item.name}status={itemData.item._status} isO={true}>
                            <MaterialCommunityIcons name="access-point" size={25} color={"#A35709","#A35709"} /> 
                          </ItemDevice>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                />
                <PopUpModal isShown={isSwitchModalOn} name={on? "Are you sure to TURN OFF all devices ?": "Are you sure to TURN ON all devices ?"} noHandler={switchModalNoBtnHandler} yesHandler={switchModalYesBtnHandler} />
                </SafeAreaView>
            )}

            {tabIndex === 1 && (
                <SafeAreaView style={styles.Dcontainer}>
                {/* <ONFswitch isOn={on} handler={switchHandler}/> */}
                <FlatList
                    style={styles.listBlock}
                    keyExtractor={(item, index) => index.toString()}
                    data={listds.filter(device => device.type === 'alarm')}
                    renderItem={itemData => (
                      <TouchableOpacity onPress={() => navigateToDevice(itemData.item.type, itemData.item.id)}>
                        <LinearGradient colors={['#000', '#fff']}>
                          <ItemDevice name={itemData.item.name}status={itemData.item._status}isO={itemData.item._isOn}>
                            <MaterialCommunityIcons name="bell" size={25} color={"#A35709",itemData.item._isOn?"#A35709":"#808080"} /> 
                          </ItemDevice>
                        </LinearGradient>
                      </TouchableOpacity>

                    )}
                />
                <PopUpModal isShown={isSwitchModalOn} name={on? "Are you sure to TURN OFF all devices ?": "Are you sure to TURN ON all devices ?"} noHandler={switchModalNoBtnHandler} yesHandler={switchModalYesBtnHandler} />
                </SafeAreaView>
            )}

            {tabIndex === 2 && (
                <SafeAreaView style={styles.Dcontainer}>
                {/* <ONFswitch isOn={on} handler={switchHandler}/> */}
                <FlatList
                    style={styles.listBlock}
                    keyExtractor={(item, index) => index.toString()}
                    data={listds.filter(device => device.type === 'water')}
                    renderItem={itemData => (
                      <TouchableOpacity onPress={() => navigateToDevice(itemData.item.type, itemData.item.id)}>
                        <LinearGradient colors={['#000', '#fff']}>
                          <ItemDevice name={itemData.item.name}status={itemData.item._status}isO={itemData.item._isOn}>
                            <MaterialCommunityIcons name="drupal" size={25} color={"#A35709",itemData.item._isOn?"#A35709":"#808080"} /> 
                          </ItemDevice>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                />
                <PopUpModal isShown={isSwitchModalOn} name={on? "Are you sure to TURN OFF all devices ?": "Are you sure to TURN ON all devices ?"} noHandler={switchModalNoBtnHandler} yesHandler={switchModalYesBtnHandler} />
                </SafeAreaView>
            )}
            {tabIndex === 3 && (
                <SafeAreaView style={styles.Dcontainer}>
                {/* <ONFswitch isOn={on} handler={switchHandler}/> */}
                <FlatList
                    style={styles.listBlock}
                    keyExtractor={(item, index) => index.toString()}
                    data={listds.filter(device => device.type === 'dht')}
                    renderItem={itemData => (
                      <TouchableOpacity onPress={() => navigateToDevice(itemData.item.type, itemData.item.id)}>
                        <LinearGradient colors={['#000', '#fff']}>
                          <ItemDevice name={itemData.item.name}status={itemData.item._status}isO={true}>
                            <MaterialCommunityIcons name="air-filter" size={25} color={"#A35709","#A35709"} /> 
                          </ItemDevice>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                />
                <PopUpModal isShown={isSwitchModalOn} name={on? "Are you sure to TURN OFF all devices ?": "Are you sure to TURN ON all devices ?"} noHandler={switchModalNoBtnHandler} yesHandler={switchModalYesBtnHandler} />
                </SafeAreaView>
            )}

        </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  SCcontainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 5,
    marginTop: 0,
    marginBottom: 10,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10
  },
  Dcontainer: {
    flex: 1,
    flexDirection: 'row',
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    padding: 10,
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    width: '100%',
    borderWidth: 4,
    borderColor: "#fff",
  },
  name: {
    fontSize: 15,
  },
  status: {
    fontSize: 10,
  },
  screenname: {
    color: '#FF8303',
    fontSize: 35,
    marginTop: 30,
    textAlign: 'center',
},

switchContainer: {
    marginTop: 0,
    height: 50,
    flexDirection: 'row',
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    alignSelf: 'center',
    justifyContent: 'space-around'
},
switchContainerOn: {
    backgroundColor: '#463423'
},
switchContainerOff: {
    backgroundColor: "#2C2C2C"
},
switchText: {
    fontSize: 15,
},
switchTextOn: {
    color: '#FF8303',
},
switchTextOff: {
    color: '#DCDCDC'
},

modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: "#000000CC"
},
itemContainer: {
  flexDirection: 'row',
},
modalContent: {
    backgroundColor: "#808080",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center'
},
modalname: {
    backgroundColor: "#00000000",
    marginTop: 30,
    marginBottom: 30,
    color: "#F2F2F2",
    fontSize: 16
},
modalBtn: {
    paddingTop: 10,
    paddingBottom: 10,
    width: '50%',
    marginBottom: 20,
    borderRadius: 20,
    borderWidth: 3
},
modalBtnDefault: {
    backgroundColor: "#F2F2F2",
    borderColor: "#FF8303",
},
modalBtnPrimary: {
    backgroundColor: "#FF8303",
    borderColor: "#F2F2F2",
},
modalBtnText: {
    textAlign: 'center',
    fontSize: 16
},
modalBtnTextDefault: {
    color: "#FF8303",
},
modalBtnTextPrimary: {
    color: "#F2F2F2"
},
chartContainer: {
  height: '30%',
  width:'100%',
  marginTop: 10,
  marginBottom: 0,
  alignItems: 'center',
  justifyContent: 'center',
},
nameBlock: {
    width: Dimensions.get('window').width/2.5,
    margin: 10,
    alignItems: 'center',
    borderColor: '#F2f2f2',
    borderWidth: 2,
},

name: {
    fontSize: 17,
    padding: 10,
    fontWeight: 'bold',
    color: '#f2f2f2',
},

listBlock: {
    marginHorizontal: 10,
    marginBottom: 10,
    height: Dimensions.get('window').height*0.5,
    width: '100%',
}
});
export default ListDevice;
