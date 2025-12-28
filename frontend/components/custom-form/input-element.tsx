import { useFormContext } from "react-hook-form"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/utils/zod"
import { JSX } from "react"

interface InputElementProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string  
  label?: string
  description?: string
  isOptional?: boolean
  inputClassName?: string
  labelClassName?: string,
  customElement?: JSX.Element
}

const InputElement: React.FC<InputElementProps> = ({ name, label, placeholder, description, isOptional, labelClassName, inputClassName, customElement, ...props }) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('', props.className)}>
          {label && (
            <FormLabel className={cn('', labelClassName)}>
              {label}
              {isOptional && (
                <span className="text-neutral-400"> (optional)</span>
              )}
            </FormLabel>
          )}
          <div className="relative">
            <FormControl>
              <Input
                {...field}
                placeholder={placeholder}
                className={cn('', inputClassName)}
                type={props.type || 'text'}
                disabled={props.disabled}
                value={props.value || field.value}
                autoComplete={props.autoComplete}
                onChange={(e) => {
                  field.onChange(e);
                  props.onChange?.(e);
                }}
              />
            </FormControl>
            {customElement}
          </div>
          {description && (
            <FormDescription>
              {description}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default InputElement