import TwoColumns from "../common/TwoColumns";
import { Circle, generalFriends, listFriends, LogoPremium, More, Ronaldo, Search, GroupChat, listGroups, Create } from "../../assets/icons/rightbar/rightbar";
import { Icon, Text } from "../common/UIElement";
import "@/assets/styles/globals.css";
import Button from "../common/Button";

function RightBar() {
  return (
    <div className="lg:w-3/12 my-2">
      <TwoColumns
        left={
          <img
            src={LogoPremium}
            width={200}
            height={200}
            className="rounded-full shadow-2xl border-4 border-white"
          />
        }
        right={
          <TwoColumns
            left={
              <Text
                children={"Gói Premium+"}
                className="font-bold bg-black text-white px-4 py-2 rounded-full whitespace-nowrap hover:bg-gray-800 cursor-pointer"
              />
            }
            right={
              <div>
                <Text
                  className="text-left px-2 font-semibold"
                  children="Đăng kí gói cao cấp để mở khoá các tính năng hấp dẫn cho bạn trải nghiệm tốt nhất"
                />
              </div>
            }
            className="flex-column-startItems gap-2"
          />
        }
        className="flex-row-between gap-2 "
      />

      <div className="h-[1px] bg-gray-300 my-4"></div>

      <div>
        <Text className="flex-row-between">
          <span className="font-bold text-gray-400">Lời mời kết bạn</span>
          <a href="#">Xem tất cả</a>
        </Text>
        <div className="flex-row-between gap-2 my-1">
          <img src={Ronaldo} className="rounded-full" width={80} height={70} />
          <TwoColumns
            left={
              <TwoColumns
                left={
                  <TwoColumns
                    left={<Text children="Cristiano Ronaldo" className="font-bold"/>}
                    right={
                      <TwoColumns
                        left={
                          <div className="flex-row-start ">
                            {generalFriends.map((friend, index)=>(
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
                right={<Text children="5 ngày trước" />}
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
                  width="145px"
                />
                <Button
                  children={"Huỷ"}
                  color="black"
                  backgroundColor="white"
                  hoverBackgroundColor="rgb(255, 255, 255, 0.7)"
                  width="120px"
                />
              </div>
            }
            className={"flex flex-col w-full gap-2"}
          />
        </div>
      </div>

      <div className="h-[1px] bg-gray-300 my-4"></div>

      <div>
        <TwoColumns
          left={
            <TwoColumns
              left={<img src={Circle} width="10" height="10" className="ml-2"/>}
              right={<Text children="Đang hoạt động" className="font-bold text-gray-400"/>}
              className={"flex-row-start gap-4"}
            />
          }
          right={
            <TwoColumns
              left={
                <img src={Search} width="20" height="20" className="cursor-pointer"/>
              }
              right={
                <img src={More} width="20" height="20" className="cursor-pointer"/>
              }
              className={"flex-row-between gap-4"}
            />
          }
          className={"flex-row-between gap-2"}
        />
      </div>
      
      <div>
        {listFriends.map((friend, index)=>(
          <TwoColumns 
            left = {
              <img
                key={index}
                src={friend.image}
                alt={friend.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            }
            right = {
              <Text children={friend.name} className="font-bold" />
            }
            className="flex-row-start gap-4 rounded-md hover:bg-gray-200 pl-6 py-2 cursor-pointer"
          />
        ))}
      </div>

      <div className="h-[1px] bg-gray-300 my-4"></div>

      <div>
        <TwoColumns
          left={
            <TwoColumns
              left={
                <img src={GroupChat} width="20" height="20"/>
              }
              right={
                <Text children="Nhóm chat" className="font-bold text-gray-400"/>
              }
              className="flex-row-start gap-2"
            />
          }
          right={
            <Icon src={Create} width="20" height="20" className="cursor-pointer"/>
          }
          className="flex-row-between "
        />
      </div>
      <div>
        {listGroups.map((group, index)=>(
          <TwoColumns
            left={
              <img src={group.image} alt={group.name} width={40} height={40} className="rounded-full"/>
            }
            right={
              <Text children={group.name} className="font-bold"/>
            }
            className={"flex-row-start gap-4 hover:bg-gray-300 rounded-md pl-6 py-2 cursor-pointer"}
          />
        ))}
      </div>
    </div>
  );
}
export default RightBar;
