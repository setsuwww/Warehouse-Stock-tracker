
import { SignJWT, jwtVerify } from "jose";

const secret = process.env.JWT_SECRET;

if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
}

const secretKey = new TextEncoder().encode(secret);

export async function createToken(user) {
    return await new SignJWT({
        id: user.id,
        email: user.email,
        role: user.role,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secretKey);
}

export async function verifyToken(token) {
    try {
        const { payload } = await jwtVerify(token, secretKey);

        return payload;
    } catch {
        return null;
    }
}
