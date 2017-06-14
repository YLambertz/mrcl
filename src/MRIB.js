import protocol from '../src/protocolDefinitions'
import MRIL from './MRIL'
import MRCP from './MRCP'

export default class MRIB {
  constructor(MRCL) {
    this.X = this.Y = this.Z = this.A = this.B = this.C = 0
    this.VELOCITY = 10
    this.MOVEMENT_METHOD = '00'

    this.MRCL = MRCL
    this.mrcpCommand = protocol.MRCP.EXECUTE
  }

  queue() {
    this.mrcpCommand = protocol.MRCP.QUEUE_IN
    return this
  }

  clearQueue(cb) {
    const mril = new MRIL()
    if (cb) {
      mril.onExecuted(cb)
    }
    const mrcp = new MRCP(this.mrcpCommand, mril)

    this.MRCL.send(mrcp)

    return this
  }

  execute() {
    this.mrcpCommand = protocol.MRCP.EXECUTE
    return this
  }

  write() {
    this.mrcpCommand = protocol.MRCP.WRITE
    return this
  }

  setVelocity(v) {
    this.VELOCITY = v
    return this
  }

  setMovementMethod(M) {
    this.MOVEMENT_METHOD = M
  }

  pose(A, B, C, cb) {
    this.move(this.X, this.Y, this.Z, A, B, C, cb)
    return this
  }

  move(M = this.MOVEMENT_METHOD, X = this.X, Y = this.Y, Z = this.Z, A = this.A, B = this.B, C = this.C, V = this.VELOCITY, cb) {
    this.MOVEMENT_METHOD = M

    this.X = X
    if (typeof Y === 'function') {
      cb = Y
    } else {
      this.Y = Y
      if (typeof Z === 'function') {
        cb = Z
      } else {
        this.Z = Z
        if (typeof A === 'function') {
          cb = A
        } else {
          this.A = A
          if (typeof B === 'function') {
            cb = B
          } else {
            this.B = B
            if (typeof C === 'function') {
              cb = C
            } else {
              this.C = C
              if (typeof V === 'function') {
                cb = V
              } else {
                this.VELOCITY = V
              }
            }
          }
        }
      }
    }

    this.createMoveCommand(cb)
  }

  moveLinear(X, Y, Z, A, B, C, V, cb) {
    this.move('01', X, Y, Z, A, B, C, V, cb)
    return this
  }

  moveP2P(X, Y, Z, A, B, C, V, cb) {
    this.move('00', X, Y, Z, A, B, C, V, cb)
    return this
  }

  delay(ms, cb) {
    this.createMRIL(`${protocol.MRIL.WAIT}${ms.toFixed(4)}`, cb)

    return this
  }

  moveToX(X, cb) {
    this.X = X
    this.createMoveCommand(cb)
    return this
  }
  moveToY(Y, cb) {
    this.Y = Y
    this.createMoveCommand(cb)
    return this
  }
  moveToZ(Z, cb) {
    this.Z = Z
    this.createMoveCommand(cb)
    return this
  }
  moveToA(A, cb) {
    this.A = A
    this.createMoveCommand(cb)
    return this
  }
  moveToB(B, cb) {
    this.B = B
    this.createMoveCommand(cb)
    return this
  }
  moveToC(C, cb) {
    this.C = C
    this.createMoveCommand(cb)
    return this
  }
  setOutput(pin, state, done) {
    if (state !== 1 && state !== 0) {
      console.log('state must be 1 or 0')
      return this
    }
    this.createMRIL(`${protocol.MRIL.OUTPUT}${pin}${state}`, done)
    return this
  }
  setInput(pin, state, done) {
    if (state !== 1 && state !== 0) {
      console.log('state must be 1 or 0')
      return this
    }
    this.createMRIL(`${protocol.MRIL.INPUT}${pin}${state}`, done)
    return this
  }

  setAdditionalAxis(axis, value, cb) {
    this.createMRIL(`${protocol.MRIL.VELOCITY}${this.VELOCITY}${protocol.MRIL.ANGLE}${axis}`, cb)
    return this
  }

  getPose(cb) {
    this.createMRIL(protocol.MRIL.X + protocol.MRIL.Y + protocol.MRIL.Z + protocol.MRIL.A + protocol.MRIL.B + protocol.MRIL.C, (response) => {
      const regex = /([XYZABC])\s*(-?\d*\.?\d+)/ig
      const pose = {}
      let match
      while ((match = regex.exec(response)) !== null) {
        pose[match[1].toLowerCase()] = +match[2]
      }
      cb(pose)
    })

    return this
  }

  getAngles(cb) {
    this.createMRIL([0, 1, 2, 3, 4, 5].map(el => protocol.MRIL.ANGLE + el).join(''), (response) => {
      const regex = /R(\d)\s*(-?\d*\.?\d+)/ig
      const pose = []
      let match
      while ((match = regex.exec(response)) !== null) {
        pose[match[1]] = +match[2]
      }
      cb(pose)
    })

    return this
  }

  createMRIL(message, onExecuted) {
    const mril = new MRIL(message)

    if (onExecuted) {
      mril.onExecuted(onExecuted)
    }

    const mrcp = new MRCP(this.mrcpCommand, mril)

    this.MRCL.send(mrcp)

    return this
  }

  createMoveCommand(cb) {
    this.createMRIL(`${protocol.MRIL.MOVEMENT_METHOD}${this.MOVEMENT_METHOD}${protocol.MRIL.VELOCITY}${this.VELOCITY}${protocol.MRIL.X}${this.X.toFixed(4)}${protocol.MRIL.Y}${this.Y.toFixed(4)}${protocol.MRIL.Z}${this.Z.toFixed(4)}${protocol.MRIL.A}${this.A.toFixed(4)}${protocol.MRIL.B}${this.B.toFixed(4)}${protocol.MRIL.C}${this.C.toFixed(4)}`, cb)
  }

}
