const path = require("path");

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");

const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("647de833738175e9f8059bca")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    "mongodb+srv://nodejsshop23:nodejsshop23@cluster0.npgx5av.mongodb.net/nodejsshop?retryWrites=true&w=majority"
  )
  .then(() => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "Collo",
          email: "dev@gmail.com",
          cart: {
            items: [],
          },
        });
        user.save();
      }
    });

    console.log("connected");
    app.listen(3000);
  })
  .catch((err) => console.log(err));
