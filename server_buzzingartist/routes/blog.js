var BlogPost = require('../models/blogPost'); //load up blogPost model
var User = require('../models/user.js');	//load up user model
var app = require('../app.js');

exports.newBlogPost = function(req, res){
	res.render("newBlogPost", {user: req.session.user});
	console.log("User is " + req.session.user.facebook.email);
}

exports.saveNewBlogPostData = function(req, res){
	console.log(req.body);
    console.log(req.session.user.facebook.id);
    console.log(req.session.user.facebook.name);
	var newblogpost = new BlogPost();

	newblogpost.blogPost.postTitle = req.body.postTitle;
    newblogpost.blogPost.postSubtitle = req.body.postSubtitle;
	newblogpost.blogPost.postBody = req.body.postBody;
	//newblogpost.blogPost.categories = req.body.categories;
	newblogpost.blogPost.authorid = req.session.user.facebook.id; 
    newblogpost.blogPost.authorName = req.session.user.facebook.name;
    console.log(" req.body.postTags " + req.body.postTags);
    newblogpost.blogPost.tags = req.body.postTags;
	//newblogpost.blogPost.date = new Date();
	//console.log(newblogpost.blogPost.date); 

	newblogpost.save(function(err, post) {
                       if (err) {
                            console.log("Error in saving" + err);
                            res.send({completed: "NOK"});  
                        } else {
                            console.log("Saved");
                            req.session.blogId = newblogpost._id;
                            res.send({completed: "OK", redirect: "/myBlogPosts"});
                        }
                    });

};

exports.myBlogPosts = function(req, res){

	var user = req.session.user;
	var recentChangedBlogId = "";
    var recentEditedBlogId ="";

	console.log(user.facebook.id);
    console.log(req.session.blogId);
    console.log(req.session.editedblogId);
    //if(typeof req.session.blogId !='undefined') {
    if(req.session.blogId){
        console.log("New blog!!!")
        recentChangedBlogId = req.session.blogId;
        req.session.blogId = null;
    }
    //else if(typeof req.session.editedblogId != 'undefined'){
    else if(req.session.editedblogId){
        console.log("Edited!!!")
        recentEditedBlogId = req.session.editedblogId;
        req.session.editedblogId = null;
    }

	var userblogposts;
    BlogPost.find({'blogPost.authorid' : user.facebook.id}, function(err, blogposts)
    {
        //console.log(blogposts);
        //console.log(count);
        if(err)
        {
        	console.log("errror in fetching blog posts");
        }
        else
        {
        	//console.log(blogposts);
        	res.render('myBlogPosts', {userblogposts: blogposts, user: user, search:null, recentBlogId:recentChangedBlogId, editedBlogId: recentEditedBlogId});
        }
    });

    //console.log(userblogposts);
//    
};

/*exports.displayFullBlogPost = function(req, res){

    //console.log("Is this executing?");
    //res.render('blogPost.ejs', {user:req.session.user, postid:req.body.postid});
    console.log(req.body.postid);
    if(req.body.postid != undefined)
    {
        res.send({completed:"OK"});
    }

    //res.send("Hello world");
    //res.send();

};*/

exports.displayBlogPost = function(req, res){
    console.log(req.query.blogpostid);

    BlogPost.findOne({'_id' : req.query.blogpostid}, function(err, blogpost)
    {
        if(err)
            {
                console.log("Error in fetching post");
            }
        else
            {
                res.render('displayBlogPost', {post: blogpost, user: req.session.user, comments: blogpost.blogPost.comments});
            }
    });
};


exports.editBlogPost = function(req, res){

    console.log("req.query.blogpostid " + req.query.blogpostid);
    BlogPost.findOne({'_id' : req.query.blogpostid}, function(err, blogpost)
    {
        if(err)
            {
                console.log("Error in fetching post");
            }
        else
            {
                res.render('editBlogPost', {post: blogpost, user: req.session.user, comments: blogpost.blogPost.comments});
            }
    });
    
};


exports.editBlogPostData = function(req, res){
   
    console.log(req.body);

    BlogPost.findOne({'_id' : req.body.postid}, function(err, blogpost)
    {
        //console.log(blogposts);
        //console.log(count);
        if(err)
        {
            console.log("errror in fetching blog post");
        }
        else
        {
            console.log(blogpost);
            blogpost.blogPost.postTitle = req.body.postTitle;
            blogpost.blogPost.postSubtitle = req.body.postSubtitle;
            blogpost.blogPost.postBody = req.body.postBody;
            blogpost.blogPost.tags = req.body.postTags;
    
            //var d = new Date();
            //console.log(d);
            
            blogpost.save(function(err, post) {
                               if (err) {
                                    console.log("Error in saving" + err);
                                    res.send({completed: "NOK"});  
                                } else {
                                    console.log("Saved");
                                    req.session.editedblogId = blogpost._id;
                                    res.send({completed: "OK", redirect:"/myBlogPosts"});
                                }
            });
        } 
    }); //end of find function

}; //endof complete function

exports.allBlogs = function(req, res){

    BlogPost.find(function(err, allblogposts)
    {
        //console.log(blogposts);
        //console.log(count);
        if(err)
        {
            console.log("errror in fetching all blog posts");
        }
        else
        {
            console.log(allblogposts);
            res.render('allBlogs', {allposts: allblogposts, user: req.session.user, search:null});
        } 
    });
}


exports.saveCommentBlogPost = function(req, res){

    console.log("req.body.comment" + req.body.comment);
    console.log("req.body.postid" + req.body.postid);
    console.log("req.session.user.facebook.id" + req.session.user.facebook.id);

    BlogPost.findOne({'_id' : req.body.postid}, function(err, blogpost)
    {
        //console.log(blogposts);
        //console.log(count);
        if(err)
        {
            console.log("errror in fetching all blog posts");
        }
        else
        {
            console.log(blogpost);
            var arr = blogpost.blogPost.comments;
            var d = new Date();
            console.log(d);
            arr.push({commentorid:req.session.user.facebook.id, commentorName:req.session.user.facebook.name, 
                comment:req.body.comment, date:d});
            blogpost.blogPost.comments = arr;
            //newblogpost.blogPost.date = new Date();
            //console.log(newblogpost.blogPost.date); 

            blogpost.save(function(err, post) {
                               if (err) {
                                    console.log("Error in saving" + err);
                                    res.send({completed: "NOK"});  
                                } else {
                                    console.log("Saved");
                                    res.send({completed: "OK"});
                                }
                    });
        } 
    });

}

exports.searchBlogPosts = function(req, res){

    console.log(req.body);

    if(req.body.option==null)
    {
        console.log("all")
        if(req.body.search)
        {
            var redirect1 = "/searchallblogposts"+"?search="+req.body.search;
            console.log(redirect1);
            res.send({user: req.session.user, search: req.body.search, redirect: redirect1, completed:"OK"});
        }
        else{
            res.send({completed:"NOK"})
        }
    }
    else if(req.body.option == "my")
    {
         console.log("mine");
         if(req.body.search)
        {
            var redirect2 = "/searchmyblogposts"+"?search="+req.body.search;
            console.log(redirect2);
            res.send({user: req.session.user, search: req.body.search, redirect: redirect2, completed:"OK"});
        }
        else{
            res.send({completed:"NOK"})
        }
    }
    

};

exports.searchallblogposts = function(req, res){

    var search = req.query.search;
    console.log("or am i here");

    BlogPost.find({
        $or:[
        {'blogPost.postBody' : new RegExp(search, 'i')},
        {'blogPost.postTitle' : new RegExp(search, 'i')},
        {'blogPost.postSubtitle' : new RegExp(search, 'i')},
        {'blogPost.tags': search}]}, function(err, allblogposts)
    {
        //console.log(blogposts);
        //console.log(count);
        if(err)
        {
            console.log("error in fetching all blog posts");
        }
        else
        {
            //console.log(allblogposts);
            
            res.render("allBlogs", {allposts: allblogposts, user: req.session.user, search: search});
            
            //res.redirect("allBlogs.ejs", {allposts: allblogposts, user: req.session.user, search: req.body.search});
        } 
    });
}

exports.searchmyblogposts = function(req, res){

    var search = req.query.search;
    var user = req.session.user;

    console.log("am i here????");

    BlogPost.find({$and:[{'blogPost.authorid' : user.facebook.id},
        { $or:[
        {'blogPost.postBody' : new RegExp(search, 'i')},
        {'blogPost.postTitle' : new RegExp(search, 'i')},
        {'blogPost.postSubtitle' : new RegExp(search, 'i')},
        {'blogPost.tags': search}]}
        ]}, function(err, allblogposts)
    {
        //console.log(blogposts);
        //console.log(count);
        if(err)
        {
            console.log("error in fetching all blog posts");
        }
        else
        {
            //console.log(allblogposts);
            
            res.render("myBlogPosts", {userblogposts: allblogposts, user: user, search: search});
            
            //res.redirect("allBlogs.ejs", {allposts: allblogposts, user: req.session.user, search: req.body.search});
        } 
    });
}