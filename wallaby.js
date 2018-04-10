module.exports = () => {
  return {
    files: [
      'packages/*/**/*.ts',
      { pattern: 'packages/*/tests/**/*.ts', ignore: true }
    ],

    tests: [
      'packages/*/tests/**/*.ts'
    ],

    env: {
      type: 'node'
    },

    debug: false,
    testFramework: 'mocha'
  };
};
