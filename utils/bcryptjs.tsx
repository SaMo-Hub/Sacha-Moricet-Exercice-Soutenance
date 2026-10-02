import bcrypt from "bcryptjs";

// Hash a password (10 salt rounds)
export function hashPassword(plainPassword: string) {
  return bcrypt.hash(plainPassword, 10).then((hashedPassword: string) => {
    return hashedPassword;
  });
}

// Compare a plain password with the hash saved in database
export function checkPassword(userPassword: string, dbPassword: string) {
  return bcrypt.compare(userPassword, dbPassword).then((result: boolean) => {
    return result;
  });
}
