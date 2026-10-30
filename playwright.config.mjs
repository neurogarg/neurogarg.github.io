import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests',
  fullyParallel:true,
  workers:2,
  reporter:'list',
  use: {
    baseURL:'http://127.0.0.1:8123',
    channel:'msedge',
    screenshot:'only-on-failure',
    trace:'retain-on-failure'
  },
  webServer: {
    command:'node scripts/serve.mjs',
    url:'http://127.0.0.1:8123',
    env:{PORT:'8123'},
    reuseExistingServer:false
  }
});
