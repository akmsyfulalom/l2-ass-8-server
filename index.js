const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("l2-assignment-8");
    const clothCollection = db.collection("cloth");

    //* Create
    app.post("/api/v1/cloth", async (req, res) => {
      try {
        const {
          name,
          image,
          brand,
          price,
          discount,
          flashSale,
          rating,
          size,
          description,
        } = req.body;
        const result = await clothCollection.insertOne({
          name,
          image,
          brand,
          price,
          discount,
          flashSale,
          rating,
          size,
          description,
          createdAt: new Date(),
        });
        res.json({
          success: true,
          message: "Successfully cloth create!",
          result,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "An error occurred while creating cloth",
          error: error.message,
        });
      }
    });

    //* Get ALL cloth
    app.get("/api/v1/cloth", async (req, res) => {
      try {
        // Extract query parameters
        const { rating, brand, category, minPrice, maxPrice } = req.query;
    
        // Construct filter object based on provided parameters
        const filter = {};
        if (rating) {
          filter.rating = parseFloat(rating); // Convert rating to number
        }
        if (brand) {
          filter.brand = brand;
        }
        if (category) {
          filter.category = category;
        }
        if (minPrice !== undefined && maxPrice !== undefined) {
          filter.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };
        } else if (minPrice !== undefined) {
          filter.price = { $gte: parseFloat(minPrice) };
        } else if (maxPrice !== undefined) {
          filter.price = { $lte: parseFloat(maxPrice) };
        }
    
        // Fetch data based on the constructed filter
        const data = await clothCollection.find(filter).toArray();
        res.json({
          success: true,
          message: "Successfully retrieved cloth!",
          data,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "An error occurred while retrieving cloth",
          error: error.message,
        });
      }
    });
    

    // Get cloth by Brand
    app.get("/api/v1/cloth/brand/:brand", async (req, res) => {
      try {
        const { brand } = req.params;
        const data = await clothCollection.find({ brand }).toArray();
        res.json({
          success: true,
          message: `Successfully retrieved cloth for brand ${brand}!`,
          data,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "An error occurred while retrieving cloth by brand",
          error: error.message,
        });
      }
    });

    // Get Single cloth by ID
    app.get("/api/v1/cloth/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const data = await clothCollection.findOne(new ObjectId(id));
        res.json({
          success: true,
          message: "successfully retrieve cloth!",
          data,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "An error occurred while retrieving cloth by ID",
          error: error.message,
        });
      }
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
  const serverStatus = {
    message: "AKM CLOTH server is running smoothly",
  };
  res.json(serverStatus);
});
