class Province {
  constructor(cell) {
    // init
    this.cell = cell;
    cell.owner = this;

    this.owner = null; // Nation
    this.neighbors = [];
    /*
    // General
    Population
    Size (poly size?)
    Development value
    
    // Economy

    // Culture

    // Combat

    

    */
    
    // Location
    this.elevation;
    this.temperature;
    this.humidity;
    // Buildings
    this.buildings = [];
  }

  setOwner(nation) {
    this.owner = nation;
  }
}
