// Returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
function lineIntersects(a,b,c,d,p,q,r,s) {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
};
// Checks if given point is in the polygon based on it's edges
function inPoly(point, edges) {
  if (!point) return false;
  let inPoly = false;
  // raycast line
  let r = {
    x1: point.x,
    y1: -100000, //// TODO: 
    x2: point.x,
    y2: point.y
  }
  for (var i = 0; i < edges.length; i++) {
    let e = edges[i];
    if (lineIntersects(r.x1, r.y1, r.x2, r.y2, e.va.site.x, e.va.site.y, e.vb.site.x, e.vb.site.y)) inPoly = !inPoly;
  }
  return inPoly;
}

function extractGeneratorData(gen) {
    let data = [];
    while (true) {
      let d = gen.next();
      if (d.done) break;
      data.push(d.value);
    }
    return data;
}

function distanceBetweenTwoPoints(x1, y1, x2, y2) {
  var a = x1 - x2;
  var b = y1 - y2;
  return Math.sqrt(a*a + b*b);
}

function sortVertices(cell, vertices) {
  let cx = cell.site.x;
  let cy = cell.site.y;
  vertices.sort((a, b) => (getAngle(cx, cy, a.site.x, a.site.y) > getAngle(cx, cy, b.site.x, b.site.y)) ? 1 : -1);
}

function getAngle(p1x, p1y, p2x, p2y) {
  let angle = Math.atan2(p2y - p1y, p2x - p1x); // range (-PI, PI]
  angle *= 180 / Math.PI; // rads to degs, range (-180, 180]
  if (angle < 0) angle = 360 + angle; // range [0, 360)
  return angle;
}

function transferData() {
  // Vertex
  for (var i = 0; i < diagram.vertices.length; i++) {
    let v = diagram.vertices[i];
    let gv = new Vertex(v.x, v.y);
    game.vertices.push(gv);
  }
  // Cells
  for (var i = 0; i < diagram.cells.length; i++) {
    let c = diagram.cells[i];
    let gc = new Cell(c.site.voronoiId, new Point(c.site.x, c.site.y));
    game.cells.push(gc);
  }
  // Rest
  for (var i = 0; i < diagram.edges.length; i++) {
    let e = diagram.edges[i];
    let ge = new Edge();
    // Copy values
    ge.va = game.getVertexFromPosition(e.va.x, e.va.y);
    ge.vb = game.getVertexFromPosition(e.vb.x, e.vb.y);
    ge.toLeft = e.lSite ? game.getCellFromID(e.lSite.voronoiId) : null;
    ge.toRight = e.rSite ? game.getCellFromID(e.rSite.voronoiId) : null;
    // Add edges reference to neighboring cells
    if (ge.toLeft) ge.toLeft.edges.push(ge);
    if (ge.toRight) ge.toRight.edges.push(ge);
    // Add edge reference to vertices
    ge.va.edges.push(ge);
    ge.vb.edges.push(ge);
    // Add to game
    game.edges.push(ge);
    // Add vertex<->cell references
    if (ge.toLeft) {
      // Add cells reference to vertices
      addVertexToCell(ge.toLeft, ge.va);
      addVertexToCell(ge.toLeft, ge.vb);
    }
    if (ge.toRight) {
      // Add cells reference to vertices
      addVertexToCell(ge.toRight, ge.va);
      addVertexToCell(ge.toRight , ge.vb);
    }

  }
  // Add cells as neighbors using edges
  allConnections = [];
  for (var i = 0; i < game.edges.length; i++) {
    let ge = game.edges[i];
    // Has both sides
    if (ge.toLeft && ge.toRight) {
      // Add eachother as neighbors
      let rs = game.cells[ge.toRight.id];
      let ls = game.cells[ge.toLeft.id];
      rs.neighbors.push(ls);
      ls.neighbors.push(rs);
      allConnections.push([rs.site.x, rs.site.y, ls.site.x, ls.site.y]);
    }
  }
  // Sort vertices for drawing
  for (var i = 0; i < game.cells.length; i++) {
    sortVertices(game.cells[i], game.cells[i].vertices);
  }
  // Remove useless vertices (no cell, no edge)
  for (var i = game.vertices.length - 1; i >= 0; i--) {
    let v = game.vertices[i];
    if (v.cells.length == 0 && v.edges.length == 0) game.vertices.splice(i, 1);
  }
  // Add vertex neighbors
  for (var i = 0; i < game.vertices.length; i++) {
    let vertex = game.vertices[i];
    // Go through edges owning this vertex and add other vertex
    for (var j = 0; j < vertex.edges.length; j++) {
      let edge = vertex.edges[j];
      // Go through vertices of this edge
      addVertexToVertex(vertex, edge.va);
      addVertexToVertex(vertex, edge.vb);
    }
  }
}

function addVertexToCell(cell, vertex) {
  let isValid = true;
  // Check for duplicates
  for (var i = 0; i < cell.vertices.length; i++) {
    let v = cell.vertices[i];
    if (v.site.x == vertex.site.x && v.site.y == vertex.site.y) {
      isValid = false;
      break;
    }
  }
  if (isValid) {
    cell.vertices.push(vertex);
    vertex.cells.push(cell);
  }
}

function addVertexToVertex(v1, v2) {
  if (v1.site.x == v2.site.x && v1.site.y == v2.site.y) return;
  // Check for duplicates
  let isValid = true;
  for (var i = 0; i < v1.neighbors.length; i++) {
    let neighbor = v1.neighbors[i];
    if (neighbor.site.x == v1.site.x && neighbor.site.y == v1.site.y) {
      isValid = false;
      break;
    }
  }
  if (isValid) v1.neighbors.push(v2);
}

function getRandomHexColor() {
  return ("#" + ('00000'+(random()*(1<<24)|0).toString(16)).slice(-6));
}

class Node {

  constructor(cell) {
    this.id = cell.id;
    this.cell = cell;
    this.neighbors = []; // Data transfered from cells
    this.distanceToStart = 0;
    this.distanceToTarget; // Estimated absolute distance to the target
    this.cameFrom = null; // Backward connection
  }

  getCost() {
    // Counting only distance from start would create Dijkstra path, but it has big performance hit.
    // Counting only distance to target is fastest, but paths created are often sub-optimal.
    return this.distanceToStart + this.distanceToTarget;
  }

}

function aStarPathfinding(validCells, startCell, targetCell) {
  // Setup
  let allNodes = [];
  let activeNodes = []; // Nodes to be checked
  let processedNodes = []; // Nodes which were active once
  // Create nodes out of valid cells
  for (let i = 0; i < validCells.length; i++) {
    const cell = validCells[i];
    let newNode = new Node(cell);
    allNodes.push(newNode);
  }
  // Find start node and assign it
  let startNode = getNodeFromID(allNodes, startCell.id);
  if (startNode) activeNodes.push(startNode);
  else return null;
  // Check is target node is in allNodes
  let targetNode = getNodeFromID(allNodes, targetCell.id);
  if (!targetNode) return null;
  // Start search for best path
  while (activeNodes.length != 0) {
    // Assign cell which is has the lowest cost
    let currentNode = activeNodes[0];
    for (let i = 0; i < activeNodes.length; i++) {
      const candidateNode = activeNodes[i];
      if (candidateNode.getCost() < currentNode.getCost()) currentNode = candidateNode;
    }
    // Add to proccessed
    processedNodes.push(currentNode);
    // If target cell was assigned - return path
    if (currentNode.id == targetCell.id) return getAStarPath(currentNode);
    // Remove current node from active ones
    let currentNodeIndex = currentNode.cell.id;
    for (var i = activeNodes.length - 1; i >= 0; i--) {
      let n = activeNodes[i];
      if (n.cell.id == currentNodeIndex) activeNodes.splice(i, 1);
    }
    // Go though all neighbors of this node
    for (let i = 0; i < currentNode.cell.neighbors.length; i++) {
      // Get neighbor
      let neighborID = currentNode.cell.neighbors[i].id;
      let neighbor = getNodeFromID(allNodes, neighborID);
      if (neighbor == null) continue; // Cell not in nodes
      if (processedNodes.includes(neighbor)) continue; // No need to process it again
      // Start calucations
      let isInActive = activeNodes.includes(neighbor);
      let startScore = currentNode.distanceToStart + distanceBetweenTwoPoints(currentNode.cell.site.x, currentNode.cell.site.y, neighbor.cell.site.x, neighbor.cell.site.y);
      if (!isInActive || startScore < neighbor.distanceToStart) {
        neighbor.distanceToStart = startScore;
        neighbor.distanceToTarget = distanceBetweenTwoPoints(neighbor.cell.site.x, neighbor.cell.site.y, targetCell.site.x, targetCell.site.y);
        neighbor.cameFrom = currentNode;
        if (!isInActive) activeNodes.push(neighbor);
      }
    }
  }
  // No path found - return null
  return null;
}

function getNodeFromID(allNodes, id) {
  for (let i = 0; i < allNodes.length; i++) {
    const node = allNodes[i];
    if (node.id == id) return node;
  }
}
// Returns path to start from given node
function getAStarPath(node) {
  let path = []; // Path of cells
  let currentNode = node;
  // Loop until first node
  while (currentNode.cameFrom != null) {
    path.push(currentNode.cell); // Push cell
    currentNode = currentNode.cameFrom; // Assign next node
    if (currentNode.cameFrom == null) path.push(currentNode.cell); // Push last cell, before loop breaks
  }
  return path;
}

function loadDefaultOptions() {
  if (optionDrawCells) document.getElementsByName("Cells")[0].checked = true;
  document.getElementsByName("Cells")[0].onclick = () => { optionDrawCells = !optionDrawCells; updateRender(); };

  if (optionDrawGeography) document.getElementsByName("Cell Height")[0].checked = true;
  document.getElementsByName("Cell Height")[0].onclick = () => { optionDrawGeography = !optionDrawGeography; updateRender(); }

  if (optionDrawRivers) document.getElementsByName("Rivers")[0].checked = true;
  document.getElementsByName("Rivers")[0].onclick = () => { optionDrawRivers = !optionDrawRivers; updateRender(); }

  if (optionDrawConnections) document.getElementsByName("Cell Connections")[0].checked = true;
  document.getElementsByName("Cell Connections")[0].onclick = () => { optionDrawConnections = !optionDrawConnections; updateRender(); }

  if (optionDrawWasteland) document.getElementsByName("Wasteland")[0].checked = true;
  document.getElementsByName("Wasteland")[0].onclick = () => { optionDrawWasteland = !optionDrawWasteland; updateRender(); }

  if (optionDrawNations) document.getElementsByName("Nations")[0].checked = true;
  document.getElementsByName("Nations")[0].onclick = () => { optionDrawNations = !optionDrawNations; updateRender(); }

  if (optionDrawPolygons) document.getElementsByName("Landmass Polygons")[0].checked = true;
  document.getElementsByName("Landmass Polygons")[0].onclick = () => { optionDrawPolygons = !optionDrawPolygons; updateRender(); }
  
  if (optionDrawHeight) document.getElementsByName("Vertices Height Value")[0].checked = true;
  document.getElementsByName("Vertices Height Value")[0].onclick = () => { optionDrawHeight = !optionDrawHeight; updateRender(); }
}