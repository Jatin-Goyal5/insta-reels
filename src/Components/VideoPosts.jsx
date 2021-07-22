import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  makeStyles,
  Typography,
  TextField,
  Avatar,
  Container,
} from "@material-ui/core";
import { firebaseDB } from "../config/config";
import { useContext } from "react";
import {AuthContext} from '../Context/AuthProvider';

const VideoPosts = (props) => {
    // console.log(props);
let [user, setUser] = useState(null);
const [comment, setComment] = useState("");
const [commentList, setCommentList] = useState([]);
const {currentUser} =useContext(AuthContext);
const useStyles = makeStyles({
  videoContainerSize: {
    height: "50%",
  },
});
let classes = useStyles();
  useEffect( async() => {
    let uid = props.post.userId;
    let doc = await firebaseDB.collection("users").doc(uid).get();
    let user =doc.data(); 
    setUser(user);
    let commentList = props.post.comment;
    let updateCommentList =[];
    for(let i =0 ; i < commentList.length ; i++){
        let commentResponse = await firebaseDB.collection("users").doc(commentList[i].userId).get();
        let commentUser = commentResponse.data();
        updateCommentList.push( {
            commentPic:commentUser.profileImageUrl,
            comment:commentList[i].comment,
        });
    }
    
    setCommentList(updateCommentList);
    // console.log(commentList);
  }, []);

 const handleCommentPost= async(e)=>{
    let commentPic ;
    
    if (currentUser.uid === user.userId) {
      commentPic = user.profileImageUrl;
    } else {
      let doc = await firebaseDB.collection("users").doc(currentUser.uid).get();
      console.log(currentUser.uid);
      let user = doc.data();
      console.log(user);
      commentPic = user.profileImageUrl;
    }
    let newCommentList = [
        ...commentList,        {
            comment:comment,
            commentPic,
        }  
    ];
    
    let updatePost = props.post;
    updatePost.comment.push({userId:currentUser.uid,comment:comment});
    await firebaseDB.collection("posts").doc(updatePost.pid).set(updatePost);
    setCommentList(newCommentList);
    setComment("");

  }
    return (
      <Container>
      <Card
        style={{
          // height: "80vh",
          width: "300px",
          margin: "auto",
          padding: "10px",
          marginBottom: "20px",
        }}
      >
        <Avatar src={user ? user.profileImageUrl : ""}></Avatar>
        <Typography variant="span">{user ? user.username : ""}</Typography>
        <div className="video-container">
          <Video
            className={classes.videoContainerSize}
            src={props.post.videoUrl}
          ></Video>
        </div>
        {/* <div>
          {isLiked ? (
            <Favorite
              onClick={() => toggleLikeIcon()}
              style={{ color: "red" }}
            ></Favorite>
          ) : (
            <FavoriteBorder onClick={() => toggleLikeIcon()}></FavoriteBorder>
          )}
        </div>

        {likesCount && (
          <div>
            <Typography variant="p">Liked by {likesCount} others </Typography>
          </div>
        )} */}
        <Typography variant="p">Comments</Typography>
        <TextField
          variant="outlined"
          label="Add a comment"
          size="small"
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
          }}
        ></TextField>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleCommentPost}
        >
          Post
        </Button>

        {commentList.map((commentObj) => {
          return (
            <>
              <Avatar src={commentObj.commentPic}></Avatar>
              <Typography variant="p">{commentObj.comment}</Typography>
            </>
          );
        })}
      </Card>
    </Container>
      
    );
};

function Video(props) {
    return (
        
       
      <video
        style={{
            // height: "80%",
            width: "100%",
        }}
        muted={true}
        loop={true}
        controls
      >
        <source src={props.src} type="video/mp4"></source>
      </video>
    );
  }
 
export default VideoPosts;