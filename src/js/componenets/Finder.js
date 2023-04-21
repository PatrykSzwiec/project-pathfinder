import {templates } from '../settings.js';

class Finder {
  constructor(finderContainer){
    const thisFinder = this;

    thisFinder.render(finderContainer);
  }

  render(finderContainer){
    const thisFinder = this;

    thisFinder.dom = {};
    thisFinder.dom.wrapper = finderContainer;

    const generatedHTML = templates.finderWidget();
    thisFinder.dom.wrapper.innerHTML = generatedHTML;
  }

}

export default Finder;