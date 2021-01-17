const express = require("express")
const path = require("path")
const mysql = require("mysql2")
const session = require('express-session');
const bcrypt = require("bcrypt")
const bodyParser = require("body-parser");
const publicDir = path.join(__dirname,"../public");
var crypto = require('crypto');
const app = express()
app.use(express.urlencoded({extended:false}));
app.use(express.static(publicDir))
app.set("view engine","ejs")


const ENCRYPTION_KEY = "sjduw73nfksc8wpdlam392jd736sgajd"; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text) {
 let iv = crypto.randomBytes(IV_LENGTH);
 let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
 let encrypted = cipher.update(text);

 encrypted = Buffer.concat([encrypted, cipher.final()]);

 return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
 let textParts = text.split(':');
 let iv = Buffer.from(textParts.shift(), 'hex');
 let encryptedText = Buffer.from(textParts.join(':'), 'hex');
 let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
 let decrypted = decipher.update(encryptedText);

 decrypted = Buffer.concat([decrypted, decipher.final()]);

 return decrypted.toString();
}



const conn = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"root",
    database:"password_manager"
})
const saltRounds = 10;

app.use(session({ 
    secret: '123456cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }
}))


app.get('/register', function(req, res, next) {
    res.render('register');
});



app.post('/register', (req,res) => {

    var inputData = {
        name: req.body.user_name,
        email: req.body.user_email,
        pass: req.body.user_pass
    }
    var sql='SELECT * FROM users WHERE email =?';
    conn.query(sql,[inputData.email],(err,result)=>{
        if(err) throw err;
        else if(result.length>0){
            var msg = inputData.email + " already exist";
        }
        else{
     
            // save users data into database
            const salt = bcrypt.genSaltSync(saltRounds);
            const hash = bcrypt.hashSync(inputData.pass, salt);
            var sql = "INSERT INTO users (name,email,pass) VALUES ('"+inputData.name+"','"+inputData.email+"','"+hash+"')";
            conn.query(sql, function (err, result) {
              if (err) throw err;
            });
            var msg =`You are successfully registered`;
        //   res.redirect("/login");
         }

        res.render('register',{alertMsg:msg});
    })
    
});



app.get('/login', function(req, res, next) {
    res.render('login');
});

app.post('/login', function(req, res){
    var email = req.body.user_email;
    var password = req.body.user_pass;
    var sql='SELECT * FROM users WHERE email =?';
    conn.query(sql, [email], function (err, result, fields) {
        if(err) throw err;
        else if(result.length>0 && bcrypt.compareSync(password,result[0].pass)){
            req.session.loggedinUser= true;
            req.session.emailAddress= email;
            req.session.name = result[0].name;
            res.redirect('/home');
        }else{
            res.render('login',{alertMsg:"Wrong email or password."});
        }
    })
})

app.get('/home', function(req, res, next) {
    if(req.session.loggedinUser){
        res.render('home',{name:req.session.name})
    }else{
        res.redirect('/login');
    }
});


app.get("/add",(req,res)=>{
    res.render("add");
})

app.post("/add",(req,res)=>{
    var app_name = req.body.app_name;
    var email = req.body.email;
    var main_email = req.session.emailAddress;
    var username = req.body.username;
    var password = req.body.app_pass;

    var sql='SELECT * FROM pass_table WHERE app_name =? and main_email=?';
    conn.query(sql,[app_name,main_email],(err,result)=>{
        if(err) throw err;
        else if(result.length>0){
            var msg = app_name + " already exist";
        }
        else{
            var encrypted_password = encrypt(password);
            var sql = "INSERT INTO pass_table (app_name,main_email,email,username,pass) VALUES ('"+app_name+"','"+main_email+"','"+email+"','"+username+"','"+encrypted_password+"')";
            conn.query(sql,(err,res)=>{
                if(err) throw err;
            });
            var msg ='Password added successfully';
        }
        res.render('add',{alertMsg:msg});
    })
})


// Search box
var obj = {}
app.post("/read",(req,res)=>{
    var keyword = req.body.srch;
    var main_email = req.session.emailAddress;
    var sql='SELECT * FROM pass_table WHERE app_name =? and main_email=?';
    conn.query(sql,[keyword,main_email],(err,result)=>{
        if(err) throw err;
        else{
            if(result.length > 0){
                var decrypted_pass = decrypt(result[0].pass);
                res.render("read",{print:[{app_name:result[0].app_name,email:result[0].email,username:result[0].username,pass:decrypted_pass}]});
            }
            else{
                var msg = "Could not find result <a href='/home'>GO BACK</a>";
                res.send(msg);
            }
        }
    })
})


app.get("/all",(req,res)=>{
    var main_email = req.session.emailAddress;
    var sql='SELECT * FROM pass_table WHERE main_email=?';
    conn.query(sql,[main_email],(err,result)=>{
        if(err) throw err;
        else{
            var i = 0;
            var j = 0;
            var data = []; 
            var decr = [];
            if(result.length > 0){
                for(i;i<result.length;i++){
                    var decrypted_pass = decrypt(result[i].pass);
                    decr.push(decrypted_pass);
                }
                for(j;j<decr.length;j++){
                    var obj = {app_name:result[j].app_name,email:result[j].email,username:result[j].username,pass:decr[j]}
                    data.push(obj);
                }
                    
                
                res.render("read",{print:data});
            }
            else{
                var msg = "No stored passwords <a href='/home'>GO BACK</a>";
                res.send(msg);
            }
        }
    })

})


app.get("/edit/:app_name",(req,res)=>{
    var old_app_name = req.params.app_name;
    sql = "SELECT * FROM pass_table WHERE app_name=? and main_email =?";
    conn.query(sql,[old_app_name,req.session.emailAddress],(err,result)=>{
        if(err) throw err;
        var decrypted_pass = decrypt(result[0].pass);
        res.render("edit",{print:[{app_name:result[0].app_name,email:result[0].email,username:result[0].username,pass:decrypted_pass}]});
    })
})

app.post("/edit/:app_name",(req,res)=>{
    var new_app_name = req.body.app_name;
    var new_email = req.body.email;
    var new_username = req.body.username;
    var new_pass = req.body.app_pass;
    

    var sql = "UPDATE pass_table SET app_name=?,main_email=?,email=?,username=?,pass=? WHERE main_email=? and app_name=?";
    var encrypted_password = encrypt(new_pass);
    conn.query(sql,[new_app_name,req.session.emailAddress,new_email,new_username,encrypted_password,req.session.emailAddress,req.params.app_name],(err,result)=>{
        if(err) throw err;
        var msg = "Record updated successfully";
        res.redirect("/all");
    })
})

app.get("/delete/:app_name",(req,res)=>{
    conn.query("DELETE FROM pass_table WHERE app_name=? and main_email=?",[req.params.app_name,req.session.emailAddress], function(err, result){
        if(err) throw err;
        console.log("record deleted");
        return res.redirect("/all");
    })
})


app.get("/",(req,res)=>{
    res.render("index");
})


app.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/');
});


app.get("*",(req,res)=>{
    res.send("<h1>404 Page Not Found</h1>");
})

app.listen(5001,()=>{console.log("Server is running")})
