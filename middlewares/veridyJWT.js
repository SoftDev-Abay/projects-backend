import jwt from "jsonwebtoken";

const verifyJWT = (req, res, next) => {
  // Extract token from Authorization header
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7, token.length); // Remove "Bearer " to get the actual token
    //  remove " on the left and right side of the token
    token = token.replace(/^"(.*)"$/, "$1");
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.token_user = decodedToken;
    console.log("decodedToken", decodedToken);

    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export default verifyJWT;
