const config = {
  plugins: [
    // Core plugins
    "@tailwindcss/postcss",
    "autoprefixer",
    
    // Use PostCSS preset environment for future CSS features
    ["postcss-preset-env", {
      features: {
        'nesting-rules': true,
      },
      browsers: ['> 1%', 'last 2 versions', 'not dead'],
    }],
    
    // Optimize and minify CSS in production
    ...(process.env.NODE_ENV === 'production'
      ? [
          ["cssnano", {
            preset: 'advanced',
            // Remove all comments except those marked with /*!
            discardComments: {
              removeAll: true,
              removeAllButFirst: true,
            },
            // Merge identical rulesets
            mergeLonghand: true,
            // Collapse adjacent whitespace
            discardEmpty: true,
            // Minify gradients
            minifyGradients: true,
          }]
        ]
      : []),
  ],
};

export default config;
