import React ,{ useState} from "react";
import { Modal,Pressable,ImageBackground,StyleSheet, Text, View, Dimensions} from "react-native";
import ProgressCircle from 'react-native-progress-circle'
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import FirebaseConnection from "../connections/FirebaseConnection";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as firebase from 'firebase';

const db = new FirebaseConnection().db;

export async function setStatus(status) {
  const uid = await AsyncStorage.getItem("uid");
  const userRef = db.collection("users").doc(uid);
  const buildingRef = db.collection("buildings").doc("bd_1");

  await db.runTransaction(async (transaction) => {
    const userInfo = await transaction.get(userRef);

    const old_status = userInfo.data().status;
    let increment = firebase.firestore.FieldValue.increment(0);

    if (status === "Safe") {
      if (old_status === "In Danger" || old_status === "Unknown") {
        increment = firebase.firestore.FieldValue.increment(-1);
      }
    } else if (status === "In Danger" || status === "Unknown") {
      if (old_status === "Safe") {
        increment = firebase.firestore.FieldValue.increment(1);
      }
    } else {
      return;
    }
    transaction.set(userRef, {status}, {merge: true});
    transaction.set(buildingRef, {numPeopleInDanger: increment}, {merge: true})
  })
}

const Warning = ({navigation}) => {

  const [modalVisible, setModalVisible] = useState(false);
  const [theme, setTheme] = React.useState("DARK");

  const indangerConfirmed = () => {
    setStatus("In Danger");
    navigation.goBack();
    setModalVisible(!modalVisible);
  }

  const okConfirmed = () => {
    setStatus("Safe");
    navigation.goBack();
    setModalVisible(!modalVisible);
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
                          percent={100}
                          radius={150}
                          borderWidth={10}
                          color="#A35709"
                          shadowColor="#fff"
                          bgColor="#fff"
                  >
                      <MaterialCommunityIcons name="fire" size={180} color="#FF0000" /> 
                      
                          <Text style={{color:'#FF0000',fontSize : 20}}> {'WARNING ! FIRE'}</Text>
                      
                  </ProgressCircle>
              </View>

            </ImageBackground >

          </View>
          <View style={styles.centeredView}>
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                //Alert.alert("Modal has been closed.");
                setModalVisible(!modalVisible);
              }}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <Text style={styles.modalText}>Please confirm your status!</Text>
                  <View style={styles.panelBtnView}>
                    <Pressable
                      style={[styles.button, styles.button_primary, styles.buttonClose]}
                      onPress={indangerConfirmed}
                    >
                      <Text style={styles.text_primary}>I'm in DANGER</Text>
                    </Pressable>
                  </View>
                  <View style={styles.panelBtnView}>
                    <Pressable
                      style={[styles.button, styles.button_default, styles.buttonClose]}
                      onPress={okConfirmed}
                    >
                      <Text style={styles.text_default}>I'm OKAY</Text>
                    </Pressable>
                  </View>
                </View>
              </View>   
            </Modal>
        <Pressable
          style={[styles.button, styles.buttonOpen]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.textStyle}>THERE'S A FIRE! ARE YOU OKAY?</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  btnText: {
    color: 'white'
  },

  chartContainer: {
    height: '90%',
    width:'100%',
    marginTop: 10,
    marginBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 10
  },
  modalView: {
    margin: 20,
    backgroundColor: "rgba(255, 154, 21, 1)",
    borderRadius: 10,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 25,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#FF8303",
    width: Dimensions.get('window').width * 0.7,
  },
  buttonClose: {
    width: Dimensions.get('window').width * 0.6,
  },
  button_primary: {
    backgroundColor: "#FF8303",
    borderColor: "white",
    borderWidth: 2,
  },
  button_default: {
    backgroundColor: "white"
  },
  text_default: {
    color: "#FF8303",
    fontWeight: "bold",
    textAlign: "center",
  },
  text_primary: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
    color: "white",
  },
  panelBtnView: {
    padding: 5
  },
});
export default Warning;
