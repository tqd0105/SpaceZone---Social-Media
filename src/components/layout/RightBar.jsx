import TwoColumns from "../common/TwoColumns";
import {
  Circle,
  generalFriends,
  listFriends,
  LogoPremium,
  More,
  Ronaldo,
  Search,
  GroupChat,
  listGroups,
  Create,
  featuredEvents,
  friendSuggestions,
  Interactive,
  Open,
  AddUser,
  Game,
  gameSuggests,
  Next,
} from "../../assets/icons/rightbar/rightbar";
import { Icon, Text } from "../common/UIElement";
import "@/assets/styles/globals.css";
import Button from "../common/Button";
import styled from "../layout/RightBar.module.scss";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import '../../styles/_mobile.scss'

function RightBar({isShowRightBar}) {
  
  return (
    <div className={`lg:sticky top-0 right-0 h-screen overflow-y-auto lg:w-[25%] m_pb-135px my-2 mr-3 ${isShowRightBar ? "": "m_hidden"}`}>
      {/* Trò chơi */}

      <div className="flex-row-center gap-2 py-2 px-4 hover:bg-gray-100 rounded-lg cursor-pointer">
        <img src={Game} width={40} height={20} alt="" />
        <h3 className="bg-gradient-to-r from-pink-400 to-red-800 bg-clip-text text-transparent font-extrabold text-lg">Giải trí ngay</h3>
      </div>
      {gameSuggests.map((gameSuggest, index)=> (
        <div className="flex-row-between gap-2 py-2 px-4 hover:bg-gray-100 rounded-lg cursor-pointer">
          <div className="flex-row-start gap-2">
            <div>
              <img src={gameSuggest.image} width={60} height={100} className="rounded-xl shadow-lg border-2 border-black" alt="" />
            </div>
            <div className="flex flex-col justify-start items-start">
              <h3 className="font-bold text-base hover:underline cursor-pointer">{gameSuggest.name}</h3>
              <span className="font-medium text-gray-400">{gameSuggest.type}</span>
            </div>
          </div>
          <div>
            <img src={Next} width={20} height={20} alt="" />
          </div>
        </div>
      ))}

      <div className="h-[1px] bg-gray-200 my-4"></div>

      {/* Chủ đề nổi bật */}
      <div >
        <h3 className="text-left text-lg font-extrabold px-4">Chủ đề nổi bật</h3>
      </div>
      {featuredEvents.map((featuredEvent, index) => (
        <div key={index} className="flex-row-between gap-2 py-2 px-4 hover:bg-gray-100 rounded-lg cursor-pointer"> 
          <div>
            <div className="flex flex-col justify-start items-start "> 
              <p className="font-semibold text-green-600 ">{featuredEvent.title}</p>
              <h2 className={`${styled.LexendDeca_font} truncate max-w-[300px] text-left hover:underline`}>{featuredEvent.content}</h2>
            </div>
            <div className="flex-row-start gap-1">
              {/* <img src={Interactive} width={20} height={20} alt="" /> */}
              <span className=" font-normal text-gray-600">{featuredEvent.quantity}</span>
            </div>
          </div>
          <div>
            <img src={Open} width={15} height={15} alt="" />
          </div>
        </div>
      ))}

      <div className="h-[1px] bg-gray-200 my-4"></div>

      {/* Gợi ý kết bạn */}
      <div>
        <h3 className="text-left text-lg font-extrabold px-4">Gợi ý kết bạn</h3>
      </div>
      {friendSuggestions.map((friendSuggestion, index) => (
        <div key={index} className="flex-row-between gap-2 py-2 px-4 hover:bg-gray-100 rounded-lg cursor-pointer">
          <div className="flex-row-start gap-2">
            <div >
              <img src={friendSuggestion.image} width={50} height={50} className="rounded-full max-w-[50px] max-h-[50px]" alt="" />
            </div>
            <div className="flex flex-col justify-start items-start">
              <span className="font-semibold hover:underline">{friendSuggestion.name} </span>
              <span className="text-gray-400">@{friendSuggestion.username}</span>
            </div>
          </div>
          <div>
            <img src={AddUser} width={20} height={20} alt="" />
          </div>
        </div>
      ))}

      <div div className="h-[1px] bg-gray-200 my-4"></div>

      {/* Lời mời kết bạn */}
      <div >
        <Text className="flex-row-between">
          <span className="font-bold text-gray-400">Lời mời kết bạn</span>
          <a href="#">Xem tất cả</a>
        </Text>
        <div className="flex-row-between gap-2 my-1 p-4 hover:bg-gray-100 rounded-lg cursor-pointer">
          <img src={Ronaldo} className="rounded-full" width={80} height={70} />
          <TwoColumns
            left={
              <TwoColumns
                left={
                  <TwoColumns
                    left={
                      <Text
                        children="Cristiano Ronaldo asd dsd s ssdasd s s"
                        className="font-semibold hover:underline cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis w-[150px]"
                      />
                    }
                    right={
                      <TwoColumns
                        left={
                          <div className="flex-row-start ">
                            {generalFriends.map((friend, index) => (
                              <img
                                key={index}
                                src={friend}
                                className="rounded-full w-5"
                              />
                            ))}
                          </div>
                        }
                        right={<Text children="2 bạn chung" />}
                        className={"flex-row-start gap-2"}
                      />
                    }
                    className={"flex-column-startItems"}
                  />
                }
                right={<Text children="5 ngày trước" className="break-normal"/>}
                className={"flex-row-between gap-2"}
              />
            }
            right={
              <div className="flex-row-between gap-1 ">
                <Button
                  children={"Xác nhận"}
                  color="white"
                  backgroundColor="#0661F2"
                  hoverBackgroundColor="rgb(6, 97, 242, 0.92)"
                  width="100%"
                />
                <Button
                  children={"Huỷ"}
                  color="black"
                  backgroundColor="#d8d9da"
                  hoverBackgroundColor="#d8d9da80"
                  width="70%"
                />
              </div>
            }
            className={"flex flex-col w-full gap-2"}
          />
        </div>
      </div>

      <div className="h-[1px] bg-gray-200 my-4"></div>
            
      {/* Đang hoạt động */}
      <div>
        <TwoColumns
          left={
            <TwoColumns
              left={
                <img src={Circle} width="10" height="10" className="ml-2" />
              }
              right={
                <Text
                  children="Đang hoạt động"
                  className="font-bold text-gray-400"
                />
              }
              className={"flex-row-start gap-4"}
            />
          }
          right={
            <TwoColumns
              left={
                <img
                  src={Search}
                  width="20"
                  height="20"
                  className="cursor-pointer"
                />
              }
              right={
                <img
                  src={More}
                  width="20"
                  height="20"
                  className="cursor-pointer"
                />
              }
              className={"flex-row-between gap-4"}
            />
          }
          className={"flex-row-between gap-2"}
        />
      </div>

      <div>
        {listFriends.map((friend, index) => (
          <TwoColumns
            left={
              <img
                key={index}
                src={friend.image}
                alt={friend.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            }
            right={<Text children={friend.name} className="font-semibold" />}
            className="flex-row-start gap-4 rounded-md hover:bg-gray-100 pl-6 py-2 cursor-pointer"
          />
        ))}
      </div>

      <div className="h-[1px] bg-gray-200 my-4"></div>

      <div>
        <TwoColumns
          left={
            <TwoColumns
              left={<img src={GroupChat} width="20" height="20" />}
              right={
                <Text
                  children="Nhóm chat"
                  className="font-bold text-gray-400"
                />
              }
              className="flex-row-start gap-2"
            />
          }
          right={
            <Icon
              src={Create}
              width="20"
              height="20"
              className="cursor-pointer"
            />
          }
          className="flex-row-between "
        />
      </div>
      <div>
        {listGroups.map((group, index) => (
          <TwoColumns
            left={
              <img
                src={group.image}
                alt={group.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            }
            right={<Text children={group.name} className="font-semibold text-left" />}
            className={
              "flex-row-start gap-4 hover:bg-gray-100 rounded-md pl-6 py-2 cursor-pointer"
            }
          />
        ))}
      </div>
    </div>
  );
}
export default RightBar;
