const jwtSigningKey = Buffer.from(process.env.JWT_SECRET!!, "base64");
export default jwtSigningKey;
