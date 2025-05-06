import PostList from "../CreatePost/PostList";

function PostTab ({posts, comments, onAddComment, onDeleteComment, onDelete, user}) {
    return (
        <div>
            <PostList 
                posts={posts}
                comments={comments} 
                onAddComment={onAddComment}
                onDeleteComment={onDeleteComment} 
                onDelete={onDelete} 
                user={user} 
            />
        </div>
    )
}

export default PostTab;