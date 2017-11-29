let mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js('resources/assets/js/app.js', 'public/js');

mix
    .copy('node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.woff2', 'public/fonts')
    .copy('node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.woff', 'public/fonts')
    .copy('node_modules/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf', 'public/fonts')
    .copy('node_modules/font-awesome/fonts/fontawesome-webfont.woff2', 'public/fonts')
    .copy('node_modules/font-awesome/fonts/fontawesome-webfont.woff', 'public/fonts')
    .copy('node_modules/font-awesome/fonts/fontawesome-webfont.ttf', 'public/fonts')
    .styles([
        'node_modules/font-awesome/css/font-awesome.css',
        'node_modules/bootstrap/dist/css/bootstrap.css',
    ], 'public/css/app.css')
