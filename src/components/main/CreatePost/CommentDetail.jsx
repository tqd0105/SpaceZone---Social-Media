import PostList from "./PostList";
import Comments from "../Comments";

function CommentDetail({ posts, comments, onDeleteComment, onAddComment, onDelete, isOpenCommentDetail, setIsOpenCommentDetail }) {

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={()=>setIsOpenCommentDetail(null)}></div>
      <div className="relative top-0 left-0 bg-white rounded-xl px-4 pt-4 w-[600px] max-h-[80vh] overflow-y-auto animate__animated animate__bounceIn">
        <div className="my-1">
          <span className="font-bold text-2xl text-blue-500">Bình luận từ bài viết</span>
          {/* <div className="h-[1px] w-full bg-slate-200 my-2"></div> */}
        </div>
        <div className="flex flex-col ">
          {/* Hiển thị bài viết được chọn */}
          <PostList 
            posts={[posts]} 
            onDelete={onDelete} 
            disableCommentButton={true}
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