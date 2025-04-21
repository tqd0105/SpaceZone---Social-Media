import PostList from "../CreatePost/PostList";

function PostTab ({posts, comments, onAddComment, onDeleteComment, onDelete, user}) {
    return (
        <div>
            <PostList 
                posts={posts}
                comments={comments} // nếu có
                onAddComment={onAddComment} // nếu có
                onDeleteComment={onDeleteComment} // nếu có
                onDelete={onDelete} // nếu có
                user={user} // nếu cần
            />
        </div>
    )
}

export default PostTab;