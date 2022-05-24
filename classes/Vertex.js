class Vertex {
  constructor(x, y) {
    this.site = new Point(x, y);
    this.edges = [];
    this.cells = [];
    this.neighbors = [];
    this.type;
    this.height = -1;
  }

}
