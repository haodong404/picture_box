import { JSX } from "solid-js";

export default function Input(
  props: JSX.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      class={`border-solid border-gray-200 rounded-lg focus:outline-blue-400 placeholder-gray-400 transition-all text-base px-4 py-2 ${props.class}`}
    />
  );
}
