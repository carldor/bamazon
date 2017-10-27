var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  
  console.log("connected as id " + connection.threadId);
  
  printAllProducts();
  getOrder();

})

function printAllProducts(){

    connection.query("SELECT * FROM products", function(err, res) {

      if (err) throw err;
      // console.log(res);

      var output = '\n-------------------------------------------------------------------------------------------------------------------\n'

      for (var i = 0; i < res.length; i++) {
        output += "item_id: " + res[i].item_id + " || product_name: " + res[i].product_name + " || department_name: " + res[i].department_name + " || price: " + res[i].price + " || stock_quantity: " + res[i].stock_quantity + '\n';
        output += '---------------------------------------------------------------------------------------------------------------------\n'
      }

      console.log(output);

    });
}

function getOrder(){
   inquirer
    .prompt([{
      name: "item_id",
      type: "input",
      message: "What is the ID of the product you would like to buy?"
    },
    {
      name: "quantity",
      type: "input",
      message: "How many units would you like to buy?"
    }])
    .then(function(answer) {
      // based on their answer, either call the bid or the post functions
      // if (answer.buyByID.toUpperCase() === "POST") {
      //   postAuction();
      // }
      // else {
      //   bidAuction();
      // }

      connection.query(
        "SELECT * FROM products WHERE ?", 
        {item_id: answer.item_id}, 
        function(err, res) {
         if (err) throw err;

         processOrder(res[0],answer);

      });
    });
}

function processOrder(product, order){
  if(product.stock_quantity < order.quantity){
    console.log("Insufficient quantity!");
    printAllProducts();
    getOrder();
  }else{
    connection.query(
      "UPDATE products SET ? WHERE ?", 
       [
          {
            stock_quantity: product.stock_quantity - order.quantity
          },
          {
            item_id: order.item_id
          }
        ], function(err, res) {
             var total_cost = order.quantity * product.price;
             console.log("Your total cost is " + total_cost);
             printAllProducts();
             getOrder();
               // console.log(res.affectedRows + " products updated!\n");

           });

        }
}