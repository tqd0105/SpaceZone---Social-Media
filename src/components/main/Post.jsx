import axios from "axios";
import { useEffect, useState } from "react";

function Post () {
    const [posts, setPosts] = useState([]);

    useEffect(()=> {
        axios.get("https://spacezone-api.onrender.com/posts", { cache: "no-store" }) // Đảm bảo không dùng cache
        .then((response)=>{
            setPosts(response.data);
        })
        .catch((error)=>{
            console.log(error);
        })
    },[])
    
    return (
        <ul>
            {posts.map((post)=>(
                <div>
                <li key={post.id}>{post.name} </li>
                <img src={post.image} alt="" /></div>
            ))}
        </ul>
    )
}

export default Post;