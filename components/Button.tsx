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
        fontFamily: "Fredoka One",
        fontSize: "24px",
        padding: "12px 18px",
        outline: "none",
        border: "none",
        borderRadius: 6,
        color: "white",
        background: buttonType === "secondary" ? "#ff6464" : "#515262",
        ...props.style,
      }}
    />
  );
}
