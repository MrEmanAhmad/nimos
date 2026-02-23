import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Plus, Minus, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function MenuItemModal({ item, optionGroups = [], onClose }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [specialNotes, setSpecialNotes] = useState('');
  const [addedAnimation, setAddedAnimation] = useState(false);
  const modalRef = useRef(null);

  // Initialize default selections
  useEffect(() => {
    if (!optionGroups.length) return;
    const defaults = {};
    optionGroups.forEach(group => {
      if (group.type === 'single') {
        const defaultChoice = group.choices?.find(c => c.default_selected);
        if (defaultChoice) {
          defaults[group.id] = [defaultChoice];
        }
      } else {
        const defaultChoices = (group.choices || []).filter(c => c.default_selected);
        if (defaultChoices.length) {
          defaults[group.id] = defaultChoices;
        }
      }
    });
    setSelectedOptions(defaults);
  }, [optionGroups]);

  // Close on Escape key & trap focus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll and focus first element when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    if (modalRef.current) {
      const firstFocusable = modalRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (firstFocusable) firstFocusable.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSingleSelect = useCallback((groupId, choice) => {
    setSelectedOptions(prev => ({
      ...prev,
      [groupId]: [choice],
    }));
  }, []);

  const handleMultiSelect = useCallback((groupId, choice, group) => {
    setSelectedOptions(prev => {
      const current = prev[groupId] || [];
      const isSelected = current.some(c => c.id === choice.id);

      if (isSelected) {
        // Deselect
        return {
          ...prev,
          [groupId]: current.filter(c => c.id !== choice.id),
        };
      } else {
        // Check max_select
        if (group.max_select && current.length >= group.max_select) {
          return prev;
        }
        return {
          ...prev,
          [groupId]: [...current, choice],
        };
      }
    });
  }, []);

  // Flatten selected options for cart
  const flattenedOptions = Object.entries(selectedOptions).flatMap(([groupId, choices]) =>
    choices.map(choice => ({
      groupId,
      choiceId: choice.id,
      name: choice.name,
      price: choice.price || 0,
    }))
  );

  // Calculate running total
  const optionsTotal = flattenedOptions.reduce((sum, opt) => sum + (opt.price || 0), 0);
  const itemTotal = ((item.price || 0) + optionsTotal) * quantity;

  // Validate required groups
  const isValid = optionGroups.every(group => {
    if (!group.required) return true;
    const selected = selectedOptions[group.id] || [];
    const minSelect = group.min_select || 1;
    return selected.length >= minSelect;
  });

  const handleAddToCart = () => {
    addItem(item, quantity, flattenedOptions, specialNotes);
    setAddedAnimation(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={`Customize ${item.name}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div ref={modalRef} className="relative w-full sm:max-w-lg max-h-[90vh] bg-[#1a1a2e] sm:rounded-2xl rounded-t-2xl border border-white/10 shadow-2xl flex flex-col animate-slideUp overflow-hidden">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-white/5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#a0a0a0] hover:text-white transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          <h2 className="text-xl font-bold text-white pr-10">{item.name}</h2>
          {item.description && (
            <p className="text-[#a0a0a0] text-sm mt-1 leading-relaxed">{item.description}</p>
          )}
          <p className="text-[#e94560] font-bold text-lg mt-2">
            &euro;{typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
          </p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Option Groups */}
          {optionGroups.map(group => (
            <div key={group.id}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
                  {group.name}
                </h3>
                <div className="flex items-center gap-2">
                  {group.required && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#e94560] bg-[#e94560]/10 px-2 py-0.5 rounded-full">
                      Required
                    </span>
                  )}
                  <span className="text-[10px] text-[#a0a0a0] uppercase tracking-wider">
                    {group.type === 'single' ? 'Choose 1' : `Choose ${group.min_select || 0}-${group.max_select || 'any'}`}
                  </span>
                </div>
              </div>

              <div className="space-y-2" role={group.type === 'single' ? 'radiogroup' : 'group'} aria-label={group.name}>
                {(group.choices || []).map(choice => {
                  const isSelected = (selectedOptions[group.id] || []).some(
                    c => c.id === choice.id
                  );

                  return (
                    <button
                      key={choice.id}
                      role={group.type === 'single' ? 'radio' : 'checkbox'}
                      aria-checked={isSelected}
                      onClick={() =>
                        group.type === 'single'
                          ? handleSingleSelect(group.id, choice)
                          : handleMultiSelect(group.id, choice, group)
                      }
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                        isSelected
                          ? 'border-[#e94560] bg-[#e94560]/10 text-white'
                          : 'border-white/5 bg-white/[0.02] text-[#e0e0e0] hover:border-white/15 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Radio / Checkbox indicator */}
                        <div
                          className={`w-5 h-5 rounded-${group.type === 'single' ? 'full' : 'md'} border-2 flex items-center justify-center transition-all duration-300 ${
                            isSelected
                              ? 'border-[#e94560] bg-[#e94560]'
                              : 'border-white/20'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm font-medium">{choice.name}</span>
                      </div>
                      {choice.price > 0 && (
                        <span className="text-[#f5a623] text-sm font-semibold">
                          +&euro;{choice.price.toFixed(2)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Special Notes */}
          <div>
            <label htmlFor="special-notes" className="block text-white font-semibold text-sm uppercase tracking-wider mb-2">
              Special Notes
            </label>
            <textarea
              id="special-notes"
              value={specialNotes}
              onChange={e => setSpecialNotes(e.target.value)}
              placeholder="Any special requests? (e.g., no onions, extra sauce)"
              rows={2}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-[#e0e0e0] placeholder-[#e0e0e0]/20 text-sm focus:outline-none focus:border-[#e94560]/50 transition-colors resize-none"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-white font-semibold text-sm uppercase tracking-wider mb-3">
              Quantity
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" aria-hidden="true" />
              </button>
              <span className="text-white font-bold text-lg w-8 text-center" aria-live="polite" aria-atomic="true">{quantity}</span>
              <button
                onClick={() => setQuantity(prev => Math.min(20, prev + 1))}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all duration-300"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer — Add to Cart */}
        <div className="p-6 pt-4 border-t border-white/5 bg-[#1a1a2e]">
          <button
            onClick={handleAddToCart}
            disabled={!isValid || addedAnimation}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
              addedAnimation
                ? 'bg-green-500 text-white scale-95'
                : isValid
                  ? 'bg-[#e94560] hover:bg-[#d13350] text-white shadow-lg shadow-[#e94560]/25 hover:shadow-[#e94560]/40 active:scale-[0.98]'
                  : 'bg-white/5 text-[#a0a0a0] cursor-not-allowed'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-5 h-5" />
                Added!
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                Add to Cart &mdash; &euro;{itemTotal.toFixed(2)}
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
}
