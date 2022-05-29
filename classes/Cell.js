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
    // Curvy edges
    /*
    strokeWeight(2);
    for (var i = 0; i < this.edges.length; i++) {
      let edge = this.edges[i];
      let vas = edge.va.site;
      let vbs = edge.vb.site;
      let xDist = vbs.x - vas.x;
      let yDist = vbs.y - vas.y;
      let dist = Math.sqrt(xDist * xDist + yDist * yDist);
      // Break the 2 main vertices into smaller ones
      let amount = 4;
      beginShape();
      curveVertex(vas.x, vas.y);
      for (var j = 0; j < amount; j++) {
        let fractionOfTotal = (((j+1)/amount)*dist) / dist;
        console.log(fractionOfTotal);
        let fractionX = vas.x + xDist * fractionOfTotal;
        let fractionY = vas.y + yDist * fractionOfTotal;
        curveVertex(fractionX+random(-0.5,0.5), fractionY+random(-0.5,0.5));
      }
      curveVertex(vbs.x, vbs.y);
      endShape(CLOSE);
    }
    */

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
