const _config = require('_config')
const webpage = require('webpage')
const wizardamigosinstitute = require('..')
/******************************************************************************
  EXPORT
******************************************************************************/
const config              = _config();

const el = webpage(config)
const { COMPONENT, API } = wizardamigosinstitute(config, () => {

  document.body.appendChild(COMPONENT);
  scrollToHash();

})

function scrollToHash () {
  if(location.hash) {
    var a = document.createElement('a');
    a.setAttribute('href', location.hash);
    a.click();
  }
}
