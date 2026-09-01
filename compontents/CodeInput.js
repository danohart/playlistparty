import { useRef } from "react";
import { FormControl } from "react-bootstrap";

// Boxed room-code entry from design 2a. The mock shows a 4-char alphanumeric
// code; Playlist Party rooms are 5-digit numeric, so this renders 5 numeric
// boxes and keeps that behaviour (auto-advance, backspace-to-previous, paste
// fills all, Enter submits when complete).
export default function CodeInput({
  value = "",
  onChange,
  onSubmit,
  length = 5,
  invalid = false,
  disabled = false,
}) {
  const refs = useRef([]);

  const chars = value.split("").slice(0, length);

  const setChar = (index, char) => {
    const next = value.split("");
    next[index] = char;
    // drop any gap past the last filled box
    const joined = next.join("").replace(/[^0-9]/g, "").slice(0, length);
    onChange(joined);
    return joined;
  };

  const focusBox = (index) => {
    const el = refs.current[index];
    if (el) el.focus();
  };

  const handleChange = (index, raw) => {
    const digit = (raw.match(/[0-9]/g) || []).pop();
    if (!digit) return;
    setChar(index, digit);
    if (index < length - 1) focusBox(index + 1);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[index]) {
        setChar(index, "");
      } else if (index > 0) {
        setChar(index - 1, "");
        focusBox(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusBox(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      focusBox(index + 1);
    } else if (e.key === "Enter") {
      if (value.length === length && onSubmit) onSubmit();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const digits = (e.clipboardData.getData("text").match(/[0-9]/g) || [])
      .slice(0, length)
      .join("");
    if (!digits) return;
    onChange(digits);
    focusBox(Math.min(digits.length, length - 1));
  };

  return (
    <div className={`pp-code${invalid ? " is-invalid" : ""}`}>
      {Array.from({ length }, (_, i) => (
        <FormControl
          key={i}
          size="lg"
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          aria-label={`Room code, digit ${i + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          value={chars[i] || ""}
          ref={(el) => (refs.current[i] = el)}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}
