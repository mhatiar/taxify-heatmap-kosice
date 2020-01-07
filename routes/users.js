const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const { ensureCorrectRole } = require('../config/roles');
var ObjectId = require('mongodb').ObjectId

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('pages/login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('pages/register'));

// Register
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('pages/register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('pages/register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });
        var CurrentDate = new Date();
        newUser.subscriptionUntil = CurrentDate.setMonth(CurrentDate.getMonth() + 1)
        newUser.registrationDate = new Date();

        const accessToken = jwt.sign({ userId: newUser._id }, 'topSecrETT', {
          expiresIn: "1d"
         });
        newUser.accessToken = accessToken;

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

router.get('/edit/(:id)', ensureAuthenticated, ensureCorrectRole("admin"), function(req, res, next){
	var o_id = new ObjectId(req.params.id)
	User.find({"_id": o_id}, function(err, result) {
		if(err) return console.log(err)
		
		// if user not found
		if (!result) {
			req.flash('error', 'User not found with id = ' + req.params.id)
			res.redirect('users/list')
		}
		else { // if user found
			// render to views/user/edit.ejs template file
			res.render('users/edit', {
        user: req.user,
				title: 'Edit User', 
				id: result[0]._id,
				name: result[0].name,
        email: result[0].email,
        role: result[0].role,
        subscriptionUntil: result[0].subscriptionUntil					
			})
		}
	})	
})

router.post('/edit/(:id)', ensureAuthenticated, ensureCorrectRole("admin"), function(req, res, next) {

      var user = {
          name: req.body.name,
          email: req.body.email,
          role: req.body.role,
          subscriptionUntil: req.body.subscriptionUntil
      }

      var o_id = new ObjectId(req.params.id)
      User.update({"_id": o_id}, user, function(err, result) {
          if (err) {
              req.flash('error', err)
              
              // render to views/user/edit.ejs
              res.render('users/edit', {
                  user: req.user,
                  title: 'Edit User',
                  id: req.params.id,
                  name: req.body.name,
                  email: req.body.email,
                  role: req.body.role,
                  subscriptionUntil: req.body.subscriptionUntil		
              })
          } else {
              req.flash('success', 'Data updated successfully!')
              
              // render to views/user/edit.ejs
              res.render('users/edit', {
                  user: req.user,
                  title: 'Edit User',
                  id: req.params.id,
                  name: req.body.name,
                  email: req.body.email,
                  role: req.body.role,
                  subscriptionUntil: req.body.subscriptionUntil	
              })
          }
      })        
})

router.get('/list', ensureAuthenticated, ensureCorrectRole("admin"), function(req, res, next) {	
  // fetch and sort users collection by id in descending order
  User.find({}, function(err, result) {
    res.render('users/list', {
      user: req.user,
      title: 'User List', 
      data: result
    })
  });
})

router.get('/add',ensureAuthenticated, ensureCorrectRole("admin"),  function(req, res, next){    
  // render to views/user/add.ejs
  res.render('users/add', {
      user: req.user,
      title: 'Add New User',
      name: '',
      age: '',
      email: ''        
  })
})

// ADD NEW USER POST ACTION
router.post('/add', ensureAuthenticated, ensureCorrectRole("admin"), function(req, res, next){    

  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }
  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }
  
  if( errors.length == 0 ) {   
      User.findOne({ email: email }).then(user => {
        if (user) {
          errors.push({ msg: 'Email already exists' });
          res.render('users/add', {
            user: req.user,
            errors,
            name,
            email,
            password,
            password2
          });
        } else {
          const newUser = new User({
            name,
            email,
            password
          });
          var CurrentDate = new Date();
          newUser.subscriptionUntil = CurrentDate.setMonth(CurrentDate.getMonth() + 1)
          newUser.registrationDate = new Date();
          
          const accessToken = jwt.sign({ userId: newUser._id }, 'topSecrETT', {
            expiresIn: "1d"
           });
          
          newUser.accessToken = accessToken;
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              console.log("Saving into database")
              newUser
                .save()
                .then(user => {
                  errors.push({ msg: 'New user has been created' });
                  res.render('users/add', { 
                    user: req.user,
                    errors,
                    title: 'Add New User',
                    name,
                    email
                })
                })
                .catch(err => console.log(err));
            });
          });
        }
      });      
  }
  else {   //Display errors to user
      res.render('users/add', { 
          errors,
          user: req.user,
          title: 'Add New User',
          name: req.body.name,
          email: req.body.email
      })
  }
})

router.post('/delete/(:id)', ensureAuthenticated, ensureCorrectRole("admin"), function(req, res, next) {    
  var o_id = new ObjectId(req.params.id)
  User.deleteOne({"_id": o_id}, function(err, result) {
      if (err) {
          req.flash('error', err)
          // redirect to users list page
          res.redirect('/users/list')
      } else {
          req.flash('success', 'User deleted successfully! id = ' + req.params.id)
          // redirect to users list page
          res.redirect('/users/list')
      }
  })    
})

//http://blog.chapagain.com.np/node-js-express-mongodb-simple-add-edit-delete-view-crud/

module.exports = router;
