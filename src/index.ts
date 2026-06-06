import app from './app';
import { config } from './config/env';

app.listen(parseInt(config.PORT), () => {
  console.log(`🚀 Server running on http://localhost:${config.PORT}`);
  console.log(`📦 Environment: ${config.NODE_ENV}`);
});
