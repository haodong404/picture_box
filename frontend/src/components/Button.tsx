import { JSX } from "solid-js";

export default function Button(
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      {...props}
      class={`rounded-lg select-none px-4 py-2 border-none font-bold tracking-wider text-base transition ${props.class}`}
      classList={{
        "bg-blue-400 hover:bg-blue-300 hover:text-light-50 cursor-pointer text-light-50/95": !props.disabled,
        "bg-gray-200 cursor-not-allowed text-gray-400": props.disabled,
      }}
    />
  );
}
