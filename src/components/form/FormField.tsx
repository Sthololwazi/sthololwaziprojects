/**
 * Reusable form field components with accessibility and error handling
 */

import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface LabelProps {
  htmlFor: string;
  label: string;
  required?: boolean;
}

function FormLabel({ htmlFor, label, required }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2"
    >
      {label}
      {required && <span className="text-gold"> *</span>}
    </label>
  );
}

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
}

export function FormInput({
  label,
  error,
  helpText,
  className,
  id,
  required,
  "aria-describedby": ariaDescribedBy,
  ...props
}: FormInputProps) {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const helpId = helpText ? `${fieldId}-help` : undefined;
  const describedBy = [ariaDescribedBy, errorId, helpId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <FormLabel htmlFor={fieldId} label={label} required={required} />
      <input
        id={fieldId}
        aria-describedby={describedBy}
        aria-invalid={!!error}
        className={cn(
          "w-full bg-background border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest",
          error && "border-red-500",
          className,
        )}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}
      {helpText && (
        <p id={helpId} className="text-xs text-muted-foreground mt-1">
          {helpText}
        </p>
      )}
    </div>
  );
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
  placeholder?: string;
}

export function FormSelect({
  label,
  options,
  error,
  placeholder,
  className,
  id,
  required,
  "aria-describedby": ariaDescribedBy,
  ...props
}: FormSelectProps) {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [ariaDescribedBy, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <FormLabel htmlFor={fieldId} label={label} required={required} />
      <select
        id={fieldId}
        aria-describedby={describedBy}
        aria-invalid={!!error}
        className={cn(
          "w-full bg-background border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest",
          error && "border-red-500",
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helpText?: string;
}

export function FormTextarea({
  label,
  error,
  helpText,
  className,
  id,
  required,
  "aria-describedby": ariaDescribedBy,
  ...props
}: FormTextareaProps) {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const helpId = helpText ? `${fieldId}-help` : undefined;
  const describedBy = [ariaDescribedBy, errorId, helpId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <FormLabel htmlFor={fieldId} label={label} required={required} />
      <textarea
        id={fieldId}
        aria-describedby={describedBy}
        aria-invalid={!!error}
        className={cn(
          "w-full bg-background border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest resize-none",
          error && "border-red-500",
          className,
        )}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}
      {helpText && (
        <p id={helpId} className="text-xs text-muted-foreground mt-1">
          {helpText}
        </p>
      )}
    </div>
  );
}
