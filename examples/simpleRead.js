import MRCL, {
  MRCP,
  MRIL,
  protocol,
  SerialTransport,
} from '../src/index.js'

import fs from 'fs'
import readline from 'readline'



//const trans = new SerialTransport.Serial({port:'Com4', baud: 9600})

const trans = new SerialTransport({
  port: 'Com4', // on mac, do ls /dev/{tty,cu}.* to list the ports
  bausRate: 9600,
})

const mrcl = new MRCL(trans)

// read file and send to robot

const lineReader = readline.createInterface({
  input: fs.createReadStream('./PP.mril'),
})

lineReader.on('line', (line) => {
  const mril = new MRIL(line)
  const cmd = new MRCP(protocol.MRCP.QUEUE_IN, mril)
  mrcl.send(cmd)

}).on('close', () => {

    console.log('file read and all commands executed')

})
