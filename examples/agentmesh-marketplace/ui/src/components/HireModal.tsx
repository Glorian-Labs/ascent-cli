'use client';

import { useState } from 'react';
import { X, Loader2, CheckCircle, AlertCircle, Wallet, Shield, Zap } from 'lucide-react';
import { hireService, type Service } from '@/lib/api-v2';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface HireModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: {
    id: string | number;
    name: string;
    aa_score: number;
    reputation_tier: string;
    services?: Service[];
  };
}

export default function HireModal({ isOpen, onClose, agent }: HireModalProps) {
  const { wallet, addNotification } = useApp();
  const [consumerName, setConsumerName] = useState(wallet.agentName || '');
  const [selectedService, setSelectedService] = useState<Service | null>(agent.services?.[0] || null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    payment_required?: { amount: string; asset: string; network: string };
    raw_header?: string;
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  const priceUSDC = selectedService ? (parseInt(selectedService.price) / 1000000).toFixed(2) : '0';

  const handleHire = async () => {
    if (!consumerName.trim()) {
      addNotification({ type: 'error', message: 'Please enter your agent name' });
      return;
    }
    if (!selectedService) {
      addNotification({ type: 'error', message: 'Please select a service' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await hireService(selectedService.id, consumerName);
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

  const tierColor = agent.aa_score >= 90 ? '#ffaa00' : agent.aa_score >= 70 ? '#00f0ff' : '#b829dd';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-lg bg-[#141419] border border-[rgba(255,255,255,0.1)] p-0 overflow-hidden"
        style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00f0ff]/10 border border-[#00f0ff]/20">
              <Zap size={18} className="text-[#00f0ff]" />
            </div>
            <h2 className="font-display text-xl font-bold">Hire Agent</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8a8a9a] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {!result ? (
            <>
              {/* Agent Info */}
              <div className="p-4 bg-[#0a0a0f] border border-[rgba(255,255,255,0.06)] mb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14 rounded-none">
                    <AvatarFallback 
                      className="rounded-none text-lg font-bold"
                      style={{ 
                        background: `linear-gradient(135deg, ${tierColor}40, ${tierColor}20)`,
                        color: tierColor
                      }}
                    >
                      {agent.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-mono font-semibold">{agent.name}</h3>
                      <Badge 
                        variant="outline"
                        className="font-mono text-[0.65rem] uppercase"
                        style={{ 
                          background: `${tierColor}15`,
                          borderColor: `${tierColor}40`,
                          color: tierColor
                        }}
                      >
                        {agent.reputation_tier}
                      </Badge>
                    </div>
                    <div 
                      className="font-display text-2xl font-black"
                      style={{ color: tierColor }}
                    >
                      {agent.aa_score.toFixed(1)}
                      <span className="text-[0.65rem] text-[#5a5a6a] font-mono ml-1">AAIS</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Selection */}
              {agent.services && agent.services.length > 1 && (
                <div className="mb-6">
                  <label className="block text-[0.7rem] text-[#8a8a9a] font-mono uppercase tracking-wider mb-2">
                    Select Service
                  </label>
                  <div className="space-y-2">
                    {agent.services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => setSelectedService(service)}
                        className={`w-full p-3 text-left border transition-all ${
                          selectedService?.id === service.id
                            ? 'border-[#00f0ff] bg-[#00f0ff]/5'
                            : 'border-[rgba(255,255,255,0.06)] bg-[#0a0a0f] hover:border-[rgba(255,255,255,0.1)]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-mono text-sm">{service.title}</div>
                            <div className="text-xs text-[#5a5a6a]">{service.category}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-display text-lg font-bold text-[#00f0ff]">
                              {(parseInt(service.price) / 1000000).toFixed(2)}
                            </div>
                            <div className="text-[0.6rem] text-[#5a5a6a] font-mono">USDC</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Single Service Display */}
              {selectedService && agent.services?.length === 1 && (
                <div className="p-4 bg-[#0a0a0f] border border-[rgba(255,255,255,0.06)] mb-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-mono font-semibold">{selectedService.title}</h3>
                      <p className="text-sm text-[#8a8a9a]">{selectedService.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-2xl font-bold text-[#00f0ff]">
                        {priceUSDC}
                      </div>
                      <div className="text-[0.65rem] text-[#5a5a6a] font-mono">USDC</div>
                    </div>
                  </div>
                  {selectedService.description && (
                    <p className="text-sm text-[#8a8a9a] mt-2">{selectedService.description}</p>
                  )}
                </div>
              )}

              {/* Consumer Name Input */}
              <div className="mb-6">
                <label className="block text-[0.7rem] text-[#8a8a9a] font-mono uppercase tracking-wider mb-2">
                  Your Agent Name
                </label>
                <Input
                  type="text"
                  value={consumerName}
                  onChange={(e) => setConsumerName(e.target.value)}
                  placeholder="e.g., MyAgent"
                  className="bg-[#0a0a0f] border-[rgba(255,255,255,0.08)] text-white font-mono
                    focus:border-[#00f0ff] focus:ring-[#00f0ff]/20"
                />
              </div>

              {/* Info Box */}
              <div className="flex items-start gap-3 p-4 bg-[#00f0ff]/5 border border-[#00f0ff]/20 mb-6">
                <Shield className="text-[#00f0ff] mt-0.5" size={18} />
                <div className="text-sm">
                  <p className="text-[#00f0ff] font-mono font-medium mb-1">x402 Payment Protocol</p>
                  <p className="text-[#8a8a9a]">
                    This transaction uses trustless x402 payments. You'll need to sign a payment after initiating.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 py-5 bg-transparent border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.05)] font-mono"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleHire}
                  disabled={isLoading || !consumerName.trim() || !selectedService}
                  className="flex-1 py-5 bg-[#00f0ff] text-black hover:bg-[#00f0ff]/90 font-mono font-semibold disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wallet size={16} className="mr-2" />
                      Hire for {priceUSDC} USDC
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            /* Result Screen */
            <div className="text-center py-6">
              {result.success ? (
                <>
                  <div className="w-16 h-16 bg-[#39ff14]/10 border border-[#39ff14]/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-[#39ff14]" size={32} />
                  </div>
                  <h2 className="font-display text-xl font-bold mb-2">Payment Required</h2>
                  <p className="text-[#8a8a9a] font-mono text-sm mb-6">
                    Sign and submit the x402 payment to complete this hire.
                  </p>
                  
                  <div className="p-4 bg-[#0a0a0f] border border-[rgba(255,255,255,0.06)] mb-6 text-left">
                    <h3 className="text-sm font-mono font-semibold mb-3 text-[#00f0ff]">Payment Details</h3>
                    <div className="space-y-2 text-sm font-mono">
                      <div className="flex justify-between">
                        <span className="text-[#5a5a6a]">Amount:</span>
                        <span className="text-white">{(parseInt(result.payment_required?.amount || '0') / 1000000).toFixed(2)} USDC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5a5a6a]">Network:</span>
                        <span className="text-white">{result.payment_required?.network}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5a5a6a]">Asset:</span>
                        <span className="text-white">{result.payment_required?.asset?.slice(0, 16)}…</span>
                      </div>
                    </div>
                    {result.raw_header && (
                      <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                        <div className="text-[0.65rem] text-[#5a5a6a] font-mono uppercase tracking-wider mb-2">
                          PAYMENT-REQUIRED Header
                        </div>
                        <div className="text-xs font-mono break-all p-3 bg-[#020204] border border-[rgba(255,255,255,0.06)] text-[#8a8a9a]">
                          {result.raw_header}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={onClose}
                    className="w-full py-5 bg-[#00f0ff] text-black hover:bg-[#00f0ff]/90 font-mono font-semibold"
                  >
                    Done
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-[#ff006e]/10 border border-[#ff006e]/30 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="text-[#ff006e]" size={32} />
                  </div>
                  <h2 className="font-display text-xl font-bold mb-2">Transaction Failed</h2>
                  <p className="text-[#ff006e] font-mono text-sm mb-6">{result.error}</p>
                  
                  <Button
                    onClick={() => setResult(null)}
                    variant="outline"
                    className="w-full py-5 bg-transparent border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.05)] font-mono"
                  >
                    Try Again
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
