const fs = require('fs');
const dns = require('dns');
const { execSync } = require('child_process');

const ServerLog = require('../../server/log');
const { getDirs, getFiles } = require('../../fs');

class AsmXPackageManager {
    static install(type, name, attribute = '--official') {
        const parameters = [type, name, attribute];

        if (parameters.length > 4) { 
            ServerLog.log("too many parameters", 'Exception');
            process.exit(1);
        }

        if ([type, name].includes(undefined)) {
            ServerLog.log("Not enough parameters\n", 'Exception');
            ServerLog.log("You need to write at least two parameters", 'Possible fixes');
            process.exit(1);
        }
        
        if (attribute) {
            if (!attribute.startsWith('--')) {
                ServerLog.log("The attribute is not marked\n", 'Exception');
                ServerLog.log("You need to use '--' at the beginning of the attribute", 'Possible fixes');
                process.exit(1);
            } else if (!['official', 'user'].includes(attribute.slice(2))) {
                ServerLog.log("Undefined attribute\n", 'Exception');
                ServerLog.log("You need to use one of these attributes (--official or --user)", 'Possible fixes');
                process.exit(1);
            }
        }
        
        if (!['box'].includes(type)) {
            ServerLog.log("undefined package type\n", 'Exception');
            ServerLog.log("You need to use one of these package type names (box)", 'Possible fixes');
            process.exit(1);
        }
        
        const BASE_URL = 'https://raw.githubusercontent.com/langprogramming-AsmX/packages/main/';
        let url;

        if (type == 'box') {
            try {
                url = `${BASE_URL}${attribute.slice(2)}/${name}`;
                const GITHUB_URL = 'https://api.github.com/repos/langprogramming-AsmX/packages/contents/packages';
                const PACKAGES_URL = '../packages';

                if (process.platform == 'win32') {
                    let response = execSync(`curl -X GET ${GITHUB_URL}`, { stdio: 'pipe' });
                    response = JSON.parse(response.toString('utf8'));

                    if (typeof response === 'object' && !Array.isArray(response)) {
                        ServerLog.log("Too many download requests.\n", 'Exception');
                        process.exit(1);
                    }

                    let typePackages = response.filter(page => page?.type == 'dir').map(page => page?.name);

                    if (!typePackages.includes(attribute.slice(2))) {
                        ServerLog.log("Incompatibility of package types.\n", 'Exception');
                        process.exit();
                    } else {
                        response = execSync(`curl -X GET ${GITHUB_URL}/${attribute.slice(2)}`, { stdio: 'pipe' });
                        response = JSON.parse(response.toString('utf8'));
                        let packages = response.map(package_t => package_t?.name);
                        
                        if (!packages.includes(name)) {
                            ServerLog.log("Non-existent package\n", 'Exception');
                            process.exit(1);
                        } else {
                            response = execSync(`curl -X GET ${GITHUB_URL}/${attribute.slice(2)}/${name}`, { stdio: 'pipe' });
                            response = JSON.parse(response.toString('utf8'));
                            response = response.map(cell_t => { return { href: cell_t.download_url, type: cell_t.type, name: cell_t?.name } });
                            
                            if (!fs.existsSync(PACKAGES_URL)) fs.mkdir(PACKAGES_URL, (e) => {});
                            
                            if (!fs.existsSync(`${PACKAGES_URL}/${name}`)) {
                                fs.mkdir(`${PACKAGES_URL}/${name}`, (e) => {});
                            } else {
                                ServerLog.log("This package exists\n", 'Exception');
                                process.exit(1);
                            }
                            
                            for (const cell_t of response) {
                                if (cell_t?.type && cell_t?.type == 'file') {
                                    response = execSync(`curl -X GET ${cell_t?.href} -i`); // { stdio: 'pipe' }
                                    response = response.toString('utf8');
                                    fs.writeFileSync(`${PACKAGES_URL}/${name}/${cell_t?.name}`, response, { encoding: 'utf8'});
                                } else if (cell_t?.type && cell_t?.type == 'dir') {
                                    
                                }
                            }
                        }
                    }
                }

            } catch (exception) {
                if (exception?.stderr) {
                    if (exception?.stderr.toString().indexOf('Could not resolve host: api.github.com') > -1)
                        ServerLog.log('Internet is not avaliable\n', 'Exception');
                    else if (exception?.stderr.toString().indexOf('Connection was reset') > -1)
                    ServerLog.log('Connection was reset\n', 'Exception');
                } 

                if (exception) {
                    dns.lookup('github.com', (except) => {
                        if (except && except.code === 'ENOTFOUND') 
                        console.log(`
                            \x1b[1F${Color.BRIGHT}[${Color.FG_RED}RequestException${Color.FG_WHITE}]: Internet is not avaliable ${Color.RESET}
                        `);
                    });

                    ServerLog.log('If you have an internet connection, you probably deleted your git account.\n', 'Possible fixes');
                }
            }
        }
    }


    static uninstall(type, name) {
        const parameters = [type, name];

        if (parameters.length > 3) { 
            ServerLog.log("too many parameters", 'Exception');
            process.exit(1);
        }

        if ([type, name].includes(undefined)) {
            ServerLog.log("Not enough parameters\n", 'Exception');
            ServerLog.log("You need to write at least two parameters", 'Possible fixes');
            process.exit(1);
        }

        if (!['box'].includes(type)) {
            ServerLog.log("undefined package type\n", 'Exception');
            ServerLog.log("You need to use one of these package type names (box)", 'Possible fixes');
            process.exit(1);
        }

        if (type == 'box') {
            try {
                const PACKAGES_URL = '../packages';

                if (!fs.existsSync(`${PACKAGES_URL}/${name}`)) {
                    ServerLog.log("This package non-exists\n", 'Exception');
                    process.exit(1);
                } else {
                    fs.rmSync(`${PACKAGES_URL}/${name}/`, { force: true, recursive: true });
                    ServerLog.log("Package deleted\n", 'Notify');
                }
            } catch (exception) {
                console.log(exception);
                ServerLog.log("An error has occurred\n", 'Exception');
            }
        }
    }


    static verify(type, name, attribute = '--strict') {
        const parameters = [type, name, attribute];
        let isVerify = false;

        if (parameters.length > 3) { 
            ServerLog.log("too many parameters", 'Exception');
            process.exit(1);
        }

        if ([type, name].includes(undefined)) {
            ServerLog.log("Not enough parameters\n", 'Exception');
            ServerLog.log("You need to write at least two parameters", 'Possible fixes');
            process.exit(1);
        }

        if (attribute) {
            if (!attribute.startsWith('--')) {
                ServerLog.log("The attribute is not marked\n", 'Exception');
                ServerLog.log("You need to use '--' at the beginning of the attribute", 'Possible fixes');
                process.exit(1);
            } else if (!['strict', 'ns'].includes(attribute.slice(2))) {
                ServerLog.log("Undefined attribute\n", 'Exception');
                ServerLog.log("You need to use one of these attributes (--strict or --ns)", 'Possible fixes');
                process.exit(1);
            }
        }
        
        if (!['box'].includes(type)) {
            ServerLog.log("undefined package type\n", 'Exception');
            ServerLog.log("You need to use one of these package type names (box)", 'Possible fixes');
            process.exit(1);
        }

        if (type == 'box') {
            try {
                const PACKAGES_URL = '../packages';

                if (!fs.existsSync(`${PACKAGES_URL}/${name}/`)) {
                    if (attribute == '--strict') {
                        ServerLog.log("This package non-exists\n", 'Exception');
                        process.exit(1);
                    } else if (attribute == '--ns') isVerify = false;
                } else {
                    let files = getFiles(`${PACKAGES_URL}/${name}`);

                    if (files.length != 0) {
                        if (files.includes('settings.json')) {
                            let settings = fs.readFileSync(`${PACKAGES_URL}/${name}/settings.json`);
                            settings = settings.toString('utf8');

                            if (settings.length == 0) {
                                if (attribute == '--strict') {
                                    ServerLog.log(`This empty file (${PACKAGES_URL}/${name}/settings.json)`, 'Exception');
                                    process.exit(1);
                                }
                            }

                            try {
                                settings = JSON.parse(settings);

                                if (Reflect.ownKeys(settings).length == 0) {
                                    if (attribute == '--strict') {
                                        ServerLog.log(`This empty file (${PACKAGES_URL}/${name}/settings.json)`, 'Exception');
                                        process.exit(1);
                                    }
                                } else {
                                    if (!Reflect.has(settings, 'type')) {
                                        if (attribute == '--strict') {
                                            ServerLog.log(`missing 'type' property (${PACKAGES_URL}/${name}/settings.json)`, 'Exception');
                                            process.exit(1);
                                        }
                                    } else {
                                        if (!['container', 'main'].includes(settings?.type)) {
                                            if (attribute == '--strict') {
                                                ServerLog.log(`invalid property name (${PACKAGES_URL}/${name}/settings.json)`, 'Exception');
                                                process.exit(1);
                                            }
                                        }
 
                                        if (settings?.type == 'main') {
                                            if (!Reflect.has(settings, 'main') || (Reflect.has(settings, 'main') && settings?.main == '')) {
                                                if (attribute == '--strict') {
                                                    ServerLog.log(`missing 'main' property (${PACKAGES_URL}/${name}/settings.json)`, 'Exception');
                                                    process.exit(1);
                                                }
                                            } else {
                                                if (fs.existsSync(`${PACKAGES_URL}/${name}/${settings.main}`)) isVerify = true;
                                            }
                                        }
                                    }
                                }
                            } catch {
                                if (attribute == '--strict') {
                                    ServerLog.log(`Invalid file (${PACKAGES_URL}/${name}/settings.json)`, 'Exception');
                                    process.exit(1);
                                }
                            }
                        }
                    }
                }
            } catch (exception) {
                // console.log(exception);
            }
        }

        return isVerify;
    }


    static __getPackageSettings(name) {
        const PACKAGES_URL = '../packages';
        if (fs.existsSync(`${PACKAGES_URL}/${name}/settings.json`)) return JSON.parse(fs.readFileSync(`${PACKAGES_URL}/${name}/settings.json`));
    }
}

module.exports = AsmXPackageManager;