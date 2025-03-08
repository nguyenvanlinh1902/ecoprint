// Register module aliases for Node.js with ES Modules
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import moduleAlias from 'module-alias';

// Lấy đường dẫn hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lấy thông tin package.json
const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

// Biến đổi tất cả các alias thành đường dẫn tuyệt đối
if (packageJson._moduleAliases) {
  const aliases = {};
  
  for (const [alias, path] of Object.entries(packageJson._moduleAliases)) {
    aliases[alias] = join(__dirname, '..', path);
  }
  
  // Đăng ký alias
  moduleAlias.addAliases(aliases);
}

export default moduleAlias; 