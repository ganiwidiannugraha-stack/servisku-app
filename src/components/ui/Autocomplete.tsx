import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

interface AutocompleteProps {
  name: string;
  options: string[];
  placeholder?: string;
  required?: boolean;
  className?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (val: string) => void;
  id?: string;
  emptyMessage?: string | null;
  label?: string;
  leftIcon?: React.ReactNode;
  error?: string;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
  name,
  options,
  placeholder,
  required,
  className = '',
  defaultValue = '',
  value,
  onChange,
  id,
  emptyMessage,
  label,
  leftIcon,
  error
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const displayValue = value !== undefined ? value : internalValue;
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter options based on current value
  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(displayValue.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full mb-4">
      {label && (
        <label htmlFor={id} className="block mb-1 text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative" ref={wrapperRef}>
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 z-10">
              {leftIcon}
            </div>
          )}
          <input
            id={id}
            name={name}
            type="text"
            value={displayValue}
            onChange={(e) => {
              const val = e.target.value;
              setInternalValue(val);
              if (onChange) onChange(val);
              setIsOpen(true);
            }}
            onFocus={() => {
              setIsFocused(true);
              setIsOpen(true);
            }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Escape') {
                setIsOpen(false);
              }
            }}
            required={required}
            placeholder={placeholder}
            className={`w-full p-2 pr-8 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              leftIcon ? 'pl-10' : ''
            } ${
              error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : isFocused ? 'border-blue-400 bg-white' : 'border-gray-300 bg-white'
            } ${className}`}
            autoComplete="new-password"
          />
          <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          tabIndex={-1}
        >
          <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (filteredOptions.length > 0 || (displayValue.length > 0 && emptyMessage !== null)) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden py-1 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setInternalValue(opt);
                  if (onChange) onChange(opt);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors focus:bg-blue-50 focus:outline-none"
              >
                {opt}
              </button>
            ))
          ) : emptyMessage !== null ? (
            <div className="px-4 py-3 text-sm text-gray-500 italic">
              {emptyMessage || `Tekan Enter untuk menambah "${displayValue}"`}
            </div>
          ) : null}
        </div>
      )}
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
        <AlertCircle size={14} className="inline mr-1" />
        {error}
      </p>
    )}
    </div>
  );
};
