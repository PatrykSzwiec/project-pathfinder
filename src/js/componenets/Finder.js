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
    console.log(thisFinder.grid);

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
      thisFinder.startFinish();
    }
    else if(thisFinder.step === 3) {
      // TO DO
    }
  }

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
        if(field.col > 1) edgeFields.push(thisFinder.grid[field.row][field.col-1]); //get field on the left value
        if(field.col < 10) edgeFields.push(thisFinder.grid[field.row][field.col+1]); //get field on the right value
        if(field.row > 1) edgeFields.push(thisFinder.grid[field.row-1][field.col]); //get field on the top value
        if(field.row < 10) edgeFields.push(thisFinder.grid[field.row+1][field.col]); //get field on the bottom value
        console.log(edgeFields);
        // if clicked field doesn't touch at least one that is already selected -> show alert and finish function
        if(!edgeFields.includes(true)) {
          alert('A new field should touch at least one that is already selected!');
          return;
        }
      }

      // select clicked field
      const selectedType = thisFinder.selectedType;
      thisFinder.grid[field.row][field.col] = true;
      fieldElem.classList.add(classNames.finder.active);
      fieldElem.setAttribute('data-type', selectedType);
      if (selectedType === 'start') {
        fieldElem.textContent = 'S';
      } else if (selectedType === 'finish') {
        fieldElem.textContent = 'F';
      }
    }
  }

  startFinish(){
    const thisFinder = this;
    const gridElem = thisFinder.element.querySelector(select.finder.grid);

    // Remove previous event listener for field click
    gridElem.removeEventListener('click', toggleStartFinish);

    // Add new event listener for field click
    gridElem.addEventListener('click', toggleStartFinish);

    function toggleStartFinish(event) {
      event.preventDefault();

      const target = event.target;
      const isActive = target.classList.contains(classNames.finder.active);
      const isStart = target.classList.contains(classNames.finder.start);
      const isFinish = target.classList.contains(classNames.finder.finish);

      // Check if clicked field is already active
      if (isActive) {
        // If clicked field is start, remove start class
        if (isStart) {
          target.classList.remove(classNames.finder.start);
          thisFinder.start = null;
        }
        // If clicked field is finish, remove finish class
        else if (isFinish) {
          target.classList.remove(classNames.finder.finish);
          thisFinder.finish = null;
        }
      }
      else {
        // If start field is not yet selected, add start class
        if (!thisFinder.start) {
          target.classList.add(classNames.finder.start);
          thisFinder.start = {
            row: parseInt(target.dataset.row),
            col: parseInt(target.dataset.col),
          };
        }
        // If finish field is not yet selected, add finish class
        else if (!thisFinder.finish) {
          target.classList.add(classNames.finder.finish);
          thisFinder.finish = {
            row: parseInt(target.dataset.row),
            col: parseInt(target.dataset.col),
          };
        }
      }
    }
  }
}

export default Finder;