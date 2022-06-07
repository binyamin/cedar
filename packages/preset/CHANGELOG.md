# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## 0.1.0 - 2022-06-07

### Added
- Add nunjucks plugin
	- Added an option to load nunjucks global data files from a given folder, including JS files
	- Allow user to specify a folder with includes, partials, macros, etc., to ignore when building
	- Pass some cedar-specific global data
- Add postcss plugin, with two PostCSS plugins: [postcss-import](https://github.com/postcss/postcss-import/), and [postcss-csso](https://github.com/lahmatiy/postcss-csso).
- Add esbuild plugin, with shortcuts for minifying, bundling, and writing sourcemaps
