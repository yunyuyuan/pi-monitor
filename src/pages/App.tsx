import { HashRouter } from "react-router-dom";

import SvgIcon from "~/components/SvgIcon";

const Main = () => {
  return (
    <>
      <button className="flex items-center rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700">
        <SvgIcon className="mr-2 aspect-square w-5 fill-white" name="love" />
        Hello
      </button>
    </>
  );
};

export default function App() {
  return (
    <HashRouter>
      <Main />
    </HashRouter>
  );
}
