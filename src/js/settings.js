export const select = {
  templateOf: {
    aboutWidget: '#template-about-widget',
    finderPage: '#template-finder-widget',
  },

  containerOf: {
    pages: '#pages',
    about: '.about-wrapper',
    finder: '.finder-wrapper',
  },

  finder: {
    grid: '.table',
    submitBtn: '.btn',
    active: '.active',
    field: '.field',
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
  },
  finder: {
    field: 'field',
    active: 'active',
    start: 'start',
    finish: 'finish',
    shortPath: 'shortPath',
    hint: 'hint',
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