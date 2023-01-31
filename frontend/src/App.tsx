import { Route, Routes } from "@solidjs/router";
import { Component, createSignal } from "solid-js";
import Header from "./components/Header";
import Login from "./view/Login";
import Main from "./view/Main";
import Partitions from "./view/Partitions";

const App: Component = () => {
  const [headerHeight, setHeaderHeight] = createSignal(0.0);
  return (
    <>
      <Header setHeaderHeight={setHeaderHeight} />
      <main
        class="absolute bottom-0 left-0 right-0 top-0"
        style={{
          top: `${headerHeight()}px`,
        }}
      >
        <Routes>
          <Route path="/" component={Login} />
          <Route path="/partitions" component={Partitions} />
          <Route path="/partitions/:partition" component={Main} />
        </Routes>
      </main>
    </>
  );
};

export default App;
