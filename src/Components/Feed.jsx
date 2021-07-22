import React, { useContext, useState,useEffect } from 'react'
import { AuthContext } from '../Context/AuthProvider';
import { Button } from '@material-ui/core';
import { Movie } from '@material-ui/icons';
import { firebaseDB, firebaseStorage } from '../config/config';
import { uuid } from 'uuidv4';
import VideoPosts from './VideoPosts';

const Feed = (props)=>{
    const {signOut,currentUser} = useContext(AuthContext);
    const [message,setMessage]=useState("");
    const [videoFile, setvideoFile] = useState("");
    const [posts,setPosts] = useState([]);
    const conditionObj ={
        root: null, //observe from whole page
        threshold: "0.8", 
    }
    function cb(enteries){
        enteries.forEach((entry)=>{
            let child = entry.target.children[0];
            child.play().then(function(){
                if(entry.isIntersecting ==false){
                    child.pause();
                    // console.log("hi");
                }
            })
        })
    }
    useEffect(()=>{
        let intersectionObserver = new IntersectionObserver(cb , conditionObj);
        let elements = document.querySelectorAll(".video-container");

        elements.forEach((el) => {
        intersectionObserver.observe(el); //Intersection Observer starts observing each video element
        });
    },[posts]);
    useEffect(() => {
        firebaseDB.collection('posts').get()
        .then((snap)=>{
           let allpost =  snap.docs.map((doc)=>{
                return doc.data();
            })
            setPosts(allpost);
            

        })
        console.log(posts)
        
    }, [])

    const handleLogout =async (e)=>{
        try{
            await signOut;
            props.history.push("/login");
        }catch(err){
            setMessage(err.message);
        }
    };
    const handleFileSubmit = async(e)=>{
        let file = e.target.files[0];
        console.log(file);
        setvideoFile(file);
    }

    const onVideoUpload = ()=>{
        try{
            let userId = currentUser.uid;
            let uploadVideo=  firebaseStorage.ref(`profilephotos/${userId}/${Date.now()}.mp4`).put(videoFile);
            uploadVideo.on('state_change',onProgress,onError,onSuccess);
    
            function onProgress(snapshot){
                let progress = (snapshot.bytesTransferred/snapshot.totalBytes)*100;
                console.log(progress);
            }
            function onError(err){
                setMessage(err.message);            
            }
            async function onSuccess(){
                let videoUrl =await uploadVideo.snapshot.ref.getDownloadURL();
                let pid = uuid();
                await firebaseDB.collection('posts').doc(pid).set({
                    pid,
                    userId,
                    likes:[],
                    comment:[],
                    videoUrl,
                });

                let response = await firebaseDB.collection('users').doc(userId).get();
                let document = response.data();
                document.postCreated.push(pid);
                await firebaseDB.collection('users').doc(userId).set(document);
            }

        }catch(err){
            setMessage(err);
        }
       
    }
    return (
        <div>
            <div>
                <input type="file" onChange={(e)=>handleFileSubmit(e)}/>
                <label>
                    <Button startIcon = {<Movie/>} variant= "contained" color="secondary"onClick={onVideoUpload} >Upload</Button>
                </label>
            </div>
            <div className="video-feed-posts">
            {posts.map((post) => {
                return <VideoPosts key={post.pid} post={post}></VideoPosts>;
            })} 
            </div>
             <button onClick={handleLogout}>LogOut</button>
        </div>
       
    );
}

export default Feed;