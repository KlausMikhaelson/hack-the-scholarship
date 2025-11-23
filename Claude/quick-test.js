import axios from "axios";

const BASE_URL = "http://localhost:3000";

async function quickTest() {
  console.log("🧪 Quick Test - Health Check\n");

  try {
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log("✅ Server is running!");
    console.log("Response:", healthResponse.data);
  } catch (error) {
    console.log("❌ Server is not responding");
    console.log("Error:", error.message);
  }
}

quickTest();
