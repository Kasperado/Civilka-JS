class Cell {
  constructor(id, site) {
    this.id = id;
    this.site = site;
    this.vertices = [];
    this.edges = [];
    this.province;
    this.neighbors = [];
    this.type;
  }

  render(color) {
    // Edge color
    strokeWeight(2);
    stroke(60);
    if (!optionDrawCells) stroke(color);
    // Background
    fill(color);
    beginShape();
    let verticesLength = this.vertices.length;
    for (var y = 0; y < verticesLength; y++) {
      let p = this.vertices[y];
      vertex(p.site.x, p.site.y);
    }
    endShape(CLOSE);
    // Point
    strokeWeight(1);
    stroke(255);
    if (!optionDrawCells) stroke(color);
    point(this.site.x, this.site.y);
  }

  isPointIn(point) {
    if (!point) return false;
    let inCell = false;
    // Raycast line
    let r = {
      x1: point.x,
      y1: -1,
      x2: point.x,
      y2: point.y
    }
    for (var i = 0; i < this.edges.length; i++) {
      let e = this.edges[i];
      if (lineIntersects(r.x1, r.y1, r.x2, r.y2, e.va.site.x, e.va.site.y, e.vb.site.x, e.vb.site.y)) inCell = !inCell;
    }
    return inCell;
  }
}
