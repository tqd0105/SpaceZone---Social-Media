import Header from "../components/layout/Header";
import Leftbar from "../components/layout/Leftbar";
import Rightbar from "../components/layout/Rightbar";
import Main from "../components/layout/Main";

function Home() {
  return (
    <div className="flex">
      <Header />
      <Leftbar />
      <Main />
      <Rightbar />
    </div>
  );
}

export default Home;
