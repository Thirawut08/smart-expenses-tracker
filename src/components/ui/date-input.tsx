"use client";

import {
  DateField as DateFieldPrimitive,
  DateFieldProps as DateFieldPrimitiveProps,
  DateInput as DateInputPrimitive,
  DateInputProps,
  DateSegment as DateSegmentPrimitive,
  DateSegmentProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";

const dateInputStyles = tv({
  base: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
});

const DateInput = ({ className, ...props }: DateInputProps) => {
  return (
    <DateInputPrimitive
      className={dateInputStyles({
        className,
      })}
      {...props}
    />
  );
};

const dateSegmentStyles = tv({
  base: "group rounded-md p-0.5 caret-transparent type-literal:px-0 focus:bg-primary focus:text-primary-foreground focus:outline-none",
});

const DateSegment = ({ className, ...props }: DateSegmentProps) => {
  return (
    <DateSegmentPrimitive
      className={dateSegmentStyles({
        className,
      })}
      {...props}
    />
  );
};

export { DateFieldPrimitive as DateField, DateInput, DateSegment };
