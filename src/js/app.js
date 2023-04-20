import {select, classNames} from './settings.js';
import About from './componenets/About.js';

const app = {
  initPages: function(){
    const thisApp = this;

    // Find container with their all child elements
    thisApp.pages = document.querySelector(select.containerOf.pages).children;

    // Find all navigation links
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    // open default page
    const idFromHash = window.location.hash.replace('#/', '');

    // if the page id is not corretct open page with below id
    let pageMatchingHash = thisApp.pages[0].id;

    // Take id of the page
    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }
    // activate page
    thisApp.activatePage(pageMatchingHash);

    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        // get page id from href attribute
        const id = clickedElement.getAttribute('href').replace('#', '');
        // run thisApp.activatePage with that id
        thisApp.activatePage(id);

        // change URL hash
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function(pageId){
    const thisApp = this;

    // add class "active" to matching pages, remove from non-matching
    for(let page of thisApp.pages){
      page.classList.toggle(
        classNames.pages.active,
        page.id == pageId
      );
    }
    // add class "active" to matching links, remove from non-matching
    for(let link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }

  },

  initAbout: function(){
    const thisApp = this;
    const aboutContainer = document.querySelector(select.containerOf.about);
    thisApp.about = new About(aboutContainer);
  },

  init: function(){
    const thisApp = this;
    thisApp.initPages();
    thisApp.initAbout();
  }
};

app.init();