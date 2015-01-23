var AXIS = {};

//------------------------------------------------------------------------------
// utils

AXIS.toInt = function(number) {
  return parseInt(number, 10);
};

//------------------------------------------------------------------------------
// export

if(typeof module === 'object') {
  module.exports = AXIS;
}
