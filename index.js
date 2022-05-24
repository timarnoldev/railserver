const express = require("express");
const hardware = require("./hardware");

const Net = require("net");
const liveport = 8846;

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.disable('x-powered-by');

global.app = app;


app.listen(8080,()=>{

    console.log('Listening for connections');

})



const getRailsHandler = {
    canHandle: function(message) {
        return message.type === "getRails";
    },
    handle: function (message, socket) {
        
            socket.write(JSON.stringify({rails: ["A","B"]})+"\n");
        
    }
}


const updateSpeed = {
    canHandle: function(message) {
        return message.type === "updateSpeed";
    },
    handle: function (message, socket) {
        if(message.rail!=null&&message.speed!=null) {

            hardware.updateSpeed(message.rail,message.speed);            

        }
    }
}

const playSoundHandler = {
    canHandle: function(message) {
        return message.type === "playSound";
    },
    handle: function (message, socket) {
        if(message.module!=null&&message.index!=null) {

            hardware.playSound(message.module,message.index);            

        }
    }
}


let methods = {
    handler: [getRailsHandler,updateSpeed,playSoundHandler]
}

function handleMessage(message, socket) {
    //  console.log(message.toString());
      let parsedMessage;
      try {
          parsedMessage = JSON.parse(message);
      } catch (e) {
          console.log(e);
          return;
      }
  
  
      methods.handler.forEach(function (method) {
          if(method.canHandle(parsedMessage)) {
              method.handle(parsedMessage, socket);
          }
      });
  
  }


const clients = [];
const server = new Net.Server();

server.listen(liveport, function () {
    console.log(`Listening on port ${liveport}`);
});

server.on('connection', (socket) => {
    clients.push(socket);
    socket.write(JSON.stringify({index: clients.length})+"\n");

    socket.on('data', function (chunk) {
      

        chunk.toString().split("\n").forEach(function (line) {
            if (line.length > 0) {
                try {
                    handleMessage(line, socket);

                } catch (e) {
                    console.log(e);
                }
            }

        });
    });

    socket.on('error',()=>{
        const indexOfClient = clients.indexOf(socket);
        if(indexOfClient!==-1) {
            clients.splice(indexOfClient,1);
        }
    });

    socket.on('close', function () {
        console.log('Connection closed');
        const indexOfClient = clients.indexOf(socket);
        if(indexOfClient!==-1) {
            clients.splice(indexOfClient,1);
        }
    });

});