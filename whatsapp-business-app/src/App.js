import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import axios from "axios";
import qrcode from "./assets/download.png";
import "./App.scss";

import OrderCard from './components/OrderCard/order-card';

let socket = socketIOClient("http://18.212.31.132:4500");
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sid: "",
      mobile: "",
      msgStatus: "",
      orderStatus: 'Not Sent'
    };
  }

  componentDidMount() {
    const getLSdata = JSON.parse(window.localStorage.getItem('whatsappconfig'));
    console.log(getLSdata)
    if(getLSdata !== undefined && getLSdata !== null){
      this.setState({
        sid: getLSdata.sid,
        mobile: getLSdata.mobile,
        msgStatus: 'notsent'
      })
    }
    socket.on("JoinACK", (data) => {
      console.log("[Join ACK]:", data);
      if (data.MessageStatus === "delivered") {
        const LSdata = {
          sid: data.MessageSid,
          mobile: data.To.split('+91')[1],
          msgStatus: data.MessageStatus
        };
        this.setState({
          sid: data.MessageSid,
          mobile: data.To,
          msgStatus: data.MessageStatus,
          orderStatus: 'Message is delivered'
        });
        window.localStorage.setItem("whatsappconfig", JSON.stringify(LSdata));
      }
      else{
        this.setState({
          sid: data.MessageSid,
          mobile: data.To,
          msgStatus: data.MessageStatus
        });
      }

      if(data.MessageStatus === "delivered" && data.EventType === "READ"){
        this.setState({
          sid: data.MessageSid,
          mobile: data.To,
          msgStatus: data.EventType,
          orderStatus: 'Message is read'
        });
      }
    });

    socket.on('orderMsgACK', (data) => {
      console.log("order ACK", data);
      if(data.MessageStatus === "sent"){
        this.setState({
          sid: data.MessageSid,
          mobile: data.To,
          msgStatus: data.MessageStatus,
          orderStatus: 'Message is sent'
        });
      }
    })
  }

  doSendMobileNumber = () => {
    const number = document.getElementById("mobileNumber").value;

    axios
      .post("http://18.212.31.132:4500/api/newUser", { clientNumber: number })
      .then(d => {
        console.log(d.data.sid);
        socket.emit("jointhegroup", { sid: d.data.sid });
      })
      .catch(err => console.log(err));
  };

  sendDispatchNotification = () => {
    console.log('send dispatch notification');
    this.setState({
      msgStatus: 'sending',
      orderStatus: 'Sending...'
    });
    const getLSdata = JSON.parse(window.localStorage.getItem('whatsappconfig'))
    const number =  getLSdata.mobile;
    axios
      .post("http://18.212.31.132:4500/api/newUser", { clientNumber: number })
      .then(d => {
        console.log(d.data.sid);
        socket.emit("jointhegroup", { sid: d.data.sid });
      })
      .catch(err => console.log(err));
  }
  render() {
    return (
      <div>
        {this.state.msgStatus === "" || this.state.msgStatus === "undelivered" || this.state.msgStatus === "failed"  ? (
          <div className="App">
            <header className="App-header">
              <div className="App__header__logo">
              <h1 className="App-title">WhatsApp Business App</h1>
              </div>
              <h2>
                Send <code>"join regalia-elk"</code> to{" "}
                <code>+44 161 850 7453</code> in WhatsApp to join our Business
                group, and we'll reply with a confirmation that you've joined
              </h2>
              <span>(Or)</span>
            </header>
            <div className="step_2">
              <p className="App-intro">
                Scan the below QR code to join the Business Group
              </p>
              <div>
                <img src={qrcode} alt="qrcode" />
              </div>
            </div>
            <div className="step_3">
              <p>
                Once you received a confirmation message from us to your
                whatsapp . Enter your 10 digit whatsapp mobile number below and
                hit enter or click on send button.
              </p>
              <div className="step_3_message">
                <input
                  type="text"
                  placeholder="mobile number"
                  className="step_3_message--txt"
                  id="mobileNumber"
                />
                <button
                  className="step_3_message--btn"
                  onClick={this.doSendMobileNumber}
                >
                  send
                </button>
              </div>
              {this.state.msgStatus === "undelivered" || this.state.msgStatus === "failed" ? (<div><p>You have not joined yet. Scan the QR code or Send "join regalia-elk" to
                <code>+44 161 850 7453</code> in WhatsApp </p></div>): ''}
            </div>
          </div>
        ) : (
          <div>
            <h1>Send Order Notification</h1>
            <OrderCard sendDispatchNotification={this.sendDispatchNotification} statusText={this.state.orderStatus} status={this.state.msgStatus} />
          </div>
        )}
      </div>
    );
  }
}

export default App;
