const userscriptInfo = require('./package.json');

const userscript_config = {
    'name': 'SO Plagiarism Case Manager',
    'description': userscriptInfo.description,
    'homepage': userscriptInfo.repository.homepage,
    'author': userscriptInfo.author,
    'version': userscriptInfo.version,
    'downloadURL': userscriptInfo.repository.dist_url,
    'updateURL': userscriptInfo.repository.dist_url,
    'match': [
        '*://stackoverflow.com/questions/*',
        '*://stackoverflow.com/users/*',
        '*://stackoverflow.com/users'
    ],
    'exclude': [
        '*://stackoverflow.com/users/edit/*',
        '*://stackoverflow.com/users/delete/*',
        '*://stackoverflow.com/users/email/*',
        '*://stackoverflow.com/users/tag-notifications/*',
        '*://stackoverflow.com/users/preferences/*',
        '*://stackoverflow.com/users/hidecommunities/*',
        '*://stackoverflow.com/users/my-collectives/*',
        '*://stackoverflow.com/users/teams/*',
        '*://stackoverflow.com/users/mylogins/*',
        '*://stackoverflow.com/users/apps/*',
        '*://stackoverflow.com/users/flag-summary/*',
        '*://stackoverflow.com/users/message/*',
    ],
    'grant': ['GM_getValue', 'GM_setValue', 'GM_deleteValue']
}

const globals = ['$', 'StackExchange'];


module.exports = {
    buildTamperMonkeyPreamble: () => {
        let preamble = ['// ==UserScript=='];

        let acc = [];
        let maxKeyLength = 0;
        Object.entries(userscript_config).forEach(([key, value]) => {
            if (value instanceof Array) {
                value.forEach(v => acc.push([key, v]));
            } else {
                acc.push([key, value]);
            }
            if (key.length > maxKeyLength) {
                maxKeyLength = key.length;
            }
        });
        acc.forEach(([key, value]) => {
            preamble.push(`// @${key.padEnd(maxKeyLength)} ${value}`);
        })

        if (globals.length > 0) {
            preamble.push('// ==/UserScript==');
            preamble.push(`/* globals ${globals.join(', ')} */`);
        }
        preamble.push('\n');
        return preamble.join('\n');
    }
};