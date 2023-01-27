import { useParams } from "@solidjs/router";
import { createEffect, createResource, For } from "solid-js";
import { createStore } from "solid-js/store";
import { listPictures } from "../api/api";
import Header from "../components/Header";
import PictureCard from "../components/PictureCard";

export default function Main() {
  const param = useParams();
  const [store, setStore] = createStore({
    current: 1,
    partition: param.partition,
  });
  const [pictures] = createResource(
    () => ({ current: store.current, partition: store.partition }),
    listPictures
  );
  createEffect(() => {
    setStore("partition", param.partition);
  });
  return (
    <main class="container mx-auto px-4 xl:px-40">
      <Header />
      <section class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <For each={pictures()?.list}>
          {(item) => <PictureCard resolves={item} />}
        </For>
      </section>
    </main>
  );
}
