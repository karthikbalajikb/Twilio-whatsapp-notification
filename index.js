const accountSid = "<your account sid>";
const authToken = "<your auth token>";
const client = require("twilio")(accountSid, authToken);
const app = require("express")();
const bodyParser = require("body-parser");
const cors = require("cors");
const MessagingResponse = require("twilio").twiml.MessagingResponse;
var http = require('http').Server(app);
const io = require('socket.io')(http);
app.io = io;

const PORT = 4500;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// socket.io events
io.on( "connection", function( socket )
{
    console.log( "A user connected" );
    socket.on('jointhegroup', function(data){
      console.log("joining with sid:",data.sid);
      socket.join(data.sid);
    })
});

http.listen(PORT, function() {
  console.log("SERVER IS RUNNING IN PORT", PORT);
});

app.post("/twilwats/inbound/msg", function(req, res) {
  console.log("recived inbound msg", req.body);

  const response = new MessagingResponse();
  const message = response.message();
  message.body("Hello World!");
  console.log(response.toString());
  res.status(200).send(response.toString());
});

app.post("/twilwats/inbound/status", function(req, res) {
  console.log("recived inbound status", req.body);
  const SmsSid = req.body.SmsSid;
  const SmsStatus = req.body.SmsStatus;
  if(SmsStatus === 'delivered' || SmsStatus === 'undelivered' || SmsStatus === 'failed') {
    io.sockets.to(SmsSid).emit('JoinACK',req.body);
  }

  if(SmsStatus === 'sent') {
    io.sockets.to(SmsSid).emit('orderMsgACK',req.body);
  }

  res.status(200).send("OK");
});

app.post("/api/newUser", function(req, res) {
  const clientNumber = req.body.clientNumber;

  client.messages
    .create({
      body: "Welcome To KB TechSpace",
      from: "whatsapp:+441618507453",
      to: "whatsapp:+91" + clientNumber
    })
    .then(message => messageAckHandler(message))
    .catch(err => console.log(err))
    .done();

  function messageAckHandler(msg) {
    console.log(msg);
    if (msg.SmsStatus === "failed") {
      res.json(msg);
    } else {
      res.json(msg);
    }
  }
});
