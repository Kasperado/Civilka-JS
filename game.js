class Game {
  constructor() {
    // Structure
    this.vertices = [];
    this.edges = [];
    this.cells = [];
    // Game
    this.rivers = [];
    this.provinces = [];
    this.nations = [];
    this.nationCounter = 0;
    this.cultures = [];
    this.cultureCounter = 0;
    this.wasteland; // Nation with all impassable terrain
    // Render
    this.needRenderUpdate = false;
  }

  getVertexFromPosition(vx, vy) {
    for (let i = 0; i < this.vertices.length; i++) {
      let vertex = this.vertices[i];
      if (vertex.site.x == vx && vertex.site.y == vy) return vertex;
    }
  }

  getCellFromID(id) {
    for (let i = 0; i < this.cells.length; i++) {
      let cell = this.cells[i];
      if (cell.id == id) return cell;
    }
  }

  addNation(nation) {
    nation.id = this.nationCounter;
    this.nationCounter++;
    this.nations.push(nation);
    this.needRenderUpdate = true;
  }
}
