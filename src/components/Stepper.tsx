interface StepperProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export default function Stepper({ value, onChange, min = 0, max = 999, step = 1 }: StepperProps) {
  return (
    <div className="stepper">
      <button className="stepper-btn" onClick={() => onChange(Math.max(min, Math.round((+(parseFloat(String(value)) || 0) - step) * 100) / 100))}>−</button>
      <input type="number" value={value} min={min} max={max} step={step} onChange={e => onChange(parseFloat(e.target.value) || 0)} />
      <button className="stepper-btn" onClick={() => onChange(Math.min(max, Math.round((+(parseFloat(String(value)) || 0) + step) * 100) / 100))}>+</button>
    </div>
  );
}
