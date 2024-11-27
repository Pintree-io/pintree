import bcrypt from 'bcryptjs';

async function main() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 12);
  console.log('Generated hash for password:', password);
  console.log(hash);
  
  // 验证
  const isValid = await bcrypt.compare(password, hash);
  console.log('Verification:', isValid);
}

main().catch(console.error);