import { Avatar, createPostItems } from "@/assets/icons/main/main.js";
import { Text } from "../common/UIElement";
import Button from "../common/Button";

function CreatePost() {
    return (
        <div className="bg-white my-4 p-4 rounded-lg shadow-md">
            <div className="flex flex-col gap-4 w-full"> 
                <div className="flex items-start gap-2 w-full"> 
                    <img src={Avatar} width="50" height="50" alt="avatar" className="rounded-full "/>
                    <div className="flex-1">
                        <div className="w-full bg-gray-200 p-3 rounded-full cursor-pointer hover:bg-gray-300">
                            <Text 
                                children="Hôm nay của bạn có ổn không?" 
                                className="text-gray-500 font-bold text-left pl-2"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center w-full"> 
                    <div className="flex gap-1">
                        {createPostItems.map((item, index) => (
                            <div key={index} className="p-2 hover:bg-gray-200 rounded-lg cursor-pointer">
                                <img src={item} width="25" height="25" alt="icon"/>
                            </div>
                        ))}
                    </div>
                    <Button children="Đăng" color="white" backgroundColor="black" className="hover:bg-gray-300"/>
                </div>
            </div>
        </div>
    );
}

export default CreatePost;