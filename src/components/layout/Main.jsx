import CreatePost from "../Main/CreatePost";
import Post from "../main/Post";
import Story from "../main/Story";

function Main () {
    return (
        <div className="lg:w-1/2">
            <CreatePost/>
            <Story/>
            <Post/>
        </div>
    )
}

export default Main;