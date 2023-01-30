import { Route, Routes } from "@solidjs/router";
import type { Component } from "solid-js";
import Login from "./view/Login";
import Main from "./view/Main";
import Menu from "./view/Menu";

const App: Component = () => {
  return (
    <Routes>
      <Route path="/partitions/:partition" component={Main} />
      <Route path="/partitions" component={Main} />
      <Route path="/" component={Login} />
      <Route path="/menu" component={Menu} />
    </Routes>
  );
};

export default App;
