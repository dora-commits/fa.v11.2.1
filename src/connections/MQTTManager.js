import MQTTConnection from "./MQTTConnection"

export default class MQTTManager {
    constructor() {
        const instance = this.constructor.instance;
        if (instance) {
            return instance;
        }
        //==============================================
        const username1 = "ndqduy";
        const password1 = "aio_rYKh78krOjXgXnQrXD9FocD4WwSH";
        this.mqtt1 = new MQTTConnection('io.adafruit.com', 80, username1, password1);

        const username2 = "ndqduy";
        const password2 = "aio_rYKh78krOjXgXnQrXD9FocD4WwSH";
        this.mqtt2 = new MQTTConnection('io.adafruit.com', 80, username2, password2);

        this.topic11 = 'ndqduy/feeds/temp';
        this.topic12 = 'ndqduy/feeds/speaker';
        this.topic21 = "ndqduy/feeds/gas";
        this.topic22 = "ndqduy/feeds/water";

        //==============================================

        // const username1 = "CSE_BBC";
        // const password1 = "";
        // this.mqtt1 = new MQTTConnection('io.adafruit.com', 80, username1, password1);

        // const username2 = "CSE_BBC1";
        // const password2 = "";
        // this.mqtt2 = new MQTTConnection('io.adafruit.com', 80, username2, password2);

        // this.topic11 = 'CSE_BBC/feeds/bk-iot-temp-humid';
        // this.topic12 = 'CSE_BBC/feeds/bk-iot-speaker';
        // this.topic21 = "CSE_BBC1/feeds/bk-iot-gas";
        // this.topic22 = "CSE_BBC1/feeds/bk-iot-relay";

        this.mqtt1.subscribe(this.topic11);
        this.mqtt1.subscribe(this.topic12);
        this.mqtt2.subscribe(this.topic21);
        this.mqtt2.subscribe(this.topic22);

        this.constructor.instance = this;
    }

    addMessageArrivedHandler(type, handler) {
        if (type === "dht") return this.mqtt1.addMessageArrivedHandler(this.topic11, handler);
        if (type === "alarm") return this.mqtt1.addMessageArrivedHandler(this.topic12, handler);
        if (type === "gas_sensor") return this.mqtt2.addMessageArrivedHandler(this.topic21, handler);
        if (type === "water") return this.mqtt2.addMessageArrivedHandler(this.topic22, handler);
    }

    removeMessageArrivedHandler(type, handlerId) {
        if (type === "dht")  this.mqtt1.removeMessageArrivedHandler(this.topic11, handlerId);
        if (type === "alarm")  this.mqtt1.removeMessageArrivedHandler(this.topic12, handlerId);
        if (type === "gas_sensor")  this.mqtt2.removeMessageArrivedHandler(this.topic21, handlerId);
        if (type === "water")  this.mqtt2.removeMessageArrivedHandler(this.topic22, handlerId);
    }

    sendMessage(type, message) {
        if (type === "dht")  this.mqtt1.sendMessage(this.topic11, message);
        if (type === "alarm")  this.mqtt1.sendMessage(this.topic12, message);
        if (type === "gas_sensor")  this.mqtt2.sendMessage(this.topic21, message);
        if (type === "water")  this.mqtt2.sendMessage(this.topic22, message);
    }

    
}