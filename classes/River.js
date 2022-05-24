class River {
  constructor(vertex) {
    this.vertices = [vertex];
  }

  init() {
    let currentVertex = this.vertices[0];
    let hasReachedEnd = false;
    // Search for neighboring vertex with lower (or same) height
    while (!hasReachedEnd) {
      let lowestIndex = -1;
      for (var i = 0; i < currentVertex.neighbors.length; i++) {
        let neighbor = currentVertex.neighbors[i];
        if (currentVertex.height > neighbor.height && neighbor.type != VertexType.OCEAN) {
          if (this.checkVertexWithOtherRivers(neighbor)) hasReachedEnd = true;
          if (neighbor.type == VertexType.COAST) hasReachedEnd = true;
          lowestIndex = i;
          if (hasReachedEnd) break;
        }
      }
      // Assign best vertex
      let best = currentVertex.neighbors[lowestIndex];
      this.vertices.push(best);
      // Tell edge that it's a river now
      for (var i = 0; i < best.edges.length; i++) {
        let edge = best.edges[i];
        // Check which vertex is currentVertex (A or B)
        if (edge.va == best && edge.vb == currentVertex || edge.vb == best && edge.va == currentVertex) {
          edge.isRiver = true;
          break;
        }
      }
      // Update currentVertex
      currentVertex = best;
      // Error (???)
      if (lowestIndex == -1) {
        console.log("error");
        hasReachedEnd = true;
      }
    }

  }

  // Check if vertex is lying on other river vertices
  checkVertexWithOtherRivers(vertex) {
    let overlaps = false;
    let hitStartRiver;
    // Go through every river
    for (var j = 0; j < game.rivers.length; j++) {
      if (overlaps) break;
      let river = game.rivers[j];
      // Go through every vertex
      for (var x = 0; x < river.vertices.length; x++) {
        if (overlaps) break;
        let riverVertex = river.vertices[x];
        if (vertex.site.x == riverVertex.site.x && riverVertex.site.y == vertex.site.y) overlaps = true;
        if (overlaps && x == 0) hitStartRiver = river;
      }
    }
    // If this river hit a start of another river, then I need to merge them together
    if (hitStartRiver != null) {
      // First I remove this river from game object (it will get GC)
      for (var i = 0; i < game.rivers.length; i++) {;
        let sv = game.rivers[i].vertices[0];
        if (sv.site.x == this.vertices[0].x && sv.site.y == this.vertices[0].y) {
          game.rivers.splice(i, 1);
        }
      }
      // Now I unshift all points from this river to hit river
      for (var i = this.vertices.length - 1; i >= 0; i--) {
        let vertex = this.vertices[i];
        hitStartRiver.vertices.unshift(vertex);
      }

    }
    return overlaps;
  }

}
