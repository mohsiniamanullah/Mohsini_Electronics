// A Node.js WebServer app

// import the Express server and other modules/libraries:
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

// create an instance of an Express application, 
// which is traditionally assigned to the variable named app.
// The app object becomes the central point for defining routes, 
// handling requests, configuring middleware, and so on
const app = express();

// Serve static files from the 'public' directory
app.use(express.static('public'));

// setup the port on which the webserver listens for requests
const port = 4000;


// Insert the rest of the web server's code here ....
// Setup mysql connection parameters
const db = mysql.createConnection(
	{
		host: 'localhost',
		user: 'root',
		password: 'A.success.786',
		database: 'mohsini_electronics' 
	}
	);

// connect to MySQL
db.connect( function(err)
	{
		if(err)
			throw err;
		console.log('Successfully connected to MYSQL db server.');
	}
);


// Middleware
// By adding bodyParser, we ensure our server handles incoming requests
// through the expresss middleware. So, parsing the the body of the incoming requests
// is part  of the procedure that our middleware takes on when handing incoming requests. 
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs'); //ejs = (embedded javascript)


//Routes
//Simply display the home/index page
//if page is index.html, then specify the name like: app.get('/home.html')

app.get('/', function(req, res)
	{
		console.log("Serving the index.ejs file by the webserver...");
		res.render('index');

	});


app.get('/contact', function(req, res)
	{
		console.log("Serving the contact.ejs file by the webserver...");
		res.render('contact');

	});


app.get('/products', function(req, res)
	{
		console.log("Serving the products.ejs file by the webserver...");
		res.render('products');

	});



// Fetch available products from the database and display them on the purchase page
app.get('/purchase', function(req, res){
	db.query('SELECT * FROM products', function(err, resultSet){

		if (err)
			throw err;
		console.log("Serving the purchase.ejs file by the webserver...");
		console.log("'allproducts' from db (contained in the resultSet): ", resultSet);
		res.render('purchase', {allproducts: resultSet} );  //objects are put inside {} curly braces
	}

	);

	}

	);



// Create a route to handle customer registration and save the customer information to the database
app.post('/purchase', function(req, res) {

console.log("The req.body: ", req.body); 


// The req.body property is used to access the data sent by the client in POST requests
// The order and the names on the left-hand side have to match the 'name' attribute of
// the 'input' elements of the 'form' element on the 'register.ejs' file.
// The format of the 'req.body' object is as follows:
// { the_customer_name: 'aName', 
// the_customer_email: 'anEmail', 
// the_product_id: 'aNumber' } 
//const { the_customer_name, the_customer_email, the_product_id } = req.body; 
const {the_customer_name, the_customer_email, the_RecNumber } = req.body; 

// Insert products record into the 'products' table
db.query(
'INSERT INTO customers (name, email, pwd) VALUES (?, ?, ?)',
[the_customer_name, the_customer_email, 'defaultPassword'], // You should encrypt the password
function(err, customerResult) {
if (err) 
throw err;

console.log(customerResult); 

// The id value of the inserted record is saved in the 'customerResult.insertId'
const customerId = customerResult.insertId;


// Insert registration info into the registrations table
db.query(
'INSERT INTO registrations (customer_id, product_id) VALUES (?, ?)',
[customerId, the_RecNumber],
function(err) {
if (err) 
 throw err; 

db.query('SELECT * FROM products WHERE RecNumber = ?', 
 [the_RecNumber],
 function(err, registeredProductResultSet) {
 if (err) 
 throw err;

 // Note: the 'registeredProductResultSet' is an array structure!
 console.log("The 'registeredProductResultSet'): ", registeredProductResultSet);

 console.log("Serving the SUCCESS.ejs file by the Webserver...");
 
//res.render('success');
 res.render('success', { customerName: the_customer_name,
 						regdProductID: the_RecNumber, 
 						regdProductName: registeredProductResultSet[0].ProductName, 
 						regdCourseDesc: registeredProductResultSet[0].Description } );
	
	 }

		);
		 } 

			); 

		}
	); 
});







// Start the server
app.listen(port, function(err)
{
	if(err)
		console.log(err);
	console.log(`The webserver app is running on http://localhost:${port}`);
});