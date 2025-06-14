/**
 * Steam API Region Detection Test
 * Test specifically for Steam API region detection capabilities
 */

console.log('🧪 Steam API Region Detection Test Starting...');

// Configuration
const TEST_CONFIG = {
    STEAM_API_KEY: '', // Will be loaded from environment
    SERVER_IP: '177.54.144.181',
    SERVER_PORT: '27084',
    CORS_PROXY: 'https://api.allorigins.win/get?url='
};

// Test Steam API region detection
async function testSteamRegionDetection() {
    console.log('🎮 Testing Steam API for region detection...');
    
    try {
        // Build Steam API URL
        const steamApiUrl = `https://api.steampowered.com/IGameServersService/GetServerList/v1/?key=${TEST_CONFIG.STEAM_API_KEY}&filter=addr\\${TEST_CONFIG.SERVER_IP}:${TEST_CONFIG.SERVER_PORT}`;
        const proxyUrl = TEST_CONFIG.CORS_PROXY + encodeURIComponent(steamApiUrl);
        
        console.log('🌐 Steam API URL:', steamApiUrl);
        console.log('🔗 Proxy URL:', proxyUrl);
        
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📥 Raw Steam API response:', data);
        
        // Parse the actual API response
        const apiData = data.contents ? JSON.parse(data.contents) : data;
        console.log('📋 Parsed Steam API data:', apiData);
        
        if (apiData.response && apiData.response.servers && apiData.response.servers.length > 0) {
            const serverInfo = apiData.response.servers[0];
            console.log('🎯 Server info found:', serverInfo);
            
            // Analyze all fields for potential region information
            console.log('🔍 Analyzing server fields for region data...');
            const allFields = Object.keys(serverInfo);
            console.log('📋 Available fields:', allFields);
            
            allFields.forEach(field => {
                const value = serverInfo[field];
                console.log(`   ${field}: ${JSON.stringify(value)}`);
                
                // Check if this field might contain region information
                if (typeof value === 'string') {
                    const lowerValue = value.toLowerCase();
                    const regionKeywords = ['region', 'country', 'location', 'geo', 'datacenter', 'brazil', 'br', 'us', 'eu', 'asia'];
                    
                    for (const keyword of regionKeywords) {
                        if (lowerValue.includes(keyword)) {
                            console.log(`   🎯 Potential region field: ${field} = ${value}`);
                        }
                    }
                }
            });
            
            // Test region extraction
            console.log('🗺️ Testing region extraction...');
            const regionData = extractRegionData(serverInfo);
            console.log('✅ Extracted region data:', regionData);
            
        } else {
            console.warn('⚠️ No servers found in Steam API response');
        }
        
    } catch (error) {
        console.error('❌ Steam API test failed:', error);
    }
}

// Extract region data from server info
function extractRegionData(serverInfo) {
    const regionFields = [
        'region', 'country', 'location', 'geo', 'datacenter', 
        'server_region', 'game_server_region', 'addr', 'gameaddr',
        'name', 'hostname'
    ];
    
    let regionData = {};
    
    for (const field of regionFields) {
        if (serverInfo[field] !== undefined) {
            regionData[field] = serverInfo[field];
        }
    }
    
    return regionData;
}

// Test IP-based region detection as fallback
async function testIPRegionDetection() {
    console.log('🌍 Testing IP-based region detection...');
    
    const apis = [
        {
            name: 'ipapi.co',
            url: `${TEST_CONFIG.CORS_PROXY}${encodeURIComponent(`https://ipapi.co/${TEST_CONFIG.SERVER_IP}/json/`)}`
        },
        {
            name: 'ip-api.com',
            url: `http://ip-api.com/json/${TEST_CONFIG.SERVER_IP}?fields=country,countryCode,region,regionName,city,lat,lon`
        }
    ];
    
    for (const api of apis) {
        try {
            console.log(`📡 Testing ${api.name}...`);
            const response = await fetch(api.url);
            const data = await response.json();
            
            if (api.name === 'ipapi.co') {
                const actualData = data.contents ? JSON.parse(data.contents) : data;
                console.log(`✅ ${api.name} result:`, actualData);
            } else {
                console.log(`✅ ${api.name} result:`, data);
            }
            
        } catch (error) {
            console.error(`❌ ${api.name} failed:`, error);
        }
    }
}

// Run tests when the page loads
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Starting comprehensive region detection tests...');
    
    // Test 1: Steam API
    await testSteamRegionDetection();
    
    // Test 2: IP-based detection
    await testIPRegionDetection();
    
    console.log('✅ All region detection tests completed');
});

// Export for manual testing
window.testRegionDetection = {
    steam: testSteamRegionDetection,
    ip: testIPRegionDetection,
    all: async () => {
        await testSteamRegionDetection();
        await testIPRegionDetection();
    }
};

console.log('🧪 Steam region test loaded. Use window.testRegionDetection.all() to run tests manually.');
