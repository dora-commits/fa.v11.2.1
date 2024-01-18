import * as React from 'react';
import MapView from 'react-native-maps';
import { StyleSheet, Text, View, Dimensions, Button } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import BottomSheet from 'reanimated-bottom-sheet';
import Animated from 'react-native-reanimated';
import FirebaseConnection from '../connections/FirebaseConnection';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getDistance} from 'geolib';
import { setStatus } from './Warning';
import {ToastAndroid, Platform, AlertIOS,} from 'react-native';
export const FIRE_RADIUS = 350;

const db = new FirebaseConnection().db;
let uid;
const mapDarkStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
];

function notifyMessage(msg) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT)
  } else {
    AlertIOS.alert(msg);
  }
}

const MapScreen = ({ navigation }) => {
  const [isOnFire, setIsOnFire] = React.useState(false);
  const [position, setPosition] = React.useState({
    latitude: 0,
    longitude: 0
  });

  const [humanPosition, setHumanPosition] = React.useState({
    lastLocationUpdate: 0,
    latitude: 0,
    longitude: 0
  })
  const [showHuman, setShowHuman] = React.useState(false);

  const [number, setNumber] = React.useState(0);

  const bs = React.createRef();
  const fall = new Animated.Value(1);

  const observer1 = React.useRef();
  const observer2 = React.useRef();
  const observer3 = React.useRef();
  const map = React.useRef();
  
  //This function may be changed
  //Function to determine whether "Are you safe" message should appear in map
  function isInDanger() {
    //showHuman is false when location is not available for this user
    if (!showHuman) {
      //User whose location can't be determined should be able to call help ?
      return false;
    }

    //two hours already passed since last location fetch
    //if ((Date.now() - humanPosition.lastLocationUpdate.toDate()) / 1000 > 3600*2) {
      //return true;
    //}

    //the distance between user and the fire is larger than FIRE_RADIUS
    if (getDistance(
      {latitude: position.latitude, longitude: position.longitude}, 
      {latitude: humanPosition.latitude, longitude: humanPosition.longitude}) > FIRE_RADIUS) {
        return false;
    } else {
      return true;
    } 
  }

  async function fetchDataFromDatabase() {
    const buildingData = await db.collection("buildings").doc("bd_1").get();
    setIsOnFire(buildingData.data().isOnFire);
    map.current.animateToRegion({
      latitude:buildingData.data().position.latitude,
      longitude:buildingData.data().position.longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121,
    })
    setPosition(buildingData.data().position);

    uid = await AsyncStorage.getItem("uid");
    const humanData = await db.collection("users").doc(uid).get();
    if ("latitude" in humanData.data() && "longitude" in humanData.data()) {
      setHumanPosition(humanData.data());
      setShowHuman(true);
    }
  }

  function addFirebaseUpdateListener() {
    observer1.current = db.collection("buildings").doc("bd_1").onSnapshot(docSnapShot => {
      setIsOnFire(docSnapShot.data().isOnFire);
      //setNumber(docSnapShot.data().numPeopleInDanger);
    });
    observer3.current = db.collection("users").where('status', 'in', ['Unknown', 'In Danger']).onSnapshot(docSnapShot => {
      console.log("Downloading the collection in map");
      setNumber(docSnapShot.size);
    })

    observer2.current = db.collection("users").doc(uid).onSnapshot(docSnapShot => {
      if ("latitude" in docSnapShot.data() && "longitude" in docSnapShot.data()) {
        setHumanPosition(docSnapShot.data());
        setShowHuman(true);
      }
    })
  }

  React.useEffect(() => {
      fetchDataFromDatabase().then(() => {
        console.log("done fetching data");
        addFirebaseUpdateListener();
      });
      
    return () => {
      observer1.current();
      observer2.current();
      observer3.current();
    }
  }, [])

  const renderInner = () => (
    <View style={styles.panel}>
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.panelTitle}>Please confirm your status</Text>
        <View style={styles.panelBtnView}>
          <TouchableOpacity style={[styles.panelBtn, { backgroundColor: '#F2F2F2' }]} onPress={() => {bs.current.snapTo(1); setStatus("In Danger"); notifyMessage("Your status is reported! Thank you for confirmation!")}}>
            <Text style={[styles.panelBtnText, { color: '#FF8200' }]}> I'm in danger</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.panelBtnView}>
          <TouchableOpacity style={[styles.panelBtn, { backgroundColor: '#FF8200', borderColor: '#F2F2F2', borderWidth: 1 }]} onPress={() => {bs.current.snapTo(1); setStatus("Safe"); notifyMessage("Your status is reported! Thank you for confirmation!")}}>
            <Text style={[styles.panelBtnText, { color: '#F2F2F2' }]}> I'm safe </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.panelHeader}>
        <View style={styles.panelHandler}></View>
      </View>
    </View>
  );

  const markerOnClick = () => {
    if (isOnFire){
      navigation.navigate('PeopleList');
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <BottomSheet
        ref={bs}
        snapPoints={[165, 0]}
        renderContent={renderInner}
        renderHeader={renderHeader}
        initialSnap={1}
        callbackNode={fall}
        enabledGestureInteraction={true}
      />
      <MapView
        style={styles.map}
        customMapStyle={mapDarkStyle}
        ref={map}> 
          <MapView.Marker
            coordinate={{
              latitude: position.latitude - 0.0006,
              longitude: position.longitude,
            }}
            description={"Address"}
            onPress={markerOnClick}
            >
              {isOnFire ?
              <View style={styles.peopleMarker}>
                {number > 1 ?
                <Text style={styles.number}>{number.toString() + " people need help"}</Text>
                :
                number === 1 ?
                <Text style={styles.number}>{"1 person needs help"}</Text>
                :
                <Text style={styles.number}>{"No one around this region"}</Text>
                }
                <MaterialCommunityIcons name="fire" size={50} color="#ff4a0d" /> 
              </View>
              : null}
          </MapView.Marker>
        {isOnFire ? 
          <MapView.Circle
              center = { {latitude: position.latitude, longitude: position.longitude} }
              radius = { FIRE_RADIUS }
              strokeWidth = { 1 }
              strokeColor = { '#ff760d' }
              fillColor = { '#c74d1422' }
          />
        : null }
        {showHuman? 
        <MapView.Marker
          coordinate={{
            latitude: humanPosition.latitude,
            longitude: humanPosition.longitude,
          }}
          title={"My place"}
          description={"Address"}>
          <MaterialCommunityIcons name="human" size={50} color="#287fad" /> 
        </MapView.Marker>
        : null }
      </MapView>
      {(isOnFire && isInDanger()) ?
      <View style={styles.btnView}>
        <TouchableOpacity style={styles.btnBtn} onPress={() => bs.current.snapTo(0)}>
          <Text style={styles.btnText}> ARE YOU SAFE?</Text>
        </TouchableOpacity>
      </View>: null}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    flex: 1,
  },

  btnView: {
    position: 'absolute',
    bottom: '5%',
    left: '17.5%',
    padding: 5,
  },

  btnBtn: {
    width: Dimensions.get('window').width * 0.65,
    padding: 10,
    backgroundColor: '#FF8303',
    alignItems: 'center',
    borderRadius: 20,
    elevation: 10,
  },

  btnText: {
    color: 'white'
  },

  myLocMarker: {
    width: 15,
    height: 15,
    borderRadius: 50,
    backgroundColor: '#005C8F',
    borderColor: 'white',
    borderWidth: 1,
  },

  panel: {
    backgroundColor: 'rgba(255, 154, 21, 0.8)',
    height: 165,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  header: {
    backgroundColor: 'white',
  },

  panelHeader: {
    backgroundColor: 'white',
  },

  panelHandler: {
    backgroundColor: 'white'
  },

  panelTitle: {
    color: '#F2F2F2',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 15,
  },

  panelBtnView: {
    padding: 5
  },

  panelBtn: {
    width: Dimensions.get('window').width * 0.65,
    padding: 5,
    alignItems: 'center',
    borderRadius: 5,
    margin: 3,
  },

  panelBtnText: {
    fontSize: 17,
    fontWeight: 'bold'
  },

  peopleMarker: {
    alignItems: "center",
  },

  number: {
    fontSize: 15,
    color: "#FFFFFF",
    textAlign: "center",
  }
});

export default MapScreen;