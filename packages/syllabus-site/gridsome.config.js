const path = require("path");

function addStyleResource(rule) {
  rule
    .use("style-resource")
    .loader("style-resources-loader")
    .options({
      patterns: [
        path.resolve(__dirname, "./src/assets/_globals.scss"),
        path.resolve(__dirname, "./src/assets/*.scss")
      ]
    });
}

module.exports = {
  siteName: "Syllabus",
  siteDescription: "Better Syllabus for DHU",
  extends: ["prettier", "plugin:gridsome/recommended"],
  templates: {
    Course: "/course/:id",
    Teacher: "/teacher/:id",
    Category: "/category/:id",
    Field: "/field/:id",
    Year: "/year/:id"
  },
  chainWebpack(config) {
    const types = ["vue-modules", "vue", "normal-modules", "normal"];

    types.forEach(type => {
      addStyleResource(config.module.rule("scss").oneOf(type));
    });
  }
};
