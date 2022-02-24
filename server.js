import express from 'express';
import bcrypt from 'bcrypt-nodejs'
import knex  from 'knex';

// Environmental Variables:
const PORT = process.env.PORT || 5000

const server = express();

// Connecting to the Database:
const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port : 5432,
      user : 'postgres',
      password : 'admin',
      database : 'smart-brain'
    }
})

// middleware:
server.use(express.json());


const database = {
    users: [
        {
            id: 1,
            name: "Vince",
            password: "code",
            email: "vince@gmail.com",
            entries: 0,
            joined: new Date()
        },
        {
            id: 2,
            name: "Vince",
            password: "code",
            email: "vince@gmail.com",
            entries: 0,
            joined: new Date()
        },
        {
            id: 3,
            name: "Vince",
            password: "code",
            email: "vince@gmail.com",
            entries: 0,
            joined: new Date()
        }
    ]
}

server.get('/', (req, res) => {
    res.send("You're home!");
})


// SignIn route:
server.post('/signin', (req,res) => {
    const {email, password} = req.body;
    db('login').select('hash').where({email}).then(passwordHash => {
        bcrypt.compare(password, passwordHash[0].hash, function(err, res) {
            if(res){
                console.log("Success?")
            }
            else{
                console.log("Error?")
            }
        });
    }).then(console.log)
    .catch(err => {
        console.log("Error Signing in: ", err);
    })
})

// Register route:
server.post('/register', (req,res) => {
    // get req body, add date joined, and entries to it : )
    const reqBody = req.body;
    const {email, password, name} = reqBody;
    bcrypt.hash(password, null, null, function(err, hash) {
        db.transaction(trx => {
            trx('login').insert({
                email,
                hash
            }).returning('email')
            .then(loginEmail => {
                trx('users').insert({
                    name: name,
                    email: loginEmail[0].email,
                    joined: new Date()})
                    .returning('*')
                    .then(user => {
                        res.status(201);
                        res.json(user[0]);
                    })
                    .then(trx.commit)
                    .catch(err => {
                        res.json("Something went wrong.")
                    });
            }).catch(err => {
                console.log("Error registering.");
            })
        })
    });
})

// Profile route:
server.get('/profile/:userId', (req, res) => {
    const userId = req.params.userId;
    db('users').select("*").where({id: userId})
    .then(user => {
        if(user.length){
            res.status(200).json(user[0])
        }
        else{
            res.json("Error getting user profile");
        }
    }).catch(err => {
        res.json("Nope?")
        console.log("Error getting user: ", err);
    })
})

// Image route:
server.put('/image', (req, res) => {
    const userId = req.body.userId;
    db('users')
    .where('id', '=', userId)
    .increment({
        entries: 1,
    }).returning("entries")
    .then(entries => {
        res.json(entries[0].entries);
    })
    .catch(err => {
        res.json("Error Updating you entries count")
        console.log("Error incrementing value: ", err);
    })
})

server.listen(PORT, () => {
    console.log(`server listening for connections on PORT: ${PORT}`);
})