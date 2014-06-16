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

            var getLicenseMarkup = function (license) {
                if (typeof license === "object" && license.hasOwnProperty("type")) {
                    return license.url ? util.format("[%s](%s)", license.type, license.url) : license.type;
                } else {
                    return license;
                }
            };

            var getLicensesMarkup = function (pkg) {
                if (pkg.licenses) {
                    return pkg.licenses.map(getLicenseMarkup).join(", ");
                } else if (pkg.license) {
                    return getLicenseMarkup(pkg.license);
                }
            };

            var getMarkup = function (pkg, parsed) {
                parsed = parsed || {};

                var homepage = pkg.homepage || pkg.repository,
                    nameMarkup = homepage ? util.format("[%s](%s)", pkg.name, homepage) : pkg.name,
                    licenseMarkup = getLicensesMarkup(pkg) || "Unknown",
                    versionMarkup = pkg.version ? "@" + pkg.version : "",
                    markup = " * " + nameMarkup + versionMarkup + " - " + licenseMarkup;

                parsed[pkg.name] = markup;

                Object.keys(pkg.dependencies || {}).forEach(function (dep) {
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