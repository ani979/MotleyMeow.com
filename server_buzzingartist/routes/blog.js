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
    console.log("picture is " + req.session.user.local.picture);
    newblogpost.blogPost.authorPic = req.session.user.local.picture;
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
    BlogPost.find({'blogPost.authorid' : user.facebook.id}).sort({'blogPost.date': -1 }).exec(function(err, blogposts) {
   
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

exports.displayComments = function(req, res){
    console.log(req.query.blogpostid);

    BlogPost.distinct("blogPost.comments", {'_id' : req.query.blogpostid}, function(err, comments)
    {
        if(err)
            {
                console.log("Error in fetching post comments");
            }
        else
            {

                    comments = comments.sort(function(a, b){
                    var keyA = new Date(a.date),
                    keyB = new Date(b.date);
                    // Compare the 2 dates
                    if(keyA < keyB) return 1;
                    if(keyA > keyB) return -1;
                    return 0;
                    });

                res.render('commentsOnBlog.ejs', {comments: comments, user:req.session.user});
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

    BlogPost.find({'blogPost.approved':true}, function(err, allblogposts) {
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
                commentorPic: req.session.user.local.picture, comment:req.body.comment, date:d});
            blogpost.blogPost.comments = arr;
            //newblogpost.blogPost.date = new Date();
            //console.log(newblogpost.blogPost.date); 

            blogpost.save(function(err, post) {
                               if (err) {
                                    console.log("Error in saving" + err);
                                    res.send({completed: "NOK"});  
                                } else {
                                    console.log("Saved");
                                    //res.render("commentsOnBlog.ejs", {comments:post.blogPost.comments});
                                    res.send({completed: "OK"});
                                }
                    });
        } 
    });

}

exports.searchBlogPosts = function(req, res){

    console.log(req.body);
    console.log("req.body.option = " + req.body.option);

    if(req.body.option==null || req.body.option == "")
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
        {'blogPost.tags': search}],
        'blogPost.approved':true}, function(err, allblogposts) {
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

exports.deleteBlogPost = function(req, res) {
    console.log("Going to delete a blog req.body " + req.body);
    BlogPost.remove({ '_id' : req.body.postid }, function(error, db) {
      if (error) {
          console.log('info', "Error while removing the blog")
          res.send({completed: "NOK"});
      } else {
            console.log("Forum post delete");
            res.send({completed: "OK", redirect: "/myBlogPosts"});
       }
  });  
}

exports.deleteBlogComment = function(req, res) {
    console.log("Going to delete a comment of blog " + req.body.commentDate);

    BlogPost.findOne({ '_id' : req.body.threadid }, function(error, db) {
      if (error) {
          console.log('info', "Error while fetching the forum thread")
          res.send({completed: "NOK"});
      } else {
            
            for(index = 0; index < db.blogPost.comments.length ; index++) {
                var result = db.blogPost.comments[index];
                console.log("NOT FOUND " + result.commentorid)
              if(result.commentorid == req.body.commentorid && result.date.getTime() == new Date(req.body.commentDate).getTime()) {
                console.log("FOUND " + result.commentorid)
                  //Remove from array
                  db.blogPost.comments.splice(index, 1);
                  db.save(function(err, eupdate){
                        if(eupdate)
                        {
                            console.log("Saved");
                        }
                    });
                  break;
              }    
           }
            res.send({completed: "OK"});
       }
  }); 
}   

  exports.editBlogComment = function(req, res) {
    console.log("Going to edit a comment of Blog " + req.body.commentDate);

    BlogPost.findOne({ '_id' : req.body.threadid }, function(error, db) {
      if (error) {
          console.log('info', "Error while fetching the forum thread")
          res.send({completed: "NOK"});
      } else {
            console.log("Forum post delete " + JSON.stringify(db.blogPost.comments) + "lenght is " + db.blogPost.comments.length);
            //findAndRemove(db.replies, 'commentorid', req.body.commentorid, 'date', req.body.date);
            for(index = 0; index < db.blogPost.comments.length ; index++) {
                var result = db.blogPost.comments[index];
                console.log("NOT FOUND " + result.commentorid)
              if(result.commentorid == req.body.commentorid && result.date.getTime() == new Date(req.body.commentDate).getTime()) {
                console.log("FOUND " + result.commentorid)
                  //Remove from array
                  db.blogPost.comments[index].comment = req.body.comment;
                  db.save(function(err, eupdate){
                        if(eupdate)
                        {
                            console.log("Saved");
                        }
                    });
                  break;
              }    
           }
            res.send({completed: "OK"});
       }
  });
}    

exports.approveBlogs = function(req, res){

    BlogPost.find({}, function(err, posts) {
        //console.log(blogposts);
        //console.log(count);
        if(err)
        {
            console.log("errror in fetching all blog posts");
        }
        else
        {
            console.log(req.session.user.local.admin);
            //console.log(allblogposts);
            res.render('approveBlogs', {posts: posts, user: req.session.user});
        } 
    });

}

exports.changeApprovalStatus = function(req, res){
    console.log(req.body.postid);
    var id = req.body.postid;

    BlogPost.findOne({ '_id' : req.body.postid }, function(error, post) {
      if (error) {
          console.log('info', "Error while fetching the forum thread")
          res.send({completed: "NOK"});
      } 

      else{

        var x = post.blogPost.approved;
        var y = !x; 
        var text="";

        if(y == true) //it is now approved
        {
            text = "Disapprove Post";
        }
        else{
            text = "Approve Post";
        }

        post.blogPost.approved = y;

        post.save(function(err, post) {
                               if (err) {
                                    console.log("Error in saving" + err)  
                                } else {
                                    console.log("Saved");
                                    res.send({completed: "OK", text: text, id: id, approved: y});
                                }
            });

      }
  });
};