import { useState } from "react";
import SearchBar from "../common/SearchBar";
import Logo from "../common/Logo";
import { Icon, Text } from "../common/UIElement";
import "@/assets/styles/globals.css"
import { HomeIcon, FriendIcon, WatchIcon, GroupIcon, GameIcon, MenuIcon, ChatIcon, NotiIcon, Avatar } from "@/assets/icons/header/header.js";
import ControlBar from "../common/ControlBar";
import styles from './Header.module.scss';

function Header() {
  const [searchValue, setSearchValue] = useState("");
  const controlCenterIcons = [HomeIcon, FriendIcon, WatchIcon, GroupIcon, GameIcon];
  const controlRightIcons = [MenuIcon, ChatIcon, NotiIcon];

  return (
    <div className="flex-row-between gap-4 bg-white px-4 py-2 fixed top-0 w-full z-50 shadow-md">
      <div className="flex justify-between items-center gap-2 cursor-pointer">
        <Logo width={"50"} height={"50"} />
        <SearchBar
          placeholder={"Tìm kiếm trên SpaceZone"}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSubmit={(e) => {
            e.preventDefault();
            console.log(searchValue);
          }}
        />
      </div>
      <div className="flex-row-center ">
        <ControlBar icons={controlCenterIcons} className="flex-row-center gap-2 " classNames="py-4 px-10 rounded-lg hover:bg-gray-200 cursor-pointer"/>
      </div>
      <div className="flex-row-center gap-4">
          <ControlBar icons={controlRightIcons} size="25" className="flex-row-center gap-2" classNames={`rounded-full p-3 hover:bg-gray-200 cursor-pointer ${styles.bgElement}`}/>
          <Icon src={Avatar} width={50} height={50} className="rounded-full cursor-pointer"/>
      </div>
    </div>
  );
}

export default Header;
