import { useNavigate, useParams } from "@solidjs/router";
import {
  createEffect,
  createResource,
  createSignal,
  ErrorBoundary,
  For,
  Suspense,
  untrack,
} from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";
import { listPartitions, listPictures } from "../api/api";
import Loading from "../components/Loading";
import Pagination from "../components/Pagination";
import PictureCard from "../components/PictureCard";
import Placeholder from "../components/Placeholder";

const PartitionSelector = (props: {
  current: string;
  setter: SetStoreFunction<{
    current: number;
    partition: string;
  }>;
}) => {
  const [partitions] = createResource(listPartitions);
  return (
    <div class="relative pt-4">
      <Suspense fallback={<Loading />}>
        <select
          onChange={(event) => {
            props.setter("partition", (event.target as any).value);
          }}
          class="px-1 py-1 form-select appearance-none
  font-mono block w-full px-3 py-0.5 text-base font-normal text-gray-700
bg-white bg-clip-padding bg-no-repeat
border border-solid border-gray-300
rounded transition ease-in-out m-0
focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
        >
          <For each={partitions()}>
            {(partition) => (
              <option selected={props.current === partition}>
                {partition}
              </option>
            )}
          </For>
        </select>
      </Suspense>
    </div>
  );
};

export default function Main() {
  const navigate = useNavigate();
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
    navigate(`/partitions/${store.partition}`);
  });
  return (
    <main class="container mx-auto px-4 xl:px-40">
      <ErrorBoundary fallback={(e) => <Placeholder text={e.toString()} />}>
        <Suspense fallback={<Loading />}>
          <section class="flex justify-end min-h-10">
            <PartitionSelector current={store.partition} setter={setStore} />
          </section>
          <section class="mt-4 min-h-96">
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 ">
              <For each={pictures()?.list}>
                {(item) => <PictureCard resolves={item} />}
              </For>
            </div>
          </section>
          <Pagination
            current={store.current}
            pagination={pictures()?.pagination}
            pageSetter={setStore}
          />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
