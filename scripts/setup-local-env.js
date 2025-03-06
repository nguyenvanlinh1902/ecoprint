const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const FUNCTIONS_DIR = path.join(__dirname, '../packages/functions');
const RUNTIME_CONFIG_EXAMPLE = path.join(FUNCTIONS_DIR, '.runtimeConfig.json.example');
const RUNTIME_CONFIG = path.join(FUNCTIONS_DIR, '.runtimeConfig.json');
const SERVICE_ACCOUNT_EXAMPLE = path.join(FUNCTIONS_DIR, 'serviceAccount.json.example');
const SERVICE_ACCOUNT = path.join(FUNCTIONS_DIR, 'serviceAccount.json');

console.log('Thiết lập môi trường phát triển local cho B2B Manager...\n');

// Kiểm tra thư mục scripts
if (!fs.existsSync(FUNCTIONS_DIR)) {
  console.error('Không tìm thấy thư mục functions. Vui lòng chạy script từ thư mục gốc của dự án.');
  process.exit(1);
}

// Kiểm tra và tạo file .runtimeConfig.json
if (fs.existsSync(RUNTIME_CONFIG)) {
  console.log('.runtimeConfig.json đã tồn tại.');
} else if (fs.existsSync(RUNTIME_CONFIG_EXAMPLE)) {
  console.log('Tạo .runtimeConfig.json từ file mẫu...');
  const configExample = fs.readFileSync(RUNTIME_CONFIG_EXAMPLE, 'utf8');
  fs.writeFileSync(RUNTIME_CONFIG, configExample);
  console.log('Đã tạo .runtimeConfig.json. Vui lòng cập nhật thông tin cấu hình thực tế.');
} else {
  console.error('Không tìm thấy file mẫu .runtimeConfig.json.example.');
}

// Kiểm tra và tạo file serviceAccount.json
if (fs.existsSync(SERVICE_ACCOUNT)) {
  console.log('serviceAccount.json đã tồn tại.');
} else if (fs.existsSync(SERVICE_ACCOUNT_EXAMPLE)) {
  console.log('Tạo serviceAccount.json từ file mẫu...');
  const serviceAccountExample = fs.readFileSync(SERVICE_ACCOUNT_EXAMPLE, 'utf8');
  fs.writeFileSync(SERVICE_ACCOUNT, serviceAccountExample);
  console.log('Đã tạo serviceAccount.json. Vui lòng cập nhật thông tin Service Account thực tế.');
} else {
  console.error('Không tìm thấy file mẫu serviceAccount.json.example.');
}

console.log('\nHướng dẫn thiết lập:');
console.log('1. Cập nhật thông tin trong file .runtimeConfig.json');
console.log('2. Cập nhật thông tin Service Account trong file serviceAccount.json');
console.log('   - Bạn có thể tải Service Account Key từ Firebase Console > Project Settings > Service accounts');
console.log('\nSau khi hoàn tất cấu hình, chạy "yarn dev" để khởi động ứng dụng ở môi trường local.');

rl.question('\nBạn có muốn tự động tạo .gitignore để loại trừ các file cấu hình nhạy cảm? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y') {
    const gitignorePath = path.join(FUNCTIONS_DIR, '.gitignore');
    let gitignoreContent = '';
    
    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }
    
    // Thêm các file cấu hình vào .gitignore nếu chưa có
    const filesToIgnore = [
      '.runtimeConfig.json',
      'serviceAccount.json'
    ];
    
    let updated = false;
    filesToIgnore.forEach(file => {
      if (!gitignoreContent.includes(file)) {
        gitignoreContent += `\n${file}`;
        updated = true;
      }
    });
    
    if (updated) {
      fs.writeFileSync(gitignorePath, gitignoreContent.trim() + '\n');
      console.log('Đã cập nhật .gitignore.');
    } else {
      console.log('Các file cấu hình đã được loại trừ trong .gitignore.');
    }
  }
  
  rl.close();
  console.log('\nThiết lập hoàn tất!');
}); 