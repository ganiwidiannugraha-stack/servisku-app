import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  onChange: (start: string, end: string) => void;
}

const PRESETS = [
  { label: 'Today', getRange: () => {
      const d = new Date(); return [d, d];
  }},
  { label: 'Yesterday', getRange: () => {
      const d = new Date(); d.setDate(d.getDate() - 1); return [d, d];
  }},
  { label: 'This Week', getRange: () => {
      const end = new Date();
      const start = new Date(end);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      return [start, end];
  }},
  { label: 'Last 7 Days', getRange: () => {
      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      return [start, end];
  }},
  { label: 'Last 28 Days', getRange: () => {
      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - 27);
      return [start, end];
  }},
  { label: 'This Month', getRange: () => {
      const end = new Date();
      const start = new Date(end.getFullYear(), end.getMonth(), 1);
      return [start, end];
  }},
  { label: 'Last Month', getRange: () => {
      const d = new Date();
      const start = new Date(d.getFullYear(), d.getMonth() - 1, 1);
      const end = new Date(d.getFullYear(), d.getMonth(), 0);
      return [start, end];
  }},
  { label: 'This Year', getRange: () => {
      const end = new Date();
      const start = new Date(end.getFullYear(), 0, 1);
      return [start, end];
  }},
];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // State for the calendar view (which month is being shown)
  const [viewDate, setViewDate] = useState(new Date(endDate));

  // Selection state for calendar clicks
  const [tempStart, setTempStart] = useState<Date | null>(start);
  const [tempEnd, setTempEnd] = useState<Date | null>(end);
  const [activePreset, setActivePreset] = useState<string | null>('This Month');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update temp state when props change
  useEffect(() => {
    setTempStart(new Date(startDate));
    setTempEnd(new Date(endDate));
  }, [startDate, endDate]);

  const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = date.toLocaleString('en-US', { month: 'short' });
    const y = date.getFullYear();
    return `${d} ${m} ${y}`;
  };

  const toYMD = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().split('T')[0];
  };

  const generateCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Padding empty days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handleDayClick = (day: Date) => {
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(day);
      setTempEnd(null);
      setActivePreset(null);
    } else {
      if (day < tempStart) {
        setTempStart(day);
        setTempEnd(null);
      } else {
        setTempEnd(day);
        onChange(toYMD(tempStart), toYMD(day));
        setIsOpen(false);
      }
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    const [s, e] = preset.getRange();
    setTempStart(s);
    setTempEnd(e);
    onChange(toYMD(s), toYMD(e));
    setViewDate(e);
    setActivePreset(preset.label);
  };

  const isDaySelected = (day: Date) => {
    if (!tempStart) return false;
    const ymd = toYMD(day);
    if (ymd === toYMD(tempStart)) return true;
    if (tempEnd && ymd === toYMD(tempEnd)) return true;
    return false;
  };

  const isDayInRange = (day: Date) => {
    if (!tempStart || !tempEnd) return false;
    return day > tempStart && day < tempEnd;
  };

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const days = generateCalendarDays();
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <CalendarIcon size={16} className="text-gray-700" strokeWidth={2.5} />
        <span>{formatDate(start)} - {formatDate(end)}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 lg:left-0 lg:right-auto mt-2 z-50 bg-white border border-gray-100 rounded-xl shadow-xl flex flex-col md:flex-row overflow-hidden min-w-[max-content]">
          
          {/* Left Panel: Presets */}
          <div className="w-full md:w-40 bg-white border-b md:border-b-0 md:border-r border-gray-100 py-3 space-y-0.5">
            {PRESETS.map(preset => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className={`w-full text-left px-5 py-2 text-sm transition-colors ${
                  activePreset === preset.label 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-600 hover:bg-blue-50/50 hover:text-blue-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Right Panel: Calendar */}
          <div className="p-5 w-[280px]">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <ChevronLeft size={18} />
              </button>
              <div className="text-sm font-medium text-gray-800">
                {viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-y-2 text-center mb-3">
              {weekDays.map(wd => (
                <div key={wd} className="text-[13px] text-gray-400">{wd}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1 place-items-center">
              {days.map((day, i) => {
                if (!day) return <div key={i} className="h-8 w-full" />;
                
                const ymd = toYMD(day);
                const isStart = tempStart && ymd === toYMD(tempStart);
                const isEnd = tempEnd && ymd === toYMD(tempEnd);
                const isSelected = isStart || isEnd;
                const inRange = isDayInRange(day);
                const isToday = ymd === toYMD(new Date());

                let wrapperClass = "relative w-full h-8 flex items-center justify-center ";
                if (inRange) {
                  wrapperClass += "bg-gray-100";
                } else if (isStart && tempEnd && day < tempEnd) {
                  wrapperClass += "bg-gradient-to-r from-transparent via-gray-100 to-gray-100";
                } else if (isEnd && tempStart && day > tempStart) {
                  wrapperClass += "bg-gradient-to-l from-transparent via-gray-100 to-gray-100";
                }

                let btnClass = "relative h-8 w-8 rounded-full text-[13px] flex items-center justify-center transition-all cursor-pointer ";
                
                if (isSelected) {
                  btnClass += "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30";
                } else if (inRange) {
                  btnClass += "text-gray-900";
                } else {
                  btnClass += "text-gray-700 hover:bg-gray-100";
                  if (isToday) btnClass += " font-bold text-blue-600";
                }

                return (
                  <div key={i} className={wrapperClass}>
                    <button
                      type="button"
                      onClick={() => handleDayClick(day)}
                      className={btnClass}
                    >
                      {day.getDate()}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
