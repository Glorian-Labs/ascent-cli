'use client';

import { useState } from 'react';
import { X, Loader2, CheckCircle, AlertCircle, Wallet, Shield } from 'lucide-react';
import { hireService, type Service } from '@/lib/api-v2';
import { useApp } from '@/context/AppContext';

interface HireModalProps {
  service: Service;
  onClose: () => void;
}

export default function HireModal({ service, onClose }: HireModalProps) {
  const { wallet, addNotification } = useApp();
  const [consumerName, setConsumerName] = useState(wallet.agentName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    payment_required?: { amount: string; asset: string; network: string };
    raw_header?: string;
    error?: string;
  } | null>(null);

  const priceUSDC = (parseInt(service.price) / 1000000).toFixed(2);

  const handleHire = async () => {
    if (!consumerName.trim()) {
      addNotification({ type: 'error', message: 'Please enter your agent name' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await hireService(service.id, consumerName);
      setResult({
        success: true,
        payment_required: response.payment_required,
        raw_header: response.raw_header,
      });
      addNotification({ 
        type: 'success', 
        message: `Payment requirements generated. Ready to sign.` 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initiate hire';
      setResult({ success: false, error: message });
      addNotification({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative glass-card w-full max-w-md p-6 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {!result ? (
          <>
            {/* Header */}
            <div className="mb-6">
              <h2 className="font-display text-xl font-bold mb-2">Hire Service</h2>
              <p className="text-text-secondary text-sm">
                You are about to hire this agent service
              </p>
            </div>

            {/* Service Info */}
            <div className="p-4 bg-white/5 rounded-lg mb-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{service.title}</h3>
                  <p className="text-sm text-text-secondary">{service.category}</p>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl font-bold text-accent-teal">
                    {priceUSDC} USDC
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-teal flex items-center justify-center text-xs font-bold">
                  {service.agent_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold">{service.agent_name}</div>
                  <div className={`text-xs ${
                    (service.aa_score || 0) >= 90 ? 'text-accent-gold' :
                    (service.aa_score || 0) >= 70 ? 'text-accent-teal' :
                    'text-text-secondary'
                  }`}>
                    AAIS {service.aa_score?.toFixed(1) || '50.0'} • {service.reputation_tier || 'Standard'}
                  </div>
                </div>
              </div>
            </div>

            {/* Consumer Name Input */}
            <div className="mb-6">
              <label className="block text-sm text-text-secondary mb-2">
                Your Agent Name
              </label>
              <input
                type="text"
                value={consumerName}
                onChange={(e) => setConsumerName(e.target.value)}
                placeholder="e.g., MyAgent"
                className="w-full px-4 py-3 bg-white/5 border border-border-subtle rounded-lg focus:outline-none focus:border-accent-teal"
              />
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-3 p-3 bg-accent-teal/10 border border-accent-teal/30 rounded-lg mb-6">
              <Shield className="text-accent-teal mt-0.5" size={18} />
              <div className="text-sm">
                <p className="text-accent-teal font-medium">x402 Payment Protocol</p>
                <p className="text-text-secondary mt-1">
                  This transaction uses trustless x402 payments. You'll need to sign a payment after initiating.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-white/5 rounded-lg text-text-secondary hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleHire}
                disabled={isLoading || !consumerName.trim()}
                className="flex-1 px-4 py-3 bg-accent-teal text-background font-semibold rounded-lg hover:bg-accent-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet size={18} />
                    Hire for {priceUSDC} USDC
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Result Screen */
          <div className="text-center py-6">
            {result.success ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="font-display text-xl font-bold mb-2">Payment Required</h2>
                <p className="text-text-secondary mb-6">
                  Sign and submit the x402 payment to complete this hire.
                </p>
                
                <div className="p-4 bg-white/5 rounded-lg mb-6 text-left">
                  <h3 className="text-sm font-semibold mb-2">Payment Details:</h3>
                  <div className="space-y-1 text-sm text-text-secondary">
                    <p>Amount: <span className="text-white">{(parseInt(result.payment_required?.amount || '0') / 1000000).toFixed(2)} USDC</span></p>
                    <p>Network: <span className="text-white">{result.payment_required?.network}</span></p>
                    <p>Asset: <span className="text-white">{result.payment_required?.asset?.slice(0, 12)}…</span></p>
                  </div>
                  {result.raw_header && (
                    <div className="mt-3">
                      <div className="text-xs text-text-secondary mb-1">PAYMENT-REQUIRED header (base64):</div>
                      <div className="text-xs font-mono break-all p-2 rounded bg-black/30 border border-white/10">
                        {result.raw_header}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="w-full px-4 py-3 bg-accent-teal text-background font-semibold rounded-lg hover:bg-accent-teal/90 transition-colors"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="font-display text-xl font-bold mb-2">Transaction Failed</h2>
                <p className="text-text-secondary mb-6">{result.error}</p>
                
                <button
                  onClick={() => setResult(null)}
                  className="w-full px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
