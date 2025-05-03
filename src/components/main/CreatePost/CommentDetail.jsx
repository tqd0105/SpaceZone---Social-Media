import PostList from "./PostList";
import Comments from "../Comments";
import { BackBlack } from "../../../assets/icons/main/main";

function CommentDetail({ posts, comments, onDeleteComment, onAddComment, onDelete, isOpenCommentDetail, setIsOpenCommentDetail, loading }) {

  return (
    <div className="fixed inset-0 flex items-center justify-center m_flex-row z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={()=>setIsOpenCommentDetail(null)}></div>
      <div className="relative top-0 left-0 bg-white rounded-xl px-4 pt-4 w-[700px] max-h-[90vh] m_w-full overflow-y-auto animate__animated animate__bounceIn">
        <div className="flex-row-center gap-2 my-1">
          <div className="hover:bg-gray-200 bg-gray-300 p-2 rounded-full cursor-pointer" 
          onClick={()=>setIsOpenCommentDetail(null)}
          >
        <img src={BackBlack} width={20} height={20} alt=""/>

          </div>
          <span className="font-bold text-2xl flex-row-center gap-2">Bài viết từ          
            <span className="text-blue-600 ">  { posts.author.name}</span>
          </span>
          {/* <div className="h-[1px] w-full bg-slate-200 my-2"></div> */}
        </div>
        <div className="flex flex-col ">
          {/* Hiển thị bài viết được chọn */}
          <PostList 
            posts={[posts]} 
            onDelete={onDelete} 
            disableCommentButton={true}
            loading={loading}
          />
          
          {/* Hiển thị bình luận của bài viết */}
          <Comments 
            posts={posts} 
            comments={comments.filter(comment => comment.postId === posts._id)} 
            onDeleteComment={onDeleteComment} 
            onAddComment={onAddComment}
          />
        </div>
      </div>
    </div>
  );
}

export default CommentDetail;