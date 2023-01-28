import { useParams } from "@solidjs/router";
import {
  createEffect,
  createResource,
  ErrorBoundary,
  For,
  Suspense,
} from "solid-js";
import { createStore } from "solid-js/store";
import { listPictures } from "../api/api";
import Header from "../components/Header";
import Loading from "../components/Loading";
import Pagination from "../components/Pagination";
import PictureCard from "../components/PictureCard";
import Placeholder from "../components/Placeholder";

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
    console.log(pictures());
  });
  return (
    <main class="container mx-auto px-4 xl:px-40">
      <Header />
      <ErrorBoundary fallback={(e) => <Placeholder text={e} />}>
        <section class="mt-4 min-h-96">
          <Suspense fallback={<Loading />}>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 ">
              <For each={pictures()?.list}>
                {(item) => <PictureCard resolves={item} />}
              </For>
            </div>
          </Suspense>
        </section>
        <Pagination pagination={pictures()?.pagination} pageSetter={setStore} />
      </ErrorBoundary>
    </main>
  );
}
