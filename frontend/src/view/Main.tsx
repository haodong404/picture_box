import { useParams } from "@solidjs/router";
import Header from "../components/Header";

export default function Main() {
  const param = useParams();
  console.log("Refresh");

  return (
    <main class="container mx-auto px-4">
      <Header />
      <section>
        <h1>{param.partition}</h1>
      </section>
    </main>
  );
}
