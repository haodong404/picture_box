import { useNavigate } from "@solidjs/router";
import { createResource, For, Suspense } from "solid-js";
import { listPartitions } from "../api/api";
import Card from "../components/Card";
import Loading from "../components/Loading";

function Item(props: { title: string }) {
  const navigate = useNavigate();
  return (
    <li
      onClick={() => {
        navigate(`/partitions/${props.title}`);
      }}
      class="m-0 divide-light-200 divide-y divide-gray-100 hover:bg-blue-50 px-4 cursor-pointer rounded-lg transition-all select-none text-lg font-mono"
    >
      {props.title}
    </li>
  );
}

export default function Partitions() {
  const [partitions] = createResource(listPartitions);

  return (
    <div
      class="flex justify-center items-center absolute bottom-0 left-0 right-0"
      style={{
        top: "-66px",
      }}
    >
      <Card>
        <h1 class="text-xl font-bold mt-0 text-center text-blue-900">
          Partitions
        </h1>
        <ul class="relative p-0 list-none">
          <Suspense fallback={<Loading />}>
            <For each={partitions()}>{(item) => <Item title={item} />}</For>
          </Suspense>
        </ul>
      </Card>
    </div>
  );
}
