require("dotenv").config();
const connection = require('./db-config');
const express = require("express");
const User = require('./models/user.js');
const app = express();
const port = process.env.PORT ?? 3000;

app.listen(port, (err) => {
  if (err) {
    console.error("Something bad happened");
  } else {
    console.log(`Server is listening on ${port}`);
  }
});

connection.connect((err) => {
  if (err) {
    console.error('error connecting: ' + err.stack);
  } else {
    console.log('connected to database with threadId :  ' + connection.threadId);
  }
});

app.use(express.json());

/*connection.query("SELECT * FROM movies", (error, result) => {
  console.log(error, result);
})*/

app.get('/api/movies', (request, response) => {
  let sql = "SELECT * FROM movies";
  const sqlValues = [];
  let andWhere = ' AND';

  if (request.query.color) {
    sql += ' WHERE color = ?';
    sqlValues.push(request.query.color);
    console.log(request.query);
  };

  if (request.query.max_duration) {
    !request.query.color ? andWhere = ' WHERE' : '';
    sql += andWhere + ' duration <= ?';
    sqlValues.push(request.query.max_duration);
    console.log(request.query);
  }

  connection.query(sql, sqlValues, (error, result) => {
    if (error) {
      console.log(error, result);
      response.status(500).send('Error retrieving data from database');
    } else {
      response.status(200).json(result)
    }
  });
});

app.get('/api/movies/:id', (request, response) => {
  const movieId = request.params.id;

  connection.query('SELECT * FROM movies WHERE id = ?', [movieId], (error, result) => {
    if (error) {
      response.status(500).send('Could not retrieve movie data');
    } else if (result.length === 0) {
      response.status(404).send('Movie not found')
    } else {
      response.status(200).json(result[0]);
    }
  });
});

app.post("/api/movies", (request, response) => {
  const { title, director, year, color, duration } = request.body;

  const errors = [];

  if (!title)
    errors.push({ field: 'title', message: 'This field is required.' });
  else if (title.length >= 255)
    errors.push({ field: 'title', message: 'Should contain less than 255 characters.' });
  else if (title.length < 1)
    errors.push({ field: 'title', message: 'This field cannot be empty.' })
  
  if (director.length < 1)
    errors.push({ field: 'director', message: 'This field cannot be empty.' });
  else if (director.length >= 255)
    errors.push({ field: 'director', message: 'Should contain less than 255 characters.' });
  
  if (typeof year != 'number')
    errors.push({ field: 'year', message: 'Should be a number.' });
  else if (year < 1888)
    errors.push({ field: 'year', message: 'A movie cannot exists prior to the invention of cinema.' })
  
  if (typeof color != 'boolean')
    errors.push({ field: 'color', message: 'If a movie has color or not is a yes/no statement, duh.' })

  if (typeof duration != 'number')
    errors.push({ field: 'duration', message: 'Should be a number.' });
  if (duration < 0)
    errors.push({ field: 'duration', message: 'A movie cannot be shorter than 0, duh.' })

  if (errors.length) {
    response.status(422).json({ validationErrors: errors });
  } else {
    connection.query('INSERT INTO movies (title, director, year, color, duration) VALUES (?, ?, ?, ?, ?)',
      [title, director, year, color, duration],
      (error, result) => {
        if (error) {
          response.status(500).send('Error saving the movie');
        } else {
          const id = result.insertId;
          const createdMovie = { id, title, director, year, color, duration };
          response.status(201).send(createdMovie);
        }
      }
    );
  }
});

app.put('/api/movies/:id', (request, response) => {
  const { movieId } = request.params;
  const moviePropsToUpdate = request.body;

  const errors = [];

  if (title.length >= 255)
    errors.push({ field: 'title', message: 'Should contain less than 255 characters.' });
  else if (title.length < 1)
    errors.push({ field: 'title', message: 'This field cannot be empty.' })
  
  if (director.length < 1)
    errors.push({ field: 'director', message: 'This field cannot be empty.' });
  else if (director.length >= 255)
    errors.push({ field: 'director', message: 'Should contain less than 255 characters.' });
  
  if (typeof year != 'number')
    errors.push({ field: 'year', message: 'Should be a number.' });
  else if (year < 1888)
    errors.push({ field: 'year', message: 'A movie cannot exists prior to the invention of cinema.' })
  
  if (typeof color != 'boolean')
    errors.push({ field: 'color', message: 'If a movie has color or not is a yes/no statement, duh.' })

  if (typeof duration != 'number')
    errors.push({ field: 'duration', message: 'Should be a number.' });
  if (duration < 0)
    errors.push({ field: 'duration', message: 'A movie cannot be shorter than 0, duh.' })

  if (errors.length) {
    response.status(422).json({ validationErrors: errors });
  } else {
    connection.query('UPDATE movies SET ? WHERE id = ?', [moviePropsToUpdate, movieId],
    (error) => {
      if (error) {
        response.status(500).send('Error updating movie data');
      } else if (result.affectedRows === 0) {
        response.status(404).send(`Movie with ID ${movieId} not found`);
      } else {
        response.sendStatus(204);
      }
    });
  }
});

app.delete('/api/movies/:id', (request, response) => {
  const movieId = request.params.id;

  connection.query('DELETE FROM movies WHERE id = ?', [movieId],
  (error, result) => {
    if (error) {
      response.status(500).send('Could not delete this movie');
    } else {
      response.status(200).send('Movie successfully deleted !');
    }
  });
});




app.get('/api/users', (request, response) => {
  let sql = 'SELECT * FROM users';
  const sqlValues = [];

  if (request.query.language) {
    sql += ' WHERE language = ?';
    sqlValues.push(request.query.language);
  }

  connection.query(sql, sqlValues, (error, result) => {
    if (error) {
      console.log(error);
      response.status(500).send('error retrieving data from database');
    } else {
      response.status(200).json(result);
    }
  });
});

app.get('/api/users/:id', (request, response) => {
  const userId = request.params.id;
  
  connection.query('SELECT * FROM users WHERE id = ?', [userId], (error, result) => {
    if (error) {
      response.status(500).send('Cannot retrieve this user');
    } else {
      response.status(200).json(result[0]);
    }
  })
});

app.post('/api/users', (request, response) => {
  const { firstname, lastname, email, city, language, password } = request.body;

  connection.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    (err, result) => {
      if (result[0]) {
        console.error(err);
        res.status(409).json({ message: 'This email is already used' });
      }
    }
  );
  const errors = [];

  if (!firstname)
    errors.push({ field: 'firstname', message: 'This field is required' });
  else if (firstname.length >= 255)
    errors.push({ field: 'firstname', message: 'Should contain less than 255 characters' });
  
    if (!lastname)
    errors.push({ field: 'lastname', message: 'This field is required' });
  else if (lastname.length >= 255)
    errors.push({ field: 'lastname', message: 'Should contain less than 255 characters' });
  
    if (!email)
    errors.push({ field: 'email', message: 'This field is required' });
  else if (email.length >= 255)
    errors.push({ field: 'email', message: 'Should contain less than 255 characters' });
  
  if (city.length >= 255 || language.length >= 255)
    errors.push({ field: 'city', message: 'Should contain less than 255 characters' })

  const emailRegex = /[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,3}/;
  if (!emailRegex.test(email))
    errors.push({ field: 'email', message: 'Invalid email' });

  if (!password) {
    errors.push({ field: 'password', message: 'You must have a password.' });
  } else if (password.length < 8) {
    errors.push({ field: 'password', message: 'Your password must contain 8 characters.'});
  }

  if (errors.length) {
    response.status(422).json({ validationErrors: errors });
  } else {
    User.hashPassword(password).then((hashedPassword) => {
      connection.query('INSERT INTO users (firstname, lastname, email, city, language, hashedPassword) VALUES (?, ?, ?, ?, ?, ?)',
      [firstname, lastname, email, city, language, hashedPassword],
      (error, result) => {
        console.log(error);
        if (error) {
          response.status(500).send('Error saving the user');
        } else {
          const id = result.insertId;
          const createdUser = { id, firstname, lastname, email };
          response.status(201).json(createdUser);
        }
      })
    })
  }
});

app.post('/api/auth/checkCredentials', (request, response) => {
  const { email, password } = request.body;

  connection.query('SELECT * FROM users WHERE email = ?', [email], (error, result) => {
    if (error) {
      response.status(500).send('error retrieving user from database');
    } else {
      /*const userToCheck = response.json(result[0]);*/

      User.verifyPassword(password, result[0].hashedPassword)
      .then((passwordIsCorrect) => {
      if (passwordIsCorrect) {
        response.status(200).send('Credentials are valid');
      } else {
        response.status(401).send('Invalid credentials');
      }
    });
    }
  });
});

app.put('/api/users/:userId', (request, response) => {
  const { userId } = request.params;
  const userPropsToUpdate = request.body;

  connection.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    (err, result) => {
      if (result[0]) {
        console.error(err);
        res.status(409).json({ message: 'This email is already used' });
      }
    });
  const errors = [];

  if (!firstname)
    errors.push({ field: 'firstname', message: 'This field is required' });
  else if (firstname.length >= 255)
    errors.push({ field: 'firstname', message: 'Should contain less than 255 characters' });
  if (!lastname)
    errors.push({ field: 'lastname', message: 'This field is required' });
  else if (lastname.length >= 255)
    errors.push({ field: 'lastname', message: 'Should contain less than 255 characters' });
  if (!email)
    errors.push({ field: 'email', message: 'This field is required' });
  else if (email.length >= 255)
    errors.push({ field: 'email', message: 'Should contain less than 255 characters' });
  if (city.length >= 255 || language.length >= 255)
    errors.push({ field: 'city', message: 'Should contain less than 255 characters' })

  const emailRegex = /[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,3}/;
  if (!emailRegex.test(email))
    errors.push({ field: 'email', message: 'Invalid email' });

  if (errors.length) {
    response.status(422).json({ validationErrors: errors });
  } else {
  
    connection.query("UPDATE users SET ? WHERE id = ?", [userPropsToUpdate, userId],
      (error) => {
        if (error) {
          response.status(500).send('Error updating a user');
        } else if (result.affectedRows === 0) {
          response.status(404).send(`User with ID ${userId} not found`);
        } else {
          response.status(204).send('User updated successfully !');
        }
      }
    );
  }
});

app.delete('/api/users/:id', (request, response) => {
  const userId = request.params.id;

  connection.query('DELETE FROM users WHERE id = ?', [userId],
  (error, result) => {
    if (error) {
      response.status(500).send('Could not delete this data');
    } else {
      response.status(200).send('Data successfully deleted !');
    }
  });
});