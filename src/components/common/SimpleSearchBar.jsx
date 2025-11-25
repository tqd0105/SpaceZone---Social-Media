import { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import './SimpleSearchBar.module.scss';

const SimpleSearchBar = ({
  placeholder = 'Search...',
  onSearch,
  value = '',
  debounceMs = 300,
  autoFocus = false
}) => {
  const [inputValue, setInputValue] = useState(value);
  const timeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Auto focus when component mounts
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Sync with external value prop
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]); // Only depend on value to avoid circular updates

  // Memoized debounced search function
  const debouncedSearch = useMemo(() => {
    return (searchTerm) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (onSearch) {
          onSearch(searchTerm);
        }
      }, debounceMs);
    };
  }, [onSearch, debounceMs]);

  // Handle input change with immediate state update and debounced search
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    debouncedSearch(newValue);
  };

  // Handle clear button
  const handleClear = () => {
    setInputValue('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (onSearch) {
      onSearch('');
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="simple-search-bar">
      <div className="simple-search-bar__container">
        <input
          ref={inputRef}
          type="text"
          className="simple-search-bar__input"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
        />
        
        {inputValue && (
          <button
            type="button"
            className="simple-search-bar__clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

SimpleSearchBar.propTypes = {
  placeholder: PropTypes.string,
  onSearch: PropTypes.func,
  value: PropTypes.string,
  debounceMs: PropTypes.number,
  autoFocus: PropTypes.bool
};

export default SimpleSearchBar;