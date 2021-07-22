import React, {useState,useContext} from 'react';
import { firebaseStorage,firebaseDB } from '../config/config';
import logo from '../logo.png';
import {Link} from 'react-router-dom';
import { Movie } from '@material-ui/icons';
import { AuthContext } from '../Context/AuthProvider';
import { Card,
        CardContent,
        Grid,
        CardActions,
        Typography,
        CardMedia,
        Button,
        makeStyles,
        TextField,
        Container
      } from "@material-ui/core";

const Signup = (props)=>{
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [message, setMessage] = useState("");
    const {signUp} = useContext(AuthContext);
    let useStyles = makeStyles({
      centerDivs: {
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        width: "100vw",
      },
      carousal: { height: "10rem", backgroundColor: "lightgray" },
      fullWidth: {
        width: "100%",
      },
      centerElements: {
        display: "flex",
        flexDirection: "column",
      },
      mb: {
        marginBottom: "1rem",
      },
      padding: {
        paddingTop: "1rem",
        paddingBottom: "1rem",
      },
      alignCenter: {
        justifyContent: "center",
      },
    });
    let classes = useStyles();
    const handleSignup= async(e)=>{
        try{
           let response =  await signUp(email,password);
           console.log(response.user.uid);
           let userId = response.user.uid;
           const uploadImage = firebaseStorage.ref(`profilephotos/${userId}/image.jpg`).put(profileImage);
           console.log(uploadImage)
           uploadImage.on('state_changed',onProgress,error,success);

           function onProgress(snapshot){
                let progress = (snapshot.bytesTransferred/snapshot.totalBytes)*100;
                console.log(progress); 
           }

           function error(e){
                 setMessage(e);             
            }
            async function success(){
                let profileImageUrl = await uploadImage.snapshot.ref.getDownloadURL();
                console.log(profileImageUrl);
                firebaseDB.collection('users').doc(userId).set(
                  {
                    userId,
                    email,
                    username,
                    password,
                    profileImageUrl,
                    postCreated:[],
                  }
                );              
            }

            props.history.push("/");
        }catch(err){
            setMessage(err.message);
        }

    }

    const handleFileSubmit = (e)=>{
        let file= e.target.files[0];
        console.log(file);
        setProfileImage(file);
       
    };

    return (  
      <div>
      <Container>
        <Grid container style={{justifyContent:"center"}}>
          {/* Carousel */}
          <Grid item sm={3}>
            <Card variant="outlined" className={classes.mb}>
              <CardMedia
                image={logo}
                style={{ height: "5rem", backgroundSize: "contain" }}
              ></CardMedia>
              <CardContent className={classes.centerElements}>
                <Typography style= {{textAlign:"center"}}>
                  Signup to see photos and videos from your friends
                </Typography>
              <TextField
                  label="Username"
                  type="text"
                  variant="outlined"
                  value={username}
                  size="small"
                  onChange={(e) => setUsername(e.target.value)}
                  className = {classes.mb}
                ></TextField>
                <TextField
                  label="Email"
                  type="email"
                  variant="outlined"
                  value={email}
                  size="small"
                  onChange={(e) => setEmail(e.target.value)}
                  className = {classes.mb}
                ></TextField>
                <TextField
                  label="Password"
                  type="password"
                  variant="outlined"
                  value={password}
                  size="small"
                  onChange={(e) => setPassword(e.target.value)}
                  className = {classes.mb}
                ></TextField>
              </CardContent>
              <CardActions>
             
                <label>
                    <Button type startIcon = {<Movie/>} variant= "contained" color="secondary" > 
                    <input type="file" onChange={(e)=>handleFileSubmit(e)}/>
                    </Button>
                </label>
              </CardActions>
              <CardActions>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSignup}
                  className={classes.fullWidth}
                >
                  SignUp
                </Button>
              </CardActions>
              <Typography style={{ textAlign: "center" }}>
                  By Signing up , you agree to our terms ,
                   Data Policy and cookies Policy
              </Typography>
            </Card>
           
              
          </Grid>
        </Grid>
      </Container>
      </div>
   
    );
}

export default Signup;