
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  id: string;
  type?: 'text' | 'email' | 'tel' | 'textarea';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  className?: string;
  rows?: number;
}

const FormField = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required,
  className,
  rows
}: FormFieldProps) => {
  const hasError = !!error;

  return (
    <div className="space-y-2">
      <Label 
        htmlFor={id} 
        className={cn(
          "text-large font-semibold",
          hasError && "text-destructive"
        )}
      >
        {label} {required && '*'}
      </Label>
      
      {type === 'textarea' ? (
        <Textarea
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={cn(
            "text-large min-h-32",
            hasError && "border-destructive focus-visible:ring-destructive",
            className
          )}
          rows={rows}
          required={required}
        />
      ) : (
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={cn(
            "text-large",
            hasError && "border-destructive focus-visible:ring-destructive",
            className
          )}
          required={required}
        />
      )}
      
      {hasError && (
        <p className="text-sm text-destructive font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
