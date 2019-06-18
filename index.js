let express = require('express') ;
let config = require('./config/config');
let app = express() ;
let cors = require('cors');
let passport  = require('passport') ; 
let FacebookStrategy = require('passport-facebook').Strategy;
let userDetails = {
    'accessToken':'',
    'userId':'',
    'pageId':'',
    'instaId':'',
    'mediaIds':[]
} ; 

let request = require('request') ;

passport.serializeUser(function(user, cb) {
    cb(null, user);
  });
  
  passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
  });
  
passport.use(new FacebookStrategy({
    clientID: "2295400073846867",
    clientSecret: "7caaf2bc00fe991cd8a36c554a562a2d",
    callbackURL: "http://localhost:3000/auth/facebook/callback",
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log("this is the accessToken",accessToken);
      userDetails["accessToken"] = accessToken ;
      userDetails["userId"] = profile.id ;
     getUser(accessToken,profile)


    console.log("this is the users profile",profile);
  }
));


app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),()=>{
      console.log("the facebook callback is getting caleld**********========***>>>");
      
  });

function getUser(accessToken,profile){
    // accessToken and profile i will use in future if need be
    if (userDetails.userId && userDetails.accessToken) {
        request('https://graph.facebook.com/'+userDetails.userId+"?fields=id,name,email&access_token="+userDetails.accessToken,(error,response,body)=>{
        console.log("this is the response",response.body);
        getFbPage();
        })
    } else {
        console.log("user details are not present");
    }
}

// app.get('/user',(req,res)=>{
//     if (userDetails.userId && userDetails.accessToken) {
//         request('https://graph.facebook.com/'+userDetails.userId+"?fields=id,name,email&access_token="+userDetails.accessToken,(error,response,body)=>{
//         console.log("this is the response",response.body);
//         res.json(response.body)
//         })
//     } else {
//         console.log("user details are not present");
//     }
// })

app.get('/home',(req,res)=>{
    res.sendFile(__dirname+'/views/index.html')
});


function getFbPage(){
    request('https://graph.facebook.com/v3.2/me/accounts?access_token='+userDetails.accessToken,(error,response,body)=>{
        let newBody = JSON.parse(body) ;
       if(newBody["data"][0]){
        userDetails.pageId = newBody["data"][0]["id"] ;
        console.log("this is the fbpage data ==>",newBody["data"][0]["id"]);
        // here we can get multiple pages from these pages create an option for the user to select from multiple pages and use redis to save for the time being
        getInstaAccount();
       }
    })
}

// app.get('/user/getFbPage',(req,res)=>{
//     request('https://graph.facebook.com/v3.2/me/accounts?access_token='+userDetails.accessToken,(error,response,body)=>{
//         let newBody = JSON.parse(body) ;
//         userDetails.pageId = newBody["data"][0]["id"] ;
//     console.log("this is the fbpage data ==>",newBody["data"][0]["id"]);
//     res.json(JSON.stringify({"pageId": userDetails.pageId }))
//     })
// })


function getInstaAccount(){
    request(' https://graph.facebook.com/v3.2/'+userDetails["pageId"]+'?fields=instagram_business_account&access_token='+userDetails["accessToken"],(error,response,body)=>{
        let parsedBody = JSON.parse(body);   
        if ( parsedBody["instagram_business_account"]) {
            userDetails.instaId = parsedBody["instagram_business_account"]["id"] ;
            console.log("this is the insta id",userDetails.instaId);
            getInstaMedia();
        }
        })
}
// app.get('/user/getInstaAccount',(req,res)=>{
//     request(' https://graph.facebook.com/v3.2/'+userDetails["pageId"]+'?fields=instagram_business_account&access_token='+userDetails["accessToken"],(error,response,body)=>{
//     let parsedBody = JSON.parse(body);   
//     userDetails.instaId = parsedBody["instagram_business_account"]["id"] ;
//     console.log("this is the insta id",userDetails.instaId);
    
//     res.send(parsedBody) ;
//     })
// })

function getInstaMedia(){
    request('https://graph.facebook.com/v3.2/'+userDetails.instaId+'/media?access_token='+userDetails.accessToken,(error,response,body)=>{
        let parsedBody = JSON.parse(body) ; 
        userDetails['mediaIds'] = parsedBody["data"]
        console.log("these are the insta media" , parsedBody);
    })
}


app.get('/user/getInstaMedia',(req,res)=>{
    request('https://graph.facebook.com/v3.2/'+userDetails.instaId+'/media?access_token='+userDetails.accessToken,(error,response,body)=>{
        let parsedBody = JSON.parse(body) ; 
        res.status(200).json(parsedBody); 
    })
})


app.get('/insta/media',(req,res)=>{
    // let mediaId = userDetails["mediaIds"][0]["id"]
    // console.log("this is the content id ",mediaId);
    // res.status(200).json({message:"good"});
    request('https://graph.facebook.com/'+userDetails["mediaIds"][0]['id']+'?fields=id,media_type,media_url,owner,timestamp&access_token='+userDetails["accessToken"],(error,response,body)=>{
        console.log("this is the media data ",body);
        let parsedBody  = JSON.parse(body) ;
        res.status(200).json(parsedBody);
    })
})

// const authRoutes = require('./routes/auth.routes');
// app.use(authRoutes) ; 


app.get("/page/details",(req,res)=>{
    request('')
})



let bodyParser = require('body-parser') ;
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())
app.use(cors());

app.listen(config.port,(error)=>{
    if(error) console.log("error in starting the server");
    else console.log(`server started on port ${config.port}`);
})