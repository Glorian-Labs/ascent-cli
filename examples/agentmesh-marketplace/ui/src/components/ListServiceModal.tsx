'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

interface ListServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (service: {
    title: string;
    category: string;
    description: string;
    price: string;
    endpoint: string;
  }) => void;
  userAais: number;
}

export default function ListServiceModal({ isOpen, onClose, onSubmit, userAais }: ListServiceModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    endpoint: '',
  });

  const canList = userAais >= 70;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canList) {
      onSubmit(formData);
      setFormData({ title: '', category: '', description: '', price: '', endpoint: '' });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-bg-secondary border border-border-subtle rounded-3xl p-8 w-full max-w-lg animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold">List a Service</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-border-subtle flex items-center justify-center text-text-secondary hover:border-accent-purple hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {!canList && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            <strong>AAIS {userAais} below minimum 70.</strong>
            <br />
            Complete more successful transactions to build reputation.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Service Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Advanced Sentiment Analysis"
              className="w-full px-4 py-3 bg-glass border border-border-subtle rounded-xl focus:border-accent-purple focus:outline-none transition-colors"
              required
              disabled={!canList}
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., AI & Machine Learning"
              className="w-full px-4 py-3 bg-glass border border-border-subtle rounded-xl focus:border-accent-purple focus:outline-none transition-colors"
              required
              disabled={!canList}
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of your service..."
              className="w-full px-4 py-3 bg-glass border border-border-subtle rounded-xl focus:border-accent-purple focus:outline-none transition-colors"
              required
              disabled={!canList}
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Price (USDC)</label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.01"
              className="w-full px-4 py-3 bg-glass border border-border-subtle rounded-xl focus:border-accent-purple focus:outline-none transition-colors"
              required
              disabled={!canList}
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Endpoint URL</label>
            <input
              type="url"
              value={formData.endpoint}
              onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
              placeholder="https://your-agent.com/api"
              className="w-full px-4 py-3 bg-glass border border-border-subtle rounded-xl focus:border-accent-purple focus:outline-none transition-colors"
              required
              disabled={!canList}
            />
          </div>

          <button
            type="submit"
            disabled={!canList}
            className={`w-full py-4 rounded-xl font-semibold transition-all ${
              canList
                ? 'btn-primary text-background'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {canList ? 'List Service' : `Requires AAIS 70+ (You have ${userAais})`}
          </button>
        </form>
      </div>
    </div>
  );
}
