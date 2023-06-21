const path = require("path");

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

const bodyParser = require("body-parser");

const errorController = require("./controllers/error");

const User = require("./models/user");

const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
var cron = require("node-cron");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

const MONGODB_URI =
  "mongodb+srv://nodejsshop23:nodejsshop23@cluster0.npgx5av.mongodb.net/nodejsshop?retryWrites=true&w=majority";

const app = express();
const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use((req, res, next) => {
  (res.locals.isAuthenticated = req.session.isLoggedIn),
    (res.locals.csrfToken = req.csrfToken());
  next();
});

// app.use((req, res, next) => {
//   User.find({ email: "collo@gmail.com" })
//     .then((user) => {
//       console.log(user);
//       next();
//     })
//     .catch((err) => console.log(err));
// });

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    cron.schedule("*/10 * * * * *", () => {
      
      User.find({ signin: 1 }).then((data) => {
        data.forEach((item) => {
          transporter.sendMail({
            to: item.email,
            from: "collinsfrontend@gmail.com",
            subject: "Signup succeeded!",
            html: "<h1>You successfully signed up!</h1>",
          });
          console.log("Signin email sent");
          User.updateMany({ signin: 1 }, { signin: 0 }).then((user) => {
            console.log(user);
          });
        });
      });
    });

    console.log("connected");
    app.listen(3000);
  })
  .catch((err) => console.log(err));
