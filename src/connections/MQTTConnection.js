import uuid from 'react-native-uuid';
import init from 'react_native_mqtt';
import { AsyncStorage} from 'react-native';

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  reconnect: true,
  sync: {},
});

export default class MQTTConnection {
    constructor(host, port, userName, password){
        this.onConnectionLost = this.onConnectionLost.bind(this)
        this.sendMessage = this.sendMessage.bind(this)
        this.onConnected = this.onConnected.bind(this)

        this.state = {
            message: [''],
            client,
            messageToSend:'',
            isConnected: false,
            error:'',
            handlers: {},
            handlerId: 0,
            pendingActions: [],
        };

        let currentTime = +new Date();
        let clientID = currentTime + uuid.v1();
        clientID = clientID.slice(0, 23);

        const client = new Paho.MQTT.Client(host, port, clientID);
        this.state.client = client;
        
        client.connect({ 
            useSSL: false,
            userName,
            password,
            onFailure: (e) => {console.log("here is the error" , e); }
        });

        client.onMessageArrived = (message) => {
            for (const handlerId in this.state.handlers[message.destinationName]) {
                this.state.handlers[message.destinationName][handlerId](message);
            }
        };
        client.onConnectionLost = this.onConnectionLost;
        client.onConnected = this.onConnected;
    }

    subscribe = (topic) => {
        action = () => {
            this.state.client.subscribe(topic);
            console.log("Subscribed to topic : ", topic);
        }
        if (!this.state.isConnected) {
            console.log("Device is currently disconnected ! Added action to pendingActions.");
            this.state.pendingActions.push(action);
        } else {
            action();
        }
    }

    //This function return a handlerId that is kept to remove the handler later.
    addMessageArrivedHandler = (topic, handler) => {
        this.state.handlerId = this.state.handlerId + 1;
        if (!this.state.handlers[topic]) this.state.handlers[topic] = {};
        this.state.handlers[topic][this.state.handlerId] = handler;
        console.log("Added handler to topic : ", topic, "handlerId : ", this.state.handlerId);
        return this.state.handlerId;
    }

    unsubscribe = (topic) => {
        action = () => {
            this.state.client.unsubscribe(topic);
            console.log("Unsubscribed to topic : ", topic);
        }
        if (!this.state.isConnected) {
            console.log("Device is currently disconnected ! Added action to pendingActions.");
            this.state.pendingActions.push(action);
        } else {
            action();
        }
    }  

    removeMessageArrivedHandler = (topic, handlerId) => {
        console.log("Removed handler from topic : ", topic, "handlerId : ", handlerId);
        if (handlerId) delete this.state.handlers[topic][handlerId];
    }

    sendMessage(topic, message) {
        var message = new Paho.MQTT.Message(message);
        message.destinationName = topic;

        action = () => {
            this.state.client.send(message);
        }

        if(this.state.isConnected) {
            action();
        } else {
            console.log("Device is currently disconnected ! Added action to pendingActions.");
            this.state.pendingActions.push(action);
        }
    }  

    onConnected() {
        console.log("Client connected !");
        this.state.error = '';
        this.state.isConnected = true;
        for (action of this.state.pendingActions) {
            console.log("Excuting action : ", action);
            action();
        }
        this.state.pendingActions = [];
        return;
    }

    onConnectionLost(responseObject) {
        console.log("Client disconnected !");
        if (responseObject.errorCode !== 0) {
            //console.log("onConnectionLost:"+responseObject.errorMessage);
            this.state.error = 'Lost Connection';
            this.state.isConnected = false;
        }
    }
}
