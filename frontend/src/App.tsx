import { Route, Routes } from "@solidjs/router";
import type { Component } from "solid-js";
import Main from "./view/Main";

const App: Component = () => {
  return (
    <Routes>
      <Route path="/partitions/:partition" component={Main} />
      <Route path="/partitions" component={Main} />
    </Routes>
  );
};

export default App;
