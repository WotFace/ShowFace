const { produce } = require('immer');

// Function that overrides the default CRA Webpack config.
// Called by https://github.com/timarney/react-app-rewired
// The package is somewhat broken in CRA2 at the time this code was written,
// but it still works for us. If it breaks, consider moving to
// https://github.com/arackaf/customize-cra.
module.exports = function override(webpackConfig, env) {
  return produce(webpackConfig, (draft) => {
    function addImportPathToSassLoader(sassLoader) {
      const uses = sassLoader.use || sassLoader.loader; // .loader used in prod

      // Patch sass-loader config
      if (env === 'development') {
        // Turn string loader into object
        uses[3] = {
          loader: uses[3], // uses[3] is a resolved path pointing to sass-loader
          options: {},
        };
      }

      // @material packages uses '@material' directly as part of their import paths.
      // Without this those imports will not resolve properly.
      uses[3].options.includePaths = ['node_modules'];
    }
    addImportPathToSassLoader(draft.module.rules[2].oneOf[5]); // Normal SASS/SCSS
    addImportPathToSassLoader(draft.module.rules[2].oneOf[6]); // SASS/SCSS modules
  });
};
