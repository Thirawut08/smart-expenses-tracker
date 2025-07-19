"use client";

import {
  TimeField as TimeFieldPrimitive,
  TimeFieldProps as TimeFieldPrimitiveProps,
  DateField as DateFieldPrimitive,
  DateInput as DateInputPrimitive,
} from "react-aria-components";
import { TimeValue } from "react-aria";
import { tv } from "tailwind-variants";
import { DateInput, DateSegment } from "./date-input";
import { Description, FieldError, Label } from "./field";

const timeFieldStyles = tv({
  slots: {
    root: "flex flex-col gap-2",
    input: "flex items-center",
  },
});

interface TimeFieldProps<T extends TimeValue>
  extends TimeFieldPrimitiveProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string;
}

function TimeField<T extends TimeValue>({
  label,
  description,
  errorMessage,
  ...props
}: TimeFieldProps<T>) {
  const { root, input } = timeFieldStyles();
  return (
    <TimeFieldPrimitive
      {...props}
      className={root({
        className: props.className,
      })}
    >
      <Label>{label}</Label>
      <DateInput className={input()}>
        {(segment) => <DateSegment segment={segment} />}
      </DateInput>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </TimeFieldPrimitive>
  );
}

export {
  TimeField,
  DateFieldPrimitive as DateField,
  DateInputPrimitive as DateInput,
};
