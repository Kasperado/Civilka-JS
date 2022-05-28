var game = new Game();
var middlePos;
var voronoi = new Voronoi();
var diagram;
var allConnections;
// Generate
let randomPolygons = [];
// Mouse position
var mousePos;
let path = [];
let pathfindingStartCell;
let cellsToSearch;

onmousemove = function(e){
    mousePos = {
      x: e.clientX,
      y: e.clientY
    };
    // Update current cell mouse is in
    for (let i = 0; i < game.cells.length; i++) {
      let c = game.cells[i];
      let isInCell = c.isPointIn(mousePos);
      if (isInCell) {
        mouseCell = c;
        break;
      } else {
        mouseCell = null;
      }
    }
    // Update path
    if (mouseCell && pathfindingStartCell) path = aStarPathfinding(cellsToSearch, pathfindingStartCell, mouseCell);
}

onmousedown = function(e) {
  if (mouseCell) {
    // Same cell selected = disable pathfinding by setting pathfindingStartCell to null
    if (mouseCell?.id == pathfindingStartCell?.id) {
      pathfindingStartCell = null;
      return;
    }
    pathfindingStartCell = mouseCell;
    cellsToSearch = (pathfindingStartCell.type == CellType.OCEAN) ? game.waterCells : game.landCells;
    if (mouseCell && pathfindingStartCell) path = aStarPathfinding(cellsToSearch, pathfindingStartCell, mouseCell);
  } 
}
var mouseCell = null;
const mapSize = {
  width: 1400,
  height: 800
};
var selectedCell;
// Storage
var canvasElement;
var context;
var cellsRender;

function setup() {
    // Setup
    createCanvas(mapSize.width, mapSize.height);
    middlePos = createVector(mapSize.width/2, mapSize.height/2);
    canvasElement = document.querySelector('#defaultCanvas0');
    context = canvasElement.getContext('2d');
    let seed = floor(random(10000));
    randomSeed(seed);
    console.log("Seed used: " + seed);
    // Poisson-disc Sampling
    const minDistance = 20;
    const maxTries = 20;
    const boundaryOffset = minDistance/2;
    let points = generatePoissonDistribution(mapSize, minDistance, maxTries, boundaryOffset);
    // Voronoi diagram
    var bbox = {xl: 0, xr: width, yt: 0, yb: height};
    diagram = voronoi.compute(points, bbox);
    // Transfer data from voronoi to game
    transferData();
    // Random Polygon Islands
    createLandmass();
    // Give type to Cells
    assignTypeToCells();
    // Create provinces from land cells
    createProvinces(game.landCells);
    createGeography();
    assignGeography();
    // Vonoroi library bug (?)
    for (let i = 0; i < game.vertices.length; i++) {
      let vertex = game.vertices[i];
      let number = vertex.cells.length;
      // 1 are corners and bug?
      if (number == 1) {
        console.log(vertex);
      }
      // 2 are map boundaries
      // 3 to be fixed
      if (number == 3) {
        let newX = (vertex.cells[0].site.x + vertex.cells[1].site.x + vertex.cells[2].site.x) / 3;
        let newY = (vertex.cells[0].site.y + vertex.cells[1].site.y + vertex.cells[2].site.y) / 3;
        vertex.site.x = vertex.site.x/2 + newX/2;
        vertex.site.y = vertex.site.y/2 + newY/2;
      }
    }
    // Spawn nations in random provinces
    //spawnNations(10, minDistance*2, 1);
    // Render to store
    updateRender();
    console.log(game);  
}

function updateRender() {
  drawCells();
  drawRivers();
  drawConnections();
  //drawGeography();
  //drawWasteland();
  drawNations();
  drawNationsBorders();
  //drawPolygons();
  //drawHeight();
  cellsRender = context.getImageData(0,0,canvasElement.width,canvasElement.height);
  // Reset
  game.needRenderUpdate = false;
}

function gameloop() {
  // AI update
  for (let i = 0; i < game.nations.length; i++) {
    game.nations[i].update();
  }
  // Render game
  if (game.needRenderUpdate) updateRender();
}

setInterval(gameloop, 1000/30);

function draw() {
  background(0, 0, 127);
  context.putImageData(cellsRender, 0, 0);
  drawMouse();
  drawPathfindingStartCell();
  drawPath();
  drawUI();
}


