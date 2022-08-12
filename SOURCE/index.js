'use strict';
/******************************************************************************
  DEPENDENCIES = CUSTOM SDK [Custom Software Development Kit]
******************************************************************************/
// const webpage     = require('webpage');
// const fastdom     = require('fastdom');
// const minixhr     = require('minixhr');
// const eventstopper= require('eventstopper');
const jmm         = require('json-meta-marked');
const markdownbox = require('holon-markdownbox');
/******************************************************************************
  PARAMETER = ARGUMENT
******************************************************************************/
  // no cli tool
  // $paramName = process.argv[2];
  // const iframe = document.createElement('iframe')
  // const url = 'https://serapath.github.io/container-frame'
  // iframe.setAttribute('src', url)
  // iframe.setAttribute('style', 'width: 0px; height: 0px; border: 0;')
  // const iframe_origin = new URL(url).origin
  // onmessage = event => {
  //   const { data, source, origin } = event
  //   if (source !== iframe.contentWindow) return
  //   if (origin !== iframe_origin) return
  //   if (data) return
  //   source.postMessage()
  //   console.log(data)
  // }
  // iframe.onload = () => {
  //   alert('asdf')
  // }
  // document.body.append(iframe)

  const params = {
    "name":"Wizardamigosinstitute.GitHub.io",
    "tagline":"Wizard Amigos Institute Website",
    "body": {
      "title": "Wizard Amigos Institute",
      "google":"",
      "note":"Don't delete this file! It's used internally to help with page regeneration."
    }
  }
  // const BACKEND_CONTENT = `https://api.github.com/repos/wizardamigosinstitute/organization/contents/CONTENT?ref=master`
  // const BACKEND_CONTENT = `https://raw.githubusercontent.com/wizardamigos/organization/master/CONTENT`
  const BACKEND_CONTENT = `https://cdn.jsdelivr.net/gh/wizardamigos/organization/CONTENT`
  var env         = {
    backend         : BACKEND_CONTENT + '/index.md'
  };
/******************************************************************************
  MODULE INTERNALS & HELPERS
******************************************************************************/
const githubLevel         = require('_githubLevel');
const organizationprofile = require('_organizationprofile');
const template            = `<div class="wizardamigos">
<embed class="wizardamigos__logo" src="SOURCE/assets/vector_wizard_pdf.svg" type="image/svg+xml"></embed>
<div class="wizardamigos__news"></div>
<div class="wizardamigos__menu"></div>
<div class="wizardamigos__content"></div>
<div id="webring" class="wizardamigos__webring">
  <div class="wizardamigos__webring__title"> Webring </div>
  <div class="wizardamigos__partners"></div>
</div>
</div>
`
let __                    = document.createElement('div');

function wizardamigosinstitute (config, INIT) { // 'data' maybe also to use for event delegation pattern
  const COMPONENT = (__.innerHTML=template,__.childNodes[0]);
  const __logo    = COMPONENT.querySelectorAll('.wizardamigos__logo')[0];
  const __menu    = COMPONENT.querySelectorAll('.wizardamigos__menu')[0];
  const __news    = COMPONENT.querySelectorAll('.wizardamigos__news')[0];
  const __content = COMPONENT.querySelectorAll('.wizardamigos__content')[0];
  const __partners = COMPONENT.querySelectorAll('.wizardamigos__partners')[0];

  var SEMAPHORE   = null;
  var CONTENT     = [];
  var LANGUAGES   = {};

  // STATE
  var __Menu__activeLanguage  = null;
  var currentLanguage         = config.language;

  // USAGE
  console.log("1: [parent] GITHUB LEVEL")
  githubLevel({ url: env.backend }, function (error, content, version) {
    if (error) { console.error(error); throw error; }

    var temp    = {};
    var CONTENT = undefined;
    console.log({content})
    const { url, data } = content
    console.log({data})
    const { name, CONTENT: list } = jmm.parse(data)

    if (name !== 'Metadata') throw new Error('wrong content: ' + name)

    console.log('21: [parent] loop', { error, data, version})

    ;['index', ...list].forEach(function (name) {
      const url = `${BACKEND_CONTENT}/${name}.${name === 'index' ? 'md' : 'markdown'}`

      githubLevel({ url }, function (error, content, version) {
        const { url, data } = content
        console.log('LOOP1', {error, content, version})
        console.log('LOOP2', {name, url, CONTENT})

        if (name === 'index') {
          console.log('index', {data})
          CONTENT = jmm.parse(data).CONTENT;
          prepareArrayContainer(CONTENT);
          CONTENT.forEach(function (title, idx) {
            if(temp[title]) {
              addContent(idx, title, temp[title]);
            }
          });
        } else if (!CONTENT) {
          temp[name] = data;
        } else {
          CONTENT.forEach(function (title, idx) {
            if(name === title) {
              addContent(idx, name, data);
            }
          });
        }
      });
    });

  });

  /******** RETURN *********/
  var API = {}; // should be an event emitter too
  return { COMPONENT, API };

  function prepareArrayContainer (CONTENT) {
    SEMAPHORE = CONTENT.length;
  }
  function addContent (idx, name, jsonmarked) {
    SEMAPHORE--;
    CONTENT[idx] = {
      name: name,
      lang: {}
    };
    var object = jmm.parse(jsonmarked);
    var html   = object.__content__;
    var langs  = html.split('<hr>').filter(function(x){return x;});
    var reg = /<p><a href="@([\s\S]*)"><\/a><\/p>([\s\S]*)/;
    langs.forEach(function(x){
      var tmp     = x.match(reg);
      var lang    = tmp[1];
      var content = tmp[2];
      CONTENT[idx].lang[lang] = content;
      if (!LANGUAGES[lang]) { LANGUAGES[lang] = true; }
    });

    console.log({SEMAPHORE, CONTENT})
    if (!SEMAPHORE) {
      prepare();
      CONTENT.forEach(({el}) => {

      })
      INIT();
    }

  }
  // FILL "CONTENT" & FILL "NEWS"
  function UPDATE_contentAndNews () {
    CONTENT.forEach(function (x, idx) {
      if (x.name === 'news') {
        var API = (function (languages) {
          return {
            changeLanguage(lang) {
              __news.innerHTML = x.lang[currentLanguage];
            }
          };
        })(x.lang);
        __news.innerHTML = x.lang[config.language];
        CONTENT[idx] = API;
      } else {
        var item = '<div class="wizardamigos__infobox"></div>';
        var tmp = (__.innerHTML=item,__.childNodes[0]);
        CONTENT[idx] = markdownbox({
          container : tmp,
          options   : { defaultLanguage: config.language },
          data      : x
        });
        console.log(__content, tmp)
        tmp.append(CONTENT[idx].el)
        __content.appendChild(tmp);
      }
    })
  }
  // FILL "MENU"
  function UPDATE_languages () {
    for (var lang in LANGUAGES) {
      (function (lang) {
        var isCurrentLanguage = (lang === currentLanguage);
        var item = '<a class="wizardamigos__lang' +
          '  wizardamigos__lang--STATE_' +
          (isCurrentLanguage ? 'active' : 'inactive') + '">'+lang+'</a>';
        var tmp  = (__.innerHTML=item,__.childNodes[0]);
        __Menu__activeLanguage = tmp;
        __menu.appendChild(tmp);
      })(lang);
    }
  }
  // FILL "WEBRING"
  function UPDATE_webring () {
    githubLevel({ url: env.backend }, function (error, content, version) {
      if (error) { console.error(error); throw error; }

      var temp    = {};
      var CONTENT = undefined;
      console.log({content})
      const { url, data } = content
      console.log({data})
      const { name, CONTENT: list } = jmm.parse(data)

      if (name !== 'Metadata') throw new Error('wrong content: ' + name)

      list.push('wallofinspiration')
      list.forEach(function (name) {
        const url = `${BACKEND_CONTENT}/${name}.${name === 'index' ? 'md' : 'markdown'}`
        if (name === 'wallofinspiration') {
          githubLevel({ url }, function (error, content, version) {
            var jsonmarked        = content.data // b64_to_utf8(data.content);
            var wallofinspiration = jmm.parse(jsonmarked).__content__;

            var div = document.createElement('div');
            div.innerHTML = wallofinspiration;

            var partners = [];

            [].forEach.call(div.querySelectorAll('h3'), function (item) {
              partners.push({ name: item.innerHTML });
            });
            [].forEach.call(div.querySelectorAll('a'), function (item, i) {
              partners[i].website = item.getAttribute('href');
            });
            [].forEach.call(div.querySelectorAll('img'), function (item, i) {
              partners[i].logo = item.getAttribute('src');
              partners[i].location = item.getAttribute('alt');
            });

            partners.forEach(function add (partner) {
              organizationprofile(__partners, {
                name: partner.name,
                logo: partner.logo,
                location: partner.location,
                website: partner.website
              });
            });

          });
        }
      });
    });
  }

  function prepare () {
    UPDATE_contentAndNews();
    UPDATE_languages();
    UPDATE_webring();

    /******** WIRE UP ********/
    __menu.addEventListener('click', function onclick (event) {
      // eventstopper(event);
      var el          = event.target;
      var isLang      = el.classList.contains('wizardamigos__lang');
      var lang        = el.innerHTML;
      var isInactive  = el !== __Menu__activeLanguage;
      if (isLang && isInactive) {
        var ON = 'wizardamigos__lang--STATE_active';
        var OFF = 'wizardamigos__lang--STATE_inactive';
        el.classList.add(ON);
        el.classList.remove(OFF);
        __Menu__activeLanguage.classList.add(OFF);
        __Menu__activeLanguage.classList.remove(ON);
        __Menu__activeLanguage = el;
        currentLanguage = lang;
        CONTENT.forEach(function switchLanguage ({api}) {
          api.changeLanguage(currentLanguage);
        });
      }
    });
  }
}
module.exports    = wizardamigosinstitute

function b64_to_utf8( str ) {
  str = str.replace(/(\r\n|\n|\r)/gm,"");
  return decodeURIComponent(escape(window.atob( str )));
}

const reset = `
/*
  CSS RESET
*/
html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, font, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td {
  margin: 0;
  padding: 0;
  border: 0;
  outline: 0;
  font-weight: inherit;
  font-style: inherit;
  font-size: 100%;
  font-family: inherit;
  vertical-align: baseline;
}
/* remember to define focus styles! */
:focus {
  outline: 0;
}
body {
  line-height: 1;
  color: black;
  background: white;
}
ol, ul {
  list-style: none;
}
/* tables still need 'cellspacing="0"' in the markup */
table {
  border-collapse: separate;
  border-spacing: 0;
}
caption, th, td {
  text-align: left;
  font-weight: normal;
}
blockquote:before, blockquote:after,
q:before, q:after {
  content: "";
}
blockquote, q {
  quotes: "" "";
}

`

const style = `
:root {
  /* WIZARD AMIGOS INSTITUTE */
  --WizardAmigosInstitute-color1       : #7A68F2;
  --WizardAmigosInstitute-color2       : #3627B4;
  --WizardAmigosInstitute-color3       : #E2FCEF;
  --WizardAmigosInstitute-color4       : #9B287B;
  --WizardAmigosInstitute-color5       : #2D4042;
  --WizardAmigosInstitute-color6       : #FFFFFF;
  --WizardAmigosInstitute-color7       : #000000;
  --WizardAmigosInstitute-color8       : #f8da95;
  --WizardAmigosInstitute-font1        : Ubuntu Mono, Open Sans, monaco, sans-serif;
  --WizardAmigosInstitute-font2        : Ubuntu Mono, Open Sans, monaco, sans-serif;
  --WizardAmigosInstitute-font-size1   : 6.5vw;
  --WizardAmigosInstitute-font-size2   : 3vw;
  --WizardAmigosInstitute-font-size3   : 2.3vw;
  --WizardAmigosInstitute-borderwidth  : 4vw;

  --WizardAmigosInstitute-mini-font-size1   : 6.5vw;
  --WizardAmigosInstitute-mini-font-size2   : 3vw;
  --WizardAmigosInstitute-mini-font-size3   : 2.3vw;
  --WizardAmigosInstitute-mini-borderwidth  : 4vw;

  --WizardAmigosInstitute-watch-font-size1   : 6.5vw;
  --WizardAmigosInstitute-watch-font-size2   : 3vw;
  --WizardAmigosInstitute-watch-font-size3   : 2.3vw;
  --WizardAmigosInstitute-watch-borderwidth  : 4vw;

  --WizardAmigosInstitute-smartphone-font-size1 : 6.5vw;
  --WizardAmigosInstitute-smartphone-font-size2 : 3vw;
  --WizardAmigosInstitute-smartphone-font-size3 : 2.3vw;
  --WizardAmigosInstitute-smartphone-borderwidth: 4vw;

  --WizardAmigosInstitute-tablet-font-size1 : 6.5vw;
  --WizardAmigosInstitute-tablet-font-size2 : 3vw;
  --WizardAmigosInstitute-tablet-font-size3 : 2.3vw;
  --WizardAmigosInstitute-tablet-borderwidth: 4vw;

  --WizardAmigosInstitute-desktop-font-size1 : 6.5vw;
  --WizardAmigosInstitute-desktop-font-size2 : 3vw;
  --WizardAmigosInstitute-desktop-font-size3 : 2.3vw;
  --WizardAmigosInstitute-desktop-borderwidth: 4vw;

  --WizardAmigosInstitute-highres-font-size1 : 6.5vw;
  --WizardAmigosInstitute-highres-font-size2 : 3vw;
  --WizardAmigosInstitute-highres-font-size3 : 2.3vw;
  --WizardAmigosInstitute-highres-borderwidth: 4vw;
}

.wizardamigos       {
  margin            : 0 auto;
}
.wizardamigos__menu {
  text-align        : center;
  margin            : 0 auto;
}
.wizardamigos__news h1 {
  display           : none;
}
.wizardamigos__news a {
  text-decoration   : none;
  color             : var(--WizardAmigosInstitute-color2);
}
.wizardamigos__news a:hover {
  text-decoration   : none;
  color             : var(--WizardAmigosInstitute-color4);
}
.wizardamigos__news {
  padding-bottom    : 1vw;
  font-family       : var(--WizardAmigosInstitute-font1);
  color             : var(--WizardAmigosInstitute-color7);
  font-size         : var(--WizardAmigosInstitute-font-size3);
  font-weight       : 900;
  text-align        : center;
  margin            : 0 auto;
}

.wizardamigos__lang {
  padding-left      : 5vmin;
  padding-right     : 5vmin;
  text-transform    : uppercase;
  cursor            : pointer;
  font-family       : var(--WizardAmigosInstitute-font2);
  font-weight       : 900;
  font-size         : 5vmin;
}
.wizardamigos__lang--STATE_inactive:hover {
  color             : var(--WizardAmigosInstitute-color3);
  background-color  : var(--WizardAmigosInstitute-color1);
}
.wizardamigos__lang--STATE_inactive {
  color             : var(--WizardAmigosInstitute-color2);
}
.wizardamigos__lang--STATE_active {
  color             : var(--WizardAmigosInstitute-color4);
}
.wizardamigos__logo {
  display           : block;
  margin            : 0 auto;
  text-align        : center;
  min-width         : 10vw;
  width             : 60vmin;
  max-width         : 65vw;
}
.wizardamigos__webring__title {
  font-family        : var(--WizardAmigosInstitute-font2);
  color              : var(--WizardAmigosInstitute-color4);
  font-size          : var(--WizardAmigosInstitute-font-size1);
  font-weight        : 900;
  text-align         : center;
}
.wizardamigos__partners {
  display               : flex;
  align-items           : stretch;
  justify-content       : center;
  flex-direction        : row;
  flex-wrap             : wrap;
  border-top            : 1px solid black;
  padding-top           : 2vw;
  padding-bottom        : 2vw;
}
@media all and (min-width: 0px) and (max-width: 321px) {
  /* mini */
  .wizardamigos__lang {
    font-family       : var(--WizardAmigosInstitute-mini-font-size2);
  }
  .wizardamigos__news {
    font-size         : var(--WizardAmigosInstitute-mini-font-size3);
  }
}
@media all and (min-width: 321px) and (max-width: 641px) {
  /* watch */
  .wizardamigos__lang {
    font-family       : var(--WizardAmigosInstitute-watch-font-size2);
  }
  .wizardamigos__news {
    font-size         : var(--WizardAmigosInstitute-watch-font-size3);
  }
}

@media all and (min-width: 641px) and (max-width: 769px) {
  /* smartphone */
  .wizardamigos__lang {
    font-family       : var(--WizardAmigosInstitute-smartphone-font-size2);
  }
  .wizardamigos__news {
    font-size         : var(--WizardAmigosInstitute-smartphone-font-size3);
  }
}

@media all and (min-width: 769px) and (max-width: 1025px) {
  /* tablet */
  .wizardamigos__lang {
    font-family       : var(--WizardAmigosInstitute-tablet-font-size2);
  }
  .wizardamigos__news {
    font-size         : var(--WizardAmigosInstitute-tablet-font-size3);
    max-width         : 85vw;
  }
}

@media all and (min-width: 1025px) and (max-width: 1201px) {
  /* desktop */
  .wizardamigos__lang {
    font-family       : var(--WizardAmigosInstitute-desktop-font-size2);
  }
  .wizardamigos__news {
    font-size         : var(--WizardAmigosInstitute-desktop-font-size3);
    max-width         : 65vw;
  }
}

@media all and (min-width: 1201px) {
  /* highres */
  .wizardamigos__lang {
    font-family       : var(--WizardAmigosInstitute-highres-font-size2);
  }
  .wizardamigos__news {
    font-size         : var(--WizardAmigosInstitute-highres-font-size3);
    max-width         : 65vw;
  }
}
`
const css = `
${reset}
${style}
@font-face                       {
  font-family                    : Pixelade;
  src                            : url('assets/PIXELADE.ttf');
}

:root {
  /* THEME */
  --Theme-color1                 : #7A68F2;
  --Theme-color2                 : #3627B4;
  --Theme-color3                 : #E2FCEF;
  --Theme-color4                 : #9B287B;
  --Theme-color5                 : #2D4042;
  --Theme-color6                 : #FFFFFF;
  --Theme-color7                 : #000000;
  --Theme-color8                 : #f8da95;
  --Theme-font1                  : Ubuntu Mono, Open Sans, monaco, sans-serif;
  --Theme-font2                  : Pixelade;
  --Theme-font-size1             : 6.5vw;
  --Theme-font-size2             : 3vw;
  --Theme-font-size3             : 2.3vw;
  --Theme-borderwidth            : 4vw;
  /* BREAK POINTS with MEDIA QUERIES */
  --Theme-mini-font-size1      : 6.7vw;
  --Theme-mini-font-size2      : 5.5vw;
  --Theme-mini-font-size3      : 5vw;
  --Theme-mini-borderwidth     : 6vw;
  --Theme-mini-margin          : 0vw;

  --Theme-watch-font-size1      : 6.7vw;
  --Theme-watch-font-size2      : 5.5vw;
  --Theme-watch-font-size3      : 5vw;
  --Theme-watch-borderwidth     : 6vw;
  --Theme-watch-margin          : 0vw;

  --Theme-smartphone-font-size1   : 7.5vw;
  --Theme-smartphone-font-size2   : 4.2vw;
  --Theme-smartphone-font-size3   : 3.6vw;
  --Theme-smartphone-borderwidth  : 4vw;
  --Theme-smartphone-margin       : 0vw;

  --Theme-tablet-font-size1   : 6vw;
  --Theme-tablet-font-size2   : 4vw;
  --Theme-tablet-font-size3   : 3vw;
  --Theme-tablet-borderwidth  : 6vw;
  --Theme-tablet-margin       : 8vw;

  --Theme-desktop-font-size1   : 4. 5vw;
  --Theme-desktop-font-size2   : 3vw;
  --Theme-desktop-font-size3   : 2.5vw;
  --Theme-desktop-borderwidth  : 5vw;
  --Theme-desktop-margin       : 16vw;

  --Theme-highres-font-size1   : 4vw;
  --Theme-highres-font-size2   : 2.5vw;
  --Theme-highres-font-size3   : 2vw;
  --Theme-highres-borderwidth  : 4vw;
  --Theme-highres-margin       : 20vw;

  /* APPLY THEME */
  --Organizationprofile-color1         : var(--Theme-color1);
  --Organizationprofile-color2         : var(--Theme-color2);
  --Organizationprofile-color3         : var(--Theme-color3);
  --Organizationprofile-color4         : var(--Theme-color4);
  --Organizationprofile-font1          : var(--Theme-font1);
  --Organizationprofile-font2          : var(--Theme-font2);
  --Organizationprofile-font-size1     : var(--Theme-font-size1);
  --Organizationprofile-font-size2     : var(--Theme-font-size2);
  --Organizationprofile-font-size3     : var(--Theme-font-size3);
  --Organizationprofile-borderwidth    : var(--Theme-borderwidth);

  --Organizationprofile-mini-font-size1      : var(--Theme-mini-font-size1);
  --Organizationprofile-mini-font-size2      : var(--Theme-mini-font-size2);
  --Organizationprofile-mini-font-size3      : var(--Theme-mini-font-size3);
  --Organizationprofile-mini-borderwidth     : var(--Theme-mini-borderwidth);
  --Organizationprofile-mini-margin          : var(--Theme-mini-margin);

  --Organizationprofile-watch-font-size1      : var(--Theme-watch-font-size1);
  --Organizationprofile-watch-font-size2      : var(--Theme-watch-font-size2);
  --Organizationprofile-watch-font-size3      : var(--Theme-watch-font-size3);
  --Organizationprofile-watch-borderwidth     : var(--Theme-watch-borderwidth);
  --Organizationprofile-watch-margin          : var(--Theme-watch-margin);

  --Organizationprofile-smartphone-font-size1   : var(--Theme-smartphone-font-size1);
  --Organizationprofile-smartphone-font-size2   : var(--Theme-smartphone-font-size2);
  --Organizationprofile-smartphone-font-size3   : var(--Theme-smartphone-font-size3);
  --Organizationprofile-smartphone-borderwidth  : var(--Theme-smartphone-borderwidth);
  --Organizationprofile-smartphone-margin       : var(--Theme-smartphone-margin);

  --Organizationprofile-tablet-font-size1   : var(--Theme-tablet-font-size1);
  --Organizationprofile-tablet-font-size2   : var(--Theme-tablet-font-size2);
  --Organizationprofile-tablet-font-size3   : var(--Theme-tablet-font-size3);
  --Organizationprofile-tablet-borderwidth  : var(--Theme-tablet-borderwidth);
  --Organizationprofile-tablet-margin       : var(--Theme-tablet-margin);

  --Organizationprofile-desktop-font-size1   : var(--Theme-desktop-font-size1);
  --Organizationprofile-desktop-font-size2   : var(--Theme-desktop-font-size2);
  --Organizationprofile-desktop-font-size3   : var(--Theme-desktop-font-size3);
  --Organizationprofile-desktop-borderwidth  : var(--Theme-desktop-borderwidth);
  --Organizationprofile-desktop-margin       : var(--Theme-desktop-margin);

  --Organizationprofile-highres-font-size1   : var(--Theme-highres-font-size1);
  --Organizationprofile-highres-font-size2   : var(--Theme-highres-font-size2);
  --Organizationprofile-highres-font-size3   : var(--Theme-highres-font-size3);
  --Organizationprofile-highres-borderwidth  : var(--Theme-highres-borderwidth);
  --Organizationprofile-highres-margin       : var(--Theme-highres-margin);

  --WizardAmigosInstitute-color1       : var(--Theme-color1);
  --WizardAmigosInstitute-color2       : var(--Theme-color2);
  --WizardAmigosInstitute-color3       : var(--Theme-color3);
  --WizardAmigosInstitute-color4       : var(--Theme-color4);
  --WizardAmigosInstitute-color5       : var(--Theme-color5);
  --WizardAmigosInstitute-color6       : var(--Theme-color6);
  --WizardAmigosInstitute-color7       : var(--Theme-color7);
  --WizardAmigosInstitute-color8       : var(--Theme-color8);
  --WizardAmigosInstitute-font1        : var(--Theme-font1);
  --WizardAmigosInstitute-font2        : var(--Theme-font2);
  --WizardAmigosInstitute-font-size1   : var(--Theme-font-size1);
  --WizardAmigosInstitute-font-size2   : var(--Theme-font-size2);
  --WizardAmigosInstitute-font-size3   : var(--Theme-font-size3);
  --WizardAmigosInstitute-borderwidth  : var(--Theme-borderwidth);

  --WizardAmigosInstitute-mini-font-size1             : var(--Theme-mini-font-size1);
  --WizardAmigosInstitute-mini-font-size2             : var(--Theme-mini-font-size2);
  --WizardAmigosInstitute-mini-font-size3             : var(--Theme-mini-font-size3);
  --WizardAmigosInstitute-mini-borderwidth            : var(--Theme-mini-borderwidth);

  --WizardAmigosInstitute-watch-font-size1             : var(--Theme-watch-font-size1);
  --WizardAmigosInstitute-watch-font-size2             : var(--Theme-watch-font-size2);
  --WizardAmigosInstitute-watch-font-size3             : var(--Theme-watch-font-size3);
  --WizardAmigosInstitute-watch-borderwidth            : var(--Theme-watch-borderwidth);

  --WizardAmigosInstitute-smartphone-font-size1          : var(--Theme-smartphone-font-size1);
  --WizardAmigosInstitute-smartphone-font-size2          : var(--Theme-smartphone-font-size2);
  --WizardAmigosInstitute-smartphone-font-size3          : var(--Theme-smartphone-font-size3);
  --WizardAmigosInstitute-smartphone-borderwidth         : var(--Theme-smartphone-borderwidth);
  --WizardAmigosInstitute-tablet-font-size1          : var(--Theme-tablet-font-size1);
  --WizardAmigosInstitute-tablet-font-size2          : var(--Theme-tablet-font-size2);
  --WizardAmigosInstitute-tablet-font-size3          : var(--Theme-tablet-font-size3);
  --WizardAmigosInstitute-tablet-borderwidth         : var(--Theme-tablet-borderwidth);

  --Markdownbox-color1                 : var(--Theme-color1);
  --Markdownbox-color2                 : var(--Theme-color2);
  --Markdownbox-color3                 : var(--Theme-color3);
  --Markdownbox-color4                 : var(--Theme-color4);
  --Markdownbox-color5                 : var(--Theme-color5);
  --Markdownbox-font1                  : var(--Theme-font1);
  --Markdownbox-font2                  : var(--Theme-font2);
  --Markdownbox-font-size1             : var(--Theme-font-size1);
  --Markdownbox-font-size2             : var(--Theme-font-size2);
  --Markdownbox-font-size3             : var(--Theme-font-size3);
  --Markdownbox-borderwidth            : var(--Theme-borderwidth);

  --Markdownbox-mini-font-size1             : var(--Theme-mini-font-size1);
  --Markdownbox-mini-font-size2             : var(--Theme-mini-font-size2);
  --Markdownbox-mini-font-size3             : var(--Theme-mini-font-size3);
  --Markdownbox-mini-borderwidth            : var(--Theme-mini-borderwidth);
  --Markdownbox-mini-margin                 : var(--Theme-mini-margin);

  --Markdownbox-watch-font-size1             : var(--Theme-watch-font-size1);
  --Markdownbox-watch-font-size2             : var(--Theme-watch-font-size2);
  --Markdownbox-watch-font-size3             : var(--Theme-watch-font-size3);
  --Markdownbox-watch-borderwidth            : var(--Theme-watch-borderwidth);
  --Markdownbox-watch-margin                 : var(--Theme-watch-margin);

  --Markdownbox-smartphone-font-size1          : var(--Theme-smartphone-font-size1);
  --Markdownbox-smartphone-font-size2          : var(--Theme-smartphone-font-size2);
  --Markdownbox-smartphone-font-size3          : var(--Theme-smartphone-font-size3);
  --Markdownbox-smartphone-borderwidth         : var(--Theme-smartphone-borderwidth);
  --Markdownbox-smartphone-margin              : var(--Theme-smartphone-margin);

  --Markdownbox-tablet-font-size1          : var(--Theme-tablet-font-size1);
  --Markdownbox-tablet-font-size2          : var(--Theme-tablet-font-size2);
  --Markdownbox-tablet-font-size3          : var(--Theme-tablet-font-size3);
  --Markdownbox-tablet-borderwidth         : var(--Theme-tablet-borderwidth);
  --Markdownbox-tablet-margin              : var(--Theme-tablet-margin);

  --Markdownbox-desktop-font-size1          : var(--Theme-desktop-font-size1);
  --Markdownbox-desktop-font-size2          : var(--Theme-desktop-font-size2);
  --Markdownbox-desktop-font-size3          : var(--Theme-desktop-font-size3);
  --Markdownbox-desktop-borderwidth         : var(--Theme-desktop-borderwidth);
  --Markdownbox-desktop-margin              : var(--Theme-desktop-margin);

  --Markdownbox-highres-font-size1          : var(--Theme-highres-font-size1);
  --Markdownbox-highres-font-size2          : var(--Theme-highres-font-size2);
  --Markdownbox-highres-font-size3          : var(--Theme-highres-font-size3);
  --Markdownbox-highres-borderwidth         : var(--Theme-highres-borderwidth);
  --Markdownbox-highres-margin              : var(--Theme-highres-margin);
}

`

//////////////////////////////////////////////////////////////////////////////////////

      // // <div id="fb-root"></div>
      // // <div class="fb-share-button"
      // //   data-href="http://wizard.amigos.institute/"
      // //   data-layout="button">
      // // </div><br>
      // // <a style="display:block" class="twitter-share-button"
      // //   href="https://twitter.com/share"
      // //   data-url="http://bit.ly/wizardamigosinstitute"
      // //   data-counturl="http://wizard.amigos.institute"
      // //   data-text="Coding for kids in berlin :-)"
      // //   data-hashtags="#berlin #programming #school"
      // //   data-related="serapath:Wizard Amigos Organizer"
      // //   data-lang="de"
      // //   data-via="wizardamigos"
      // //   data-size="normal"
      // //   data-count="none">
      // // Tweet us :-)
      // // </a>
      // // FACEBOOK
      // (function(d, s, id) {
      //   var js, fjs = d.getElementsByTagName(s)[0];
      //   if (d.getElementById(id)) return;
      //   js = d.createElement(s); js.id = id;
      //   js.src = "//connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v2.3&appId=322249881240262";
      //   fjs.parentNode.insertBefore(js, fjs);
      // }(document, 'script', 'facebook-jssdk'));
      // // TWITTER
      // (function(d,s,id){
      //   var js,fjs=d.getElementsByTagName(s)[0],t=window.twttr||{};
      //   if(d.getElementById(id))return;js=d.createElement(s);
      //   js.id=id;js.src="https://platform.twitter.com/widgets.js";
      //   fjs.parentNode.insertBefore(js,fjs);t._e=[];
      //   t.ready=function(f){t._e.push(f);};return t;
      // }(document,"script","twitter-wjs"));
