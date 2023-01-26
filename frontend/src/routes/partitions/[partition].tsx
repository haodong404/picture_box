import { useParams } from "solid-start";
import Header from "~/components/Header";

export default function Home() {
  const param = useParams();
  return (
    <main class="container mx-auto px-4">
        <Header />
        <section>
          <h1>{param.partition}</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
          <h1>CONTENT</h1>
        </section>
    </main>
  );
}
