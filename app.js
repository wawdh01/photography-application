const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const ejsLint = require('ejs-lint');
const flash = require('connect-flash');
const path = require("path");
const session = require("express-session");
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(morgan('combined'));

app.use(session({
    secret: "abcd@123",
    resave: false,
    saveUninitialized: false
}));
app.use(flash())


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    if (req.cookies.token != null) {
      res.locals.isLoggedIn = true
    }
    else {
      res.locals.isLoggedIn = false
    }
    next();
});


app.listen(PORT, ()=>console.log(`The server is started at PORT : ${PORT}`));


app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


mongoose.connect(process.env.MDB_CONNECT)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

//swagger changes
const swaggerDocument = YAML.load("./docs/openapi.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));



//UI for ejs engine configuration
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.set("views", path.join(__dirname, "views"));

app.use("/auth", require('./routers/userRouter'));
app.use("/order", require('./routers/orderRouter'));
app.use("/cart", require('./routers/cartRouter'));
app.use("/catalogue", require('./routers/catalogueRouter'));
app.use("/contact", require('./routers/contactRouter'));
app.use("/", require('./routers/homeRouter'));