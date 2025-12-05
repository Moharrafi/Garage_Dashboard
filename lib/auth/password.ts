"use server"

import crypto from "crypto"

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = await new Promise<string>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error)
      } else {
        resolve(derivedKey.toString("hex"))
      }
    })
  })
  return { hash, salt }
}

export async function verifyPassword(password: string, hash: string, salt: string) {
  const derived = await new Promise<string>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error)
      } else {
        resolve(derivedKey.toString("hex"))
      }
    })
  })
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"))
}
