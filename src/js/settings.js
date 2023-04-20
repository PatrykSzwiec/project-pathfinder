export const select = {
  templateOf: {
    aboutWidget: '#template-about-widget',
    finderWidget: '#template-finder-widget',
  },

  containerOf: {
    pages: '#pages',
    about: '.about-wrapper',
    finder: '.finder-wrapper',
  },

  nav: {
    links: '.nav-menu a'
  }
};

export const classNames = {
  nav: {
    active: 'active',
  },
  pages: {
    active: 'active',
  }
};

export const templates = {
  aboutWidget: Handlebars.compile(
    document.querySelector(select.templateOf.aboutWidget).innerHTML
  ),

  finderWidget: Handlebars.compile(
    document.querySelector(select.templateOf.finderWidget).innerHTML
  ),
};