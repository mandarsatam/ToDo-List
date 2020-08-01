const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.set("view engine", "ejs");


mongoose.connect("mongodb+srv://mandarsatam:mandar1997@cluster0.y9mcg.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true })

const newItemSchema = {
    name: "String"
};

const Item = mongoose.model("Item", newItemSchema);

const item1 = new Item({
    name: "Welcome to todo list"
});

const item2 = new Item({
    name: "Hit + to add new items and checkbox to cross the items in the list"
});

const itemArray = [item1, item2];

const ListSchema = {
    name: String,
    items: [newItemSchema]
};

const List = mongoose.model("List", ListSchema);


app.get("/", function(req, res) {

    Item.find({}, function(err, foundItems) {
        if (foundItems.length == 0) {
            Item.insertMany(itemArray, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully inserted default items");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", { kindOfDay: "Today", newListItem: foundItems });
        }
    })



});

app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, function(err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: itemArray
                });
                list.save();
                res.redirect("/" + customListName);

            } else {
                res.render("list", { kindOfDay: foundList.name, newListItem: foundList.items });
            }
        }
    })


})

app.post("/", function(req, res) {
    const itemName = req.body.item;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });

    if (listName == "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }


})

app.post("/delete", function(req, res) {
    const checkedId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName == "Today") {
        Item.findByIdAndRemove(checkedId, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully deleted item");
            }
        })
        res.redirect("/")

    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedId } } }, function(err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            } else {
                console.log(err);
            }
        })

    }



})

let port = process.env.port;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function() {
    console.log("Server is running");
})