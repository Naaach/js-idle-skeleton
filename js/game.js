class Game {
  constructor() {
    this.points = 0;
    this.pointsPerSecond = 0;
    this.pointsPerClick = 1;
    this.pointsPerMinute = 0;
    this.intervalID = null;
    this.preloadEntities = [];
    this.entities = [];
    this.$viewPoints = null;
    this.updateDivisor = 5;

    this.customEvents = {
      // updatePoints
    };

    this.prepareGame();
  }

  prepareGame() {
    this.loadSaveGame()
    this.initGame()
  }
  initGame() {
    this.createCustomEvents()
    this.initListeners()
    this.pointsOnClick()
    this.update()
  }
  saveData() {
      const toSave = {
        points: this.points,
        pointsPerSecond: this.pointsPerSecond ,
        pointsPerClick: this.pointsPerClick,
        entities: this.entities.map(entity => entity.getDataToSave())
      }

    const encoded = btoa(JSON.stringify(toSave))
    localStorage.setItem('saveData', encoded)
  }
  loadSaveGame() {
    const saveData = localStorage.getItem('saveData')
    
    if (saveData) {
      const decoded = JSON.parse(atob(saveData))

      Object.keys(decoded).forEach(key => {
        this[key] = decoded[key]
      })

      // Cast the upgrades
      this.entities.forEach((entity, index) => {
        this.entities[index] = new Upgrade().createFromSaveData(entity)
      })
    } 
  }
  update() {
    this.intervalID = setInterval(() => {
      let sumPoints = 0
      this.entities.forEach(entity => {
        this.addPoints(entity.pointsPerSecond / this.updateDivisor)
        sumPoints += entity.pointsPerSecond
      })

      // Calc the total points per minute
      const totalPointsPerSecond = parseFloat((sumPoints).toFixed(2))
      document.querySelector('.pointsPerTime span.pointsPerSecond').innerHTML = totalPointsPerSecond;

      const totalPointsPerMinute = parseFloat((sumPoints * 60).toFixed(2));
      document.querySelector('.pointsPerTime span.pointsPerMinute').innerHTML = totalPointsPerMinute

    }, 1000 / this.updateDivisor)
  }
  addPoints(points) {
    this.points = parseFloat((this.points + points).toFixed(2))
    this.updateView()

    // notifi the cahnge
    document.dispatchEvent(this.customEvents.updatePoints)
  }
  lessPoints(plessPoints) {
    this.points = parseFloat((this.points - plessPoints).toFixed(2))

    // notifi the cahnge
    document.dispatchEvent(this.customEvents.updatePoints)
  }
  pointsOnClick() {
    document.querySelector('#generate_point')
      .addEventListener('click', clickEvent => {
        if (clickEvent) clickEvent.preventDefault()
        this.addPoints(this.pointsPerClick)
      })
  }
  updateView() {
    if (!this.$viewPoints) this.$viewPoints = document.querySelector('#general_points')
    this.$viewPoints.innerHTML = this.points
  }
  addEntity(entity) {
    const found = this.entities.find(e => e.name == entity.name)
    if (!found) {
      const index = this.entities.push(entity)
      // init the entity
      this.entities[index - 1].init()
    } 

    return this;
  }
  createCustomEvents() {
    this.customEvents.updatePoints = new CustomEvent('updatePoints', {
      detail: {
        points: () => this.points
      }
    })
  }
  initListeners() {
    // save data on close
    window.addEventListener("beforeunload", event => {
      confirm()
      this.saveData()
    })

    // Buy upgrade
    document.addEventListener('buyUpgrade', event => {      
      this.lessPoints(event.detail.pointsToLess())
    })
  }
}

class Upgrade {
  constructor(name, initalPrice, showAt, pointsPerOne, incrementalRatio) {
    this.name = name;
    this.id = this.generateSnowflake(name);
    this.$el = null;
    this.showAt = showAt;
    this.price = initalPrice;
    this.amount = 0;
    this.pointsPerOne = pointsPerOne;
    this.pointsPerSecond = 0;
    this.incrementalRatio = incrementalRatio;
    this.active = false;
    this.customEvents = {
      // buyUpgrade
    };
  }
  createFromSaveData(toCast) {
    Object.keys(toCast).forEach(key => {
      this[key] = toCast[key]
      
    })
    this.init()

    return this
  }
  getDataToSave() {
    return {
      name: this.name,
      showAt: this.showAt,
      price: this.price,
      amount: this.amount,
      pointsPerOne: this.pointsPerOne,
      pointsPerSecond: this.pointsPerSecond,
      incrementalRatio: this.incrementalRatio,
      active: this.active,
    }
  }
  init() {
    this.$el = this.generateDOMElement()
    this.initListeners()
  }
  generateDOMElement() {
    const $upgradesDiv = document.querySelector('#upgrades')
    const $container = document.createElement('div')

    $container.setAttribute('id', this.id)
    $container.setAttribute('class', `upgrade ${this.id}`)

    const estructure = `
      <p class="${this.id} total">Total ${this.name}s: <span class="total">${this.amount}</span></p>
      <p class ="${this.id} price">Price: <span class="price">${this.price}</span></p>
      <p class="${this.id} pointsPerSecond">Points per second: <span class="pointsPerSecond">${this.pointsPerSecond}</span></p>
      <p class="${this.id} buy">Buy new ${this.name} <button class="buy" disabled>Buy</button></p>
      <hr><hr>
    `;

    $container.innerHTML = estructure
    $upgradesDiv.appendChild($container)

    this.initEvents()
    return document.querySelector(`#upgrades #${this.id}`)
  }
  initEvents() {
    const $button = document.querySelector(`#${this.id} .buy button`)
    if (!$button) {
      setTimeout(() => {
        this.initEvents()
      }, 250)
    } else {
      $button.addEventListener('click', event => this.buyEvent(event))
    }
  }
  buyEvent(evnet) {
    if (event) event.preventDefault()

    // notify the buy
    document.dispatchEvent(new CustomEvent('buyUpgrade', {
      detail: {
        upgradeName: () => this.name,
        upgradeId: () => this.id,
        pointsToLess: () => this.price
      }
    }))

    this.amount += 1
    this.price = parseInt(this.price * this.incrementalRatio)
    this.pointsPerSecond = parseFloat((this.amount * this.pointsPerOne).toFixed(2))
    this.updateDOMValues()
  }
  updateDOMValues() {
    // total
    const $total = document.querySelector(`#${this.id} .${this.id}.total span.total`)
    if ($total) {
      $total.innerHTML = this.amount
    } else {
      console.error(`No se ha podido poner el total en ${this.id}`)
    }

    // precio
    const $price = document.querySelector(`#${this.id} .${this.id}.price span.price`)
    if ($price) {
      $price.innerHTML = this.price
    } else {
      console.error(`No se ha podido poner el price en ${this.id}`)
    }

    // precio
    const $pointsPerSecond = document.querySelector(`#${this.id} .${this.id}.pointsPerSecond span.pointsPerSecond`)
    if ($pointsPerSecond) {
      $pointsPerSecond.innerHTML = this.pointsPerSecond
    } else {
      console.error(`No se ha podido poner el pointsPerSecond en ${this.id}`)
    }
  }
  checkAvailabletoBuy(points) {
    if (points >= this.price) {
      this.$el.querySelector('button').removeAttribute('disabled')
    } else {
      this.$el.querySelector('button').setAttribute('disabled', true)
    }
  }
  checkToShow(points) {    
    if(points >= this.price) {
      if (this.active == false) this.$el.classList.remove('hidden')
      this.$el.classList.remove('preview')
      if (this.active == false) this.active = true;
    } 

    if ((points >= this.showAt) && (points < this.price)) {
      this.$el.classList.remove('hidden')
      this.$el.classList.add('preview')
    }

    if (points < this.showAt) {      
      if (this.active == false) this.$el.classList.add('hidden')
    }
  }
  initListeners() {
    document.addEventListener('updatePoints', event => {
      this.checkAvailabletoBuy(event.detail.points())
      this.checkToShow(event.detail.points())
    })
  }
  generateSnowflake() {
    return `upgrade_${parseInt((new Date().getTime() * Math.random()))}`
  }
}