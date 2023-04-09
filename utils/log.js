const { performance } = require('perf_hooks');
require('reflect-metadata');

export  function log(target, name, descriptor) {
    const original = descriptor.value;
    if (typeof original === 'function') {
        descriptor.value = function (...args) {
            console.log(`Calling ${name} with args: ${args.join(', ')} on address ${this.signer.address}`);
            return original.apply(this, args);
        }
    }
    return descriptor;
}
