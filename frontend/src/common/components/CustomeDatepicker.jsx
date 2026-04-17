import { format } from "date-fns";
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@pages/components/ui/popover";
import { Calendar } from "@pages/components/ui/calendar";
import { useEffect, useState } from "react";

const CustomDatePicker = ({
  label,
  value,
  onChange,
  error,
  disableFuture = false,
  pickerType = "date", // date | range | year | month
}) => {
  const [open, setOpen] = useState(false);

  const [date, setDate] = useState(() => {
    if (pickerType === "range") {
      return {
        from: value?.from ? new Date(value.from) : null,
        to: value?.to ? new Date(value.to) : null,
      };
    }
    return value ? new Date(value) : null;
  });

  const [startYear, setStartYear] = useState(new Date().getFullYear());

  // 🔄 Sync external value
  useEffect(() => {
    if (pickerType === "range") {
      setDate({
        from: value?.from ? new Date(value.from) : null,
        to: value?.to ? new Date(value.to) : null,
      });
    } else {
      setDate(value ? new Date(value) : null);
    }
  }, [value, pickerType]);

  // ✅ Handle Select
  const handleSelect = (selected) => {
    if (!selected) return;

    if (pickerType === "year") {
      const year = selected.getFullYear();
      const firstDay = new Date(year, 0, 1);
      setDate(firstDay);
      onChange?.(year);
      setOpen(false);
      return;
    }

    if (pickerType === "month") {
      setDate(selected);
      onChange?.({
        month: selected.getMonth() + 1,
        year: selected.getFullYear(),
      });
      setOpen(false);
      return;
    }

    if (pickerType === "range") {
      setDate(selected);
      onChange?.(selected);

      if (selected?.from && selected?.to) {
        if (selected.from.getTime() !== selected.to.getTime()) {
          setOpen(false);
        }
      }
      return;
    }

    // single date
    setDate(selected);
    onChange?.(selected);
    setOpen(false);
  };

  // ❌ Clear
  const handleClear = () => {
    if (pickerType === "range") {
      const cleared = { from: null, to: null };
      setDate(cleared);
      onChange?.(cleared);
    } else {
      setDate(null);
      onChange?.(null);
    }
  };

  // 🧠 Display value
  const displayValue = () => {
    if (pickerType === "range") {
      if (!date?.from) return "Pick date range";
      if (!date?.to) return `${format(date.from, "PPP")} - ...`;
      return `${format(date.from, "PPP")} - ${format(date.to, "PPP")}`;
    }

    if (!date) {
      if (pickerType === "year") return "Year";
      if (pickerType === "month") return "Month";
      return "Pick a date";
    }

    if (pickerType === "year") return format(date, "yyyy");
    if (pickerType === "month") return format(date, "MMM yyyy");

    return format(date, "PPP");
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1 text-sm font-normal text-textblack">
          {label}
        </label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative cursor-pointer" onClick={() => setOpen(true)}>
            <CalendarIcon
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <div className="flex items-center justify-between border border-gray-300 rounded-md pl-9 pr-3 py-2 bg-white shadow-sm">
              <span
                className={`text-sm ${
                  date && (pickerType !== "range" || date?.from)
                    ? "text-black"
                    : "text-gray-400"
                }`}
              >
                {displayValue()}
              </span>

              {(pickerType === "range" ? date?.from || date?.to : date) && (
                <X
                  size={16}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="text-gray-400 hover:text-red_text cursor-pointer"
                />
              )}
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-64 p-4" align="start">
          {/* YEAR / MONTH PICKER */}
          {pickerType === "year" || pickerType === "month" ? (
            <>
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <ChevronLeft
                  className="cursor-pointer"
                  onClick={() =>
                    setStartYear((prev) =>
                      pickerType === "year" ? prev - 9 : prev - 1
                    )
                  }
                />
                <span className="text-sm font-medium">
                  {pickerType === "year"
                    ? `${startYear} - ${startYear + 8}`
                    : startYear}
                </span>
                <ChevronRight
                  className="cursor-pointer"
                  onClick={() =>
                    setStartYear((prev) =>
                      pickerType === "year" ? prev + 9 : prev + 1
                    )
                  }
                />
              </div>

              {/* Year Grid */}
              {pickerType === "year" ? (
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 9 }, (_, i) => {
                    const year = startYear + i;
                    return (
                      <div
                        key={year}
                        onClick={() => {
                          const selectedDate = new Date(year, 0, 1);
                          setDate(selectedDate);
                          onChange?.(year);
                          setOpen(false);
                        }}
                        className={`px-3 py-2 text-sm rounded-md cursor-pointer text-center
                          ${
                            date?.getFullYear?.() === year
                              ? "bg-primary text-white"
                              : "hover:bg-gray-100"
                          }`}
                      >
                        {year}
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Month Grid
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 12 }, (_, i) => {
                    const monthDate = new Date(startYear, i, 1);
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          setDate(monthDate);
                          onChange?.({
                            month: i + 1,
                            year: startYear,
                          });
                          setOpen(false);
                        }}
                        className={`px-3 py-2 text-sm rounded-md cursor-pointer text-center
                          ${
                            date &&
                            date.getMonth() === i &&
                            date.getFullYear() === startYear
                              ? "bg-primary text-white"
                              : "hover:bg-gray-100"
                          }`}
                      >
                        {format(monthDate, "MMM")}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            // Default Calendar (date / range)
            <Calendar
              mode={pickerType === "range" ? "range" : "single"}
              selected={date}
              onSelect={handleSelect}
              defaultMonth={
                pickerType === "range"
                  ? date?.from || new Date()
                  : date || new Date()
              }
              disabled={
                disableFuture
                  ? (d) => d > new Date()
                  : undefined
              }
            />
          )}
        </PopoverContent>
      </Popover>

      {error && <p className="mt-1 text-xs text-red_text">{error}</p>}
    </div>
  );
};

export default CustomDatePicker;