/**
 * Test script to diagnose servers.html loading issues
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧪 Starting servers.html diagnostic test...');
    
    // Test 1: Check if required elements exist
    console.log('📋 Test 1: Checking required elements...');
    const requiredElements = [
        'server-region',
        'server-status-dot',
        'server-status-text',
        'server-map',
        'server-players',
        'server-mode',
        'server-latency',
        'server-address'
    ];
    
    let missingElements = [];
    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            missingElements.push(id);
            console.error(`❌ Missing element: ${id}`);
        } else {
            console.log(`✅ Found element: ${id}`);
        }
    });
    
    // Test 2: Check flag-icons CSS
    console.log('📋 Test 2: Checking flag-icons CSS...');
    const flagElement = document.querySelector('.fi');
    if (flagElement) {
        const computedStyle = window.getComputedStyle(flagElement);
        console.log('✅ Flag element found, computed style:', {
            display: computedStyle.display,
            width: computedStyle.width,
            height: computedStyle.height,
            backgroundImage: computedStyle.backgroundImage
        });
    } else {
        console.error('❌ No flag element (.fi) found');
    }
    
    // Test 3: Check if CS2ServerStatus is loaded
    console.log('📋 Test 3: Checking CS2ServerStatus...');
    if (window.cs2ServerStatus) {
        console.log('✅ CS2ServerStatus is available');
        console.log('📊 Server data:', window.cs2ServerStatus.serverData);
        console.log('⚙️ Config:', window.cs2ServerStatus.config);
    } else {
        console.error('❌ CS2ServerStatus not available');
    }
    
    // Test 4: Check for JavaScript errors
    console.log('📋 Test 4: Setting up error monitoring...');
    window.addEventListener('error', function(event) {
        console.error('🚨 JavaScript Error:', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
        });
    });
    
    // Test 5: Monitor network requests
    console.log('📋 Test 5: Monitoring network requests...');
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        console.log('🌐 Network request:', args[0]);
        return originalFetch.apply(this, args)
            .then(response => {
                console.log('📥 Response:', response.status, response.statusText, 'for', args[0]);
                return response;
            })
            .catch(error => {
                console.error('❌ Network error:', error, 'for', args[0]);
                throw error;
            });
    };
    
    // Test 6: Check CORS proxy availability
    console.log('📋 Test 6: Testing CORS proxy...');
    fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://httpbin.org/json'))
        .then(response => response.json())
        .then(data => {
            console.log('✅ CORS proxy working:', data);
        })
        .catch(error => {
            console.error('❌ CORS proxy failed:', error);
        });
    
    // Test 7: Summary
    setTimeout(() => {
        console.log('📋 Diagnostic Summary:');
        console.log(`Missing elements: ${missingElements.length > 0 ? missingElements.join(', ') : 'None'}`);
        console.log(`CS2ServerStatus loaded: ${window.cs2ServerStatus ? 'Yes' : 'No'}`);
        console.log('🧪 Diagnostic test completed');
    }, 3000);
});

// Export for console access
window.runServersPageDiagnostic = function() {
    console.log('🔧 Manual diagnostic triggered');
    // Re-run tests manually
    document.dispatchEvent(new Event('DOMContentLoaded'));
};

console.log('🧪 Servers page diagnostic script loaded. Run window.runServersPageDiagnostic() to test manually.');
