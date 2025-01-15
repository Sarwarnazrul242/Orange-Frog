module.exports = function override(config, env) {
  config.ignoreWarnings = [
    {
      module: /html2pdf.js/, // Ignore warnings from html2pdf.js
    },
  ];

  return config;
};