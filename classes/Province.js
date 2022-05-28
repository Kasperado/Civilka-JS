class Province {
  constructor(cell) {
    // init
    this.cell = cell;
    cell.owner = this;

    this.owner = null; // Nation
    this.neighbors = [];
    // Location
    this.elevation;
    this.temperature;
    this.humidity;
  }

  setOwner(nation) {
    this.owner = nation;
  }
}
