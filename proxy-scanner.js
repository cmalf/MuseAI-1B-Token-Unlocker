const fs = require('fs').promises;
const { URL } = require('url');
const https = require('https');
const { SocksProxyAgent } = require('socks-proxy-agent');
const { HttpsProxyAgent } = require('https-proxy-agent');
const pLimit = require('p-limit');

const PROXY_FILE = 'proxy.txt';
const TARGET_URL = 'https://ipinfo.io/json';
const CONCURRENCY_LIMIT = 10;
const REQUEST_TIMEOUT = 15000;
const OUTPUT_US_FILE = 'US_proxy.txt';

const parseProxyString = (proxyString) => {
    try {
        const trimmedString = proxyString.trim();
        if (!trimmedString || trimmedString.startsWith('#')) {
            return null;
        }

        const proxyUrl = new URL(trimmedString);

        if (!proxyUrl.hostname || !proxyUrl.port || !proxyUrl.protocol) {
            console.warn(`⚠️ Invalid line (missing host, port, or protocol): ${proxyString}`);
            return null;
        }

        const protocol = proxyUrl.protocol.slice(0, -1).toLowerCase();
        const supportedProtocols = ['http', 'https', 'socks', 'socks4', 'socks5'];

        if (!supportedProtocols.includes(protocol)) {
            console.warn(`⚠️ Protocol not supported '${protocol}': ${proxyString}`);
            return null;
        }

        return {
            protocol: protocol,
            host: proxyUrl.hostname,
            port: parseInt(proxyUrl.port, 10),
            username: proxyUrl.username || undefined,
            password: proxyUrl.password || undefined,
        };
    } catch (error) {
        console.warn(`⚠️ Failed to parse proxy string '${proxyString}': ${error.message}`);
        return null;
    }
};

const createProxyAgent = (parsedProxy) => {
    const { protocol, host, port, username, password } = parsedProxy;

    const auth = (username || password) ? `${username || ''}:${password || ''}@` : '';
    const agentUrl = `${protocol}://${auth}${host}:${port}`;

    try {
        switch (protocol) {
            case 'http':
            case 'https':
                return new HttpsProxyAgent(agentUrl);
            case 'socks': 
            case 'socks4':
            case 'socks5':
                return new SocksProxyAgent(agentUrl);
            default:
                console.error(`❌ Protocol not supported for agent: ${protocol}`);
                return null;
        }
    } catch (error) {
         console.error(`❌ Failed to create agent for ${agentUrl}: ${error.message}`);
         return null;
    }
};

const checkProxy = (proxyString) => new Promise((resolve) => {
    const parsedProxy = parseProxyString(proxyString);
    if (!parsedProxy) {
        return resolve({ proxy: proxyString, status: 'Failed', error: 'Failed to parse or protocol not supported' });
    }

    const agent = createProxyAgent(parsedProxy);
     if (!agent) {
        return resolve({ proxy: proxyString, status: 'Failed', error: `Failed to create agent for protocol ${parsedProxy.protocol}` });
    }

    const req = https.get(TARGET_URL, {
        agent: agent,
        timeout: REQUEST_TIMEOUT 
    }, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            if (res.statusCode !== 200) {
                 let errorBody = data.length < 200 ? data : data.substring(0, 200) + '...';
                 return resolve({
                     proxy: proxyString,
                     status: 'Failed',
                     error: `Status code: ${res.statusCode}. Response: ${errorBody}`
                 });
            }
            try {
                const ipInfo = JSON.parse(data);
                const ip = ipInfo.ip;
                const country = ipInfo.country;
                const region = `${ipInfo.city || 'Unknown City'}, ${ipInfo.region || 'Unknown Region'}, ${country || 'Unknown Country'}`;
                
                resolve({ proxy: proxyString, status: 'Active', ip: ip, region: region, country: country });
            } catch (parseError) {
                const responseBody = data.length < 200 ? data : data.substring(0, 200) + '...';
                 resolve({ proxy: proxyString, status: 'Failed', error: `Failed to parse JSON response: ${parseError.message}. Body: ${responseBody}` });
            }
        });
    });

    req.on('error', (err) => {
        if (!req.aborted) {
           req.abort();
        }
        resolve({ proxy: proxyString, status: 'Failed', error: `Request error: ${err.message}` });
    });
});

const main = async () => {
    console.log('👻 Starting proxy scan...');
    console.log(`📚 Reading proxy list from file: ${PROXY_FILE}`);

    let proxyStrings = [];
    try {
        const fileContent = await fs.readFile(PROXY_FILE, 'utf8');
        proxyStrings = fileContent.split(/\r?\n/).filter(line => line.trim() && !line.trim().startsWith('#'));
        console.log(`✅ Found ${proxyStrings.length} proxies to check.`);
    } catch (error) {
        console.error(`❌ Failed to read file ${PROXY_FILE}: ${error.message}`);
        console.log('😢 Finished (with file read error).');
        process.exit(1); 
    }

    if (proxyStrings.length === 0) {
         console.log('ℹ️ proxy.txt is empty or contains only comments. Nothing to check.');
         console.log('😊 Finished.');
         return;
    }

    const limit = pLimit(CONCURRENCY_LIMIT);
    console.log(`⏳ Starting checks with concurrency limit of ${CONCURRENCY_LIMIT}...`);

    const checkPromises = proxyStrings.map(proxy => limit(() => checkProxy(proxy)));
    const results = await Promise.all(checkPromises);

    console.log('\n--- Scan Results ---');

    const activeCount = results.filter(r => r.status === 'Active').length;
    const failedCount = results.filter(r => r.status === 'Failed').length;

    results.forEach(result => {
        if (result.status === 'Active') {
            const flag = result.country === 'US' ? '🇺🇸' : '✅';
            console.log(`${flag} Active: ${result.proxy} -> IP: ${result.ip}, Region: ${result.region}`);
        } else {
            console.log(`❌ Failed: ${result.proxy} -> Error: ${result.error}`);
        }
    });

    console.log('\n--- Summary ---');
    console.log(`Total Proxies Checked: ${results.length}`);
    console.log(`Active: ${activeCount}`);
    console.log(`Failed: ${failedCount}`);

    const usProxies = results
        .filter(r => r.status === 'Active' && r.country === 'US')
        .map(r => r.proxy);

    if (usProxies.length > 0) {
        try {
            await fs.readFile(OUTPUT_US_FILE, 'utf8').catch(() => {});
            await fs.writeFile(OUTPUT_US_FILE, usProxies.join('\n'), 'utf8');
            console.log(`\n📁 Successfully filtered and saved ${usProxies.length} active US proxies to '${OUTPUT_US_FILE}'!`);
        } catch (error) {
            console.error(`\n❌ Failed to save file ${OUTPUT_US_FILE}: ${error.message}`);
        }
    } else {
        console.log(`\n🤷‍♂️ No active US proxies found to save.`);
    }

    console.log('\n😊 Scan finished!');
};

main();
