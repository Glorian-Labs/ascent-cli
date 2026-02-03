/**
 * Payment Requirements Resource
 * Access payment requirements for a URL
 */

async function handler(uri, { url }) {
  try {
    const decodedUrl = decodeURIComponent(url);
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    
    const initResponse = await fetch(decodedUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    });
    
    if (initResponse.status !== 402) {
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify({
            url: decodedUrl,
            protected: false,
            status: initResponse.status,
            message: 'Resource is not payment-protected or is freely accessible'
          }, null, 2)
        }]
      };
    }
    
    const paymentRequired = initResponse.headers.get('PAYMENT-REQUIRED');
    const requirements = JSON.parse(Buffer.from(paymentRequired, 'base64').toString());
    
    return {
      contents: [{
        uri: uri.href,
        mimeType: 'application/json',
        text: JSON.stringify({
          url: decodedUrl,
          protected: true,
          requirements: requirements.accepts,
          scheme: requirements.scheme,
          network: requirements.network
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      contents: [{
        uri: uri.href,
        mimeType: 'text/plain',
        text: `Error fetching payment requirements: ${error.message}`
      }]
    };
  }
}

module.exports = { name: 'payment-requirements', pattern: 'payment-requirements://{url}', handler };