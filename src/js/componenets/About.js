import { select, templates } from '../settings.js';

class About {
  constructor(aboutContainer){
    const thisAbout = this;

    thisAbout.render(aboutContainer);
  }

  render(aboutContainer){
    const thisAbout = this;

    thisAbout.dom = {};
    thisAbout.dom.wrapper = aboutContainer;

    const generatedHTML = templates.aboutWidget();
    thisAbout.dom.wrapper.innerHTML = generatedHTML;

    thisAbout.dom.linkImage = thisAbout.dom.wrapper.querySelectorAll(select.home.linkImage);

  }

}

export default About;