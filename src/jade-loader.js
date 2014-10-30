var rectifier = require('jade-react-compiler');

// todo: think about using suger JS to fix stuff like scope etc! and add magic functions so we dont need utils

module.exports = function(source) {
  this.cacheable && this.cacheable();

  var jscode = rectifier.compileClient(source, {filename:'/Users/demi/Projects/pellet/doghouse/frontend/haha'});
  jscode = 'React = react = require("react");' +
    'Pellet = pellet = require("pellet");' +
    'utils = {addComponent:pellet.jade_addComponent, addEl:pellet.jade_addEl, intl:pellet.jade_intl};' +
    'module.exports=function(scope)' +
    jscode.substring(25);

  return jscode;
};
