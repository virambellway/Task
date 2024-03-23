const express =  require('express');
require('./database/config');
const app = express();
const cors = require('cors');
const user =  require('./database/userSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const category =  require('./database/categorySchema')
app.use(express.json());
app.use(cors());




app.post('/register', async (req, res) => {
    try {
    
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
      }
  
      
      const existingUser = await user.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: 'User with this email already exists' });
      }
  
     
      const hashedPassword = await bcrypt.hash(password, 10);
  
      
      const newUser = new user({ username, email, password: hashedPassword });
  
      
      const savedUser = await newUser.save();
  
      
      res.status(201).json({ message: 'User registered successfully', user: savedUser });
    } catch (error) {
      console.error('Error during user registration:', error);
      res.status(500).json({ message: 'Failed to register user' });
    }
  });

app.post("/login", async (req, res) => {
  const { usernameOrEmail, password } = req.body;

try {
    // Find user by username or email in the database
    const User = await user.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] });

    if (!User) {
        return res.status(404).json({ status: false, message: "User not found" });
    }

    // Compare the password provided by the user with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, User.password);

    if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const secretkey = crypto.randomBytes(32).toString('hex');
    const token = jwt.sign({ userId: User._id }, secretkey, { expiresIn: '1h' });

    // Exclude the password field from the response object
    const { password: userPassword, ...userWithoutPassword } = User.toObject();
    res.status(200).json({ status: true, message: "Login successful", token, user: userWithoutPassword });
} catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Login failed", why: error });
}
  });
  
app.post('/add-category',async (req,res)=>{
  try{
   const {name} = req.body;
   if(!name){
    res.status(400).json({ status: false, message: "category name is required"})
   }
   const newCategory = new category({name});
   const savecategory = await newCategory.save();

   res.status(200).json({
    status:true,
    message:"Category added Succesfully",
   })
  }catch(error){
    console.error("Error during add-category:", error);
    res.status(500).json({status:false, message:"Error in adding category",error:error})
  }
})

app.get('/get-category-list', async (req, res) => {
  try {
    // Fetch the list of categories from the database
    const categories = await category.find();

    // Check if categories exist
    if (!categories || categories.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No categories found",
      });
    }

    // Send the list of categories as a response
    res.status(200).json({
      status: true,
      message: "Category list retrieved successfully",
      data: categories,
    });
  } catch (error) {
    console.error("Error during get-category-list:", error);
    res.status(500).json({
      status: false,
      message: "Error in retrieving category list",
      error: error,
    });
  }
});
app.delete('/delete-category', async (req, res) => {
  try {
    const categoryId = req.query.id;

    // Check if category exists
    const existingCategory = await category.findById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({
        status: false,
        message: "Category not found",
      });
    }

    // Delete the category
    await category.findByIdAndDelete(categoryId);

    res.status(200).json({
      status: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error during delete-category:", error);
    res.status(500).json({
      status: false,
      message: "Error in deleting category",
      error: error,
    });
  }
});
// Backend route to get a single category by its ID
app.get('/categories', async (req, res) => {
  try {
    const categoryId = req.query.id;
    const Category = await category.findById(categoryId);
    if (!Category) {
      return res.status(404).json({status:false, message: 'Category not found' });
    }
    res.status(200).json({status:true,data:Category});
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    res.status(500).json({ message: 'Error fetching category', error });
  }
});

app.put('/edit-category', async (req, res) => {
  try {
    const categoryId = req.query.id;
    const { name } = req.body;

    // Check if category exists
    const existingCategory = await category.findById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({
        status: false,
        message: "Category not found",
      });
    }

    // Update the category
    existingCategory.name = name;
    await existingCategory.save();

    res.status(200).json({
      status: true,
      message: "Category updated successfully",
      data: existingCategory,
    });
  } catch (error) {
    console.error("Error during edit-category:", error);
    res.status(500).json({
      status: false,
      message: "Error in editing category",
      error: error,
    });
  }
});

app.listen(3001,()=>{
    console.log("LIVE ON PORT 3006")
})
