"use client";

import {
  FieldError as FieldErrorPrimitive,
  FieldErrorProps,
  Label as LabelPrimitive,
  LabelProps,
  Text as TextPrimitive,
  TextProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";

const labelStyles = tv({
  base: "text-sm font-medium text-foreground",
});

const Label = (props: LabelProps) => {
  return (
    <LabelPrimitive
      {...props}
      className={labelStyles({
        className: props.className,
      })}
    />
  );
};

const descriptionStyles = tv({
  base: "text-sm text-muted-foreground",
});

const Description = (props: TextProps) => {
  return (
    <TextPrimitive
      {...props}
      slot="description"
      className={descriptionStyles({
        className: props.className,
      })}
    />
  );
};

const fieldErrorStyles = tv({
  base: "text-sm text-destructive",
});

const FieldError = (props: FieldErrorProps) => {
  return (
    <FieldErrorPrimitive
      {...props}
      className={fieldErrorStyles({
        className: props.className,
      })}
    />
  );
};

export { Label, Description, FieldError };
