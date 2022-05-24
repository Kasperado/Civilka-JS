class Nation {
  constructor() {
    this.id;
    this.game;
    this.name;
    this.nameAdjective;
    this.capital;
    this.provinces = [];
    this.borders = []; // Array of edges which make border
    this.mainCulture;
    this.color;
    this.relations = [];
    // Test zone 
    this.administrativeReach = 30;
  }

  addProvince(province) {
    this.provinces.push(province);
    province.setOwner(this);
    this.updateBorder();
    game.needRenderUpdate = true;
  }

  updateBorder() {
    this.borders = []; // Reset
    // Go through every province to get which edges neighbor other countries
    for (let i = 0; i < this.provinces.length; i++) {
      let province = this.provinces[i];
      for (var n = 0; n < province.neighbors.length; n++) {
        let neighbor = province.neighbors[n];
        if (neighbor.owner != province.owner) {
          // Find which edge is it
          let borderEdge = this.findBorderEdge(province.cell, neighbor.cell);
          if (borderEdge) this.borders.push(borderEdge);
          else console.log("err");
        }
      }
    }
  }

  findBorderEdge(c1, c2) {
    for (var i = 0; i < c1.edges.length; i++) {
      let c1e = c1.edges[i];
      for (var j = 0; j < c2.edges.length; j++) {
        let c2e = c2.edges[j];
        // Same points at same positions within the edges means it's the same edge
        let vaBool = (c1e.va.site.x == c2e.va.site.x && c1e.va.site.y == c2e.va.site.y);
        let vbBool = (c1e.vb.site.x == c2e.vb.site.x && c1e.vb.site.y == c2e.vb.site.y);
        if (vaBool && vbBool) return c1e;
      }
    }
  }
  //  
  update() {
    let count = this.provinces.length / 10;
    let rng = random();
    if (rng > (0.2 + count)) this.expand();
    else this.settle();
  }
  // Finds province nearby and adds it to the civ
  expand() {
    let addedProvince = false;
    let validProvinces = [...this.provinces];
    while (!addedProvince) {
      let randProvinceIndex = this.closestActiveToCapital(validProvinces);
      let randProvince = validProvinces[randProvinceIndex];
      // Check if neighbor is valid
      for (var j = 0; j < randProvince.neighbors.length; j++) {
        let neighbor = randProvince.neighbors[j];
        // Not owned
        if (neighbor.owner !== null) continue;
        // Administrative reach
        let distance = distanceBetweenTwoPoints(this.capital.cell.site.x, this.capital.cell.site.y, neighbor.cell.site.x, neighbor.cell.site.y);
        if (distance > this.administrativeReach) continue;
        // All good
        this.addProvince(neighbor);
        addedProvince = true;
        break; // Add only one
      }
      // This randProvince is used
      validProvinces.splice(randProvinceIndex, 1);
      // All valid options exhausted
      if (validProvinces == 0) this.administrativeReach++;
      if (validProvinces == 0) break;
    }
  }
  // Create new same culture civ nearby
  settle() {
    let validProvinces = [...game.provinces];
    // Select province
    for (let i = 0; i < validProvinces.length; i++) {
      const province = validProvinces[i];
      // No owner
      if (province.owner != null) continue;
      // Neighbours have no owners
      let nValid = true;
      for (let n = 0; n < province.neighbors.length; n++) {
        let neighbor = province.neighbors[n];
        if (neighbor.owner != null) nValid = false;
      }
      if (!nValid) continue;
      // Not too close not too far
      let distance = distanceBetweenTwoPoints(this.capital.cell.site.x, this.capital.cell.site.y, province.cell.site.x, province.cell.site.y);
      if (distance > 40) continue;
      // Land route

      // Add new nation
      let nation = new Nation();
      let newColor = this.color;
      //if (random() < 0.2) newColor = adjust(newColor, random(-100, 100));
      nation.color = newColor;
      nation.capital = province;
      nation.addProvince(province);
      game.addNation(nation);
      return; // Stop function
    }
    // If new settle place not found then expand instead
    this.expand();
  }

  closestActiveToCapital(active) {
    let capital = active[0].owner.capital.cell;
    let closestIndex = 0;
    let closestDistance = 9999; // // TODO:
    for (var i = 0; i < active.length; i++) {
      let province = active[i];
      let distance = distanceBetweenTwoPoints(capital.site.x, capital.site.y, province.cell.site.x, province.cell.site.y);
      if (distance < closestDistance) {
        closestIndex = i;
        closestDistance = distance;
      }
    }
    return closestIndex;
  }

}
