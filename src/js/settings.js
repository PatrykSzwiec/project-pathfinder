export const select = {
  templateOf: {
    aboutWidget: '#template-about-widget',
    finderPage: '#template-finder-widget',
  },

  containerOf: {
    pages: '#pages',
    about: '.about-wrapper.container',
    finder: '.finder-wrapper.container',
  },

  finder: {
    grid: '.table',
  },
  nav: {
    links: '.nav-link',
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

  finderPage: Handlebars.compile(
    document.querySelector(select.templateOf.finderPage).innerHTML
  ),
};