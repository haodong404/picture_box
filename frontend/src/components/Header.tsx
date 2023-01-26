import { A, useNavigate } from "@solidjs/router";
import { createEffect, createSignal, For } from "solid-js";

export default function Header() {
  const partitions = ["default", "b", "c", "d"];
  const [selection, setSelection] = createSignal(partitions[0]);
  const navigate = useNavigate();

  createEffect(() => {
    navigate(`/partitions/${selection()}`);
  });

  return (
    <div class="flex bg-white justify-center sticky top-0 border-b-2 border-solid border-t-0 border-x-0 border-gray-200">
      <div class="flex justify-center py-4 items-baseline gap-4">
        <A
          href="https://github.com/zacharychin233/picture_box"
          class="font-serif font-extrabold text-xl text-gray-700 hover:text-blue-500 transition-colors md:text-2xl"
        >
          Picture Box
        </A>
        <span class="font-mono text-gray-400">{APP_VERSION}</span>
      </div>
      <div class="absolute right-0 h-full flex items-center pr-4 gap-2">
        <select
          onChange={(event) => {
            setSelection((event.target as any).value);
          }}
          class="px-1 py-1form-select appearance-none
          font-mono block w-full px-3 py-0.5 text-base font-normal text-gray-700
      bg-white bg-clip-padding bg-no-repeat
      border border-solid border-gray-300
      rounded transition ease-in-out m-0
      focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
        >
          <For each={partitions}>
            {(partition) => <option>{partition}</option>}
          </For>
        </select>
      </div>
    </div>
  );
}
