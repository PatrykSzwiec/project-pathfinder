import {templates, select, classNames} from '../settings.js';

class Finder {
  constructor(element){
    const thisFinder = this;

    // Save reference to finder page div
    thisFinder.element = element;

    // Start at step 1
    thisFinder.step = 1;

    // Object to store info about currenct status of grid
    thisFinder.grid = {};
    for(let row = 1; row <= 10; row++) {
      thisFinder.grid[row] = {};
      for(let col = 1; col <= 10; col++) {
        thisFinder.grid[row][col] = false;
      }
    }
    //console.log(thisFinder.grid);

    // render view for the first time
    thisFinder.render();
  }

  render(){
    const thisFinder = this;

    // determine what title and button content should be used
    let pageData = null;
    switch(thisFinder.step) {
    case 1:
      pageData = { title: 'Draw routes', buttonText: 'Finish drawing' };
      break;
    case 2:
      pageData = { title: 'Pick start and finish', buttonText: 'Compute' };
      break;
    case 3:
      pageData = { title: 'The best route is', buttonText: 'Start again' };
      break;
    }

    // generate view from the template and set it as page content
    const generatedHTML = templates.finderPage(pageData);
    thisFinder.element.innerHTML = generatedHTML;

    // generate 100 fields for grid and add it to HTML
    let html = '';
    for(let row = 1; row <= 10; row++) {
      for(let col = 1; col <= 10; col++) {
        html += '<div class="field" data-row="' + row + '" data-col="' + col + '"></div>';
      }
    }

    thisFinder.element.querySelector(select.finder.grid).innerHTML = html;
    thisFinder.initActions();
  }

  changeStep(newStep) {
    const thisFinder = this;
    thisFinder.step = newStep;
    thisFinder.render();
    thisFinder.gridUpdate();
  }
  // Method to update grid between steps 1-2 / 2-3
  gridUpdate(){
    const thisFinder = this;
    // Update the grid based on thisFinder.grid
    const table = document.querySelector(select.finder.grid);
    const fields = table.querySelectorAll(select.finder.field);
    fields.forEach(field => {
      const x = parseInt(field.dataset.row);
      const y = parseInt(field.dataset.col);
      // Get row/col of active / start / finish fields
      const isActive = thisFinder.grid[x][y];
      //console.log(this.grid[x][y],x,y);

      const isStart = thisFinder.startField && x === thisFinder.startField.row && y === thisFinder.startField.col;
      const isFinish = thisFinder.finishField && x === thisFinder.finishField.row && y === thisFinder.finishField.col;
      // If statements to check if field contain class active / start / finish
      if (isActive || isStart) {
        field.classList.add(classNames.finder.active);
        if(isStart){
          field.classList.add(classNames.finder.start);
        } else if (isFinish) {
          field.classList.add(classNames.finder.finish);
        }
        thisFinder.grid[x][y] = true;
      } else {
        field.classList.remove(classNames.finder.active, classNames.finder.start, classNames.finder.finish);
        thisFinder.grid[x][y] = false;
      }
    });

  }

  initActions() {
    const thisFinder = this;

    if(thisFinder.step === 1) {
      thisFinder.element.querySelector(select.finder.submitBtn).addEventListener('click', function(e) {
        e.preventDefault();
        thisFinder.changeStep(2);
      });

      thisFinder.element.querySelector(select.finder.grid).addEventListener('click', function(e) {
        e.preventDefault();
        if(e.target.classList.contains(classNames.finder.field)) {
          thisFinder.toggleField(e.target);
          thisFinder.hintFields(e.target);
        }
      });
    }

    else if(thisFinder.step === 2) {
      thisFinder.element.querySelector(select.finder.submitBtn).addEventListener('click', function(e) {
        e.preventDefault();
        thisFinder.changeStep(3);
      });

      thisFinder.element.querySelector(select.finder.grid).addEventListener('click', function(e) {
        e.preventDefault();
        if (e.target.classList.contains(classNames.finder.field)) {
          thisFinder.startFinish(e.target);
        }
      });
    }

    else if(thisFinder.step === 3) {

      thisFinder.calculateAllRoutes();

      thisFinder.element.querySelector(select.finder.submitBtn).addEventListener('click', function(e) {
        e.preventDefault();
        thisFinder.clearFields();
        thisFinder.changeStep(1);
      });
    }
  }

  /* STEP 1 - allow user to select fields for route  */
  toggleField(fieldElem) {
    const thisFinder = this;
    //console.log(thisFinder);
    // get row and col info from field elem attrs
    const field = {
      row: parseInt(fieldElem.getAttribute('data-row'), 10),
      col: parseInt(fieldElem.getAttribute('data-col'), 10),
    };

    // if field with this row and col is true -> unselect it
    if(thisFinder.grid[field.row][field.col]) {
      thisFinder.grid[field.row][field.col] = false;
      fieldElem.classList.remove(classNames.finder.active);
      fieldElem.classList.add(classNames.finder.hint);
    

      // remove hint class from neighbors
      if (field.col > 1) {
        const leftFieldElem = document.querySelector(`[data-row="${field.row}"][data-col="${field.col-1}"]`);
        leftFieldElem.classList.remove(classNames.finder.hint);
      }
      if (field.col < 10) {
        const rightFieldElem = document.querySelector(`[data-row="${field.row}"][data-col="${field.col+1}"]`);
        rightFieldElem.classList.remove(classNames.finder.hint);
      }
      if (field.row > 1) {
        const topFieldElem = document.querySelector(`[data-row="${field.row-1}"][data-col="${field.col}"]`);
        topFieldElem.classList.remove(classNames.finder.hint);
      }
      if (field.row < 10) {
        const bottomFieldElem = document.querySelector(`[data-row="${field.row+1}"][data-col="${field.col}"]`);
        bottomFieldElem.classList.remove(classNames.finder.hint);
      }
    }
    else {
      // flatten object to array of values e.g. [false, false, false]
      const gridValues = Object.values(thisFinder.grid)
        .map(col => Object.values(col))
        .flat();

      // if grid isn't empty...
      if(gridValues.includes(true)) {
        // determine edge fields
        const edgeFields = [];

        if (field.col > 1) {
          const leftValue = thisFinder.grid[field.row][field.col - 1];
          edgeFields.push(leftValue); //get field on the left value
        }

        if (field.col < 10) {
          const rightValue = thisFinder.grid[field.row][field.col + 1];
          edgeFields.push(rightValue); //get field on the right value
        }

        if (field.row > 1) {
          const topValue = thisFinder.grid[field.row - 1][field.col];
          edgeFields.push(topValue); //get field on the top value
        }

        if (field.row < 10) {
          const bottomValue = thisFinder.grid[field.row + 1][field.col];
          edgeFields.push(bottomValue); //get field on the bottom value
        }
        //console.log(edgeFields);
  
        // if clicked field doesn't touch at least one that is already selected -> show alert and finish function
        if (!edgeFields.includes(true)) {
          alert('A new field should touch at least one that is already selected!');
          return;
        }
      }
  
      // select clicked field
      thisFinder.grid[field.row][field.col] = true;
      //console.log(fieldElem);
      if(fieldElem.classList.contains(classNames.finder.hint) || fieldElem.classList.contains(classNames.finder.field)){
        fieldElem.classList.add(classNames.finder.active);
        fieldElem.classList.remove(classNames.finder.hint);
      }
      //console.log(thisFinder.grid);
    }
  }

  hintFields(fieldElem) {
    const thisFinder = this;
    const field = {
      row: parseInt(fieldElem.getAttribute('data-row'), 10),
      col: parseInt(fieldElem.getAttribute('data-col'), 10),
    };
  
    // loop through every field in the grid and add hint class to neighbors that are not active
    for (let row = 1; row <= 10; row++) {
      for (let col = 1; col <= 10; col++) {
        const gridField = thisFinder.grid[row][col];
        if (gridField === false && !(row === field.row && col === field.col)) {
          // check if field has an active neighbor
          let hasActiveNeighbor = false;
          if (row > 1) {
            const topField = thisFinder.grid[row - 1][col];
            if (topField === true) {
              hasActiveNeighbor = true;
            }
          }
          if (row < 10) {
            const bottomField = thisFinder.grid[row + 1][col];
            if (bottomField === true) {
              hasActiveNeighbor = true;
            }
          }
          if (col > 1) {
            const leftField = thisFinder.grid[row][col - 1];
            if (leftField === true) {
              hasActiveNeighbor = true;
            }
          }
          if (col < 10) {
            const rightField = thisFinder.grid[row][col + 1];
            if (rightField === true) {
              hasActiveNeighbor = true;
            }
          }
          if (hasActiveNeighbor) {
            const hintField = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if(!hintField.classList.contains(classNames.finder.active)){
              hintField.classList.add(classNames.finder.hint);
            }
          }
        }
      }
    }
  }

  /* STEP 2 - allow user to select start and finish field from selected one */
  startFinish(fieldElem){
    const thisFinder = this;

    // check if start or finish fields already exist
    const startField = thisFinder.element.querySelector(`.${classNames.finder.start}`);
    const finishField = thisFinder.element.querySelector(`.${classNames.finder.finish}`);
    const isActive = fieldElem.classList.contains(classNames.finder.active);

    // get row and col info from field elem attrs
    const field = {
      row: parseInt(fieldElem.getAttribute('data-row'), 10),
      col: parseInt(fieldElem.getAttribute('data-col'), 10),
    };

    if(isActive){
      if (!startField) {
        // add start class to the clicked field and update the finishField object
        fieldElem.classList.add(classNames.finder.start);

        thisFinder.startField = { row: field.row, col: field.col };

      } else if (!finishField && !fieldElem.classList.contains(classNames.finder.start)) {
        // add finish class to the clicked field and update the finishField object
        fieldElem.classList.add(classNames.finder.finish);

        thisFinder.finishField = { row: field.row, col: field.col };

      } else if (fieldElem.classList.contains(classNames.finder.start)){
        // remove start and finish class when user clicked start field
        const fields = thisFinder.element.querySelectorAll(`.${classNames.finder.field}`);
        fields.forEach(field => {
          field.classList.remove(classNames.finder.start);
          field.classList.remove(classNames.finder.finish);
        });

      } else if (fieldElem.classList.contains(classNames.finder.finish)){
        // remove finish class when user clicked finish field
        fieldElem.classList.remove(classNames.finder.finish);
      }
    } else {
      alert ('Select field from selected route!');
    }


  }

  /* STEP 3- calculate route from start to finish */
  getFieldElem(row, col) {
    return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  }
  calculateAllRoutes() {
    const distances = {};
    const previous = {};
    const queue = [];
    const visited = {};
  
    const grid = this.grid;
    const start = this.startField;
    const finish = this.finishField;
  
    // Initialize distances and queue
    for (let row = 1; row <= 10; row++) {
      for (let col = 1; col <= 10; col++) {
        const id = `${row},${col}`;
        // Check if the current field is active
        if (grid[row][col]) {
          // Set distance to 0 for the start field and to Infinity for all other active fields
          if (row === start.row && col === start.col) {
            distances[id] = 0;
          } else {
            distances[id] = Infinity;
          }
  
          previous[id] = null;
          queue.push(id);
        }
      }
    }
    while (queue.length > 0) {
      // Find the field with the smallest distance in the queue
      let smallestDistance = Infinity;
      let closestFieldId = null;
      for (let i = 0; i < queue.length; i++) {
        if (distances[queue[i]] < smallestDistance) {
          smallestDistance = distances[queue[i]];
          closestFieldId = queue[i];
        }
      }
  
      if (closestFieldId === null) {
        break;
      }
  
      const [currentRow, currentCol] = closestFieldId.split(',').map(Number);
  
      // Check if we have reached the finish field
      if (currentRow === finish.row && currentCol === finish.col) {
        let path = [];
        let currentFieldId = closestFieldId;
        while (previous[currentFieldId]) {
          const [row, col] = currentFieldId.split(',').map(Number);
          const currentField = { row, col };
          path.push(currentField);
          currentFieldId = previous[currentFieldId];
        }
        const startField = { row: start.row, col: start.col };
        path.push(startField);
        path.reverse();
        console.log('Shortest path:', path);

        // Add class 'shortPath' to each field in the path
        path.forEach(({ row, col }) => {
          const fieldElem = this.getFieldElem(row, col);
          if (fieldElem) {
            fieldElem.classList.add(classNames.finder.shortPath);
          }
        });

        return;
      }

      // Remove the current field from the queue and mark it as visited
      queue.splice(queue.indexOf(closestFieldId), 1);
      visited[closestFieldId] = true;
  
      // Find the adjacent fields that are active and not visited
      const adjacentFields = [];
      const upId = `${currentRow - 1},${currentCol}`;
      const downId = `${currentRow + 1},${currentCol}`;
      const leftId = `${currentRow},${currentCol - 1}`;
      const rightId = `${currentRow},${currentCol + 1}`;
      if (currentRow > 1 && grid[currentRow - 1][currentCol] && !visited[upId]) {
        adjacentFields.push(upId);
      }
      if (currentRow < 10 && grid[currentRow + 1][currentCol] && !visited[downId]) {
        adjacentFields.push(downId);
      }
      if (currentCol > 1 && grid[currentRow][currentCol - 1] && !visited[leftId]) {
        adjacentFields.push(leftId);
      }
      if (currentCol < 10 && grid[currentRow][currentCol + 1] && !visited[rightId]) {
        adjacentFields.push(rightId);
      }
  
      // Update the distances and previous fields for the adjacent fields
      adjacentFields.forEach(adjacentFieldId => {
        const distanceToAdjacent = distances[closestFieldId] + 1;
        if (distanceToAdjacent < distances[adjacentFieldId]) {
          distances[adjacentFieldId] = distanceToAdjacent;
          previous[adjacentFieldId] = closestFieldId;
        }
      });
    }
  
    console.log('No path found');
  }
  clearFields() {
    const thisFinder = this;
    // Clear grid
    thisFinder.grid = {};
    for(let row = 1; row <= 10; row++) {
      thisFinder.grid[row] = {};
      for(let col = 1; col <= 10; col++) {
        thisFinder.grid[row][col] = false;
      }
    }
  
    // Clear startField and finishField
    thisFinder.startField = null;
    thisFinder.finishField = null;
  }
}
export default Finder;