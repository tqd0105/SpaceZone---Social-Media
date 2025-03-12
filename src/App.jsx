import Header from "./components/layout/Header";
import Leftbar from "./components/layout/LeftBar";
import './App.css'
import RightBar from "./components/layout/RightBar";
import Main from "./components/layout/Main";

function App() {
  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Header />
      <div className="flex justify-between w-full pt-[80px]"> {/* Thêm padding-top để tránh bị header che */}
        <Leftbar />
        <Main/>
        <RightBar/>
      </div>
    </div>
  );
}

export default App;
