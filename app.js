//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const { Db } = require("mongodb");

const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://Aarsha:test123@cluster0.wvtakcf.mongodb.net/todolistDB",{useNewUrlParser: true});

const itemsSchema={
    name:String
};
const Item=mongoose.model("Item",itemsSchema);

const item1= new Item({
  name: "Welcome!"
});
const item2= new Item({
  name: "Hit the + button to add an item."
});
const item3= new Item({
  name: "Hit the checkbox to delete an item"
});
const defaultItems=[item1,item2,item3];

const listSchema={
  name: String,
  items: [itemsSchema]
};
const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({},function(err,results){
    if(err){
      console.log(err);
    }
    else{
      if(results.length===0){
        Item.insertMany(defaultItems,function(err){
          if(err){
            console.log(err);
          }
          else{
            console.log("Successfully added!");
          }
        })
      res.redirect("/");
      }
      else{
        res.render("list", {listTitle: "Today", newListItems: results});
      }
    }

  })
});

app.get("/:customListName", function(req,res){
  const customlistname= _.capitalize(req.params.customListName);
  List.findOne({name:customlistname},function(err,results){
    if(!err){
      if(!results){
        const list=new List({
          name: customlistname,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customlistname);
      }
      else{
        //shows existing list
        res.render("list", {listTitle: results.name, newListItems: results.items});
      }
    }
  })
  
  
});

app.post("/", function(req, res){
  const itemName=req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name: itemName
  });
  if(listName==="Today"){
      item.save();
      res.redirect("/");
    }
  else{
    List.findOne({name:listName}, function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});

app.post("/delete",function(req,res){
  var checkedItem= req.body.checkBox;
  var checkedList=req.body.listName;
  if(checkedList==="Today"){
    Item.findByIdAndRemove(checkedItem,function(err){
      if(err){
         console.log(err);
      }
      else{
        console.log("successfully deleted!");
        res.redirect("/");
        
      }
    });
  }
  else{
    List.findOneAndUpdate({name:checkedList},{$pull:{items: {_id:checkedItem}}},function(err,foundList){
      if(!err){
        res.redirect("/"+checkedList);
      }
    })
  }
})


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
