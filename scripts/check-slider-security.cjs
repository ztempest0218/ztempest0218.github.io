const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({ window: {}, document: { querySelector: () => null } });
const source = fs.readFileSync(path.join(__dirname, '../ideal-image-slider/ideal-image-slider.js'), 'utf8');
vm.runInContext(source, context);
const result = vm.runInContext(`
  var payloads = [
    '{"__proto__":{"polluted":true}}',
    '{"constructor":{"prototype":{"polluted":true}}}',
    '{"classes":{"__proto__":{"polluted":true}}}',
    '{"classes":{"constructor":{"prototype":{"polluted":true}}}}',
    '{"prototype":{"polluted":true}}'
  ];
  payloads.forEach(function(payload) {
    new IdealImageSlider.Slider(JSON.parse(payload));
  });
  var options = new IdealImageSlider.Slider({
    interval: 2000, classes: { container: 'example' }, hasOwnProperty: 'not a function'
  });
  ({ polluted: ({}).polluted, interval: options.settings.interval, container: options.settings.classes.container });
`, context);
assert.equal(result.polluted, undefined, 'Slider options polluted Object.prototype');
assert.equal(result.interval, 2000);
assert.equal(result.container, 'example');
console.log('Slider prototype-pollution regression checks passed.');
