import { button, darkGray, primary } from "./shared";
import { ButtonHTMLAttributes } from "react";

export default function Button(
  props: ButtonHTMLAttributes<HTMLButtonElement> & {
    buttonType?: "main" | "secondary";
  }
) {
  const { buttonType = "main" } = props;
  return (
    <button
      {...props}
      style={{
        ...button,
        padding: "10px 20px",
        outline: "none",
        border: "none",
        borderRadius: 50,
        color: props.disabled ? "#9c9c9c" : "white",
        cursor: props.disabled ? "not-allowed" : "pointer",
        background: props.disabled
          ? "#e0e0e0"
          : buttonType === "secondary"
          ? darkGray
          : primary,
        ...props.style,
      }}
    />
  );
}
