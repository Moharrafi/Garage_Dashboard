import crypto from "crypto"

const HEAD = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")

function getSecret() {
  const secret = process.env.APP_SESSION_SECRET
  if (!secret) {
    throw new Error("APP_SESSION_SECRET is required")
  }
  return secret
}

function createSignature(data: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url")
}

export async function createSessionToken(email: string) {
  const secret = getSecret()
  const issuedAt = Math.floor(Date.now() / 1000)
  const expiresAt = issuedAt + 60 * 60 * 24 * 7 // 7 days
  const payload = Buffer.from(JSON.stringify({ email, iat: issuedAt, exp: expiresAt })).toString("base64url")
  const signature = createSignature(`${HEAD}.${payload}`, secret)
  return `${HEAD}.${payload}.${signature}`
}

export async function verifySessionToken(token: string) {
  try {
    const secret = getSecret()
    const [head, payload, signature] = token.split(".")
    if (!head || !payload || !signature) return null
    const expectedSignature = createSignature(`${head}.${payload}`, secret)
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null
    }
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"))
    if (typeof data.exp !== "number" || data.exp * 1000 < Date.now()) {
      return null
    }
    return data
  } catch {
    return null
  }
}
