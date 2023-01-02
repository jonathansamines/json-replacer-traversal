'use strict';

function createTraverseReplacer(fn) {
  const keys = new WeakMap();
  const parents = new WeakMap();

  let root = null;

  function getPath(value) {
    let parent = value;
    let path = '';

    do {
      const parentKey = keys.get(parent);

      if (parentKey) {
        path = path ? `${parentKey}.${path}` : parentKey;
      }

      parent = parents.get(parent);
    } while (parent !== undefined);

    return path;
  }

  return function replacer(key, value) {
    if (root === null) {
      root = this;
      return value;
    }

    // save key for each visited node

    keys.set(this, key);

    // save "parent" node for each intermediate node

    if ((typeof value === 'object' && value !== null) || Array.isArray(value)) {
      parents.set(value, this);
    }

    // call "fn" with current visiting node

    const path = getPath(this) ?? key;
    const isRoot = key === path;
    const isLeaf = !parents.has(value);

    return fn.call(this, key, value, path, isRoot, isLeaf);
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
