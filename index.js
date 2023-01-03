'use strict';

const assert = require('assert');

function createTraverseReplacer(fn) {
  const paths = new WeakMap();

  let root = null;

  return function replacer(key, value) {
    // ignore root

    if (root === null) {
      root = this;
      return value;
    }

    // save "path" for each visited intermediate node

    const parentPath = paths.get(this);
    const path = parentPath ? `${parentPath}.${key}` : key;

    if ((typeof value === 'object' && value !== null) || Array.isArray(value)) {
      paths.set(value, path);
    }

    // call "fn" with current visiting node

    const isRoot = key === path;
    const isLeaf = !paths.has(value);

    console.log('key=%s path=%s root=%s leaf=%s', key, path, isRoot, isLeaf);

    return fn.call(this, key, value, path, isRoot);
  };
}

function createOmitReplacer(ignore) {
  const ignored = new Set(ignore);

  function ignoreNode(key, value, path) {
    if (ignored.has(path)) {
      return undefined;
    }

    return value;
  }

  return createTraverseReplacer(ignoreNode);
}

const hello = {
  a: { some: 'value', other: 'value', third: { crazy: false } },
  b: { some: 'other value' },
  c: { some: 'third value' },
  d: 0,
};

const actual = JSON.parse(
  JSON.stringify(hello, createOmitReplacer([
    'a.other',
    'b.some',
    'c',
  ])),
);

const expected = {
  a: { some: 'value', third: { crazy: false } },
  d: 0,
};

assert.deepStrictEqual(actual, expected);
