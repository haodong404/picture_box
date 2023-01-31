import { A } from "@solidjs/router";
import { createSignal, For, lazy, onMount } from "solid-js";
import Viewer from "viewerjs";
import "viewerjs/dist/viewer.css";
import { Scheme } from "../api/models";

function ResolveItem(props: any) {
  return (
    <div class="px-2 pb-1 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
      <A
        href={props.url}
        class="text-blue-900 text-xs font-bold inline-block"
        target="_blank"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {props.resolve}
      </A>
    </div>
  );
}

export default function PictureCard(props: { scheme: Scheme }) {
  let image;
  const [viewer, setViewer] = createSignal<Viewer>();
  onMount(() => {
    setViewer(
      new Viewer(image, {
        url() {
          return props.scheme.pictures["origin"];
        },
      })
    );
  });
  return (
    <div
      onClick={() => {
        viewer().show();
      }}
      class="border-2 border-solid border rounded-lg border-gray-200 cursor-pointer hover:shadow-gray-200 hover:shadow-md transition-shadow"
    >
      <section class="h-32">
        <img
          class="w-full h-full object-cover overflow-hidden rounded-t-md"
          ref={image}
          src={props.scheme.pictures[props.scheme.thumbnail]}
          alt="Origin"
        />
      </section>
      <section class="p-4 flex gap-2 flex-wrap">
        <For each={Object.entries(props.scheme.pictures)}>
          {([key, value], index) => (
            <ResolveItem resolve={key} url={value} index={index} />
          )}
        </For>
      </section>
    </div>
  );
}
