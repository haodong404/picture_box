import { A, useNavigate, useParams, useLocation } from "@solidjs/router";
import {
  createEffect,
  createResource,
  createSignal,
  ErrorBoundary,
  For,
  Suspense,
  untrack,
} from "solid-js";
import { getPartitions } from "../api/api";
import Loading from "./Loading";
import Placeholder from "./Placeholder";

const PartitionSelector = () => {
  const params = useParams();
  const [selection, setSelection] = createSignal<string>(undefined);
  const [partitions] = createResource(getPartitions);
  const navigate = useNavigate();

  createEffect(() => {
    if (untrack(selection) === undefined) {
      if (params.partition !== undefined) {
        setSelection(partitions()[0]);
      }
    }
    let select = selection();
    if (params.partition !== select) {
      navigate(`/partitions/${select}`);
    }
  });

  return (
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
      <For each={partitions()}>
        {(partition) => (
          <option selected={untrack(selection) === partition}>
            {partition}
          </option>
        )}
      </For>
    </select>
  );
};

export default function Header() {
  return (
    <div class="flex z-50 bg-white justify-center sticky top-0 border-b-2 border-solid border-t-0 border-x-0 border-gray-200">
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
      <div class="absolute right-0 h-full flex items-center pr-4 gap-2">
        <ErrorBoundary fallback={(err) => <Placeholder text={err} />}>
          <Suspense fallback={<Loading />}>
            <PartitionSelector />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
