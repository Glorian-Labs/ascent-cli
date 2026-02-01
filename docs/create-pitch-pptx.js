const pptxgen = require('pptxgenjs');
const html2pptx = require('./html2pptx');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = '/home/hebx/clawd/hackathons/canteen-x402/ascent-cli/docs';
const SLIDES_DIR = path.join(OUTPUT_DIR, 'slides');

// Color palette
const PURPLE = '9A4DFF';
const TEAL = '00F5FF';
const DARK = '0a0a0f';
const DARKER = '050508';
const LIGHT = 'f0f0f5';
const GRAY = '6b6b7b';

async function createGradientBackgrounds() {
    console.log('Creating gradient backgrounds...');
    
    // Slide 1: Purple gradient background
    const slide1Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="810">
        <defs>
            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#050508"/>
                <stop offset="50%" style="stop-color:#1a0a2e"/>
                <stop offset="100%" style="stop-color:#0a0a0f"/>
            </linearGradient>
            <radialGradient id="r1" cx="30%" cy="70%" r="50%">
                <stop offset="0%" style="stop-color:#9A4DFF;stop-opacity:0.15"/>
                <stop offset="100%" style="stop-color:#9A4DFF;stop-opacity:0"/>
            </radialGradient>
            <radialGradient id="r2" cx="70%" cy="30%" r="50%">
                <stop offset="0%" style="stop-color:#00F5FF;stop-opacity:0.1"/>
                <stop offset="100%" style="stop-color:#00F5FF;stop-opacity:0"/>
            </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g1)"/>
        <rect width="100%" height="100%" fill="url(#r1)"/>
        <rect width="100%" height="100%" fill="url(#r2)"/>
    </svg>`;
    
    // Slide 2: Dark with noise texture
    const slide2Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="810">
        <rect width="100%" height="100%" fill="#0a0a0f"/>
    </svg>`;
    
    // Slide 3: Dark gradient
    const slide3Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="810">
        <defs>
            <linearGradient id="g3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#0a0a0f"/>
                <stop offset="100%" style="stop-color:#0f0a1a"/>
            </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g3)"/>
    </svg>`;
    
    // Slide 4: Dark solid
    const slide4Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="810">
        <rect width="100%" height="100%" fill="#050508"/>
    </svg>`;
    
    // Slide 5: Dark purple gradient
    const slide5Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="810">
        <defs>
            <linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#0a0a0f"/>
                <stop offset="100%" style="stop-color:#0f0818"/>
            </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g5)"/>
    </svg>`;
    
    // Slide 6: Dark with noise
    const slide6Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="810">
        <rect width="100%" height="100%" fill="#0a0a0f"/>
    </svg>`;
    
    // Slide 7: Purple gradient (same as slide 1)
    const slide7Svg = slide1Svg;
    
    const backgrounds = [
        { svg: slide1Svg, file: 'bg-slide1.png' },
        { svg: slide2Svg, file: 'bg-slide2.png' },
        { svg: slide3Svg, file: 'bg-slide3.png' },
        { svg: slide4Svg, file: 'bg-slide4.png' },
        { svg: slide5Svg, file: 'bg-slide5.png' },
        { svg: slide6Svg, file: 'bg-slide6.png' },
        { svg: slide7Svg, file: 'bg-slide7.png' },
    ];
    
    for (const bg of backgrounds) {
        await sharp(Buffer.from(bg.svg))
            .png()
            .toFile(path.join(SLIDES_DIR, bg.file));
    }
    
    console.log('Gradient backgrounds created!');
}

async function createSlideHTML() {
    console.log('Creating HTML slides...');
    
    // Ensure slides directory exists
    if (!fs.existsSync(SLIDES_DIR)) {
        fs.mkdirSync(SLIDES_DIR, { recursive: true });
    }
    
    // Slide 1: Title
    const slide1 = `<!DOCTYPE html>
<html>
<head>
<style>
html { background: #ffffff; }
body {
    width: 720pt; height: 405pt; margin: 0; padding: 0;
    background-image: url('bg-slide1.png');
    background-size: cover;
    font-family: Arial, sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.logo {
    font-family: 'Courier New', monospace;
    font-size: 18pt;
    font-weight: bold;
    color: ${TEAL};
    letter-spacing: 0.3em;
    margin-bottom: 30pt;
}
h1 {
    font-size: 42pt;
    font-weight: bold;
    text-align: center;
    color: ${LIGHT};
    line-height: 1.2;
    margin-bottom: 20pt;
}
.gradient-text {
    color: ${PURPLE};
}
.tagline {
    font-size: 14pt;
    color: ${GRAY};
    text-align: center;
    max-width: 400pt;
}
.event-badge {
    position: absolute;
    bottom: 30pt;
    font-family: 'Courier New', monospace;
    font-size: 10pt;
    color: ${GRAY};
    border: 1pt solid ${GRAY};
    padding: 8pt 15pt;
    border-radius: 50pt;
}
</style>
</head>
<body>
<p class="logo">ASCENT</p>
<h1>The <span class="gradient-text">Forge</span> for<br>Agent Commerce</h1>
<p class="tagline">A developer CLI for scaffolding autonomous agents with native x402 payment rails on Aptos</p>
<p class="event-badge">Canteen × Aptos × x402 Hackathon 2026</p>
</body>
</html>`;

    // Slide 2: Problem
    const slide2 = `<!DOCTYPE html>
<html>
<head>
<style>
html { background: #ffffff; }
body {
    width: 720pt; height: 405pt; margin: 0; padding: 0;
    background-image: url('bg-slide2.png');
    background-size: cover;
    font-family: Arial, sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.slide-number {
    position: absolute;
    top: 20pt;
    left: 30pt;
    font-family: 'Courier New', monospace;
    font-size: 10pt;
    color: ${PURPLE};
    font-weight: bold;
}
h2 {
    font-size: 28pt;
    font-weight: bold;
    color: ${LIGHT};
    margin-bottom: 30pt;
}
.gradient-text { color: ${PURPLE}; }
.problem-grid {
    display: flex;
    gap: 20pt;
    max-width: 650pt;
}
.problem-card {
    background: rgba(255,255,255,0.02);
    border: 1pt solid rgba(255,255,255,0.05);
    padding: 20pt;
    border-radius: 10pt;
    flex: 1;
}
.problem-card h3 {
    font-size: 14pt;
    color: ${LIGHT};
    margin-bottom: 10pt;
}
.problem-card p {
    color: ${GRAY};
    font-size: 10pt;
    line-height: 1.5;
}
.icon {
    font-size: 24pt;
    margin-bottom: 10pt;
}
</style>
</head>
<body>
<p class="slide-number">01 / PROBLEM</p>
<h2>The Agent Economy Has a <span class="gradient-text">Payment Gap</span></h2>
<div class="problem-grid">
    <div class="problem-card">
        <p class="icon">&#128273;</p>
        <h3>API Key Hell</h3>
        <p>Agents require manual credential management. No native way to pay per request at the protocol layer.</p>
    </div>
    <div class="problem-card">
        <p class="icon">&#128202;</p>
        <h3>Billing Complexity</h3>
        <p>Monthly subscriptions don't fit micro-transactions. Agents need millisecond-fast, per-call payments.</p>
    </div>
    <div class="problem-card">
        <p class="icon">&#129302;</p>
        <h3>No Trust Layer</h3>
        <p>Autonomous agents can't verify counterparty reputation before transacting. Commerce requires trust.</p>
    </div>
</div>
</body>
</html>`;

    // Slide 3: Solution
    const slide3 = `<!DOCTYPE html>
<html>
<head>
<style>
html { background: #ffffff; }
body {
    width: 720pt; height: 405pt; margin: 0; padding: 0;
    background-image: url('bg-slide3.png');
    background-size: cover;
    font-family: Arial, sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.slide-number {
    position: absolute;
    top: 20pt;
    left: 30pt;
    font-family: 'Courier New', monospace;
    font-size: 10pt;
    color: ${PURPLE};
    font-weight: bold;
}
.content {
    display: flex;
    padding: 40pt;
    gap: 30pt;
}
.solution-text { flex: 1; }
.solution-text h2 {
    font-size: 28pt;
    font-weight: bold;
    color: ${LIGHT};
    margin-bottom: 15pt;
}
.gradient-text { color: ${TEAL}; }
.solution-text > p {
    font-size: 12pt;
    color: ${GRAY};
    line-height: 1.6;
    margin-bottom: 15pt;
}
.feature-list {
    list-style: none;
    padding: 0;
    margin: 0;
}
.feature-list li {
    color: ${LIGHT};
    font-size: 11pt;
    margin-bottom: 8pt;
    padding-left: 15pt;
}
.feature-list li::before {
    content: '>';
    color: ${TEAL};
    margin-right: 8pt;
}
.terminal {
    flex: 1;
    background: #0d0d12;
    border-radius: 10pt;
    border: 1pt solid rgba(154,77,255,0.2);
    overflow: hidden;
}
.terminal-header {
    background: rgba(255,255,255,0.03);
    padding: 10pt 15pt;
    display: flex;
    gap: 5pt;
    border-bottom: 1pt solid rgba(255,255,255,0.05);
}
.dot { width: 8pt; height: 8pt; border-radius: 50%; }
.dot.red { background: #ff5f56; }
.dot.yellow { background: #ffbd2e; }
.dot.green { background: #27c93f; }
.terminal-body {
    padding: 15pt;
    font-family: 'Courier New', monospace;
    font-size: 8pt;
    line-height: 1.6;
    color: #a0a0b0;
}
.cmd { color: ${TEAL}; }
.success { color: #27c93f; }
.highlight { color: ${PURPLE}; }
</style>
</head>
<body>
<p class="slide-number">02 / SOLUTION</p>
<div class="content">
    <div class="solution-text">
        <h2>Introducing <span class="gradient-text">Ascent CLI</span></h2>
        <p>The first developer tool that forges autonomous agents with native x402 payment rails. One command. Complete ecosystem. Production-ready.</p>
        <ul class="feature-list">
            <li>Zero-config project scaffolding</li>
            <li>Interactive setup wizard</li>
            <li>Multi-wallet stress testing</li>
            <li>Real-time analytics dashboard</li>
            <li>Agent reputation system (AAIS)</li>
            <li>Move module generation</li>
        </ul>
    </div>
    <div class="terminal">
        <div class="terminal-header">
            <div class="dot red"></div>
            <div class="dot yellow"></div>
            <div class="dot green"></div>
        </div>
        <div class="terminal-body">
            <p><span class="highlight">$</span> <span class="cmd">ascent init my-agent --template express</span></p>
            <p style="margin-top: 10pt;"><span class="success">&#10003;</span> Express template selected<br><span class="success">&#10003;</span> Interactive configuration<br><span class="success">&#10003;</span> Dependencies installed<br><span class="success">&#10003;</span> Environment configured</p>
            <p style="margin-top: 10pt;"><span class="highlight">$</span> <span class="cmd">cd my-agent && ascent dev</span></p>
            <p style="margin-top: 10pt;">&#128293; <span class="highlight">Development environment starting...</span><br><span class="success">&#10003;</span> Local facilitator on port 4022<br><span class="success">&#10003;</span> Agent server on port 3006</p>
        </div>
    </div>
</div>
</body>
</html>`;

    // Slide 4: Demo
    const slide4 = `<!DOCTYPE html>
<html>
<head>
<style>
html { background: #ffffff; }
body {
    width: 720pt; height: 405pt; margin: 0; padding: 0;
    background-image: url('bg-slide4.png');
    background-size: cover;
    font-family: Arial, sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.slide-number {
    position: absolute;
    top: 20pt;
    left: 30pt;
    font-family: 'Courier New', monospace;
    font-size: 10pt;
    color: ${PURPLE};
    font-weight: bold;
}
h2 {
    font-size: 28pt;
    font-weight: bold;
    color: ${LIGHT};
    margin-bottom: 15pt;
}
.gradient-text { color: ${TEAL}; }
.demo-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12pt;
    max-width: 650pt;
    justify-content: center;
}
.demo-card {
    background: rgba(154,77,255,0.05);
    border: 1pt solid rgba(154,77,255,0.2);
    border-radius: 10pt;
    padding: 12pt;
    width: 300pt;
}
.demo-card h3 {
    font-size: 11pt;
    color: ${LIGHT};
    margin: 0 0 8pt 0;
}
.demo-card pre {
    font-family: 'Courier New', monospace;
    font-size: 7pt;
    background: rgba(0,0,0,0.3);
    padding: 8pt;
    border-radius: 5pt;
    color: #b0b0c0;
    line-height: 1.3;
    margin: 0;
}
</style>
</head>
<body>
<p class="slide-number">03 / DEMO</p>
<h2>E2E Validated <span class="gradient-text">Commerce Flow</span></h2>
<div class="demo-grid">
    <div class="demo-card">
        <h3>One Command Setup</h3>
        <pre>Interactive wizard guides you through template selection, network configuration, facilitator setup, and environment auto-configuration. Zero to deployed in 60 seconds.</pre>
    </div>
    <div class="demo-card">
        <h3>Multi-Wallet Testing</h3>
        <pre>$ ascent test --all-wallets
Wallet 1-5: OK FORGED 0.01 USDC each
Success Rate: 100%</pre>
    </div>
    <div class="demo-card">
        <h3>Live Dashboard</h3>
        <pre>Real-time analytics at localhost:3456 including transaction volume, agent reputation scores, payment flow visualization, and performance metrics.</pre>
    </div>
    <div class="demo-card">
        <h3>Move Generation</h3>
        <pre>$ ascent move generate-verify
Generates ready-to-deploy Aptos Move modules for on-chain payment verification. Bridging Web2 frameworks with Web3 settlement.</pre>
    </div>
</div>
</body>
</html>`;

    // Slide 5: Architecture
    const slide5 = `<!DOCTYPE html>
<html>
<head>
<style>
html { background: #ffffff; }
body {
    width: 720pt; height: 405pt; margin: 0; padding: 0;
    background-image: url('bg-slide5.png');
    background-size: cover;
    font-family: Arial, sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.slide-number {
    position: absolute;
    top: 20pt;
    left: 30pt;
    font-family: 'Courier New', monospace;
    font-size: 10pt;
    color: ${PURPLE};
    font-weight: bold;
}
h2 {
    font-size: 28pt;
    font-weight: bold;
    color: ${LIGHT};
    margin-bottom: 30pt;
}
.gradient-text { color: ${TEAL}; }
.flow-diagram {
    display: flex;
    align-items: center;
    gap: 15pt;
    margin-bottom: 30pt;
}
.flow-node {
    background: rgba(255,255,255,0.03);
    border: 1pt solid rgba(154,77,255,0.3);
    padding: 15pt 20pt;
    border-radius: 8pt;
    text-align: center;
    min-width: 100pt;
}
.flow-node h4 {
    font-size: 10pt;
    color: ${LIGHT};
    margin: 0 0 5pt 0;
}
.flow-node p {
    font-size: 8pt;
    color: ${GRAY};
    margin: 0;
}
.flow-arrow {
    font-size: 18pt;
    color: ${TEAL};
}
.tech-stack {
    display: flex;
    gap: 8pt;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 500pt;
}
.tech-badge {
    background: rgba(154,77,255,0.1);
    border: 1pt solid rgba(154,77,255,0.3);
    padding: 5pt 12pt;
    border-radius: 50pt;
    font-family: 'Courier New', monospace;
    font-size: 8pt;
    color: ${LIGHT};
}
</style>
</head>
<body>
<p class="slide-number">04 / ARCHITECTURE</p>
<h2>x402 Protocol <span class="gradient-text">Integration</span></h2>
<div class="flow-diagram">
    <div class="flow-node">
        <h4>&#129302; Agent Client</h4>
        <p>Signs transactions<br>Aptos SDK</p>
    </div>
    <p class="flow-arrow">&#8594;</p>
    <div class="flow-node">
        <h4>&#9889; x402 Middleware</h4>
        <p>402 Challenge<br>Payment Headers</p>
    </div>
    <p class="flow-arrow">&#8594;</p>
    <div class="flow-node">
        <h4>&#128269; Facilitator</h4>
        <p>Verify & Settle<br>Aptos Testnet</p>
    </div>
    <p class="flow-arrow">&#8594;</p>
    <div class="flow-node">
        <h4>&#9989; Access Granted</h4>
        <p>Protected Resource<br>Agent Service</p>
    </div>
</div>
<div class="tech-stack">
    <p class="tech-badge">Aptos SDK</p>
    <p class="tech-badge">x402 Protocol</p>
    <p class="tech-badge">Node.js</p>
    <p class="tech-badge">Express.js</p>
    <p class="tech-badge">SQLite</p>
    <p class="tech-badge">Move</p>
    <p class="tech-badge">USDC</p>
    <p class="tech-badge">Testnet</p>
</div>
</body>
</html>`;

    // Slide 6: Traction
    const slide6 = `<!DOCTYPE html>
<html>
<head>
<style>
html { background: #ffffff; }
body {
    width: 720pt; height: 405pt; margin: 0; padding: 0;
    background-image: url('bg-slide6.png');
    background-size: cover;
    font-family: Arial, sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.slide-number {
    position: absolute;
    top: 20pt;
    left: 30pt;
    font-family: 'Courier New', monospace;
    font-size: 10pt;
    color: ${PURPLE};
    font-weight: bold;
}
h2 {
    font-size: 28pt;
    font-weight: bold;
    color: ${LIGHT};
    margin-bottom: 30pt;
}
.gradient-text { color: ${TEAL}; }
.stats-grid {
    display: flex;
    gap: 30pt;
    margin-bottom: 30pt;
}
.stat-card {
    text-align: center;
    padding: 15pt;
}
.stat-number {
    font-size: 36pt;
    font-weight: bold;
    color: ${PURPLE};
    line-height: 1;
    margin-bottom: 5pt;
}
.stat-label {
    font-size: 10pt;
    color: ${GRAY};
    font-family: 'Courier New', monospace;
}
.achievement-banner {
    padding: 12pt 25pt;
    background: linear-gradient(90deg, rgba(154,77,255,0.1), rgba(0,245,255,0.1));
    border: 1pt solid rgba(154,77,255,0.3);
    border-radius: 50pt;
    display: flex;
    align-items: center;
    gap: 10pt;
}
.achievement-banner p {
    font-size: 12pt;
    color: ${LIGHT};
    margin: 0;
}
</style>
</head>
<body>
<p class="slide-number">05 / TRACTION</p>
<h2>Hackathon <span class="gradient-text">Achievements</span></h2>
<div class="stats-grid">
    <div class="stat-card">
        <p class="stat-number">6</p>
        <p class="stat-label">Core Commands</p>
    </div>
    <div class="stat-card">
        <p class="stat-number">5</p>
        <p class="stat-label">Test Wallets</p>
    </div>
    <div class="stat-card">
        <p class="stat-number">100%</p>
        <p class="stat-label">E2E Validated</p>
    </div>
    <div class="stat-card">
        <p class="stat-number">2</p>
        <p class="stat-label">Easter Eggs Found</p>
    </div>
</div>
<div class="achievement-banner">
    <p>&#127942;</p>
    <p><b>GOLDEN-COOKIE-X402-9F3A</b> &nbsp;|&nbsp; <b>X402 IS MAGIC</b></p>
    <p>&#127942;</p>
</div>
</body>
</html>`;

    // Slide 7: Closing
    const slide7 = `<!DOCTYPE html>
<html>
<head>
<style>
html { background: #ffffff; }
body {
    width: 720pt; height: 405pt; margin: 0; padding: 0;
    background-image: url('bg-slide7.png');
    background-size: cover;
    font-family: Arial, sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.cta-container {
    text-align: center;
}
.cta-container h2 {
    font-size: 36pt;
    font-weight: bold;
    color: ${LIGHT};
    margin-bottom: 15pt;
}
.gradient-text { color: ${TEAL}; }
.cta-container > p {
    font-size: 14pt;
    color: ${GRAY};
    margin-bottom: 25pt;
    max-width: 400pt;
}
.github-btn {
    display: inline-flex;
    align-items: center;
    gap: 8pt;
    background: linear-gradient(135deg, #${PURPLE}, #${TEAL});
    color: ${DARKER};
    padding: 12pt 25pt;
    border-radius: 50pt;
    font-weight: bold;
    font-size: 12pt;
    text-decoration: none;
}
.footer-note {
    position: absolute;
    bottom: 20pt;
    font-family: 'Courier New', monospace;
    font-size: 9pt;
    color: ${GRAY};
}
</style>
</head>
<body>
<div class="cta-container">
    <h2>Ready to <span class="gradient-text">Forge</span>?</h2>
    <p>Ascent CLI is open source, production-ready, and waiting for your agents. Welcome to the future of autonomous commerce.</p>
    <div class="github-btn">
        <p>&#128187; github.com/Hebx/ascent-cli</p>
    </div>
</div>
<p class="footer-note">Built with &#128156; by Ihab Heb for the Canteen × Aptos × x402 Hackathon 2026</p>
</body>
</html>`;

    const slides = [
        { html: slide1, file: 'slide1.html' },
        { html: slide2, file: 'slide2.html' },
        { html: slide3, file: 'slide3.html' },
        { html: slide4, file: 'slide4.html' },
        { html: slide5, file: 'slide5.html' },
        { html: slide6, file: 'slide6.html' },
        { html: slide7, file: 'slide7.html' },
    ];
    
    for (const slide of slides) {
        fs.writeFileSync(path.join(SLIDES_DIR, slide.file), slide.html);
    }
    
    console.log('HTML slides created!');
}

async function createPresentation() {
    console.log('Creating PowerPoint presentation...');
    
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = 'Ihab Heb';
    pptx.title = 'Ascent CLI - Pitch Deck';
    pptx.subject = 'The Forge for Agent Commerce';
    
    // Process each slide
    for (let i = 1; i <= 7; i++) {
        console.log(`Processing slide ${i}...`);
        const htmlFile = path.join(SLIDES_DIR, `slide${i}.html`);
        await html2pptx(htmlFile, pptx);
    }
    
    // Save presentation
    const outputFile = path.join(OUTPUT_DIR, 'ascent-cli-pitch.pptx');
    await pptx.writeFile({ fileName: outputFile });
    console.log(`Presentation saved to: ${outputFile}`);
}

async function main() {
    try {
        // Save html2pptx.js locally
        const html2pptxPath = path.join(OUTPUT_DIR, 'html2pptx.js');
        if (!fs.existsSync(html2pptxPath)) {
            console.log('Downloading html2pptx.js...');
            const response = await fetch('https://raw.githubusercontent.com/anthropics/skills/main/skills/pptx/scripts/html2pptx.js');
            const content = await response.text();
            fs.writeFileSync(html2pptxPath, content);
        }
        
        await createGradientBackgrounds();
        await createSlideHTML();
        await createPresentation();
        
        console.log('Done! Pitch deck created successfully.');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
