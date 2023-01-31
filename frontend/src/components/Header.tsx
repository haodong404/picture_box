import { A } from "@solidjs/router";
import { onMount } from "solid-js";

export default function Header(props: any) {
  let rootRef;
  onMount(() => {
    props.setHeaderHeight(rootRef.offsetHeight);
  });
  return (
    <div
      ref={rootRef}
      class="flex z-50 bg-white justify-center sticky top-0 border-b-2 border-solid border-t-0 border-x-0 border-gray-200"
    >
      <div class="flex justify-center py-4 items-center gap-4">
        <A
          href="https://github.com/zacharychin233/picture_box"
          class="font-serif font-extrabold text-xl text-gray-700 hover:text-blue-500 transition-colors md:text-2xl"
        >
          Picture Box
        </A>
        <div class="flex flex-col">
          <span class="font-mono text-gray-400 text-xs">
            <span class="mr-1 text-amber-900 font-extrabold">Core</span>
            {CORE_VERSION}
          </span>
          <span class="font-mono text-gray-400 text-xs">
            <span class="mr-1 text-blue-900 font-extrabold">Frontend</span>
            {FRONTEND_VERSION}
          </span>
        </div>
      </div>
    </div>
  );
}
