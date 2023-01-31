import { children, JSX } from "solid-js";

export default function Card(
  props: JSX.CustomAttributes<HTMLDivElement> & {
    children?: any;
    class?: string;
  }
) {
  const c = children(() => props.children);
  return (
    <div
      {...props}
      class={`border-2 border-solid border bg-light-50 rounded-lg border-gray-200 shadow-gray-200 shadow-md p-4 ${props.class}`}
    >
      {c()}
    </div>
  );
}
