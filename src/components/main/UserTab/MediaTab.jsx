import { useState } from "react";
import { CloseWhite } from "../../../assets/icons/main/main";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function MediaTab({ posts }) {
  const [selectedPostId, setSelectedPostId] = useState(null);

  const selectedPost = posts?.find((post) => post._id === selectedPostId);

  return (
    <div>
        {Array.isArray(posts) && posts.length > 0 ? (
      <div className="flex-row-start gap-2 w-full">
          
          {posts.map((post, index) =>
            post.image ? (
              <img
                src={`${API_URL}${post.image}`}
                className="w-[160px] h-[160px] object-cover border-[2px]  rounded-lg shadow-md cursor-pointer"
                key={post._id}
                alt=""
                onClick={() => setSelectedPostId(post._id)}
              />
            ) : null
          )}
      </div>

        ) : (
          <div className="m-4">
            <span className="font-bold ">Chưa có đa phương tiện nào</span>
          </div>
        )}

      {selectedPost && (
        <div className="fixed inset-0 flex-row-center z-50 ">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 z-10 cursor-pointer" 
            onClick={() => setSelectedPostId(null)}
          ></div>
          <div
            className="absolute top-4 left-4 bg-black rounded-full p-3 hover:bg-gray-800 cursor-pointer z-40"
            onClick={() => setSelectedPostId(null)}
          >
            <img src={CloseWhite} width={20} height={20} alt="" />
          </div>
          <div className="relative h-[700px] object-scale-down flex-row-center  z-20 animate__animated animate__zoomIn">
            <img
              className="object-contain  max-w-[90vw] max-h-[90vh] rounded-md shadow-xl"
              src={`${API_URL}${selectedPost.image}`}
              alt=""
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaTab;
