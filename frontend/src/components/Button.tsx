import { JSX } from "solid-js";

export default function Button(
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      {...props}
      class={`rounded-lg px-4 py-2 border-none font-bold bg-blue-400 text-blue-50 tracking-wider text-base cursor-pointer hover:bg-blue-300 hover:text-light-50 transition ${props.class}`}
    />
  );
}
