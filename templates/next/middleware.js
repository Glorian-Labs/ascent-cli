// Next.js x402 Middleware Template
import { paymentProxy } from "@rvk_rishikesh/next";
import { x402ResourceServer, HTTPFacilitatorClient } from "@rvk_rishikesh/core/server";
import { ExactAptosScheme } from "@rvk_rishikesh/aptos/exact/server";

const PAY_TO_ADDRESS = process.env.PAYMENT_RECIPIENT_ADDRESS;
const FACILITATOR_URL = process.env.FACILITATOR_URL || "https://x402-navy.vercel.app/facilitator/";

// Initialize facilitator
const facilitator = new HTTPFacilitatorClient({ url: FACILITATOR_URL });

// Setup Aptos scheme with USDC
const aptosScheme = new ExactAptosScheme();
aptosScheme.registerMoneyParser(async (amount, network) => {
  const decimals = 6; // USDC decimals
  const atomicAmount = BigInt(Math.round(amount * Math.pow(10, decimals))).toString();
  return {
    amount: atomicAmount,
    asset: "0x69091fbab5f7d635ee7ac5098cf0c1efbe31d68fec0f2cd565e8d168daf52832",
    extra: { symbol: "USDC" }
  };
});

// Create server
const resourceServer = new x402ResourceServer([facilitator])
  .register("aptos:2", aptosScheme);

// Define protected routes
const routes = {
  "/api/paid": {
    accepts: [{
      scheme: "exact",
      payTo: PAY_TO_ADDRESS,
      price: "0.01",
      network: "aptos:2"
    }],
    description: "Paid API endpoint",
    mimeType: "application/json"
  }
};

// Create proxy
const proxy = paymentProxy(routes, resourceServer);

// Middleware
export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  if (path.startsWith('/api/paid')) {
    return await proxy(request);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/paid/:path*"]
};
