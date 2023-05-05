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
    const table = document.querySelector('.table');
    const fields = table.querySelectorAll('.field');
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
        field.classList.add('active');
        if(isStart){
          field.classList.add(classNames.finder.start);
        } else if (isFinish) {
          field.classList.add(classNames.finder.finish);
        }
        thisFinder.grid[x][y] = true;
      } else {
        field.classList.remove('active', classNames.finder.start, classNames.finder.finish);
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
        //thisFinder.changeStep(1);
      });

    }
    
  }

  /* STEP 1 - allow user to select fields for route  */
  toggleField(fieldElem) {
    const thisFinder = this;

    // get row and col info from field elem attrs
    const field = {
      row: parseInt(fieldElem.getAttribute('data-row'), 10),
      col: parseInt(fieldElem.getAttribute('data-col'), 10),
    };

    // if field with this row and col is true -> unselect it
    if(thisFinder.grid[field.row][field.col]) {
      thisFinder.grid[field.row][field.col] = false;
      fieldElem.classList.remove(classNames.finder.active);
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

        if(field.col > 1) edgeFields.push(thisFinder.grid[field.row][field.col-1]);//get field on the left value
        if(field.col < 10) edgeFields.push(thisFinder.grid[field.row][field.col+1]); //get field on the right value
        if(field.row > 1) edgeFields.push(thisFinder.grid[field.row-1][field.col]); //get field on the top value
        if(field.row < 10) edgeFields.push(thisFinder.grid[field.row+1][field.col]); //get field on the bottom value
        //console.log(edgeFields);

        // if clicked field doesn't touch at least one that is already selected -> show alert and finish function
        if(!edgeFields.includes(true)) {
          alert('A new field should touch at least one that is already selected!');
          return;
        }
      }

      // select clicked field
      thisFinder.grid[field.row][field.col] = true;
      fieldElem.classList.add(classNames.finder.active);

      //console.log(thisFinder.grid);

    }
  }

  colorHintField() {
    
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
    const id = `${row},${col}`;
    const { col: colNum, row: rowNum } = this.getFieldById(id);
    return document.querySelector(`.field[data-row="${rowNum}"][data-col="${colNum}"]`);
  }

  getNeighbors(rowIndex, colIndex) {
    const neighbors = [];
    for (let row = rowIndex - 1; row <= rowIndex + 1; row++) {
      for (let col = colIndex - 1; col <= colIndex + 1; col++) {
        // Check if neighbor is within bounds of grid
        if (
          row >= 0 &&
          row < this.grid.length &&
          col >= 0 &&
          col < this.grid[0].length
        ) {
          // Check if neighbor is not the current field and is active
          if (!(row === rowIndex && col === colIndex) && this.isActive(row, col)) {
            neighbors.push({ row, col });
          }
        }
      }
    }
    return neighbors;
  }
  

  calculateAllRoutes() {
    const thisFinder = this;
    console.log(thisFinder);

    const distances = {};
    const previous = {};
    const queue = [];

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

    console.log("Distances: ", distances);
    console.log("Previous: ", previous);
    console.log("Queue: ", queue);

    while (queue.length > 0) {
      // find the field with the smallest distance in the queue
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

      // check if we have reached the finish field
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
        return;
      }

      // calculate the distances to neighboring fields
      for (let row = currentRow - 1; row <= currentRow + 1; row++) {
        for (let col = currentCol - 1; col <= currentCol + 1; col++) {
          // Check if neighbor is within bounds of grid
          if (
            row >= 1 &&
            row <= 10 &&
            col >= 1 &&
            col <= 10
          ) {
            // Check if neighbor is not the current field and is active
            if (!(row === currentRow && col === currentCol) && grid[row][col]) {
              const neighborId = `${row},${col}`;
              const altDistance = distances[closestFieldId] + 1;
              if (altDistance < distances[neighborId]) {
                distances[neighborId] = altDistance;
                previous[neighborId] = closestFieldId;
              }
            }
          }
        }
      }

      // remove the current field from the queue
      queue.splice(queue.indexOf(closestFieldId), 1);
    }
    console.log('No path found');
  }
}
export default Finder;