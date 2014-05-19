/*jslint node: true*/

(function () {
    "use strict";

    var util = require("util");

    var npm = require("npm"),
        yargs = require("yargs");

    var args = yargs.argv._;

    if (args.length === 0) {
        console.error("Usage: node index.js <directory>");
        process.exit(1);
        return;
    }

    var prefix = args[0];

    npm.load({ "prefix": prefix }, function (err, npm) {
        npm.commands.ls([], true, function (err, packages) {
            if (err) {
                console.error(err);
                return;
            }

            var getMarkup = function (pkg, parsed) {
                parsed = parsed || {};

                var homepage = pkg.homepage || pkg.repository,
                    nameMarkup = homepage ? util.format("[%s](%s)", pkg.name, homepage) : pkg.name,
                    license = (typeof pkg.license === "object" && pkg.license.hasOwnProperty("type")) ?
                        (pkg.license.hasOwnProperty("url") ?
                            util.format("[%s](%s)", pkg.license.type, pkg.license.url) :
                            pkg.license.type) :
                        pkg.license,
                    licenseMarkup = license || "Unknown",
                    markup = " * " + nameMarkup + " - " + licenseMarkup;

                parsed[pkg.name] = markup;

                Object.keys(pkg.dependencies).forEach(function (dep) {
                    getMarkup(pkg.dependencies[dep], parsed);
                });

                return parsed;
            };

            var markup = getMarkup(packages);

            Object.keys(markup).sort().forEach(function (name) {
                console.log(markup[name]);
            });
        });
    });
}());