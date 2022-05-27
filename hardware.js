const raspi = require('raspi');
const I2C = require('raspi-i2c').I2C;

const hardware = {

    init() {

        raspi.init(()=>{
            const i2c = new I2C();
            global.i2c = i2c;
            console.log("init i2c done");
        });

    },

    updateSpeed(rail,speed) {

        const transmitSpeed = speed+127; 

        console.log(Buffer.from([0x01,transmitSpeed]));

        if(rail==="A") {
            global.i2c.write(0x01,0x01,Buffer.from([transmitSpeed]),()=>{
                console.log("updated speed A");
            });
        }else if(rail==="B") {
            global.i2c.write(0x01,0x02,Buffer.from([transmitSpeed]),()=>{
                console.log("updated speed B");
            });
        }

    },

    playSound(module,index) {

    },

    soundModules: [0x04]






}






module.exports = hardware;