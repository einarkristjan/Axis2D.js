// namespace - "new function" for naming the object
var AXIS = AXIS || new function AXIS(){};

//------------------------------------------------------------------------------
// utils / helpers

AXIS.toInt = function(number) {
  return parseInt(number, 10);
};

//------------------------------------------------------------------------------
// export

if(typeof module === 'object') {
  module.exports = AXIS;
}
