// Get the packages we need
var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    secrets = require('./config/secrets'),
    bodyParser = require('body-parser');

// Create our Express application
var app = express();

// Use environment defined port or 4000
var port = process.env.PORT || 3000;

// Connect to a MongoDB
mongoose.connect(secrets.mongo_connection, { useMongoClient: true});

// Allow CORS so that backend and frontend could be put on different servers
var allowCrossDomain = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
};

// Import Schemas
var User = require('./models/user.js');
var Task = require('./models/task.js');

app.use(allowCrossDomain);

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//routes
//======================================================================================

//route: ./users
//---------------------------------------------------------

router.route('/users')

    //GET: Respond with a list of users
    .get(function(req,res){

        let where = {};
        if (req.query.where != undefined){
            where = JSON.parse(req.query.where)
        }

        let select = {};
        if (req.query.select != undefined){
            select = JSON.parse(req.query.select)
        }

        let j_sort = {};
        if (req.query.sort != undefined){
            j_sort = JSON.parse(req.query.sort)
        }

        User.find(where,
            select,
            {
                skip:Number(req.query.skip),
                limit:Number(req.query.limit),
                sort: j_sort
            },
            function(err,users){
                if(err){
                    res.status(500).json({
                        message:"We don't know what happened!",
                        data:[]
                    })
                    return;
                }

                if(req.query.count){
                    res.json({
                        message: "OK",
                        data: users.length
                    });
                    return;
                }

                res.json({
                    message: "OK",
                    data: users
                });

            });

    })

    //POST
    .post(function(req,res){

        if(req.body.name === undefined && req.body.email === undefined){

            res.status(500).json({
                message: "Validation Error: A name is required! An email is required!",
                data:[]
            });
            return;
        }

        if(req.body.email === undefined){

            res.status(500).json({
                message: "An email is required!",
                data:[]
            });
            return;
        }

        if(req.body.name === undefined){

            res.status(500).json({
                message: "Validation Error: A name is required!",
                data:[]
            });
            return;
        }

        User.find({email:req.body.email},function(err,data){

            if(data.length > 0){

                res.status(500).json({
                    message: "This email already exists",
                    data:[]
                })
            }
            else{
                let user = new User();
                user.name = req.body.name;
                user.email = req.body.email;
                user.pendingTasks = req.body.pendingTasks;
                if(req.body.pendingTasks === undefined){
                    user.pendingTasks = []
                }

                user.save(function(err,user){
                    if(err)
                        res.send(err);

                    res.status(201).json({
                        message: "User added",
                        data: user
                    });
                })
            }
        })
    })

//--------------------------------------------------------------
//route: users/:id

router.route("/users/:id")


    .get(function(req,res){
        User.findById(req.params.id, function(err,user){

            if(err){
                res.status(404).json({
                    message: "User not found",
                    data: []
                });
                return;
            }

            res.json({
                    message: "OK",
                    data: user
            });
        });
    })

    //PUT
    .put(function(req, res){

        User.findById(req.params.id, function(err,user){

            if(err){
                res.status(404).json({
                    message: "User not found",
                    data: []
                });
                return;
            }

            if(req.body.name === undefined && req.body.email === undefined){
                res.status(500).json({
                    message: "Validation Error: A name is required! An email is required!",
                    data:[]
                });
                return;
            }

            if(req.body.email === undefined){
                res.status(500).json({
                    message: "An email is required!",
                    data:[]
                });
                return;
            }

            if(req.body.name === undefined){
                res.status(500).json({
                    message: "Validation Error: A name is required!",
                    data:[]
                });
                return;
            }

            User.find({email:req.body.email},function(err,data){
                if(data.length > 0 && data[0].email != user.email){
                    res.status(500).json({
                        message: "This email already exists",
                        data:[]
                    })
                }
                else{
                    user.name = req.body.name;
                    user.email = req.body.email;
                    user.pendingTasks = req.body.pendingTasks;
                    if(req.body.pendingTasks === undefined){
                        user.pendingTasks = []
                    }

                    user.save(function(err,user){
                        if(err)
                            res.send(err);

                        res.json({
                            message: "User updated",
                            data: user
                        });
                    })
                }
            })

        })
    })

    .delete(function(req,res){
        User.remove({ _id: req.params.id}, function(err,user){
            if(err){
                res.status(404).json({
                    message: "User not found",
                    data: []
                });
                return;
            }

            res.json({
                message:"User deleted",
                data:[]
            });
        });
    })



//---------------------------------------------------------------
//route: tasks

router.route("/tasks")

    .get(function(req,res){
        let where = {};
        if (req.query.where != undefined){
            where = JSON.parse(req.query.where)
        }

        let select = {};
        if (req.query.select != undefined){
            select = JSON.parse(req.query.select)
        }

        let j_sort = {};
        if (req.query.sort != undefined){
            j_sort = JSON.parse(req.query.sort)
        }

        Task.find(where,
            select,
            {
                skip:Number(req.query.skip),
                limit:Number(req.query.limit),
                sort: j_sort
            },
            function(err,tasks){
                if(err){
                    res.status(500).json({
                        message:"We don't know what happened!",
                        data:[]
                    })
                    return;
                }

                if(req.query.count){
                    res.json({
                        message: "OK",
                        data: tasks.length
                    });
                    return;
                }

                res.json({
                    message: "OK",
                    data: tasks
                });

            });
    })

    .post(function(req,res){

        if(req.body.name === undefined && req.body.deadline === undefined){
            res.status(500).json({
                message: "Validation Error: A name is required! A deadline is required! ",
                data: []
            })
            return;
        }

        if(req.body.name === undefined){
            res.status(500).json({
                message: "Validation Error: A name is required! ",
                data: []
            })
            return;
        }

        if(req.body.deadline === undefined){
            res.status(500).json({
                message: "A deadline is required! ",
                data: []
            })
            return;
        }

        task = new Task();
        task.name = req.body.name;
        task.description = req.body.description;
        if(req.body.description === undefined){
            task.description = "";
        }
        task.deadline = req.body.deadline;
        task.completed = req.body.completed;
        if(req.body.completed === undefined){
            task.completed = false;
        }
        task.assignedUser = req.body.assignedUser;
        if(req.body.assignedUser === undefined){
            task.assignedUser = "";
        }
        task.assignedUserName = req.body.assignedUserName;
        if(req.body.assignedUserName === undefined){
            task.assignedUserName = "unassigned";
        }

        task.save(function(err,task){
            if(err)
                res.send(err);
            res.status(201).json({
                message: "Task added",
                data: task
            });
        });
    })

//---------------------------------------------------------------
//route: tasks/:id

router.route("/tasks/:id")

    .get(function(req,res){
        Task.findById(req.params.id, function(err,task){
            if(err){
                res.status(404).json({
                    message:"Task not found",
                    data:[]
                });
                return;
            }

            res.json({
                message: "OK",
                data: task
            });
        })


    })

    .put(function(req,res){
        Task.findById(req.params.id, function(err,task){
            if(err){
                res.status(404).json({
                    message: "Task not found",
                    data:[]
                });
                return;
            }

            if(req.body.name === undefined && req.body.deadline === undefined){
                res.status(500).json({
                    message: "Validation Error: A name is required! A deadline is required! ",
                    data: []
                })
                return;
            }

            if(req.body.name === undefined){
                res.status(500).json({
                    message: "Validation Error: A name is required! ",
                    data: []
                })
                return;
            }

            if(req.body.deadline === undefined){
                res.status(500).json({
                    message: "A deadline is required! ",
                    data: []
                })
                return;
            }

            task.name = req.body.name;
            task.description = req.body.description;
            if(req.body.description === undefined){
                task.description = "";
            }
            task.deadline = req.body.deadline;
            task.completed = req.body.completed;
            if(req.body.completed === undefined){
                task.completed = false;
            }
            task.assignedUser = req.body.assignedUser;
            if(req.body.assignedUser === undefined){
                task.assignedUser = "";
            }
            task.assignedUserName = req.body.assignedUserName;
            if(req.body.assignedUserName === undefined){
                task.assignedUserName = "unassigned";
            }

            task.save(function(err,task){
                if(err)
                    res.send(err);
                res.json({
                    message: "Task updated",
                    data: task
                });
            });
        })
    })

    .delete(function(req,res){
        Task.remove({ _id: req.params.id}, function(err,task){
            if(err){
                res.status(404).json({
                    message: "Task not found",
                    data:[]
                });
                return;
            }

            res.json({
                message:"Task deleted",
                data:[]
            });
        })
    })

//=================================================================
// Use routes as a module (see index.js)
require('./routes')(app, router);

// Start the server
app.listen(port);
console.log('Server running on port ' + port);
