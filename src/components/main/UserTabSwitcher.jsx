import { useState } from "react";
import PostTab from "./UserTab/PostTab";
import CommentTab from "./UserTab/CommentTab";
import MediaTab from "./UserTab/MediaTab";
import EventTab from "./UserTab/EventTab";
import StoreTab from "./UserTab/StoreTab";

const UserTab = [
    {
        id: 1,
        label: "Bài viết",
        render: (props) => <PostTab {...props} />
    },
    {
        id: 2,
        label: "Bình luận",
        render: (props) => <CommentTab {...props} />
    },
    {
        id: 3,
        label: "Media",
        render: (props) => <MediaTab {...props} />

    },
    {
        id: 4,
        label: "Sự kiên",
        render: (props) => <EventTab {...props} />

    },
    {
        id: 5,
        label: "Lưu trữ",
        render: (props) => <StoreTab {...props} />

    },
]

function UserTabSwitcher ({posts, comments, onAddComment, onDeleteComment, onDelete, user}) {
    const [activeTab, setActiveTab] = useState(1);
    const props = { posts, comments, onAddComment, onDeleteComment, onDelete, user };
    return (
        <div>
            <div className="flex-row-between">
            {
                UserTab.map((tab)=> (
                    <div 
                        key={tab.id} 
                        className={`${activeTab === tab.id ? "border-b-blue-500 border-b-4 " : "text-gray-400"} font-bold hover:bg-gray-300 py-3 w-full cursor-pointer`}
                        onClick={()=>setActiveTab(tab.id)}    
                    >     
                    {tab.label}
                    </div>
                ))
            }
            </div>
            
            <div className="mt-6 p-2 bg-white rounded-lg shadow-lg border-[1px] border-gray-300">
                {UserTab.find((tab) => tab.id === activeTab)?.render(props)}
            </div>
        </div>
    )
}

export default UserTabSwitcher;   