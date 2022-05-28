function drawCells() {
  for (let i = 0; i < game.cells.length; i++) {
    let cell = game.cells[i];
    if (cell.type == CellType.LAND) cell.render("#080");
    else cell.render("#008");
  }
}

function drawConnections() {
  stroke(128,128,128,128);
  strokeWeight(1);
  for (let i = 0; i < allConnections.length; i++) {
    let c = allConnections[i];
    line(c[0], c[1], c[2], c[3]);
  }
}

function drawUI() {
  strokeWeight(1);
  stroke(255,0,0);
  fill(255,0,0);
  text("FPS: "+floor(frameRate()), 20, 50);
  text("X: " + mousePos?.x, 20, 70);
  text("Y: " + mousePos?.y, 20, 90);
}

function drawPathfindingStartCell() {
  if (pathfindingStartCell == null) return;
  // Edge color
  stroke("red");
  // Background
  fill(255, 0, 0, 120);
  beginShape();
  for (var y = 0; y < pathfindingStartCell.vertices.length; y++) {
    let p = pathfindingStartCell.vertices[y];
    vertex(p.site.x, p.site.y);
  }
  endShape(CLOSE);
}


function drawPath() {
  if (path) {
    beginShape();
    noFill();
    stroke("red");
    strokeWeight(2);
    for (let i = 0; i < path.length; i++) {
      const cell = path[i];
      vertex(cell.site.x, cell.site.y);
    }
    endShape();
  }
}

function drawGeography() {
  stroke(128,128,128,128);
  strokeWeight(1);
  for (let i = 0; i < game.provinces.length; i++) {
    let province = game.provinces[i];
    // Color depends on cell geographical location
    let color = "white"; // Inpassable mountains
    if (province.elevation == ElevationLevel.PLAINS) color = "green"; // Plain
    else if (province.elevation == ElevationLevel.HILLS) color = "orange"; // Hills
    else if (province.elevation == ElevationLevel.HIGHLANDS) color = "brown"; // HIGHLANDS
    else if (province.elevation == ElevationLevel.MOUNTAINS) color = "black"; // MOUNTAINS
    province.cell.render(color);
  }
}

function drawNations() {
  for (var i = 0; i < game.nations.length; i++) {
    let nation = game.nations[i];
    for (var j = 0; j < nation.provinces.length; j++) {
      let province = nation.provinces[j];
      province.cell.render(nation.color);
    }
    strokeWeight(6);
    stroke(255, 0, 0);
    point(nation.capital.cell.site.x, nation.capital.cell.site.y);
    strokeWeight(3);
    stroke(255);
    point(nation.capital.cell.site.x, nation.capital.cell.site.y);
  }
}

function drawNationsBorders() {
  for (var i = 0; i < game.nations.length; i++) {
    let nation = game.nations[i];
    for (var j = 0; j < nation.borders.length; j++) {
      let b = nation.borders[j];
      strokeWeight(2);
      // Color - I darken nation color
      let borderColor = adjust(nation.color, -100);
      //// TODO: move this bad boy to some init function
      // Line - I need to move the line closer the province middle
      let cell;
      // No nation to right
      if (b.toRight.owner.owner == null) cell = b.toLeft;
      else if (b.toRight.owner.owner.id == nation.id) cell = b.toRight;
      else cell = b.toLeft;
      // Calc middle Point
      let xOffset = (b.va.site.x + b.vb.site.x)/2;
      let yOffset = (b.va.site.y + b.vb.site.y)/2;
      let middlePoint = new Point(xOffset, yOffset);
      // Angle
      let angle = getAngle(middlePoint.x, middlePoint.y, cell.site.x, cell.site.y);
      let v = p5.Vector.fromAngle(radians(angle));
      v.x *= 1.1;
      v.y *= 1.1;
      // Move edge points in that angle
      let newPointA = new Point(b.va.site.x+v.x, b.va.site.y+v.y);
      let newPointB = new Point(b.vb.site.x+v.x, b.vb.site.y+v.y);
      stroke(borderColor);
      line(newPointA.x, newPointA.y, newPointB.x, newPointB.y);
      //line(b.va.site.x, b.va.site.y, b.vb.site.x, b.vb.site.y);
    }
  }
}

function adjust(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

function drawWasteland() {
  for (var j = 0; j < game.wasteland.provinces.length; j++) {
    let province = game.wasteland.provinces[j];
    province.cell.render(game.wasteland.color);
  }
}

function drawMouse() {
  for (var i = 0; i < game.cells.length; i++) {
    let c = game.cells[i];
    let isInCell = c.isPointIn(mousePos);
    if (isInCell) {
      mouseCell = c;
      for (var j = 0; j < c.neighbors.length; j++) {
        let n = c.neighbors[j].site;
        strokeWeight(2);
        stroke(128,128,128);
        line(c.site.x, c.site.y, n.x, n.y);
      }
      strokeWeight(1);
      stroke("red");
      fill("red");
      text("Cell ID: " + i, 20, 20);
    }
  }
}

function drawRivers() {
  for (var i = 0; i < game.rivers.length; i++) {
    let river = game.rivers[i];
    beginShape();
    noFill();
    curveTightness(0);
    curveVertex(river.vertices[0].site.x, river.vertices[0].site.y);
    let riverLength = river.vertices.length;
    for (var j = 0; j < riverLength; j++) {
      let vertex = river.vertices[j];
      strokeWeight(2);
      stroke(50,50,255)
      curveVertex(vertex.site.x, vertex.site.y);
      //let c = river.vertices[j];
      //let c2 = river.vertices[j+1];
      //if (c2) line(c.site.x, c.site.y, c2.site.x, c2.site.y);
    }
    curveVertex(river.vertices[riverLength - 1].site.x, river.vertices[riverLength - 1].site.y);
    endShape();
  }
}

function drawHeight() {
  for (var i = 0; i < game.vertices.length; i++) {
    let vertex = game.vertices[i];
    if (vertex.type == VertexType.LAND) stroke(255, 0, 0);
    else if (vertex.type == VertexType.OCEAN) stroke(100, 100, 200);
    else if (vertex.type == VertexType.COAST) stroke(200, 200, 0);
    if (vertex.height > 1) strokeWeight(vertex.height/2);
    else strokeWeight(1);
    point(vertex.site.x, vertex.site.y);
  }
}

function drawPolygons() {
  strokeWeight(5);
  for (var i = 0; i < randomPolygons.length; i++) {
    let rp = randomPolygons[i];
    stroke(255,255,255,128);
    for (var j = 0; j < rp.points.length; j++) {
      let c = rp.points[j];
      let c2 = rp.points[j+1];
      if (c2) line(c.x, c.y, c2.x, c2.y);
      else line(c.x, c.y, rp.points[0].x, rp.points[0].y);
    }
    stroke(255,0,0);
    point(rp.points[0].x, rp.points[0].y);
  }
}
