class EventEmiter {
  constructor() {
    this.events = [
      // {
      //   name
      //   handlers
      // }
    ];
  }

  existEvent(eventName) {
    return this.events.find(e => e.name == eventName)
  }
  createEvent(eventName) {
    if (!this.existEvent(eventName)) {
      this.events.push({
        name: eventName,
        handlers: []
      })

      return true
    } else {
      return false
    }
  }
  addHandler(eventName, fn) {
    const foundIndex = this.events.findIndex(e => e.name == eventName)

    if (foundIndex > -1) {
      this.events[foundIndex].handlers.push(fn)
    } else {
      console.error(`No existe el evento: ${eventName}`)
    }
  }
  triggerEvent(eventName, data, scope) {
    const event = this.existEvent(eventName)

    if (event) {
      event.handlers.forEach(handler => {
        handler.call(scope, data)
      })
    } else {
      console.error(`No existe el evento: ${eventName}`)
    }
  }
}






const utils = ({
  eventEmiter: new EventEmiter()
})